import { describe, it, expect } from 'vitest';
import { getSituationalRubric } from '../marking/rubrics/situational';

describe('getSituationalRubric', () => {
  it('returns rubric with correct essay type', () => {
    const rubric = getSituationalRubric();
    expect(rubric.essayType).toBe('situational');
  });

  it('has total max score of 30', () => {
    expect(getSituationalRubric().totalMaxScore).toBe(30);
  });

  it('has 3 dimensions', () => {
    const rubric = getSituationalRubric();
    expect(rubric.dimensions).toHaveLength(3);
  });

  it('each dimension has max score of 10', () => {
    for (const dim of getSituationalRubric().dimensions) {
      expect(dim.maxScore).toBe(10);
    }
  });

  it('each dimension has 5 bands', () => {
    for (const dim of getSituationalRubric().dimensions) {
      expect(dim.bands).toHaveLength(5);
      const bandNumbers = dim.bands.map((b) => b.band).sort();
      expect(bandNumbers).toEqual([1, 2, 3, 4, 5]);
    }
  });

  it('band score ranges do not overlap within a dimension', () => {
    for (const dim of getSituationalRubric().dimensions) {
      const sorted = [...dim.bands].sort((a, b) => a.minScore - b.minScore);
      for (let i = 1; i < sorted.length; i++) {
        expect(sorted[i].minScore).toBeGreaterThan(sorted[i - 1].maxScore);
      }
    }
  });

  it('sets subType for known subtypes', () => {
    expect(getSituationalRubric('letter').subType).toBe('letter');
    expect(getSituationalRubric('email').subType).toBe('email');
    expect(getSituationalRubric('report').subType).toBe('report');
    expect(getSituationalRubric('speech').subType).toBe('speech');
    expect(getSituationalRubric('proposal').subType).toBe('proposal');
  });

  it('ignores unknown subtype', () => {
    const rubric = getSituationalRubric('unknown_type');
    expect(rubric.subType).toBeUndefined();
  });

  it('returns rubric without subType when none given', () => {
    const rubric = getSituationalRubric();
    expect(rubric.subType).toBeUndefined();
  });

  it('has descriptors for every band', () => {
    for (const dim of getSituationalRubric().dimensions) {
      for (const band of dim.bands) {
        expect(band.descriptors.length).toBeGreaterThan(0);
      }
    }
  });
});
