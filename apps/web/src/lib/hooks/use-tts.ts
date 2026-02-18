'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { readCsrfToken } from './use-csrf-token';

type TtsStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'error';

interface UseTtsReturn {
  status: TtsStatus;
  progress: number; // 0-1
  error: string | null;
  play: (text: string, useCase?: 'feedback' | 'rewrite' | 'vocabulary') => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
}

const MAX_CHUNK_LENGTH = 4000; // Leave some room below the 4096 API limit

/** Split text at sentence boundaries into chunks under the max length. */
function chunkText(text: string): string[] {
  if (text.length <= MAX_CHUNK_LENGTH) return [text];

  const sentences = text.match(/[^.!?]+[.!?]+\s*/g) ?? [text];
  const chunks: string[] = [];
  let current = '';

  for (const sentence of sentences) {
    if ((current + sentence).length > MAX_CHUNK_LENGTH) {
      if (current) chunks.push(current.trim());
      current = sentence;
    } else {
      current += sentence;
    }
  }
  if (current.trim()) chunks.push(current.trim());

  return chunks;
}

async function fetchAudioChunk(
  text: string,
  useCase?: string,
): Promise<ArrayBuffer> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const csrfToken = readCsrfToken();
  if (csrfToken) headers['x-csrf-token'] = csrfToken;

  const res = await fetch('/api/v1/tts', {
    method: 'POST',
    headers,
    body: JSON.stringify({ text, useCase }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'TTS request failed' }));
    throw new Error(err.error || `TTS error: ${res.status}`);
  }

  return res.arrayBuffer();
}

export function useTts(): UseTtsReturn {
  const [status, setStatus] = useState<TtsStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Clean up object URL and audio element
  const cleanup = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeAttribute('src');
      audioRef.current = null;
    }
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
      abortRef.current?.abort();
    };
  }, [cleanup]);

  const play = useCallback(
    async (text: string, useCase?: 'feedback' | 'rewrite' | 'vocabulary') => {
      // Abort any in-flight request
      abortRef.current?.abort();
      cleanup();

      const controller = new AbortController();
      abortRef.current = controller;

      setStatus('loading');
      setProgress(0);
      setError(null);

      try {
        const chunks = chunkText(text);
        const audioBuffers: ArrayBuffer[] = [];

        for (let i = 0; i < chunks.length; i++) {
          if (controller.signal.aborted) return;
          audioBuffers.push(await fetchAudioChunk(chunks[i], useCase));
          setProgress((i + 1) / chunks.length * 0.5); // First 50% = loading
        }

        if (controller.signal.aborted) return;

        // Concatenate all audio chunks into a single blob
        const blob = new Blob(audioBuffers, { type: 'audio/mpeg' });
        const url = URL.createObjectURL(blob);
        objectUrlRef.current = url;

        const audio = new Audio(url);
        audioRef.current = audio;

        audio.addEventListener('timeupdate', () => {
          if (audio.duration > 0) {
            setProgress(0.5 + (audio.currentTime / audio.duration) * 0.5);
          }
        });

        audio.addEventListener('ended', () => {
          setStatus('idle');
          setProgress(0);
        });

        audio.addEventListener('error', () => {
          setStatus('error');
          setError('Audio playback failed');
        });

        await audio.play();
        setStatus('playing');
      } catch (err: any) {
        if (controller.signal.aborted) return;
        setStatus('error');
        setError(err.message ?? 'Failed to generate audio');
      }
    },
    [cleanup],
  );

  const pause = useCallback(() => {
    if (audioRef.current && status === 'playing') {
      audioRef.current.pause();
      setStatus('paused');
    }
  }, [status]);

  const resume = useCallback(() => {
    if (audioRef.current && status === 'paused') {
      audioRef.current.play();
      setStatus('playing');
    }
  }, [status]);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    cleanup();
    setStatus('idle');
    setProgress(0);
    setError(null);
  }, [cleanup]);

  return { status, progress, error, play, pause, resume, stop };
}
