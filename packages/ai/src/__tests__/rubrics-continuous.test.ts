import { describe, it, expect } from 'vitest';
import { getContinuousRubric } from '../marking/rubrics/continuous';

describe('getContinuousRubric', () => {
  it('returns rubric with correct essay type', () => {
    expect(getContinuousRubric().essayType).toBe('continuous');
  });

  it('has total max score of 30', () => {
    expect(getContinuousRubric().totalMaxScore).toBe(30);
  });

  it('has 3 dimensions', () => {
    expect(getContinuousRubric().dimensions).toHaveLength(3);
  });

  it('each dimension has max score of 10', () => {
    for (const dim of getContinuousRubric().dimensions) {
      expect(dim.maxScore).toBe(10);
    }
  });

  it('each dimension has 5 bands', () => {
    for (const dim of getContinuousRubric().dimensions) {
      expect(dim.bands).toHaveLength(5);
      const bands = dim.bands.map((b) => b.band).sort();
      expect(bands).toEqual([1, 2, 3, 4, 5]);
    }
  });

  it('band score ranges cover 0-10', () => {
    for (const dim of getContinuousRubric().dimensions) {
      const sorted = [...dim.bands].sort((a, b) => a.minScore - b.minScore);
      expect(sorted[0].minScore).toBe(0);
      expect(sorted[sorted.length - 1].maxScore).toBe(10);
    }
  });

  it('sets subType when provided', () => {
    const rubric = getContinuousRubric('narrative');
    expect(rubric.subType).toBe('narrative');
  });

  it('subType is undefined when not provided', () => {
    expect(getContinuousRubric().subType).toBeUndefined();
  });

  it('dimension names are for continuous writing', () => {
    const names = getContinuousRubric().dimensions.map((d) => d.name);
    expect(names).toContain('Content & Development');
    expect(names).toContain('Language & Expression');
    expect(names).toContain('Organisation & Structure');
  });

  it('has descriptors for every band', () => {
    for (const dim of getContinuousRubric().dimensions) {
      for (const band of dim.bands) {
        expect(band.descriptors.length).toBeGreaterThan(0);
      }
    }
  });
});
