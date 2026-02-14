import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../shared/openai-client', () => ({
  chatCompletion: vi.fn(),
  getOpenAIClient: vi.fn(),
}));

describe('checkGrammar', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('returns annotations from AI response', async () => {
    const { chatCompletion } = await import('../shared/openai-client');
    (chatCompletion as any).mockResolvedValue(JSON.stringify({
      annotations: [
        { offsetStart: 0, offsetEnd: 4, category: 'grammar', originalText: 'ther', suggestion: 'there', explanation: 'Spelling error' },
        { offsetStart: 10, offsetEnd: 15, category: 'vocabulary', originalText: 'good', suggestion: 'excellent', explanation: 'Use stronger vocab' },
      ],
    }));

    const { checkGrammar } = await import('../writing-assistant/grammar-checker');
    const result = await checkGrammar({ text: 'Ther is a good example of writing here.', essayType: 'continuous' });

    expect(result.annotations).toHaveLength(2);
    expect(result.annotations[0].category).toBe('grammar');
    expect(result.annotations[1].category).toBe('vocabulary');
  });

  it('returns empty for very short text', async () => {
    const { checkGrammar } = await import('../writing-assistant/grammar-checker');
    const result = await checkGrammar({ text: 'Hi' });
    expect(result.annotations).toEqual([]);
  });

  it('returns empty for empty text', async () => {
    const { checkGrammar } = await import('../writing-assistant/grammar-checker');
    const result = await checkGrammar({ text: '' });
    expect(result.annotations).toEqual([]);
  });

  it('filters out invalid annotations', async () => {
    const { chatCompletion } = await import('../shared/openai-client');
    (chatCompletion as any).mockResolvedValue(JSON.stringify({
      annotations: [
        { offsetStart: 0, offsetEnd: 5, category: 'grammar', originalText: 'hello', suggestion: 'Hello', explanation: 'Capitalize' },
        { offsetStart: 10, offsetEnd: 5, category: 'grammar', originalText: 'bad', suggestion: 'good', explanation: 'x' }, // end < start
        { offsetStart: 0, offsetEnd: 5, category: 'grammar', originalText: null, suggestion: 'x', explanation: 'x' }, // null original
      ],
    }));

    const { checkGrammar } = await import('../writing-assistant/grammar-checker');
    const result = await checkGrammar({ text: 'hello world this is a test sentence for checking.' });
    expect(result.annotations).toHaveLength(1);
  });

  it('normalises unknown categories to grammar', async () => {
    const { chatCompletion } = await import('../shared/openai-client');
    (chatCompletion as any).mockResolvedValue(JSON.stringify({
      annotations: [
        { offsetStart: 0, offsetEnd: 5, category: 'unknown_cat', originalText: 'hello', suggestion: 'Hello', explanation: 'x' },
      ],
    }));

    const { checkGrammar } = await import('../writing-assistant/grammar-checker');
    const result = await checkGrammar({ text: 'hello world test sentence for grammar.' });
    expect(result.annotations[0].category).toBe('grammar');
  });

  it('returns empty on JSON parse error', async () => {
    const { chatCompletion } = await import('../shared/openai-client');
    (chatCompletion as any).mockResolvedValue('not json');

    const { checkGrammar } = await import('../writing-assistant/grammar-checker');
    const result = await checkGrammar({ text: 'This is a test sentence for grammar checking purposes.' });
    expect(result.annotations).toEqual([]);
  });
});
