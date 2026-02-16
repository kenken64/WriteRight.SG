import { chatCompletion } from "../shared/openai-client";

const CATEGORIES = ["environment", "technology", "social_issues", "education", "health", "current_affairs"] as const;
export type TopicCategory = typeof CATEGORIES[number];

export async function categoriseTopic(topicText: string): Promise<TopicCategory> {
  const result = await chatCompletion(
    "You categorise essay topics. Respond with ONLY one category name.",
    `Categorise this topic into one of: ${CATEGORIES.join(", ")}\n\nTopic: ${topicText}`,
    { temperature: 0, maxTokens: 20, tracking: { operation: "topic_categorise" } }
  );

  const cleaned = result.trim().toLowerCase().replace(/\s+/g, "_") as TopicCategory;
  if (CATEGORIES.includes(cleaned)) return cleaned;
  return "current_affairs"; // fallback
}

export function isValidCategory(category: string): category is TopicCategory {
  return CATEGORIES.includes(category as TopicCategory);
}
