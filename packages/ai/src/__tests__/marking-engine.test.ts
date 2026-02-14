import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../shared/openai-client', () => ({
  chatCompletion: vi.fn(),
  getOpenAIClient: vi.fn(),
}));

describe('evaluateEssay', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('selects situational rubric for situational type', async () => {
    const { chatCompletion } = await import('../shared/openai-client');
    (chatCompletion as any).mockResolvedValue(JSON.stringify({
      dimensionScores: [
        { name: 'Task Fulfilment', score: 8, maxScore: 10, band: 4, justification: 'Good' },
        { name: 'Language & Style', score: 7, maxScore: 10, band: 4, justification: 'Good' },
        { name: 'Organisation & Coherence', score: 7, maxScore: 10, band: 4, justification: 'Good' },
      ],
      totalScore: 22,
      band: 4,
      strengths: [{ text: 'Clear purpose', quote: 'example' }],
      weaknesses: [{ text: 'Vocab limited', quote: 'example', suggestion: 'Expand' }],
      nextSteps: ['Read more'],
      confidence: 0.85,
      reviewRecommended: false,
    }));

    const { evaluateEssay } = await import('../marking/engine');
    const result = await evaluateEssay({
      essayText: 'Dear Sir, I am writing to express...',
      essayType: 'situational',
      essaySubType: 'letter',
      prompt: 'Write a formal letter',
    });

    expect(result.essayType).toBe('situational');
    expect(result.band).toBe(4);
    expect(result.totalScore).toBe(22);
    expect(result.dimensionScores).toHaveLength(3);
  });

  it('selects continuous rubric for continuous type', async () => {
    const { chatCompletion } = await import('../shared/openai-client');
    (chatCompletion as any).mockResolvedValue(JSON.stringify({
      dimensionScores: [
        { name: 'Content & Development', score: 6, maxScore: 10, band: 3, justification: 'OK' },
        { name: 'Language & Expression', score: 5, maxScore: 10, band: 3, justification: 'OK' },
        { name: 'Organisation & Structure', score: 5, maxScore: 10, band: 3, justification: 'OK' },
      ],
      totalScore: 16,
      band: 3,
      strengths: [{ text: 'Creative', quote: 'x' }],
      weaknesses: [{ text: 'Weak ending', quote: 'x', suggestion: 'y' }],
      nextSteps: ['Plan better'],
      confidence: 0.7,
      reviewRecommended: true,
    }));

    const { evaluateEssay } = await import('../marking/engine');
    const result = await evaluateEssay({
      essayText: 'It was a dark and stormy night...',
      essayType: 'continuous',
      prompt: 'Write a narrative',
    });

    expect(result.essayType).toBe('continuous');
    expect(result.rubricVersion).toBe('v1.0');
  });

  it('throws MarkingError on invalid JSON', async () => {
    const { chatCompletion } = await import('../shared/openai-client');
    (chatCompletion as any).mockResolvedValue('not valid json');

    const { evaluateEssay } = await import('../marking/engine');
    await expect(evaluateEssay({
      essayText: 'Test',
      essayType: 'situational',
      prompt: 'Write',
    })).rejects.toThrow('Failed to parse');
  });
});
