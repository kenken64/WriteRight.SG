import { describe, it, expect, vi, beforeEach } from 'vitest';
import { isValidCategory } from '../topics/categoriser';

vi.mock('../shared/openai-client', () => ({
  chatCompletion: vi.fn(),
  getOpenAIClient: vi.fn(),
}));

import { chatCompletion } from '../shared/openai-client';

describe('isValidCategory', () => {
  it('returns true for all valid categories', () => {
    const valid = ['environment', 'technology', 'social_issues', 'education', 'health', 'current_affairs'];
    for (const cat of valid) {
      expect(isValidCategory(cat)).toBe(true);
    }
  });

  it('returns false for invalid categories', () => {
    expect(isValidCategory('sports')).toBe(false);
    expect(isValidCategory('')).toBe(false);
    expect(isValidCategory('ENVIRONMENT')).toBe(false);
    expect(isValidCategory('random')).toBe(false);
  });
});

describe('categoriseTopic', () => {
  beforeEach(() => {
    vi.mocked(chatCompletion).mockReset();
  });

  it('calls OpenAI and returns valid category', async () => {
    vi.mocked(chatCompletion).mockResolvedValue('technology');
    const { categoriseTopic } = await import('../topics/categoriser');
    const result = await categoriseTopic('The impact of AI on education');
    expect(result).toBe('technology');
    expect(isValidCategory(result)).toBe(true);
  });

  it('falls back to current_affairs for unknown response', async () => {
    vi.mocked(chatCompletion).mockResolvedValue('unknown_category');
    const { categoriseTopic } = await import('../topics/categoriser');
    const result = await categoriseTopic('Something random');
    expect(result).toBe('current_affairs');
  });

  it('trims and lowercases response', async () => {
    vi.mocked(chatCompletion).mockResolvedValue('  Technology  ');
    const { categoriseTopic } = await import('../topics/categoriser');
    const result = await categoriseTopic('AI stuff');
    expect(result).toBe('technology');
  });
});
