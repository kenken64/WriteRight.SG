import { describe, it, expect } from 'vitest';
import { estimateImageQuality } from '../ocr/image-preprocess';

describe('estimateImageQuality', () => {
  it('returns low for small images', () => {
    expect(estimateImageQuality({ width: 300, height: 400, size: 50000 })).toBe('low');
  });

  it('returns medium for moderate images', () => {
    expect(estimateImageQuality({ width: 1000, height: 1000, size: 200000 })).toBe('medium');
  });

  it('returns high for large images', () => {
    expect(estimateImageQuality({ width: 2000, height: 1500, size: 500000 })).toBe('high');
  });

  it('boundary: exactly 500k pixels is medium', () => {
    expect(estimateImageQuality({ width: 1000, height: 500, size: 100000 })).toBe('medium');
  });

  it('boundary: exactly 2M pixels is high', () => {
    expect(estimateImageQuality({ width: 2000, height: 1000, size: 100000 })).toBe('high');
  });

  it('handles very small dimensions', () => {
    expect(estimateImageQuality({ width: 10, height: 10, size: 100 })).toBe('low');
  });
});
