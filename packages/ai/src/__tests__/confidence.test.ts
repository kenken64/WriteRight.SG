import { describe, it, expect } from 'vitest';
import { calculateConfidence, needsManualReview, getConfidenceLabel } from '../ocr/confidence';

describe('calculateConfidence', () => {
  it('returns 0 for empty text', () => {
    expect(calculateConfidence('')).toBe(0);
    expect(calculateConfidence('   ')).toBe(0);
  });

  it('returns high confidence for clean text', () => {
    const cleanEssay = 'The importance of education cannot be understated. In Singapore, students are encouraged to pursue academic excellence from a young age. This has led to a society that values learning and knowledge. Furthermore, the government has invested heavily in educational infrastructure.';
    const confidence = calculateConfidence(cleanEssay);
    expect(confidence).toBeGreaterThanOrEqual(0.8);
  });

  it('penalises illegible markers', () => {
    const clean = 'This is a normal essay about education in Singapore.';
    const withIllegible = 'This is a [illegible] essay about [illegible] in Singapore.';
    expect(calculateConfidence(withIllegible)).toBeLessThan(calculateConfidence(clean));
  });

  it('penalises crossed-out sections', () => {
    const clean = 'This is a normal sentence.';
    const withCrossed = 'This is a [crossed out: bad word] sentence.';
    expect(calculateConfidence(withCrossed)).toBeLessThan(calculateConfidence(clean));
  });

  it('penalises very short text', () => {
    const short = 'Hello world.';
    const confidence = calculateConfidence(short);
    expect(confidence).toBeLessThan(0.9);
  });

  it('returns value between 0 and 1', () => {
    const texts = [
      'Normal essay text here.',
      '[illegible] [illegible] [illegible]',
      'A'.repeat(500),
      '!@#$%^&*()',
    ];
    for (const text of texts) {
      const c = calculateConfidence(text);
      expect(c).toBeGreaterThanOrEqual(0);
      expect(c).toBeLessThanOrEqual(1);
    }
  });
});

describe('needsManualReview', () => {
  it('returns true for low confidence', () => {
    expect(needsManualReview(0.5)).toBe(true);
    expect(needsManualReview(0.69)).toBe(true);
  });

  it('returns false for high confidence', () => {
    expect(needsManualReview(0.7)).toBe(false);
    expect(needsManualReview(0.95)).toBe(false);
  });
});

describe('getConfidenceLabel', () => {
  it('returns correct labels', () => {
    expect(getConfidenceLabel(0.9)).toBe('high');
    expect(getConfidenceLabel(0.85)).toBe('high');
    expect(getConfidenceLabel(0.75)).toBe('medium');
    expect(getConfidenceLabel(0.5)).toBe('low');
    expect(getConfidenceLabel(0.1)).toBe('low');
  });
});
