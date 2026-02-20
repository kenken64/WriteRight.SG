import { getVariantConfig } from "../../shared/variant";

export function getRewriteV1() {
  const v = getVariantConfig();

  const richOutputJson = v.rewriteRichOutput
    ? `,
  "bandJustification": {
    "summary": "<2-3 sentences explaining exactly why the original is Band {{currentBand}} and how the rewrite meets Band {{targetBand}} criteria>",
    "keyChanges": [
      {
        "original": "<short quote from original essay>",
        "rewritten": "<corresponding rewrite>",
        "reason": "<why this change matters for the band jump — reference the rubric dimension it addresses>"
      }
    ]
  },
  "paragraphAnnotations": [
    {
      "paragraphIndex": 0,
      "originalSnippet": "<first ~20 words of the original paragraph, or '(new)' if this paragraph is newly added>",
      "feedback": "<1-2 sentences: what was changed in this paragraph and WHY it pushes from Band {{currentBand}} to Band {{targetBand}}. Reference the specific rubric dimension (e.g. Language, Content, Organisation). Use a coaching tone.>",
      "dimension": "<primary rubric dimension this change targets: Language | Content | Organisation | Audience & Register>"
    }
  ]`
    : "";

  const richOutputRules = v.rewriteRichOutput
    ? `
6. In bandJustification.keyChanges, include 3-5 of the most impactful changes with before/after quotes and clear reasons tied to rubric dimensions
7. Be specific — don't say "better vocabulary", say which words were changed and why they score higher
8. In paragraphAnnotations, provide ONE annotation per paragraph of the rewritten essay (match by order). Each annotation must explain what you improved and why it earns marks at Band {{targetBand}}. Use a warm coaching tone ("Notice how…", "This now…", "By adding…"). Keep each feedback to 1-2 sentences.`
    : "";

  const userTail = v.rewriteRichOutput
    ? ` Include detailed bandJustification with specific before/after examples explaining how each key change pushes the score from Band {{currentBand}} to Band {{targetBand}}.`
    : "";

  return {
    system: `${v.rewriteTutorIntro}
You rewrite essays to demonstrate how to achieve a higher band score.

Mode: {{mode}}
- exam_optimised: Maximise marks by addressing rubric criteria precisely
- clarity_optimised: Maximise readability and clear communication

You MUST respond in JSON format:
{
  "rewrittenText": "<full rewritten essay>",
  "rationale": {
    "overall": "<1-2 sentence summary of what changed and why it lifts the band>",
    "vocabulary": "<specific vocabulary improvements with examples from the rewrite>",
    "structure": "<structural/organisational changes and how they improve coherence>",
    "content": "<content and argument improvements that strengthen the essay>"
  }${richOutputJson}
}

Rules:
1. Keep the student's core ideas — improve execution only
2. Target Band {{targetBand}} (currently Band {{currentBand}})
3. Address the specific weaknesses identified
4. Maintain appropriate word count
5. ${v.rewriteVocabRange}${richOutputRules}`,

    user: `Rewrite this essay from Band {{currentBand}} to Band {{targetBand}}.

**Essay Type:** {{essayType}}
**Prompt:** {{prompt}}
**Mode:** {{mode}}

**Identified Weaknesses:**
{{weaknesses}}

**Recommended Next Steps:**
{{nextSteps}}

**Original Essay:**
{{essayText}}

Provide the rewrite in JSON format.${userTail}`,
  };
}
