'use client';

import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { TechniqueCard } from './technique-card';
import type { GuidedRewriteResponse, SoWhatChainData } from '@/lib/api/client';

interface SoWhatChainProps {
  submissionId: string;
  existing?: GuidedRewriteResponse;
  onSave: (data: SoWhatChainData, isComplete: boolean) => void;
  isSaving: boolean;
}

export function SoWhatChain({ submissionId, existing, onSave, isSaving }: SoWhatChainProps) {
  const [steps, setSteps] = useState<string[]>(['']);
  const isComplete = existing?.is_complete ?? false;

  useEffect(() => {
    if (existing?.response_data) {
      const data = existing.response_data as SoWhatChainData;
      if (data.steps?.length) setSteps(data.steps);
    }
  }, [existing?.id]);

  const updateStep = (index: number, value: string) => {
    const next = [...steps];
    next[index] = value;
    setSteps(next);
  };

  const addStep = () => setSteps([...steps, '']);

  const canSave = steps.some((s) => s.trim().length > 0);

  return (
    <TechniqueCard
      title={'"So What?" Chain'}
      description="Keep asking 'so what?' to dig deeper into your argument and find the real insight."
      techniqueNumber={1}
      isComplete={isComplete}
      isSaving={isSaving}
      onToggleComplete={() => onSave({ steps }, !isComplete)}
      onSave={() => onSave({ steps }, isComplete)}
      canSave={canSave}
    >
      <div className="space-y-2">
        {steps.map((step, i) => (
          <div key={i}>
            <label className="text-xs font-medium text-muted-foreground">
              {i === 0 ? 'Your initial claim' : `So what? (level ${i})`}
            </label>
            <textarea
              value={step}
              onChange={(e) => updateStep(i, e.target.value)}
              rows={2}
              placeholder={
                i === 0
                  ? 'State your main point...'
                  : 'Why does the previous point matter?'
              }
              className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
          </div>
        ))}
        <button
          onClick={addStep}
          className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-primary hover:bg-primary/5 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          Ask &ldquo;so what?&rdquo; again
        </button>
      </div>
    </TechniqueCard>
  );
}
