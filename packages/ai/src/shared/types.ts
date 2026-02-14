export interface DimensionScore {
  name: string;
  score: number;
  maxScore: number;
  band: number;
  justification: string;
}

export interface FeedbackItem {
  text: string;
  quote: string;
  suggestion?: string;
}

export interface EvaluationResult {
  essayType: "situational" | "continuous";
  rubricVersion: string;
  modelId: string;
  promptVersion: string;
  dimensionScores: DimensionScore[];
  totalScore: number;
  band: number;
  strengths: FeedbackItem[];
  weaknesses: FeedbackItem[];
  nextSteps: string[];
  confidence: number;
  reviewRecommended: boolean;
}

export interface RewriteResult {
  mode: "exam_optimised" | "clarity_optimised";
  rewrittenText: string;
  diffPayload: DiffChange[];
  rationale: Record<string, string>;
  targetBand: number;
}

export interface DiffChange {
  type: "add" | "remove" | "unchanged";
  value: string;
  lineNumber?: number;
}

export interface OcrResult {
  text: string;
  confidence: number;
  pages: OcrPage[];
}

export interface OcrPage {
  pageNumber: number;
  text: string;
  confidence: number;
  imageRef: string;
}

export interface TopicPrompt {
  title: string;
  prompt: string;
  guidingPoints: string[];
  essayType: "situational" | "continuous";
  category?: string;
  level?: string;
}

export interface AchievementCheck {
  achievementCode: string;
  unlocked: boolean;
  progress: number;
  target: number;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastSubmissionDate: string | null;
  streakActive: boolean;
}
