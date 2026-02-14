import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')!;

/**
 * Cron function: fetches RSS from SG news sources, extracts articles,
 * generates MOE-style essay prompts via AI, categorises and stores.
 */

const RSS_FEEDS = [
  { name: 'CNA', url: 'https://www.channelnewsasia.com/api/v1/rss-outbound-feed?_format=xml&category=6311' },
  { name: 'Straits Times', url: 'https://www.straitstimes.com/news/singapore/rss.xml' },
  { name: 'TODAY', url: 'https://www.todayonline.com/rss.xml' },
];

interface Article {
  title: string;
  description: string;
  source: string;
  pubDate: string;
}

async function fetchRssArticles(feed: { name: string; url: string }): Promise<Article[]> {
  try {
    const res = await fetch(feed.url, { headers: { 'User-Agent': 'WriteRight-SG/1.0' } });
    if (!res.ok) return [];
    const xml = await res.text();

    // Simple XML parsing for RSS items
    const items: Article[] = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
    let match;
    while ((match = itemRegex.exec(xml)) !== null && items.length < 5) {
      const itemXml = match[1];
      const title = itemXml.match(/<title><!\[CDATA\[(.*?)\]\]>|<title>(.*?)<\/title>/)?.[1] ?? itemXml.match(/<title>(.*?)<\/title>/)?.[1] ?? '';
      const desc = itemXml.match(/<description><!\[CDATA\[(.*?)\]\]>|<description>(.*?)<\/description>/)?.[1] ?? '';
      const pubDate = itemXml.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] ?? '';

      if (title) {
        items.push({ title: title.trim(), description: desc.trim().slice(0, 500), source: feed.name, pubDate });
      }
    }
    return items;
  } catch (err) {
    console.error(`RSS fetch failed for ${feed.name}:`, err);
    return [];
  }
}

async function generatePrompts(articles: Article[]): Promise<Array<{
  title: string;
  prompt: string;
  guidingPoints: string[];
  essayType: 'situational' | 'continuous';
  category: string;
  sourceArticle: string;
}>> {
  const articleSummaries = articles.map((a, i) => `${i + 1}. [${a.source}] ${a.title}: ${a.description}`).join('\n');

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${OPENAI_API_KEY}` },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a Singapore English teacher creating O-Level essay prompts based on current affairs. Generate prompts that are:
- Age-appropriate for Sec 3-5 students
- Aligned to MOE English syllabus
- Mix of situational writing (formal letter, email, report, speech, proposal) and continuous writing (narrative, expository, argumentative, descriptive)
- Include 3-5 guiding points per prompt
- Categorise as: environment, technology, social_issues, education, health, current_affairs`,
        },
        {
          role: 'user',
          content: `Based on these recent Singapore news articles, generate 3 diverse essay prompts:\n\n${articleSummaries}\n\nReturn JSON array: [{"title":"...","prompt":"...","guidingPoints":["..."],"essayType":"situational"|"continuous","category":"...","sourceArticle":"article title"}]`,
        },
      ],
      max_tokens: 2000,
      temperature: 0.7,
      response_format: { type: 'json_object' },
    }),
  });

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content ?? '{"prompts":[]}';
  const parsed = JSON.parse(content);
  return parsed.prompts ?? parsed ?? [];
}

serve(async (_req: Request) => {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // 1. Fetch articles from all feeds
    const allArticles: Article[] = [];
    for (const feed of RSS_FEEDS) {
      const articles = await fetchRssArticles(feed);
      allArticles.push(...articles);
    }

    if (allArticles.length === 0) {
      return new Response(JSON.stringify({ message: 'No articles fetched', topicsCreated: 0 }), { status: 200 });
    }

    // Take top 8 most recent
    const selectedArticles = allArticles.slice(0, 8);

    // 2. Generate prompts
    const prompts = await generatePrompts(selectedArticles);

    // 3. Store in topics table
    let created = 0;
    for (const p of prompts) {
      // Dedup by title similarity
      const { data: existing } = await supabase
        .from('topics')
        .select('id')
        .eq('source', 'trending')
        .ilike('source_text', `%${p.sourceArticle.slice(0, 30)}%`)
        .limit(1);

      if (existing?.length) continue;

      const { error } = await supabase.from('topics').insert({
        source: 'trending',
        source_text: p.sourceArticle,
        category: p.category,
        essay_type: p.essayType,
        level: null, // suitable for all levels
        generated_prompts: {
          title: p.title,
          prompt: p.prompt,
          guidingPoints: p.guidingPoints,
        },
      });

      if (!error) created++;
    }

    // Log
    await supabase.from('audit_logs').insert({
      user_id: '00000000-0000-0000-0000-000000000000', // system
      action: 'trending_topics_generated',
      details: { articlesProcessed: selectedArticles.length, topicsCreated: created },
    });

    return new Response(JSON.stringify({
      success: true,
      articlesProcessed: selectedArticles.length,
      topicsCreated: created,
    }), { status: 200 });

  } catch (err) {
    console.error('trending-topics error:', err);
    return new Response(JSON.stringify({ error: (err as Error).message }), { status: 500 });
  }
});
