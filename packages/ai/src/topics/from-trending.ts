import { chatCompletion } from "../shared/openai-client";
import { TopicGenerationError } from "../shared/errors";
import { getPrompt } from "../prompts/registry";
import type { TopicPrompt } from "../shared/types";

const SG_CONTEXT = `Singapore context: MOE O-Level English Paper 1 Section B.
Focus on topics relevant to Singaporean students: local issues, Asian perspectives, global topics with Singapore angles.
Categories: environment, technology, social issues, education, health, current affairs.`;

export async function generateFromTrending(
  essayType: "situational" | "continuous",
  level: string = "sec4",
  category?: string
): Promise<TopicPrompt[]> {
  const { system, user } = getPrompt("topic-gen-v1", {
    source: "trending",
    articleText: "",
    essayType,
    level,
    additionalContext: SG_CONTEXT + (category ? `\nFocus on category: ${category}` : ""),
  });

  const raw = await chatCompletion(system, user, { temperature: 0.8, maxTokens: 2000, jsonMode: true });

  let parsed: any;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new TopicGenerationError("Failed to parse trending topic response");
  }

  return (parsed.topics ?? []).map((t: any) => ({
    title: t.title,
    prompt: t.prompt,
    guidingPoints: t.guidingPoints ?? [],
    essayType,
    category: t.category ?? category ?? null,
    level,
  }));
}
