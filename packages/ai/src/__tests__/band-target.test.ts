import { describe, it, expect } from 'vitest';
import { calculateTargetBand, getBandDescription, getImprovementFocus } from '../rewrite/band-target';

describe('calculateTargetBand', () => {
  it('returns +1 for bands 1-4', () => {
    expect(calculateTargetBand(1)).toBe(2);
    expect(calculateTargetBand(2)).toBe(3);
    expect(calculateTargetBand(3)).toBe(4);
    expect(calculateTargetBand(4)).toBe(5);
  });

  it('caps at band 5', () => {
    expect(calculateTargetBand(5)).toBe(5);
  });
});

describe('getBandDescription', () => {
  it('returns descriptions for all bands', () => {
    for (let i = 1; i <= 5; i++) {
      const desc = getBandDescription(i);
      expect(desc).toBeTruthy();
      expect(desc.length).toBeGreaterThan(10);
    }
  });

  it('returns unknown for band 0', () => {
    expect(getBandDescription(0)).toContain('Unknown');
  });
});

describe('getImprovementFocus', () => {
  it('returns focus areas for each band', () => {
    for (let i = 1; i <= 5; i++) {
      const focus = getImprovementFocus(i);
      expect(Array.isArray(focus)).toBe(true);
      expect(focus.length).toBeGreaterThan(0);
    }
  });

  it('band 1 focuses on basics', () => {
    const focus = getImprovementFocus(1);
    expect(focus.some((f) => f.toLowerCase().includes('grammar'))).toBe(true);
  });

  it('band 5 focuses on maintaining excellence', () => {
    const focus = getImprovementFocus(5);
    expect(focus.some((f) => f.toLowerCase().includes('maintain'))).toBe(true);
  });
});
