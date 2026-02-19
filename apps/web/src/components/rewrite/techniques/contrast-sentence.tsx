'use client';

import React, { useState, useEffect } from 'react';
import { TechniqueCard } from './technique-card';
import type { GuidedRewriteResponse, ContrastSentenceData } from '@/lib/api/client';

interface ContrastSentenceProps {
  submissionId: string;
  existing?: GuidedRewriteResponse;
  onSave: (data: ContrastSentenceData, isComplete: boolean) => void;
  isSaving: boolean;
}

const CONNECTORS = ['but', 'yet', 'while'] as const;

export function ContrastSentence({ submissionId, existing, onSave, isSaving }: ContrastSentenceProps) {
  const [sentence, setSentence] = useState('');
  const [activeConnector, setActiveConnector] = useState<string | null>(null);
  const isComplete = existing?.is_complete ?? false;

  useEffect(() => {
    if (existing?.response_data) {
      const data = existing.response_data as ContrastSentenceData;
      if (data.sentence) setSentence(data.sentence);
    }
  }, [existing?.id]);

  const hasConnector = CONNECTORS.some((c) =>
    sentence.toLowerCase().includes(` ${c} `),
  );

  const canSave = sentence.trim().length > 0;

  return (
    <TechniqueCard
      title="Contrast Sentence"
      description='Create tension using a connector like "but", "yet", or "while".'
      techniqueNumber={5}
      isComplete={isComplete}
      isSaving={isSaving}
      onToggleComplete={() => onSave({ sentence }, !isComplete)}
      onSave={() => onSave({ sentence }, isComplete)}
      canSave={canSave}
    >
      <div className="space-y-2">
        <div className="flex flex-wrap gap-1.5">
          {CONNECTORS.map((connector) => (
            <button
              key={connector}
              onClick={() => {
                setActiveConnector(activeConnector === connector ? null : connector);
                if (!sentence.trim()) {
                  setSentence(`... ${connector} ...`);
                }
              }}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                activeConnector === connector
                  ? 'border-purple-300 bg-purple-50 text-purple-700'
                  : 'border-gray-200 text-muted-foreground hover:bg-gray-50'
              }`}
            >
              {connector}
            </button>
          ))}
        </div>
        <input
          type="text"
          value={sentence}
          onChange={(e) => setSentence(e.target.value)}
          placeholder='e.g. "The city was bustling with life, yet beneath the surface..."'
          className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        {canSave && !hasConnector && (
          <p className="text-[11px] text-amber-600">
            Tip: Try including &ldquo;but&rdquo;, &ldquo;yet&rdquo;, or &ldquo;while&rdquo; for contrast.
          </p>
        )}
      </div>
    </TechniqueCard>
  );
}
