'use client';

import { useMemo } from 'react';
import { AudioPlayer } from './audio-player';

interface DimensionScore {
  name: string;
  score: number;
  maxScore: number;
  band: number;
}

interface FeedbackItemData {
  text: string;
  quote?: string;
  suggestion?: string;
}

interface ListenToFeedbackProps {
  band: number;
  totalScore: number;
  dimensions: DimensionScore[];
  strengths: FeedbackItemData[];
  weaknesses: FeedbackItemData[];
  nextSteps: string[];
  submissionId?: string;
}

/** Compose a natural-sounding script from structured evaluation data. */
function composeFeedbackScript(props: ListenToFeedbackProps): string {
  const { band, totalScore, dimensions, strengths, weaknesses, nextSteps } = props;

  const lines: string[] = [];

  // Opening
  lines.push(
    `Your essay scored ${totalScore} out of 30, which places you in Band ${band}.`,
  );

  // Per-dimension
  if (dimensions.length > 0) {
    lines.push('Here is how you did in each area.');
    for (const d of dimensions) {
      lines.push(`${d.name}: ${d.score} out of ${d.maxScore}.`);
    }
  }

  // Strengths
  if (strengths.length > 0) {
    lines.push("Let's start with what you did well.");
    for (const s of strengths) {
      lines.push(s.text);
    }
  }

  // Weaknesses
  if (weaknesses.length > 0) {
    lines.push('Now, here are some areas you can improve.');
    for (const w of weaknesses) {
      let line = w.text;
      if (w.suggestion) line += ` Here is a suggestion: ${w.suggestion}`;
      lines.push(line);
    }
  }

  // Next steps
  if (nextSteps.length > 0) {
    lines.push('For your next essay, focus on these steps.');
    for (let i = 0; i < nextSteps.length; i++) {
      lines.push(`Step ${i + 1}: ${nextSteps[i]}`);
    }
  }

  // Closing
  lines.push('Keep practising. You are making progress!');

  return lines.join(' ');
}

export function ListenToFeedback(props: ListenToFeedbackProps) {
  const script = useMemo(() => composeFeedbackScript(props), [props]);

  return <AudioPlayer text={script} useCase="feedback" label="Listen to Feedback" submissionId={props.submissionId} />;
}
