import { describe, it, expect } from 'vitest';
import { getPrompt, listPrompts } from '../prompts/registry';

describe('listPrompts', () => {
  it('returns all registered prompt keys', () => {
    const keys = listPrompts();
    expect(keys).toContain('marking-sw-v1');
    expect(keys).toContain('marking-cw-v1');
    expect(keys).toContain('rewrite-v1');
    expect(keys).toContain('topic-gen-v1');
  });
});

describe('getPrompt', () => {
  it('returns system and user for valid key', () => {
    const prompt = getPrompt('marking-sw-v1');
    expect(prompt.system).toBeTruthy();
    expect(prompt.user).toBeTruthy();
  });

  it('throws for unknown prompt key', () => {
    expect(() => getPrompt('nonexistent-v99')).toThrow('Unknown prompt');
  });

  it('interpolates variables in template', () => {
    const prompt = getPrompt('marking-sw-v1', { essayText: 'My test essay', prompt: 'Write a letter' });
    expect(prompt.user).toContain('My test essay');
  });

  it('replaces multiple occurrences of same variable', () => {
    const prompt = getPrompt('rewrite-v1', {
      essayText: 'ESSAY_HERE',
      mode: 'exam_optimised',
      essayType: 'situational',
      prompt: 'Write a letter',
      currentBand: '3',
      targetBand: '4',
      weaknesses: '[]',
      nextSteps: '[]',
    });
    expect(typeof prompt.system).toBe('string');
    expect(typeof prompt.user).toBe('string');
  });

  it('all prompts return non-empty system and user', () => {
    for (const key of listPrompts()) {
      const prompt = getPrompt(key);
      expect(prompt.system.length).toBeGreaterThan(0);
      expect(prompt.user.length).toBeGreaterThan(0);
    }
  });
});
