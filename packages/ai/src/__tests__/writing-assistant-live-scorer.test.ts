import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../shared/openai-client', () => ({
  chatCompletion: vi.fn(),
  getOpenAIClient: vi.fn(),
}));

describe('scoreLive', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('returns default score for very short text', async () => {
    const { scoreLive } = await import('../writing-assistant/live-scorer');
    const result = await scoreLive({
      text: 'Hi',
      essayType: 'situational',
      assignmentPrompt: 'Write a letter',
    });

    expect(result.totalScore).toBe(0);
    expect(result.band).toBe(1);
    expect(result.maxScore).toBe(30);
    expect(result.nextBandTips[0].tip).toContain('Start writing');
    expect(result.paragraphCount).toBe(0);
  });

  it('returns default score for empty text', async () => {
    const { scoreLive } = await import('../writing-assistant/live-scorer');
    const result = await scoreLive({
      text: '',
      essayType: 'continuous',
      assignmentPrompt: 'Write',
    });
    expect(result.totalScore).toBe(0);
  });

  it('parses AI response into structured result', async () => {
    const { chatCompletion } = await import('../shared/openai-client');
    (chatCompletion as any).mockResolvedValue(JSON.stringify({
      totalScore: 18,
      maxScore: 30,
      band: 3,
      dimensions: [
        { name: 'Task Fulfilment', score: 6, maxScore: 10, status: 'Developing', details: ['Covers main points'] },
        { name: 'Language', score: 6, maxScore: 10, status: 'Developing', details: ['Some variety'] },
        { name: 'Organisation', score: 6, maxScore: 10, status: 'Developing', details: ['Basic structure'] },
      ],
      nextBandTips: [
        { dimension: 'Language', tip: 'Use more varied vocabulary', potentialGain: 2 },
      ],
    }));

    const { scoreLive } = await import('../writing-assistant/live-scorer');
    const result = await scoreLive({
      text: 'Dear Sir, I am writing to express my concerns about the recent changes in our school policy. The changes have affected many students negatively.',
      essayType: 'situational',
      assignmentPrompt: 'Write a formal letter',
    });

    expect(result.totalScore).toBe(18);
    expect(result.band).toBe(3);
    expect(result.dimensions).toHaveLength(3);
    expect(result.nextBandTips).toHaveLength(1);
    expect(result.nextBandTips[0].dimension).toBe('Language');
    expect(result.modelId).toBe('gpt-4o-mini');
  });

  it('returns fallback on parse error', async () => {
    const { chatCompletion } = await import('../shared/openai-client');
    (chatCompletion as any).mockResolvedValue('not json at all');

    const { scoreLive } = await import('../writing-assistant/live-scorer');
    const result = await scoreLive({
      text: 'A sufficiently long text for scoring that passes the minimum length check for the scorer.',
      essayType: 'continuous',
      assignmentPrompt: 'Write a story',
    });

    expect(result.totalScore).toBe(0);
    expect(result.band).toBe(1);
    expect(result.dimensions).toEqual([]);
  });

  it('counts paragraphs correctly', async () => {
    const { chatCompletion } = await import('../shared/openai-client');
    (chatCompletion as any).mockResolvedValue(JSON.stringify({
      totalScore: 10,
      band: 2,
      dimensions: [],
      nextBandTips: [],
    }));

    const { scoreLive } = await import('../writing-assistant/live-scorer');
    const result = await scoreLive({
      text: 'Paragraph one here with enough content.\n\nParagraph two with more content.\n\nParagraph three ending.',
      essayType: 'continuous',
      assignmentPrompt: 'Write',
    });

    expect(result.paragraphCount).toBe(3);
  });

  it('uses custom rubric version when provided', async () => {
    const { chatCompletion } = await import('../shared/openai-client');
    (chatCompletion as any).mockResolvedValue(JSON.stringify({ totalScore: 15, band: 3, dimensions: [], nextBandTips: [] }));

    const { scoreLive } = await import('../writing-assistant/live-scorer');
    const result = await scoreLive({
      text: 'Some text that is long enough to pass the minimum length requirement for scoring.',
      essayType: 'situational',
      assignmentPrompt: 'Write',
      rubricVersion: 'custom-v2',
    });

    expect(result.rubricVersion).toBe('custom-v2');
  });
});
