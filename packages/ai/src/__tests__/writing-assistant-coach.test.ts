import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockCreate = vi.fn();
vi.mock('../shared/openai-client', () => ({
  getOpenAIClient: () => ({
    chat: { completions: { create: mockCreate } },
  }),
}));

import { chatWithCoach } from '../writing-assistant/coach';

describe('chatWithCoach', () => {
  beforeEach(() => {
    mockCreate.mockReset();
  });

  it('returns response from AI', async () => {
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: 'Try adding more detail to your introduction.' } }],
    });

    const result = await chatWithCoach({
      question: 'How should I start?',
      essayText: 'My draft essay...',
      essayType: 'situational',
      assignmentPrompt: 'Write a letter',
      history: [],
    });

    expect(result.response).toBe('Try adding more detail to your introduction.');
    expect(result.messageCount).toBe(1);
  });

  it('enforces message limit of 15', async () => {
    const history = Array.from({ length: 15 }, (_, i) => ({
      role: 'student' as const,
      content: `Message ${i}`,
    }));

    const result = await chatWithCoach({
      question: 'One more question',
      essayText: '',
      essayType: 'continuous',
      assignmentPrompt: 'Write',
      history,
    });

    expect(result.response).toContain('reached the chat limit');
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('includes essay context in messages', async () => {
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: 'Good start!' } }],
    });

    await chatWithCoach({
      question: 'Is this okay?',
      essayText: 'My essay about education...',
      essayType: 'continuous',
      assignmentPrompt: 'Write about education',
      history: [],
    });

    const messages = mockCreate.mock.calls[0][0].messages;
    expect(messages.some((m: any) => m.content.includes('My essay about education'))).toBe(true);
  });

  it('handles empty AI response gracefully', async () => {
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: null } }],
    });

    const result = await chatWithCoach({
      question: 'Help?',
      essayText: '',
      essayType: 'situational',
      assignmentPrompt: 'Write',
      history: [],
    });

    expect(result.response).toContain('not sure how to help');
  });

  it('adapts system prompt for student level', async () => {
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: 'Response' } }],
    });

    await chatWithCoach({
      question: 'Help',
      essayText: '',
      essayType: 'continuous',
      assignmentPrompt: 'Write',
      history: [],
      studentLevel: 'weak',
    });

    const systemMsg = mockCreate.mock.calls[0][0].messages[0].content;
    expect(systemMsg).toContain('simple language');
  });
});
