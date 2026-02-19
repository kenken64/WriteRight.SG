'use client';

import React, { useState, useEffect } from 'react';
import { TechniqueCard } from './technique-card';
import type { GuidedRewriteResponse, FiveSensesData } from '@/lib/api/client';

interface FiveSensesSnapshotProps {
  submissionId: string;
  existing?: GuidedRewriteResponse;
  onSave: (data: FiveSensesData, isComplete: boolean) => void;
  isSaving: boolean;
}

const SENSES = ['See', 'Hear', 'Smell', 'Feel', 'Taste'] as const;

export function FiveSensesSnapshot({ submissionId, existing, onSave, isSaving }: FiveSensesSnapshotProps) {
  const [sensoryDetail, setSensoryDetail] = useState('');
  const [activeSense, setActiveSense] = useState<string | null>(null);
  const isComplete = existing?.is_complete ?? false;

  useEffect(() => {
    if (existing?.response_data) {
      const data = existing.response_data as FiveSensesData;
      if (data.sensoryDetail) setSensoryDetail(data.sensoryDetail);
    }
  }, [existing?.id]);

  const canSave = sensoryDetail.trim().length > 0;

  return (
    <TechniqueCard
      title="Five Senses Snapshot"
      description="Add a vivid sensory detail to make your writing come alive."
      techniqueNumber={2}
      isComplete={isComplete}
      isSaving={isSaving}
      onToggleComplete={() => onSave({ sensoryDetail }, !isComplete)}
      onSave={() => onSave({ sensoryDetail }, isComplete)}
      canSave={canSave}
    >
      <div className="space-y-2">
        <div className="flex flex-wrap gap-1.5">
          {SENSES.map((sense) => (
            <button
              key={sense}
              onClick={() => setActiveSense(activeSense === sense ? null : sense)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                activeSense === sense
                  ? 'border-blue-300 bg-blue-50 text-blue-700'
                  : 'border-gray-200 text-muted-foreground hover:bg-gray-50'
              }`}
            >
              {sense}
            </button>
          ))}
        </div>
        <textarea
          value={sensoryDetail}
          onChange={(e) => setSensoryDetail(e.target.value)}
          rows={3}
          placeholder={
            activeSense
              ? `Describe what you ${activeSense.toLowerCase()} in this moment...`
              : 'Pick a sense above and describe a vivid detail...'
          }
          className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
        />
      </div>
    </TechniqueCard>
  );
}
