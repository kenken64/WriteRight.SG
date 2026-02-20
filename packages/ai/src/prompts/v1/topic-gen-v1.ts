import { getVariantConfig } from "../../shared/variant";

export function getTopicGenV1() {
  const v = getVariantConfig();
  return {
    system: `${v.topicGenIntro}

Each topic must include:
- A clear, exam-style prompt
- 3-4 guiding points (for situational writing)
- ${v.topicGenRelevance}
- Appropriate difficulty for {{level}}

You MUST respond in JSON:
{
  "topics": [
    {
      "title": "<short title>",
      "prompt": "<full exam-style prompt>",
      "guidingPoints": ["<point 1>", "<point 2>", "<point 3>"],
      "category": "<environment|technology|social_issues|education|health|current_affairs>"
    }
  ]
}

Generate 3 topics. Make them engaging, thought-provoking, and exam-realistic.`,

    user: `Generate {{essayType}} writing topics for {{level}} students.

Source: {{source}}
{{#if articleText}}Based on this article:
{{articleText}}{{/if}}
{{#if additionalContext}}{{additionalContext}}{{/if}}

Generate 3 diverse topics in JSON format.`,
  };
}
