import { getOpenAIClient } from "../shared/openai-client";
import { MODEL_PRIMARY } from "../shared/model-config";
import { trackUsage } from "../shared/usage-tracker";
import type { CoachRequest, CoachResponse } from "./types";

const MAX_MESSAGES = 15;

function buildSystemPrompt(req: CoachRequest): string {
  const levelGuidance =
    req.studentLevel === "weak"
      ? "Use simple language. Offer structured scaffolding. Break tasks into small steps."
      : req.studentLevel === "strong"
        ? "Be concise. Focus on subtle refinements — tone, nuance, sophistication."
        : "Balance guidance and independence. Ask guiding questions.";

  return `You are a friendly writing coach for a Singapore secondary school student preparing for O Level English.

ESSAY CONTEXT:
- Type: ${req.essayType}
- Assignment: ${req.assignmentPrompt}
- Student level: ${req.studentLevel ?? "average"}

STRICT RULES:
1. NEVER write full sentences or paragraphs for the student.
2. Give strategies, thought-starters, and questions — NOT answers.
3. If they ask "write this for me", refuse kindly and redirect.
4. Keep responses concise (2-4 sentences max).
5. ${levelGuidance}
6. Use Singapore-appropriate English (but correct Singlish if used in formal writing).
7. Be encouraging. Celebrate what they're doing well before suggesting improvements.`;
}

export async function chatWithCoach(req: CoachRequest): Promise<CoachResponse> {
  const messageCount = req.history.filter((m) => m.role === "student").length + 1;

  if (messageCount > MAX_MESSAGES) {
    return {
      response:
        "You've reached the chat limit for this essay session (15 messages). Try applying the strategies we discussed — you've got this! 💪",
      messageCount,
    };
  }

  const client = getOpenAIClient();

  const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
    { role: "system", content: buildSystemPrompt(req) },
  ];

  // Add essay context as first user message
  if (req.essayText) {
    messages.push({
      role: "user",
      content: `[Current essay draft for context — do not repeat this back]\n\n${req.essayText.slice(0, 2000)}`,
    });
    messages.push({
      role: "assistant",
      content: "I've read your essay draft. How can I help?",
    });
  }

  // Add conversation history
  for (const msg of req.history.slice(-10)) {
    messages.push({
      role: msg.role === "student" ? "user" : "assistant",
      content: msg.content,
    });
  }

  // Add current question
  messages.push({ role: "user", content: req.question });

  const start = Date.now();
  const response = await client.chat.completions.create({
    model: MODEL_PRIMARY,
    temperature: 0.6,
    max_tokens: 300,
    messages,
  });

  trackUsage({
    operation: "coaching",
    model: MODEL_PRIMARY,
    usage: response.usage as any,
    durationMs: Date.now() - start,
    status: "success",
  });

  return {
    response: response.choices[0]?.message?.content ?? "I'm not sure how to help with that. Try asking differently!",
    messageCount,
  };
}
