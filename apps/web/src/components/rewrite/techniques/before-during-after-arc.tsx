'use client';

import React, { useState, useEffect } from 'react';
import { TechniqueCard } from './technique-card';
import type { GuidedRewriteResponse, BeforeDuringAfterData } from '@/lib/api/client';

interface BeforeDuringAfterArcProps {
  submissionId: string;
  existing?: GuidedRewriteResponse;
  onSave: (data: BeforeDuringAfterData, isComplete: boolean) => void;
  isSaving: boolean;
}

export function BeforeDuringAfterArc({ submissionId, existing, onSave, isSaving }: BeforeDuringAfterArcProps) {
  const [before, setBefore] = useState('');
  const [during, setDuring] = useState('');
  const [after, setAfter] = useState('');
  const isComplete = existing?.is_complete ?? false;

  useEffect(() => {
    if (existing?.response_data) {
      const data = existing.response_data as BeforeDuringAfterData;
      if (data.before) setBefore(data.before);
      if (data.during) setDuring(data.during);
      if (data.after) setAfter(data.after);
    }
  }, [existing?.id]);

  const canSave =
    before.trim().length > 0 || during.trim().length > 0 || after.trim().length > 0;

  return (
    <TechniqueCard
      title="Before / During / After Arc"
      description="Structure a moment as a mini-narrative with clear progression."
      techniqueNumber={4}
      isComplete={isComplete}
      isSaving={isSaving}
      onToggleComplete={() => onSave({ before, during, after }, !isComplete)}
      onSave={() => onSave({ before, during, after }, isComplete)}
      canSave={canSave}
    >
      <div className="space-y-2">
        <div>
          <label className="text-xs font-medium text-muted-foreground">Before</label>
          <textarea
            value={before}
            onChange={(e) => setBefore(e.target.value)}
            rows={2}
            placeholder="What was the situation before?"
            className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">During</label>
          <textarea
            value={during}
            onChange={(e) => setDuring(e.target.value)}
            rows={2}
            placeholder="What happened in the key moment?"
            className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">After</label>
          <textarea
            value={after}
            onChange={(e) => setAfter(e.target.value)}
            rows={2}
            placeholder="What changed afterwards?"
            className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
          />
        </div>
      </div>
    </TechniqueCard>
  );
}
