import { chatCompletion } from "../shared/openai-client";
import { TopicGenerationError } from "../shared/errors";
import { getPrompt } from "../prompts/registry";
import type { TopicPrompt } from "../shared/types";

export async function generateFromArticle(
  articleText: string,
  essayType: "situational" | "continuous",
  level: string = "sec4"
): Promise<TopicPrompt[]> {
  const { system, user } = getPrompt("topic-gen-v1", {
    source: "article",
    articleText,
    essayType,
    level,
  });

  const raw = await chatCompletion(system, user, { temperature: 0.7, maxTokens: 2000, jsonMode: true, tracking: { operation: "topic_gen" } });

  let parsed: any;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new TopicGenerationError("Failed to parse topic generation response");
  }

  const prompts: TopicPrompt[] = (parsed.topics ?? []).map((t: any) => ({
    title: t.title,
    prompt: t.prompt,
    guidingPoints: t.guidingPoints ?? [],
    essayType,
    category: t.category ?? null,
    level,
  }));

  if (!prompts.length) {
    throw new TopicGenerationError("No topics generated from article");
  }

  return prompts;
}
