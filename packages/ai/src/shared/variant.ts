export type Variant = "sg" | "international";

export function getVariant(): Variant {
  const v = process.env.NEXT_PUBLIC_VARIANT ?? "sg";
  return v === "international" ? "international" : "sg";
}

export interface VariantConfig {
  variant: Variant;
  productName: string;
  examBoard: string;
  calibrationStandard: string;
  studentContext: string;
  vocabRange: string;
  terminology: string;
  topicRelevance: string;
  defaultLevel: string;
  levels: string[];
  levelLabels: Record<string, string>;
  rewriteRichOutput: boolean;
  coachLanguageRule: string;

  // Prompt-specific strings
  markingSwExaminer: string;
  markingRubricSource: string;
  markingSwCalibration: string;
  markingCwExaminer: string;
  markingCwCalibration: string;
  topicGenIntro: string;
  topicGenRelevance: string;
  rewriteTutorIntro: string;
  rewriteVocabRange: string;
  grammarContext: string;
  rubricVersion: string;
  liveScorerIntro: string;
  coachContext: string;
  analyzerContext: string;
  outlineContext: string;
}

const SG_CONFIG: VariantConfig = {
  variant: "sg",
  productName: "WriteRight SG",
  examBoard: "Singapore O-Level",
  calibrationStandard: "O-Level standard",
  studentContext: "Singapore secondary school",
  vocabRange: "Sec 3-5 student",
  terminology: "Singapore English teaching terminology",
  topicRelevance: "Singapore context",
  defaultLevel: "sec4",
  levels: ["sec1", "sec2", "sec3", "sec4", "sec5"],
  levelLabels: {
    sec1: "Sec 1",
    sec2: "Sec 2",
    sec3: "Sec 3",
    sec4: "Sec 4",
    sec5: "Sec 5",
  },
  rewriteRichOutput: true,
  coachLanguageRule:
    "Use Singapore-appropriate English (but correct Singlish if used in formal writing).",

  // Prompt strings
  markingSwExaminer:
    "You are an expert Singapore O-Level English Language examiner specialising in Situational Writing (Paper 1, Section A).",
  markingRubricSource: "the official MOE rubric",
  markingSwCalibration:
    "Calibrate to O-Level standard — Band 3 = average competent student, Band 5 = exceptional.",
  markingCwExaminer:
    "You are an expert Singapore O-Level English Language examiner specialising in Continuous Writing (Paper 1, Section B).",
  markingCwCalibration: "Calibrate to O-Level standard.",
  topicGenIntro:
    "You generate O-Level English essay topics for Singapore secondary school students.",
  topicGenRelevance: "Relevance to Singapore context",
  rewriteTutorIntro:
    "You are an expert English writing tutor for Singapore O-Level students.",
  rewriteVocabRange:
    "Use vocabulary appropriate for a strong Sec 3-5 student (not university level)",
  grammarContext:
    "You are a grammar checker for Singapore secondary school English essays.",
  rubricVersion: "sg-olevel-v1",
  liveScorerIntro:
    "You are an O Level English essay scorer for Singapore students.",
  coachContext:
    "You are a friendly writing coach for a Singapore secondary school student preparing for O Level English.",
  analyzerContext:
    "You are an essay analysis engine for Singapore secondary school students.",
  outlineContext:
    "You are a writing coach helping Singapore secondary school students plan essays.",
};

const INTERNATIONAL_CONFIG: VariantConfig = {
  variant: "international",
  productName: "Sharpener",
  examBoard: "Cambridge/IELTS",
  calibrationStandard: "Cambridge IGCSE standard",
  studentContext: "high school",
  vocabRange: "Year 9-11 student",
  terminology: "standard English teaching terminology",
  topicRelevance: "global/current affairs",
  defaultLevel: "sec4",
  levels: ["sec3", "sec4", "sec5"],
  levelLabels: {
    sec3: "Year 9",
    sec4: "Year 10",
    sec5: "Year 11",
  },
  rewriteRichOutput: false,
  coachLanguageRule:
    "Use clear, concise English following NYT editorial standards.",

  // Prompt strings
  markingSwExaminer:
    "You are an expert Cambridge IGCSE English Language examiner specialising in Situational Writing.",
  markingRubricSource: "the following rubric",
  markingSwCalibration:
    "Calibrate to Cambridge IGCSE standard — Band 3 = average competent student, Band 5 = exceptional.",
  markingCwExaminer:
    "You are an expert Cambridge IGCSE English Language examiner specialising in Continuous Writing.",
  markingCwCalibration: "Calibrate to Cambridge IGCSE standard.",
  topicGenIntro:
    "You generate Cambridge IGCSE English essay topics for high school students.",
  topicGenRelevance: "Relevance to global/current affairs",
  rewriteTutorIntro:
    "You are an expert English writing tutor for Cambridge IGCSE students.",
  rewriteVocabRange:
    "Use vocabulary appropriate for a strong Year 9-11 student (not university level)",
  grammarContext: "You are a grammar checker for high school English essays.",
  rubricVersion: "intl-igcse-v1",
  liveScorerIntro:
    "You are an English essay scorer for Cambridge IGCSE students.",
  coachContext:
    "You are a friendly writing coach for a high school student preparing for Cambridge IGCSE English.",
  analyzerContext: "You are an essay analysis engine for high school students.",
  outlineContext:
    "You are a writing coach helping high school students plan essays.",
};

let _cachedConfig: VariantConfig | null = null;
let _cachedVariant: Variant | null = null;

export function getVariantConfig(): VariantConfig {
  const v = getVariant();
  if (_cachedConfig && _cachedVariant === v) return _cachedConfig;
  _cachedConfig = v === "international" ? { ...INTERNATIONAL_CONFIG } : { ...SG_CONFIG };
  _cachedVariant = v;
  return _cachedConfig;
}
