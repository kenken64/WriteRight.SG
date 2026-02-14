import { MarkingError } from "../shared/errors";
import type { EvaluationResult } from "../shared/types";

export function validateEvaluation(result: EvaluationResult, rubric: { totalMaxScore: number; dimensions: { name: string; maxScore: number }[] }): void {
  // Validate total score
  if (result.totalScore < 0 || result.totalScore > rubric.totalMaxScore) {
    throw new MarkingError(`Total score ${result.totalScore} out of range [0, ${rubric.totalMaxScore}]`);
  }

  // Validate band
  if (result.band < 0 || result.band > 5) {
    throw new MarkingError(`Band ${result.band} out of range [0, 5]`);
  }

  // Validate dimension scores
  if (result.dimensionScores.length !== rubric.dimensions.length) {
    throw new MarkingError(`Expected ${rubric.dimensions.length} dimension scores, got ${result.dimensionScores.length}`);
  }

  for (const dim of result.dimensionScores) {
    const rubricDim = rubric.dimensions.find((d) => d.name === dim.name);
    if (!rubricDim) {
      throw new MarkingError(`Unknown dimension: ${dim.name}`);
    }
    if (dim.score < 0 || dim.score > rubricDim.maxScore) {
      throw new MarkingError(`${dim.name} score ${dim.score} out of range [0, ${rubricDim.maxScore}]`);
    }
  }

  // Validate sum matches total
  const calculatedTotal = result.dimensionScores.reduce((sum, d) => sum + d.score, 0);
  if (calculatedTotal !== result.totalScore) {
    throw new MarkingError(`Dimension sum ${calculatedTotal} doesn't match total ${result.totalScore}`);
  }

  // Must have at least one strength and weakness
  if (!result.strengths.length) {
    throw new MarkingError("Evaluation must include at least one strength");
  }
  if (!result.weaknesses.length) {
    throw new MarkingError("Evaluation must include at least one weakness");
  }
}
