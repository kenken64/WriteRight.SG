import { chatCompletion } from "../shared/openai-client";
import { MODEL_FAST } from "../shared/model-config";
import type { GrammarCheckRequest, GrammarCheckResult, GrammarAnnotation } from "./types";

const SYSTEM_PROMPT = `You are a grammar checker for Singapore secondary school English essays.
Check the text for: grammar errors, spelling mistakes, weak vocabulary, run-on sentences (>35 words), and excessive passive voice.

Return JSON with "annotations" array. Each annotation:
{
  "offsetStart": number (character offset in original text),
  "offsetEnd": number (character offset end),
  "category": "grammar" | "spelling" | "vocabulary" | "style" | "passive_voice",
  "originalText": string (the exact text with the issue),
  "suggestion": string (the corrected/improved text),
  "explanation": string (brief explanation suitable for a teenager)
}

RULES:
- Be accurate with character offsets — count carefully
- For vocabulary, only flag very basic/overused words (very good, very bad, a lot, nice, thing)
- For style, flag run-on sentences (>35 words)
- For passive_voice, only flag if >30% of sentences are passive
- Don't flag everything — focus on the most impactful 5-10 issues
- Keep explanations simple and educational
- Return ONLY valid JSON with "annotations" key`;

export async function checkGrammar(req: GrammarCheckRequest): Promise<GrammarCheckResult> {
  if (!req.text || req.text.trim().length < 10) {
    return { annotations: [] };
  }

  const userPrompt = `Check this ${req.essayType ?? "essay"} text:\n\n"""${req.text}"""`;

  const raw = await chatCompletion(SYSTEM_PROMPT, userPrompt, {
    model: MODEL_FAST,
    temperature: 0.1,
    maxTokens: 2000,
    jsonMode: true,
  });

  try {
    const parsed = JSON.parse(raw);
    const annotations: GrammarAnnotation[] = (parsed.annotations ?? [])
      .filter(
        (a: any) =>
          typeof a.offsetStart === "number" &&
          typeof a.offsetEnd === "number" &&
          a.offsetEnd > a.offsetStart &&
          a.originalText &&
          a.suggestion
      )
      .map((a: any) => ({
        offsetStart: a.offsetStart,
        offsetEnd: a.offsetEnd,
        category: ["grammar", "spelling", "vocabulary", "style", "passive_voice"].includes(a.category)
          ? a.category
          : "grammar",
        originalText: a.originalText,
        suggestion: a.suggestion,
        explanation: a.explanation ?? "",
      }));

    return { annotations };
  } catch {
    return { annotations: [] };
  }
}
