/** Writing Assistant — shared types */

export type EssayType = "situational" | "continuous";
export type WritingMode = "practice" | "timed" | "exam";
export type StudentLevel = "weak" | "average" | "strong"; // Band 1-2, 3, 4-5

export interface AnalysisRequest {
  text: string;
  essayType: EssayType;
  assignmentPrompt: string;
  wordTarget?: { min: number; max: number };
  studentLevel?: StudentLevel;
}

export interface StructureSection {
  label: string;
  detected: boolean;
  paragraphIndex?: number;
}

export interface RepetitionFlag {
  word: string;
  count: number;
  alternatives: string[];
}

export interface AnalysisResult {
  structure: StructureSection[];
  toneAssessment: { tone: string; appropriate: boolean; note?: string };
  wordPacing: { percentUsed: number; pointsCovered: number; totalPoints: number; warning?: string };
  repetitions: RepetitionFlag[];
  paragraphCount: number;
}

export type SuggestionType =
  | "opening"
  | "transition"
  | "vocabulary"
  | "structure"
  | "conclusion"
  | "run_on"
  | "connector"
  | "word_limit"
  | "refocus"
  | "general";

export interface SuggestionRequest {
  text: string;
  currentParagraph: string;
  cursorParagraphIndex: number;
  essayType: EssayType;
  assignmentPrompt: string;
  wordTarget?: { min: number; max: number };
  studentLevel?: StudentLevel;
}

export interface Suggestion {
  type: SuggestionType;
  text: string;
  example?: string;
}

export interface CoachRequest {
  question: string;
  essayText: string;
  essayType: EssayType;
  assignmentPrompt: string;
  history: { role: "student" | "coach"; content: string }[];
  studentLevel?: StudentLevel;
}

export interface CoachResponse {
  response: string;
  messageCount: number;
}

export type AnnotationCategory = "grammar" | "spelling" | "vocabulary" | "style" | "passive_voice";

export interface GrammarAnnotation {
  offsetStart: number;
  offsetEnd: number;
  category: AnnotationCategory;
  originalText: string;
  suggestion: string;
  explanation: string;
}

export interface GrammarCheckRequest {
  text: string;
  essayType?: EssayType;
}

export interface GrammarCheckResult {
  annotations: GrammarAnnotation[];
}

export interface LiveScoreRequest {
  text: string;
  essayType: EssayType;
  assignmentPrompt: string;
  rubricVersion?: string;
}

export interface DimensionLiveScore {
  name: string;
  score: number;
  maxScore: number;
  status: string;
  details: string[];
}

export interface NextBandTip {
  dimension: string;
  tip: string;
  potentialGain: number;
}

export interface LiveScoreResult {
  totalScore: number;
  maxScore: number;
  band: number;
  dimensions: DimensionLiveScore[];
  nextBandTips: NextBandTip[];
  paragraphCount: number;
  rubricVersion: string;
  modelId: string;
}

export interface OutlineRequest {
  topic: string;
  essayType: EssayType;
  guidingPoints?: string[];
}

export interface OutlineSection {
  section: string;
  label: string;
  suggestion: string;
}

export interface OutlineResult {
  sections: OutlineSection[];
}
