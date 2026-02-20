import { describe, it, expect, afterEach } from 'vitest';
import { getVariant, getVariantConfig } from '../shared/variant';
import { getPrompt } from '../prompts/registry';

describe('getVariant', () => {
  const originalEnv = process.env.NEXT_PUBLIC_VARIANT;

  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env.NEXT_PUBLIC_VARIANT;
    } else {
      process.env.NEXT_PUBLIC_VARIANT = originalEnv;
    }
  });

  it('defaults to "sg" when env not set', () => {
    delete process.env.NEXT_PUBLIC_VARIANT;
    expect(getVariant()).toBe('sg');
  });

  it('returns "sg" when env is "sg"', () => {
    process.env.NEXT_PUBLIC_VARIANT = 'sg';
    expect(getVariant()).toBe('sg');
  });

  it('returns "international" when env is "international"', () => {
    process.env.NEXT_PUBLIC_VARIANT = 'international';
    expect(getVariant()).toBe('international');
  });

  it('defaults to "sg" for unknown values', () => {
    process.env.NEXT_PUBLIC_VARIANT = 'unknown';
    expect(getVariant()).toBe('sg');
  });
});

describe('getVariantConfig', () => {
  const originalEnv = process.env.NEXT_PUBLIC_VARIANT;

  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env.NEXT_PUBLIC_VARIANT;
    } else {
      process.env.NEXT_PUBLIC_VARIANT = originalEnv;
    }
  });

  it('returns SG config by default', () => {
    delete process.env.NEXT_PUBLIC_VARIANT;
    const config = getVariantConfig();
    expect(config.variant).toBe('sg');
    expect(config.productName).toBe('WriteRight SG');
    expect(config.examBoard).toBe('Singapore O-Level');
    expect(config.defaultLevel).toBe('sec4');
    expect(config.levels).toEqual(['sec1', 'sec2', 'sec3', 'sec4', 'sec5']);
    expect(config.rewriteRichOutput).toBe(true);
  });

  it('returns international config when set', () => {
    process.env.NEXT_PUBLIC_VARIANT = 'international';
    const config = getVariantConfig();
    expect(config.variant).toBe('international');
    expect(config.productName).toBe('Sharpener');
    expect(config.examBoard).toBe('Cambridge/IELTS');
    expect(config.defaultLevel).toBe('sec4');
    expect(config.levels).toEqual(['sec3', 'sec4', 'sec5']);
    expect(config.rewriteRichOutput).toBe(false);
  });

  it('SG config contains Singapore-specific prompt strings', () => {
    delete process.env.NEXT_PUBLIC_VARIANT;
    const config = getVariantConfig();
    expect(config.markingSwExaminer).toContain('Singapore O-Level');
    expect(config.markingRubricSource).toContain('MOE');
    expect(config.terminology).toContain('Singapore');
    expect(config.coachLanguageRule).toContain('Singapore-appropriate');
    expect(config.rubricVersion).toBe('sg-olevel-v1');
  });

  it('international config contains Cambridge-specific prompt strings', () => {
    process.env.NEXT_PUBLIC_VARIANT = 'international';
    const config = getVariantConfig();
    expect(config.markingSwExaminer).toContain('Cambridge IGCSE');
    expect(config.markingRubricSource).not.toContain('MOE');
    expect(config.terminology).toContain('standard English');
    expect(config.coachLanguageRule).toContain('NYT editorial');
    expect(config.rubricVersion).toBe('intl-igcse-v1');
  });

  it('SG level labels use "Sec" prefix', () => {
    delete process.env.NEXT_PUBLIC_VARIANT;
    const config = getVariantConfig();
    expect(config.levelLabels['sec4']).toBe('Sec 4');
  });

  it('international level labels use "Year" prefix', () => {
    process.env.NEXT_PUBLIC_VARIANT = 'international';
    const config = getVariantConfig();
    expect(config.levelLabels['sec4']).toBe('Year 10');
  });

  it('cache updates when variant changes', () => {
    process.env.NEXT_PUBLIC_VARIANT = 'sg';
    expect(getVariantConfig().productName).toBe('WriteRight SG');

    process.env.NEXT_PUBLIC_VARIANT = 'international';
    expect(getVariantConfig().productName).toBe('Sharpener');
  });
});

describe('prompt functions respect variant', () => {
  const originalEnv = process.env.NEXT_PUBLIC_VARIANT;

  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env.NEXT_PUBLIC_VARIANT;
    } else {
      process.env.NEXT_PUBLIC_VARIANT = originalEnv;
    }
  });

  it('SG marking-sw prompt contains Singapore O-Level and MOE', () => {
    process.env.NEXT_PUBLIC_VARIANT = 'sg';
    const prompt = getPrompt('marking-sw-v1');
    expect(prompt.system).toContain('Singapore O-Level');
    expect(prompt.system).toContain('MOE rubric');
  });

  it('international marking-sw prompt contains Cambridge IGCSE', () => {
    process.env.NEXT_PUBLIC_VARIANT = 'international';
    const prompt = getPrompt('marking-sw-v1');
    expect(prompt.system).toContain('Cambridge IGCSE');
    expect(prompt.system).not.toContain('MOE rubric');
  });

  it('SG rewrite prompt includes bandJustification', () => {
    process.env.NEXT_PUBLIC_VARIANT = 'sg';
    const prompt = getPrompt('rewrite-v1');
    expect(prompt.system).toContain('bandJustification');
    expect(prompt.system).toContain('paragraphAnnotations');
  });

  it('international rewrite prompt excludes bandJustification', () => {
    process.env.NEXT_PUBLIC_VARIANT = 'international';
    const prompt = getPrompt('rewrite-v1');
    expect(prompt.system).not.toContain('bandJustification');
    expect(prompt.system).not.toContain('paragraphAnnotations');
  });

  it('SG topic gen references Singapore context', () => {
    process.env.NEXT_PUBLIC_VARIANT = 'sg';
    const prompt = getPrompt('topic-gen-v1');
    expect(prompt.system).toContain('Singapore');
  });

  it('international topic gen references global/current affairs', () => {
    process.env.NEXT_PUBLIC_VARIANT = 'international';
    const prompt = getPrompt('topic-gen-v1');
    expect(prompt.system).toContain('global/current affairs');
  });

  it('SG marking-cw prompt contains O-Level standard', () => {
    process.env.NEXT_PUBLIC_VARIANT = 'sg';
    const prompt = getPrompt('marking-cw-v1');
    expect(prompt.system).toContain('O-Level standard');
  });

  it('international marking-cw prompt contains Cambridge IGCSE standard', () => {
    process.env.NEXT_PUBLIC_VARIANT = 'international';
    const prompt = getPrompt('marking-cw-v1');
    expect(prompt.system).toContain('Cambridge IGCSE standard');
  });
});
