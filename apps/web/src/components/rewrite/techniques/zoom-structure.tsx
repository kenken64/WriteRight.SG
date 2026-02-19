'use client';

import React, { useState, useEffect } from 'react';
import { Search, Globe, Heart } from 'lucide-react';
import { TechniqueCard } from './technique-card';
import type { GuidedRewriteResponse, ZoomStructureData } from '@/lib/api/client';

interface ZoomStructureProps {
  submissionId: string;
  existing?: GuidedRewriteResponse;
  onSave: (data: ZoomStructureData, isComplete: boolean) => void;
  isSaving: boolean;
}

export function ZoomStructure({ submissionId, existing, onSave, isSaving }: ZoomStructureProps) {
  const [closeUp, setCloseUp] = useState('');
  const [bigPicture, setBigPicture] = useState('');
  const [personalConnection, setPersonalConnection] = useState('');
  const isComplete = existing?.is_complete ?? false;

  useEffect(() => {
    if (existing?.response_data) {
      const data = existing.response_data as ZoomStructureData;
      if (data.closeUp) setCloseUp(data.closeUp);
      if (data.bigPicture) setBigPicture(data.bigPicture);
      if (data.personalConnection) setPersonalConnection(data.personalConnection);
    }
  }, [existing?.id]);

  const canSave =
    closeUp.trim().length > 0 ||
    bigPicture.trim().length > 0 ||
    personalConnection.trim().length > 0;

  return (
    <TechniqueCard
      title="Zoom Structure"
      description="Move from a close-up detail to the big picture, then connect it personally."
      techniqueNumber={6}
      isComplete={isComplete}
      isSaving={isSaving}
      onToggleComplete={() => onSave({ closeUp, bigPicture, personalConnection }, !isComplete)}
      onSave={() => onSave({ closeUp, bigPicture, personalConnection }, isComplete)}
      canSave={canSave}
    >
      <div className="space-y-2">
        <div>
          <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Search className="h-3 w-3" /> Close-up
          </label>
          <textarea
            value={closeUp}
            onChange={(e) => setCloseUp(e.target.value)}
            rows={2}
            placeholder="Zoom in on a tiny, specific detail..."
            className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
          />
        </div>
        <div>
          <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Globe className="h-3 w-3" /> Big picture
          </label>
          <textarea
            value={bigPicture}
            onChange={(e) => setBigPicture(e.target.value)}
            rows={2}
            placeholder="Zoom out — what bigger idea or context does this connect to?"
            className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
          />
        </div>
        <div>
          <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Heart className="h-3 w-3" /> Personal connection
          </label>
          <textarea
            value={personalConnection}
            onChange={(e) => setPersonalConnection(e.target.value)}
            rows={2}
            placeholder="Why does this matter to you personally?"
            className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
          />
        </div>
      </div>
    </TechniqueCard>
  );
}
