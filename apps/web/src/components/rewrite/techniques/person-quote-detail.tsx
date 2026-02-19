'use client';

import React, { useState, useEffect } from 'react';
import { TechniqueCard } from './technique-card';
import type { GuidedRewriteResponse, PersonQuoteData } from '@/lib/api/client';

interface PersonQuoteDetailProps {
  submissionId: string;
  existing?: GuidedRewriteResponse;
  onSave: (data: PersonQuoteData, isComplete: boolean) => void;
  isSaving: boolean;
}

export function PersonQuoteDetail({ submissionId, existing, onSave, isSaving }: PersonQuoteDetailProps) {
  const [personName, setPersonName] = useState('');
  const [quote, setQuote] = useState('');
  const [physicalDetail, setPhysicalDetail] = useState('');
  const isComplete = existing?.is_complete ?? false;

  useEffect(() => {
    if (existing?.response_data) {
      const data = existing.response_data as PersonQuoteData;
      if (data.personName) setPersonName(data.personName);
      if (data.quote) setQuote(data.quote);
      if (data.physicalDetail) setPhysicalDetail(data.physicalDetail);
    }
  }, [existing?.id]);

  const canSave =
    personName.trim().length > 0 ||
    quote.trim().length > 0 ||
    physicalDetail.trim().length > 0;

  return (
    <TechniqueCard
      title="Person + Quote + Detail"
      description="Bring a real person into your essay with their words and a physical detail."
      techniqueNumber={3}
      isComplete={isComplete}
      isSaving={isSaving}
      onToggleComplete={() => onSave({ personName, quote, physicalDetail }, !isComplete)}
      onSave={() => onSave({ personName, quote, physicalDetail }, isComplete)}
      canSave={canSave}
    >
      <div className="space-y-2">
        <div>
          <label className="text-xs font-medium text-muted-foreground">Person&apos;s name</label>
          <input
            type="text"
            value={personName}
            onChange={(e) => setPersonName(e.target.value)}
            placeholder="e.g. My grandmother, Mr. Tan..."
            className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Their quote</label>
          <input
            type="text"
            value={quote}
            onChange={(e) => setQuote(e.target.value)}
            placeholder='What did they say? e.g. "You must always..."'
            className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Physical detail</label>
          <input
            type="text"
            value={physicalDetail}
            onChange={(e) => setPhysicalDetail(e.target.value)}
            placeholder="A detail about how they look, move, or gesture..."
            className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>
    </TechniqueCard>
  );
}
