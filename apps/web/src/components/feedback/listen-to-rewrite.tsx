'use client';

import { useMemo } from 'react';
import { AudioPlayer } from './audio-player';
import type { BandJustification, RewriteAnnotation } from '@/lib/api/client';

interface ListenToRewriteProps {
  targetBand: string | null;
  bandJustification: BandJustification | null;
  annotations: RewriteAnnotation[] | null;
  submissionId?: string;
}

/** Compose a coaching walkthrough from rewrite annotations and justification. */
function composeRewriteScript(props: ListenToRewriteProps): string {
  const { targetBand, bandJustification, annotations } = props;

  const lines: string[] = [];

  // Opening
  if (targetBand) {
    lines.push(`This rewrite shows what a Band ${targetBand} essay looks like.`);
  }

  // Band justification summary
  if (bandJustification?.summary) {
    lines.push(bandJustification.summary);
  }

  // Key changes walkthrough
  if (bandJustification?.keyChanges?.length) {
    lines.push('Here are the key changes that lift the score.');
    for (const change of bandJustification.keyChanges) {
      lines.push(
        `The original said: "${change.original}". This was rewritten to: "${change.rewritten}". ${change.reason}`,
      );
    }
  }

  // Paragraph-level annotations walkthrough
  if (annotations?.length) {
    lines.push('Now let me walk you through each paragraph.');
    for (const a of annotations) {
      lines.push(
        `Paragraph ${a.paragraphIndex + 1}, focusing on ${a.dimension}. ${a.feedback}`,
      );
    }
  }

  // Closing
  lines.push(
    'Study these changes carefully. Try to apply similar techniques in your next essay.',
  );

  return lines.join(' ');
}

export function ListenToRewrite(props: ListenToRewriteProps) {
  const script = useMemo(() => composeRewriteScript(props), [props]);

  return <AudioPlayer text={script} useCase="rewrite" label="Listen to Walkthrough" submissionId={props.submissionId} />;
}
