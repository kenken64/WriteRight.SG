/**
 * Clarity-optimised rewrite: focuses on readability and clear expression.
 * Prioritises: clear communication, logical flow, conciseness.
 */

export const CLARITY_OPTIMISED_INSTRUCTIONS = `
You are rewriting this essay for MAXIMUM CLARITY. Focus on:

1. **Clear Thesis**: Make the main argument immediately obvious
2. **Simple Sentences**: Break complex sentences into clearer ones
3. **Logical Flow**: Ensure each paragraph follows naturally from the previous
4. **Remove Redundancy**: Cut unnecessary words and repetition
5. **Active Voice**: Convert passive constructions to active where possible
6. **Concrete Examples**: Replace vague statements with specific examples
7. **Readability**: Aim for clear, accessible language (not overly formal)

Keep the student's ideas and arguments intact.
The goal is not to impress the examiner but to communicate clearly.
`;

export function getClarityOptimisedConfig() {
  return {
    temperature: 0.4,
    focusAreas: ["clarity", "flow", "conciseness", "examples", "active_voice"],
    preserveVoice: true,
    maxVocabularyLevel: "B1-B2",
  };
}
