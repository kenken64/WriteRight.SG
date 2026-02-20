import { chatCompletion } from "../shared/openai-client";
import { MODEL_PRIMARY } from "../shared/model-config";
import { getVariantConfig } from "../shared/variant";
import type { OutlineRequest, OutlineResult } from "./types";

function getSystemPrompt(): string {
  const v = getVariantConfig();
  return `${v.outlineContext}
Given a topic and essay type, suggest outline points. Do NOT write the essay — only suggest structure and brief point ideas.

Return JSON with "sections" array:
[
  { "section": "introduction", "label": "Introduction", "suggestion": "brief guidance for this section" },
  { "section": "hook", "label": "Hook", "suggestion": "..." },
  { "section": "body1_point", "label": "Body 1 — Main Point", "suggestion": "..." },
  { "section": "body1_evidence", "label": "Body 1 — Evidence/Example", "suggestion": "..." },
  { "section": "body2_point", "label": "Body 2 — Main Point", "suggestion": "..." },
  { "section": "body2_evidence", "label": "Body 2 — Evidence/Example", "suggestion": "..." },
  { "section": "body3_point", "label": "Body 3 — Main Point", "suggestion": "..." },
  { "section": "body3_evidence", "label": "Body 3 — Evidence/Example", "suggestion": "..." },
  { "section": "conclusion", "label": "Conclusion", "suggestion": "..." }
]

For situational writing, include: purpose, audience, format, and ensure given points are covered.
Suggestions should be brief guiding ideas (not full sentences to copy).
Return ONLY valid JSON.`;
}

export async function generateOutline(req: OutlineRequest): Promise<OutlineResult> {
  const userPrompt = `Topic: ${req.topic}
Essay type: ${req.essayType}
${req.guidingPoints?.length ? `Guiding points from assignment:\n${req.guidingPoints.map((p, i) => `${i + 1}. ${p}`).join("\n")}` : ""}`;

  const raw = await chatCompletion(getSystemPrompt(), userPrompt, {
    model: MODEL_PRIMARY,
    temperature: 0.5,
    maxTokens: 1200,
    jsonMode: true,
    tracking: { operation: "outline" },
  });

  try {
    const parsed = JSON.parse(raw);
    return {
      sections: (parsed.sections ?? []).map((s: any) => ({
        section: s.section ?? "general",
        label: s.label ?? "",
        suggestion: s.suggestion ?? "",
      })),
    };
  } catch {
    return { sections: [] };
  }
}
