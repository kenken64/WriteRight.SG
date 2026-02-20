'use client';

import { useState, useEffect, useCallback } from 'react';
import { brandedProductName } from '@/lib/variant';

interface DimensionDemo {
  name: string;
  score: number;
  maxScore: number;
  description: string;
  emoji: string;
}

const SAMPLE_ESSAY = `Dear Editor,

I am writing to express my concern about the increasing use of plastic bags in Singapore. Despite government efforts to reduce plastic waste, many Singaporeans continue to use disposable bags for their daily shopping.

I believe that imposing a mandatory charge on plastic bags would significantly reduce usage. Countries like Ireland and the UK have seen dramatic reductions after implementing such charges. Furthermore, providing affordable reusable alternatives at checkout points would make the transition easier for consumers.

I urge the authorities to consider this proposal seriously. Together, we can make Singapore a greener city for future generations.

Yours faithfully,
Alex Tan`;

const DIMENSIONS: DimensionDemo[] = [
  { name: 'Task Fulfilment', score: 5, maxScore: 6, description: 'Addresses the prompt with relevant points and appropriate format', emoji: '🎯' },
  { name: 'Language & Vocabulary', score: 4, maxScore: 6, description: 'Good range of vocabulary with mostly accurate usage', emoji: '📖' },
  { name: 'Organisation', score: 5, maxScore: 6, description: 'Clear structure with logical flow between paragraphs', emoji: '🏗️' },
  { name: 'Grammar & Mechanics', score: 4, maxScore: 6, description: 'Generally accurate grammar with minor slips', emoji: '✏️' },
  { name: 'Tone & Register', score: 5, maxScore: 6, description: 'Appropriate formal tone maintained throughout', emoji: '🎭' },
];

interface DemoMarkerProps {
  onComplete?: () => void;
}

export function DemoMarker({ onComplete }: DemoMarkerProps) {
  const [phase, setPhase] = useState<'intro' | 'scanning' | 'scoring' | 'complete'>('intro');
  const [currentDimension, setCurrentDimension] = useState(0);
  const [animatedScores, setAnimatedScores] = useState<number[]>([]);
  const [scanProgress, setScanProgress] = useState(0);

  const startDemo = useCallback(() => {
    setPhase('scanning');
    setScanProgress(0);
  }, []);

  // Scanning animation
  useEffect(() => {
    if (phase !== 'scanning') return;
    const interval = setInterval(() => {
      setScanProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setPhase('scoring');
          return 100;
        }
        return p + 2;
      });
    }, 40);
    return () => clearInterval(interval);
  }, [phase]);

  // Scoring animation
  useEffect(() => {
    if (phase !== 'scoring') return;
    if (currentDimension >= DIMENSIONS.length) {
      setPhase('complete');
      return;
    }
    const timer = setTimeout(() => {
      const dim = DIMENSIONS[currentDimension];
      // Animate score counting up
      let current = 0;
      const scoreInterval = setInterval(() => {
        current++;
        setAnimatedScores((prev) => {
          const next = [...prev];
          next[currentDimension] = current;
          return next;
        });
        if (current >= dim.score) {
          clearInterval(scoreInterval);
          setTimeout(() => setCurrentDimension((d) => d + 1), 400);
        }
      }, 120);
    }, 300);
    return () => clearTimeout(timer);
  }, [phase, currentDimension]);

  const totalScore = DIMENSIONS.reduce((s, d) => s + d.score, 0);
  const maxTotal = DIMENSIONS.reduce((s, d) => s + d.maxScore, 0);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Sample essay */}
      <div className="relative rounded-lg border bg-white p-4">
        <h3 className="text-sm font-semibold text-muted-foreground mb-2">📝 Sample Essay — Formal Letter</h3>
        <div className={`text-sm leading-relaxed whitespace-pre-line ${phase === 'scanning' ? 'text-muted-foreground' : ''}`}>
          {phase === 'scanning' && (
            <div
              className="absolute left-0 right-0 h-0.5 bg-blue-400 transition-all duration-100 opacity-70"
              style={{ top: `${(scanProgress / 100) * 100}%` }}
            />
          )}
          {SAMPLE_ESSAY}
        </div>
      </div>

      {/* Controls / Results */}
      {phase === 'intro' && (
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-4">
            See how {brandedProductName()} analyses and scores an essay in real time
          </p>
          <button
            onClick={startDemo}
            className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
          >
            ▶️ Start Demo Marking
          </button>
        </div>
      )}

      {phase === 'scanning' && (
        <div className="text-center space-y-2">
          <p className="text-sm font-medium text-blue-600 animate-pulse">🔍 Scanning essay...</p>
          <div className="h-2 rounded-full bg-gray-100 max-w-xs mx-auto">
            <div className="h-2 rounded-full bg-blue-500 transition-all" style={{ width: `${scanProgress}%` }} />
          </div>
        </div>
      )}

      {(phase === 'scoring' || phase === 'complete') && (
        <div className="space-y-3">
          {DIMENSIONS.map((dim, i) => {
            const score = animatedScores[i];
            const isRevealed = score !== undefined;
            const isCurrent = i === currentDimension && phase === 'scoring';

            return (
              <div
                key={dim.name}
                className={`flex items-center gap-3 rounded-lg border p-3 transition-all duration-300 ${
                  isCurrent ? 'border-blue-300 bg-blue-50 scale-[1.02]' : isRevealed ? 'border-green-200 bg-green-50' : 'opacity-40'
                }`}
              >
                <span className="text-xl">{dim.emoji}</span>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{dim.name}</span>
                    {isRevealed && (
                      <span className="text-sm font-bold text-green-700">
                        {score} / {dim.maxScore}
                      </span>
                    )}
                  </div>
                  {isRevealed && (
                    <p className="text-xs text-muted-foreground mt-0.5">{dim.description}</p>
                  )}
                </div>
              </div>
            );
          })}

          {phase === 'complete' && (
            <div className="text-center pt-4 space-y-3">
              <div className="inline-block rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-3 text-white">
                <p className="text-2xl font-bold">{totalScore} / {maxTotal}</p>
                <p className="text-sm opacity-90">Band 4 — Strong Writer ⭐</p>
              </div>
              <p className="text-sm text-muted-foreground">
                This is how every submission gets scored — across 5 dimensions aligned to the MOE rubric.
              </p>
              {onComplete && (
                <button
                  onClick={onComplete}
                  className="rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-white hover:bg-primary/90"
                >
                  Continue →
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
