import { chatCompletion } from "../shared/openai-client";
import { MODEL_PRIMARY } from "../shared/model-config";
import type { SuggestionRequest, Suggestion } from "./types";

const SYSTEM_PROMPT = `You are a writing coach for Singapore secondary school students (Sec 1-4, O Level English).
Based on the student's current paragraph and position in the essay, provide ONE contextual suggestion.

RULES:
- NEVER write full sentences for the student
- Give strategies, not answers
- Match the student's level
- Be encouraging but honest
- For weak students: more scaffolding, simpler language
- For strong students: subtle refinements only

Return JSON: { "type": string, "text": string, "example": string }
type is one of: opening, transition, vocabulary, structure, conclusion, run_on, connector, word_limit, refocus, general
"example" shows a pattern, NOT a copy-paste sentence.`;

export async function getSuggestion(req: SuggestionRequest): Promise<Suggestion> {
  const wordCount = req.text.split(/\s+/).filter(Boolean).length;
  const totalParagraphs = req.text.split(/\n\s*\n/).filter(Boolean).length;

  const userPrompt = `Essay type: ${req.essayType}
Assignment: ${req.assignmentPrompt}
Student level: ${req.studentLevel ?? "average"}
Word count: ${wordCount}${req.wordTarget ? ` / target ${req.wordTarget.min}-${req.wordTarget.max}` : ""}
Current paragraph index: ${req.cursorParagraphIndex} of ${totalParagraphs}
Position: ${req.cursorParagraphIndex === 0 ? "opening" : req.cursorParagraphIndex >= totalParagraphs - 1 ? "ending" : "middle"}

Full essay so far:
"""
${req.text}
"""

Current paragraph being written:
"""
${req.currentParagraph}
"""`;

  const raw = await chatCompletion(SYSTEM_PROMPT, userPrompt, {
    model: MODEL_PRIMARY,
    temperature: 0.5,
    maxTokens: 500,
    jsonMode: true,
    tracking: { operation: "suggestion" },
  });

  try {
    const parsed = JSON.parse(raw);
    return {
      type: parsed.type ?? "general",
      text: parsed.text ?? "Keep writing — you're doing well!",
      example: parsed.example,
    };
  } catch {
    return { type: "general", text: "Keep going — try to develop your current point with an example." };
  }
}
