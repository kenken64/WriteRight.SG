/**
 * Heuristic confidence scoring for OCR output.
 */

const ILLEGIBLE_PATTERN = /\[illegible\]/gi;
const CROSSED_OUT_PATTERN = /\[crossed out:[^\]]*\]/gi;
const UNUSUAL_CHARS = /[^a-zA-Z0-9\s.,!?;:'"()\-\n]/g;

export function calculateConfidence(text: string): number {
  if (!text || text.trim().length === 0) return 0;

  let score = 1.0;
  const words = text.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  if (wordCount === 0) return 0;

  // Penalise illegible markers
  const illegibleCount = (text.match(ILLEGIBLE_PATTERN) || []).length;
  score -= (illegibleCount / wordCount) * 2;

  // Minor penalty for crossed-out sections
  const crossedOutCount = (text.match(CROSSED_OUT_PATTERN) || []).length;
  score -= (crossedOutCount / wordCount) * 0.5;

  // Penalise unusual character density
  const unusualChars = (text.match(UNUSUAL_CHARS) || []).length;
  score -= (unusualChars / text.length) * 1.5;

  // Bonus for reasonable word count (essay should be 200-1500 words)
  if (wordCount < 50) score -= 0.2;
  if (wordCount >= 200 && wordCount <= 1500) score += 0.05;

  // Penalise very short average word length (garbled text)
  const avgWordLen = words.reduce((sum, w) => sum + w.length, 0) / wordCount;
  if (avgWordLen < 2.5) score -= 0.3;

  return Math.max(0, Math.min(1, score));
}

export function needsManualReview(confidence: number): boolean {
  return confidence < 0.7;
}

export function getConfidenceLabel(confidence: number): "high" | "medium" | "low" {
  if (confidence >= 0.85) return "high";
  if (confidence >= 0.7) return "medium";
  return "low";
}
