import { evaluateEssay, type MarkingInput } from "./engine";
import type { EvaluationResult } from "../shared/types";

export interface BenchmarkCase {
  id: string;
  input: MarkingInput;
  expectedBand: number;
  expectedScoreRange: [number, number];
  tags: string[];
}

export interface BenchmarkResult {
  caseId: string;
  passed: boolean;
  evaluation: EvaluationResult;
  bandMatch: boolean;
  scoreInRange: boolean;
  durationMs: number;
}

export async function runBenchmark(cases: BenchmarkCase[]): Promise<{
  results: BenchmarkResult[];
  passRate: number;
  avgDurationMs: number;
}> {
  const results: BenchmarkResult[] = [];

  for (const bc of cases) {
    const start = Date.now();
    try {
      const evaluation = await evaluateEssay(bc.input);
      const durationMs = Date.now() - start;
      const bandMatch = evaluation.band === bc.expectedBand;
      const scoreInRange = evaluation.totalScore >= bc.expectedScoreRange[0] && evaluation.totalScore <= bc.expectedScoreRange[1];

      results.push({
        caseId: bc.id,
        passed: bandMatch && scoreInRange,
        evaluation,
        bandMatch,
        scoreInRange,
        durationMs,
      });
    } catch (error) {
      results.push({
        caseId: bc.id,
        passed: false,
        evaluation: {} as EvaluationResult,
        bandMatch: false,
        scoreInRange: false,
        durationMs: Date.now() - start,
      });
    }
  }

  const passRate = results.filter((r) => r.passed).length / results.length;
  const avgDurationMs = results.reduce((sum, r) => sum + r.durationMs, 0) / results.length;

  return { results, passRate, avgDurationMs };
}
