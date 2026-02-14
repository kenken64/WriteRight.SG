/**
 * Exam-optimised rewrite: focuses on maximising marks within the rubric.
 * Prioritises: task fulfilment, formal register, rubric-aligned structure.
 */

export const EXAM_OPTIMISED_INSTRUCTIONS = `
You are rewriting this essay to MAXIMISE exam marks. Focus on:

1. **Task Fulfilment**: Ensure every guiding point is addressed directly
2. **Format Compliance**: Strict adherence to the expected format (letter/report/speech etc.)
3. **Formal Register**: Upgrade informal language to formal academic register
4. **Paragraph Structure**: PEEL paragraphs (Point, Evidence, Explanation, Link)
5. **Vocabulary Upgrades**: Replace basic words with Band 4-5 vocabulary
6. **Connectors**: Add discourse markers (Furthermore, Nevertheless, In conclusion)
7. **Grammar Fixes**: Correct all grammatical errors
8. **Word Count**: Stay within the specified range

Do NOT change the student's core ideas or arguments — improve HOW they are expressed.
Preserve the student's voice where possible while elevating the quality.
`;

export function getExamOptimisedConfig() {
  return {
    temperature: 0.3,
    focusAreas: ["task_fulfilment", "register", "structure", "vocabulary", "grammar"],
    preserveVoice: true,
    maxVocabularyLevel: "B2-C1",
  };
}
