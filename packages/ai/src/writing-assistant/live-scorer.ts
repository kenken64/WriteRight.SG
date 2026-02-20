import { chatCompletion } from "../shared/openai-client";
import { MODEL_FAST } from "../shared/model-config";
import { getVariantConfig } from "../shared/variant";
import type { LiveScoreRequest, LiveScoreResult } from "./types";

const MODEL_ID = MODEL_FAST;

function getRubricVersion(): string {
  return getVariantConfig().rubricVersion;
}

function buildPrompt(req: LiveScoreRequest): { system: string; user: string } {
  const v = getVariantConfig();
  const isSW = req.essayType === "situational";

  const system = `${v.liveScorerIntro}
Score the essay draft in progress. This is a LIVE estimate — the student is still writing.

${isSW ? `Situational Writing rubric (30 marks total):
- Task Fulfilment (10): purpose, audience, tone, format, coverage of given info/points
- Language (20): organisation, grammar, vocabulary, expression, sentence variety` : `Continuous Writing rubric (30 marks total):
- Content & Development (10): relevance, depth, creativity, engagement
- Language (20): organisation, grammar, vocabulary, expression, sentence variety`}

Return JSON:
{
  "totalScore": number,
  "maxScore": 30,
  "band": number (1-5),
  "dimensions": [
    { "name": string, "score": number, "maxScore": number, "status": string, "details": [string] }
  ],
  "nextBandTips": [
    { "dimension": string, "tip": string, "potentialGain": number }
  ]
}

Be encouraging but honest. Tips should be specific and actionable.
Return ONLY valid JSON.`;

  const user = `Essay type: ${req.essayType}
Assignment: ${req.assignmentPrompt}

Current draft:
"""
${req.text}
"""`;

  return { system, user };
}

export async function scoreLive(req: LiveScoreRequest): Promise<LiveScoreResult> {
  const paragraphCount = req.text.split(/\n\s*\n/).filter(Boolean).length;
  const rubricVersion = getRubricVersion();

  if (!req.text || req.text.trim().length < 30) {
    return {
      totalScore: 0,
      maxScore: 30,
      band: 1,
      dimensions: [],
      nextBandTips: [{ dimension: "General", tip: "Start writing to see your live score!", potentialGain: 0 }],
      paragraphCount: 0,
      rubricVersion: req.rubricVersion ?? rubricVersion,
      modelId: MODEL_ID,
    };
  }

  const { system, user } = buildPrompt(req);

  const raw = await chatCompletion(system, user, {
    model: MODEL_ID,
    temperature: 0.2,
    maxTokens: 1500,
    jsonMode: true,
    tracking: { operation: "live_score" },
  });

  try {
    const parsed = JSON.parse(raw);
    return {
      totalScore: parsed.totalScore ?? 0,
      maxScore: parsed.maxScore ?? 30,
      band: parsed.band ?? 1,
      dimensions: (parsed.dimensions ?? []).map((d: any) => ({
        name: d.name ?? "",
        score: d.score ?? 0,
        maxScore: d.maxScore ?? 10,
        status: d.status ?? "",
        details: d.details ?? [],
      })),
      nextBandTips: (parsed.nextBandTips ?? []).map((t: any) => ({
        dimension: t.dimension ?? "",
        tip: t.tip ?? "",
        potentialGain: t.potentialGain ?? 0,
      })),
      paragraphCount,
      rubricVersion: req.rubricVersion ?? rubricVersion,
      modelId: MODEL_ID,
    };
  } catch {
    return {
      totalScore: 0,
      maxScore: 30,
      band: 1,
      dimensions: [],
      nextBandTips: [],
      paragraphCount,
      rubricVersion: req.rubricVersion ?? rubricVersion,
      modelId: MODEL_ID,
    };
  }
}
