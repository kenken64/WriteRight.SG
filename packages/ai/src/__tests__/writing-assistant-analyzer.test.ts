import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../shared/openai-client', () => ({
  chatCompletion: vi.fn(),
  getOpenAIClient: vi.fn(),
}));

describe('analyzeEssay', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('returns analysis with structure, tone, pacing, repetitions', async () => {
    const { chatCompletion } = await import('../shared/openai-client');
    (chatCompletion as any).mockResolvedValue(JSON.stringify({
      structure: [
        { label: 'Introduction', detected: true, paragraphIndex: 0 },
        { label: 'Body', detected: true, paragraphIndex: 1 },
        { label: 'Conclusion', detected: true, paragraphIndex: 2 },
      ],
      toneAssessment: { tone: 'formal', appropriate: true },
      wordPacing: { percentUsed: 60, pointsCovered: 2, totalPoints: 3 },
      repetitions: [{ word: 'very', count: 5, alternatives: ['extremely', 'quite'] }],
      paragraphCount: 3,
    }));

    const { analyzeEssay } = await import('../writing-assistant/analyzer');
    const result = await analyzeEssay({
      text: 'Para 1.\n\nPara 2.\n\nPara 3.',
      essayType: 'situational',
      assignmentPrompt: 'Write a letter',
      wordTarget: { min: 200, max: 400 },
    });

    expect(result.structure).toHaveLength(3);
    expect(result.toneAssessment.tone).toBe('formal');
    expect(result.wordPacing.percentUsed).toBe(60);
    expect(result.repetitions).toHaveLength(1);
    expect(result.paragraphCount).toBe(3);
  });

  it('falls back to local analysis on parse error', async () => {
    const { chatCompletion } = await import('../shared/openai-client');
    (chatCompletion as any).mockResolvedValue('invalid json');

    const { analyzeEssay } = await import('../writing-assistant/analyzer');
    const result = await analyzeEssay({
      text: 'Paragraph one.\n\nParagraph two.\n\nParagraph three.',
      essayType: 'continuous',
      assignmentPrompt: 'Write a story',
    });

    expect(result.structure).toHaveLength(3);
    expect(result.structure[0].label).toBe('Introduction');
    expect(result.toneAssessment.tone).toBe('unknown');
    expect(result.paragraphCount).toBe(3);
  });

  it('calculates word pacing from text when AI fails', async () => {
    const { chatCompletion } = await import('../shared/openai-client');
    (chatCompletion as any).mockResolvedValue('bad');

    const { analyzeEssay } = await import('../writing-assistant/analyzer');
    const words = Array(100).fill('word').join(' ');
    const result = await analyzeEssay({
      text: words,
      essayType: 'continuous',
      assignmentPrompt: 'Write',
      wordTarget: { min: 200, max: 400 },
    });

    expect(result.wordPacing.percentUsed).toBe(25); // 100/400
  });
});
