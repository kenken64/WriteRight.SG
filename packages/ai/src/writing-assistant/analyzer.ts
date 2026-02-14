import { chatCompletion } from "../shared/openai-client";
import type { AnalysisRequest, AnalysisResult } from "./types";

const SYSTEM_PROMPT = `You are an essay analysis engine for Singapore secondary school students.
Analyse the essay and return JSON with:
- structure: array of { label, detected, paragraphIndex? } for Introduction, Body paragraphs, Conclusion
- toneAssessment: { tone: string, appropriate: boolean, note?: string }
- wordPacing: { percentUsed: number (0-100), pointsCovered: number, totalPoints: number, warning?: string }
- repetitions: array of { word, count, alternatives: string[] } for words used 3+ times (excluding common words)
- paragraphCount: number

For situational writing, check formal/informal tone matches the task.
For continuous writing, check narrative consistency.
Return ONLY valid JSON.`;

export async function analyzeEssay(req: AnalysisRequest): Promise<AnalysisResult> {
  const wordCount = req.text.split(/\s+/).filter(Boolean).length;
  const wordMax = req.wordTarget?.max ?? 400;
  const percentUsed = Math.round((wordCount / wordMax) * 100);

  const userPrompt = `Essay type: ${req.essayType}
Assignment: ${req.assignmentPrompt}
Word count: ${wordCount}${req.wordTarget ? ` (target: ${req.wordTarget.min}-${req.wordTarget.max})` : ""}
Student level: ${req.studentLevel ?? "average"}

Essay text:
"""
${req.text}
"""`;

  const raw = await chatCompletion(SYSTEM_PROMPT, userPrompt, {
    model: "gpt-4o-mini",
    temperature: 0.2,
    maxTokens: 1500,
    jsonMode: true,
  });

  try {
    const parsed = JSON.parse(raw);
    return {
      structure: parsed.structure ?? [],
      toneAssessment: parsed.toneAssessment ?? { tone: "unknown", appropriate: true },
      wordPacing: {
        percentUsed: parsed.wordPacing?.percentUsed ?? percentUsed,
        pointsCovered: parsed.wordPacing?.pointsCovered ?? 0,
        totalPoints: parsed.wordPacing?.totalPoints ?? 3,
        warning: parsed.wordPacing?.warning,
      },
      repetitions: parsed.repetitions ?? [],
      paragraphCount: parsed.paragraphCount ?? req.text.split(/\n\s*\n/).length,
    };
  } catch {
    // Fallback with basic local analysis
    const paragraphs = req.text.split(/\n\s*\n/).filter(Boolean);
    return {
      structure: [
        { label: "Introduction", detected: paragraphs.length >= 1, paragraphIndex: 0 },
        { label: "Body", detected: paragraphs.length >= 2, paragraphIndex: 1 },
        { label: "Conclusion", detected: paragraphs.length >= 3, paragraphIndex: paragraphs.length - 1 },
      ],
      toneAssessment: { tone: "unknown", appropriate: true },
      wordPacing: { percentUsed, pointsCovered: 0, totalPoints: 3 },
      repetitions: [],
      paragraphCount: paragraphs.length,
    };
  }
}
