'use client';

import { useTts } from '@/lib/hooks/use-tts';

interface AudioPlayerProps {
  /** The text to synthesise. */
  text: string;
  /** TTS voice profile use case. */
  useCase: 'feedback' | 'rewrite' | 'vocabulary';
  /** Button label. */
  label?: string;
  /** Submission ID for cache scoping. */
  submissionId?: string;
}

export function AudioPlayer({ text, useCase, label = 'Listen', submissionId }: AudioPlayerProps) {
  const { status, progress, error, play, pause, resume, stop } = useTts();

  const handleClick = () => {
    switch (status) {
      case 'idle':
      case 'error':
        play(text, useCase, submissionId);
        break;
      case 'loading':
        stop();
        break;
      case 'playing':
        pause();
        break;
      case 'paused':
        resume();
        break;
    }
  };

  const buttonLabel = (() => {
    switch (status) {
      case 'idle': return label;
      case 'loading': return 'Generating audio...';
      case 'playing': return 'Pause';
      case 'paused': return 'Resume';
      case 'error': return 'Retry';
    }
  })();

  const icon = (() => {
    switch (status) {
      case 'idle':
      case 'error':
        return (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
          </svg>
        );
      case 'loading':
        return (
          <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        );
      case 'playing':
        return (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
          </svg>
        );
      case 'paused':
        return (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
          </svg>
        );
    }
  })();

  return (
    <div className="inline-flex items-center gap-2">
      <button
        onClick={handleClick}
        disabled={!text}
        className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted disabled:opacity-50"
      >
        {icon}
        {buttonLabel}
      </button>

      {(status === 'playing' || status === 'paused') && (
        <>
          {/* Progress bar */}
          <div className="h-1.5 w-20 overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${Math.round(Math.max(progress - 0.5, 0) * 200)}%` }}
            />
          </div>
          <button
            onClick={stop}
            className="rounded-md p-1 text-muted-foreground hover:bg-muted"
            title="Stop"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 7.5A2.25 2.25 0 017.5 5.25h9a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-9z" />
            </svg>
          </button>
        </>
      )}

      {status === 'loading' && (
        <span className="text-[10px] text-muted-foreground">
          {Math.round(progress * 100)}%
        </span>
      )}

      {error && (
        <span className="text-xs text-red-600">{error}</span>
      )}
    </div>
  );
}
