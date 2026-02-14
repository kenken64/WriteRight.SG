import { describe, it, expect } from 'vitest';
import { validateEvaluation } from '../marking/validator';
import { MarkingError } from '../shared/errors';
import type { EvaluationResult } from '../shared/types';

const rubric = {
  totalMaxScore: 30,
  dimensions: [
    { name: 'Task Fulfilment', maxScore: 10 },
    { name: 'Language & Style', maxScore: 10 },
    { name: 'Organisation & Coherence', maxScore: 10 },
  ],
};

function makeResult(overrides: Partial<EvaluationResult> = {}): EvaluationResult {
  return {
    essayType: 'situational',
    rubricVersion: 'v1.0',
    modelId: 'gpt-4o',
    promptVersion: 'marking-sw-v1',
    dimensionScores: [
      { name: 'Task Fulfilment', score: 7, maxScore: 10, band: 4, justification: 'Good' },
      { name: 'Language & Style', score: 7, maxScore: 10, band: 4, justification: 'Good' },
      { name: 'Organisation & Coherence', score: 6, maxScore: 10, band: 3, justification: 'OK' },
    ],
    totalScore: 20,
    band: 4,
    strengths: [{ text: 'Good structure', quote: 'example' }],
    weaknesses: [{ text: 'Improve vocab', quote: 'example', suggestion: 'Use varied words' }],
    nextSteps: ['Practice more'],
    confidence: 0.85,
    reviewRecommended: false,
    ...overrides,
  };
}

describe('validateEvaluation', () => {
  it('accepts valid evaluation', () => {
    expect(() => validateEvaluation(makeResult(), rubric)).not.toThrow();
  });

  it('rejects total score out of range (negative)', () => {
    expect(() => validateEvaluation(makeResult({ totalScore: -1 }), rubric)).toThrow(MarkingError);
  });

  it('rejects total score exceeding max', () => {
    expect(() => validateEvaluation(makeResult({ totalScore: 31 }), rubric)).toThrow(MarkingError);
  });

  it('rejects band > 5', () => {
    expect(() => validateEvaluation(makeResult({ band: 6 }), rubric)).toThrow(MarkingError);
  });

  it('rejects band < 0', () => {
    expect(() => validateEvaluation(makeResult({ band: -1 }), rubric)).toThrow(MarkingError);
  });

  it('rejects wrong number of dimensions', () => {
    const result = makeResult();
    result.dimensionScores = result.dimensionScores.slice(0, 2);
    expect(() => validateEvaluation(result, rubric)).toThrow('Expected 3 dimension scores, got 2');
  });

  it('rejects unknown dimension name', () => {
    const result = makeResult();
    result.dimensionScores[0].name = 'Unknown Dimension';
    expect(() => validateEvaluation(result, rubric)).toThrow('Unknown dimension');
  });

  it('rejects dimension score exceeding max', () => {
    const result = makeResult();
    result.dimensionScores[0].score = 11;
    result.totalScore = 24;
    expect(() => validateEvaluation(result, rubric)).toThrow('out of range');
  });

  it('rejects dimension score < 0', () => {
    const result = makeResult();
    result.dimensionScores[0].score = -1;
    result.totalScore = 12;
    expect(() => validateEvaluation(result, rubric)).toThrow('out of range');
  });

  it('rejects if dimension sum does not match total', () => {
    const result = makeResult({ totalScore: 25 }); // actual sum is 20
    expect(() => validateEvaluation(result, rubric)).toThrow("doesn't match total");
  });

  it('rejects empty strengths', () => {
    expect(() => validateEvaluation(makeResult({ strengths: [] }), rubric)).toThrow('at least one strength');
  });

  it('rejects empty weaknesses', () => {
    expect(() => validateEvaluation(makeResult({ weaknesses: [] }), rubric)).toThrow('at least one weakness');
  });
});
