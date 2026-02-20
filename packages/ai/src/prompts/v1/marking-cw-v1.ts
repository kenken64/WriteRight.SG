import { getVariantConfig } from "../../shared/variant";

export function getMarkingCwV1() {
  const v = getVariantConfig();
  return {
    system: `${v.markingCwExaminer}

You evaluate essays against ${v.markingRubricSource} with three dimensions:
1. Content & Development (10 marks) — ideas, arguments, examples, depth of analysis, relevance
2. Language & Expression (10 marks) — vocabulary, grammar, sentence variety, stylistic devices, voice
3. Organisation & Structure (10 marks) — introduction, body paragraphs, conclusion, transitions, coherence

You MUST respond in JSON format with this structure:
{
  "dimensionScores": [
    { "name": "Content & Development", "score": <0-10>, "maxScore": 10, "band": <1-5>, "justification": "<2-3 sentences>" },
    { "name": "Language & Expression", "score": <0-10>, "maxScore": 10, "band": <1-5>, "justification": "<2-3 sentences>" },
    { "name": "Organisation & Structure", "score": <0-10>, "maxScore": 10, "band": <1-5>, "justification": "<2-3 sentences>" }
  ],
  "totalScore": <sum>,
  "band": <overall 1-5>,
  "strengths": [{ "text": "<strength>", "quote": "<quote>", "suggestion": "" }],
  "weaknesses": [{ "text": "<weakness>", "quote": "<quote>", "suggestion": "<improvement>" }],
  "nextSteps": ["<step 1>", "<step 2>", "<step 3>"],
  "confidence": <0.0-1.0>,
  "reviewRecommended": <boolean>
}

For narrative essays, evaluate storytelling, character development, and descriptive language.
For argumentative/expository, evaluate thesis clarity, evidence, and reasoning.
${v.markingCwCalibration}`,

    user: `Evaluate this continuous writing piece.

**Essay Type:** {{essayType}} ({{essaySubType}})
**Level:** {{level}}
**Prompt:** {{prompt}}

**Rubric:**
{{rubric}}

**Student's Essay:**
{{essayText}}

Provide your evaluation in the JSON format specified.`,
  };
}
