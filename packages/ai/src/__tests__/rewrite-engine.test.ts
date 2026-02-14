import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { EvaluationResult } from '../shared/types';

vi.mock('../shared/openai-client', () => ({
  chatCompletion: vi.fn(),
  getOpenAIClient: vi.fn(),
}));

const makeEval = (): EvaluationResult => ({
  essayType: 'situational',
  rubricVersion: 'v1.0',
  modelId: 'gpt-4o',
  promptVersion: 'marking-sw-v1',
  dimensionScores: [
    { name: 'Task Fulfilment', score: 5, maxScore: 10, band: 3, justification: 'OK' },
    { name: 'Language & Style', score: 5, maxScore: 10, band: 3, justification: 'OK' },
    { name: 'Organisation & Coherence', score: 5, maxScore: 10, band: 3, justification: 'OK' },
  ],
  totalScore: 15,
  band: 3,
  strengths: [{ text: 'Good', quote: 'x' }],
  weaknesses: [{ text: 'Improve', quote: 'x', suggestion: 'Do better' }],
  nextSteps: ['Practice'],
  confidence: 0.8,
  reviewRecommended: false,
});

describe('rewriteEssay', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('returns rewrite result with diff', async () => {
    const { chatCompletion } = await import('../shared/openai-client');
    (chatCompletion as any).mockResolvedValue(JSON.stringify({
      rewrittenText: 'Improved essay text here.',
      rationale: { overall: 'Better structure' },
    }));

    const { rewriteEssay } = await import('../rewrite/engine');
    const result = await rewriteEssay({
      essayText: 'Original essay text.',
      mode: 'exam_optimised',
      evaluation: makeEval(),
      essayType: 'situational',
      prompt: 'Write a letter',
    });

    expect(result.mode).toBe('exam_optimised');
    expect(result.rewrittenText).toBe('Improved essay text here.');
    expect(result.targetBand).toBe(4); // band 3 -> target 4
    expect(result.diffPayload).toBeDefined();
    expect(result.rationale).toHaveProperty('overall');
  });

  it('throws RewriteError on invalid JSON response', async () => {
    const { chatCompletion } = await import('../shared/openai-client');
    (chatCompletion as any).mockResolvedValue('not json');

    const { rewriteEssay } = await import('../rewrite/engine');
    const { RewriteError } = await import('../shared/errors');

    await expect(rewriteEssay({
      essayText: 'Original.',
      mode: 'clarity_optimised',
      evaluation: makeEval(),
      essayType: 'continuous',
      prompt: 'Write an essay',
    })).rejects.toThrow(RewriteError);
  });
});
