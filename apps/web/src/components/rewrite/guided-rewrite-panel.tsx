'use client';

import React, { useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, Loader2 } from 'lucide-react';
import {
  useGuidedRewriteResponses,
  useUpsertGuidedResponse,
  type GuidedTechniqueKey,
  type GuidedRewriteResponse,
  type GuidedResponseData,
} from '@/lib/api/client';
import { SoWhatChain } from './techniques/so-what-chain';
import { FiveSensesSnapshot } from './techniques/five-senses-snapshot';
import { PersonQuoteDetail } from './techniques/person-quote-detail';
import { BeforeDuringAfterArc } from './techniques/before-during-after-arc';
import { ContrastSentence } from './techniques/contrast-sentence';
import { ZoomStructure } from './techniques/zoom-structure';

interface GuidedRewritePanelProps {
  submissionId: string;
  originalText: string;
}

const TECHNIQUE_ORDER: GuidedTechniqueKey[] = [
  'so_what_chain',
  'five_senses_snapshot',
  'person_quote_detail',
  'before_during_after',
  'contrast_sentence',
  'zoom_structure',
];

export function GuidedRewritePanel({ submissionId, originalText }: GuidedRewritePanelProps) {
  const { data: responses, isLoading } = useGuidedRewriteResponses(submissionId);
  const upsert = useUpsertGuidedResponse();
  const [showEssay, setShowEssay] = useState(false);

  const responseMap = useMemo(() => {
    const map = new Map<GuidedTechniqueKey, GuidedRewriteResponse>();
    if (responses) {
      for (const r of responses) {
        map.set(r.technique_key, r);
      }
    }
    return map;
  }, [responses]);

  const completedCount = TECHNIQUE_ORDER.filter(
    (k) => responseMap.get(k)?.is_complete,
  ).length;

  const handleSave = (
    techniqueKey: GuidedTechniqueKey,
    data: GuidedResponseData,
    isComplete: boolean,
  ) => {
    upsert.mutate({
      submissionId,
      technique_key: techniqueKey,
      response_data: data,
      is_complete: isComplete,
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Progress bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Progress</span>
          <span>{completedCount}/6 techniques</span>
        </div>
        <div className="flex gap-1">
          {TECHNIQUE_ORDER.map((key) => (
            <div
              key={key}
              className={`h-2 flex-1 rounded-full transition-colors ${
                responseMap.get(key)?.is_complete
                  ? 'bg-green-500'
                  : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Collapsible essay reference */}
      {originalText && (
        <div className="rounded-lg border bg-gray-50">
          <button
            onClick={() => setShowEssay(!showEssay)}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            {showEssay ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
            Your Essay (reference)
          </button>
          {showEssay && (
            <div className="border-t px-4 py-3">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
                {originalText}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Technique cards */}
      <SoWhatChain
        submissionId={submissionId}
        existing={responseMap.get('so_what_chain')}
        onSave={(data, isComplete) => handleSave('so_what_chain', data, isComplete)}
        isSaving={upsert.isPending}
      />
      <FiveSensesSnapshot
        submissionId={submissionId}
        existing={responseMap.get('five_senses_snapshot')}
        onSave={(data, isComplete) => handleSave('five_senses_snapshot', data, isComplete)}
        isSaving={upsert.isPending}
      />
      <PersonQuoteDetail
        submissionId={submissionId}
        existing={responseMap.get('person_quote_detail')}
        onSave={(data, isComplete) => handleSave('person_quote_detail', data, isComplete)}
        isSaving={upsert.isPending}
      />
      <BeforeDuringAfterArc
        submissionId={submissionId}
        existing={responseMap.get('before_during_after')}
        onSave={(data, isComplete) => handleSave('before_during_after', data, isComplete)}
        isSaving={upsert.isPending}
      />
      <ContrastSentence
        submissionId={submissionId}
        existing={responseMap.get('contrast_sentence')}
        onSave={(data, isComplete) => handleSave('contrast_sentence', data, isComplete)}
        isSaving={upsert.isPending}
      />
      <ZoomStructure
        submissionId={submissionId}
        existing={responseMap.get('zoom_structure')}
        onSave={(data, isComplete) => handleSave('zoom_structure', data, isComplete)}
        isSaving={upsert.isPending}
      />
    </div>
  );
}
