import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('openai', () => {
  const mockCreate = vi.fn();
  return {
    default: class OpenAI {
      chat = { completions: { create: mockCreate } };
      constructor() {}
    },
    __mockCreate: mockCreate,
  };
});

beforeEach(() => {
  vi.resetModules();
  process.env.OPENAI_API_KEY = 'test-key';
});

describe('chatCompletion', () => {
  it('sends system and user messages', async () => {
    const { __mockCreate } = await import('openai') as any;
    __mockCreate.mockResolvedValue({
      choices: [{ message: { content: 'response text' } }],
    });

    const { chatCompletion } = await import('../shared/openai-client');
    const result = await chatCompletion('system prompt', 'user prompt');
    expect(result).toBe('response text');
    expect(__mockCreate).toHaveBeenCalledWith(expect.objectContaining({
      messages: [
        { role: 'system', content: 'system prompt' },
        { role: 'user', content: 'user prompt' },
      ],
    }));
  });

  it('uses custom options', async () => {
    const { __mockCreate } = await import('openai') as any;
    __mockCreate.mockResolvedValue({
      choices: [{ message: { content: '{}' } }],
    });

    const { chatCompletion } = await import('../shared/openai-client');
    await chatCompletion('sys', 'user', { model: 'gpt-4o-mini', temperature: 0, maxTokens: 100, jsonMode: true });
    expect(__mockCreate).toHaveBeenCalledWith(expect.objectContaining({
      model: 'gpt-4o-mini',
      temperature: 0,
      max_tokens: 100,
      response_format: { type: 'json_object' },
    }));
  });

  it('returns empty string when no content', async () => {
    const { __mockCreate } = await import('openai') as any;
    __mockCreate.mockResolvedValue({ choices: [{ message: { content: null } }] });

    const { chatCompletion } = await import('../shared/openai-client');
    const result = await chatCompletion('sys', 'user');
    expect(result).toBe('');
  });
});
