import { describe, it, expect } from 'vitest';
import { getVoiceForUseCase, getVoiceDescription, getAllVoices, isValidVoice } from '../tts/voices';

describe('getVoiceForUseCase', () => {
  it('returns profile for feedback', () => {
    const profile = getVoiceForUseCase('feedback');
    expect(profile.voice).toBe('nova');
    expect(profile.model).toBe('tts-1');
    expect(profile.speed).toBe(1.0);
    expect(profile.description).toBeTruthy();
  });

  it('returns profile for rewrite', () => {
    const profile = getVoiceForUseCase('rewrite');
    expect(profile.voice).toBe('shimmer');
    expect(profile.model).toBe('tts-1-hd');
    expect(profile.speed).toBe(0.9);
  });

  it('returns profile for vocabulary', () => {
    const profile = getVoiceForUseCase('vocabulary');
    expect(profile.voice).toBe('onyx');
    expect(profile.speed).toBe(0.75);
  });
});

describe('getVoiceDescription', () => {
  it('returns description for all voices', () => {
    const voices = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'] as const;
    for (const v of voices) {
      expect(getVoiceDescription(v)).toBeTruthy();
      expect(getVoiceDescription(v).length).toBeGreaterThan(5);
    }
  });
});

describe('getAllVoices', () => {
  it('returns all 6 voices', () => {
    const voices = getAllVoices();
    expect(voices).toHaveLength(6);
    voices.forEach((v) => {
      expect(v.voice).toBeTruthy();
      expect(v.description).toBeTruthy();
    });
  });
});

describe('isValidVoice', () => {
  it('returns true for valid voices', () => {
    expect(isValidVoice('nova')).toBe(true);
    expect(isValidVoice('alloy')).toBe(true);
    expect(isValidVoice('shimmer')).toBe(true);
  });

  it('returns false for invalid voices', () => {
    expect(isValidVoice('invalid')).toBe(false);
    expect(isValidVoice('')).toBe(false);
    expect(isValidVoice('NOVA')).toBe(false);
  });
});
