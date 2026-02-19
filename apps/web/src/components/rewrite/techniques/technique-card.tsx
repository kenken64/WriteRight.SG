'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

interface TechniqueCardProps {
  title: string;
  description: string;
  techniqueNumber: number;
  isComplete: boolean;
  isSaving: boolean;
  onToggleComplete: () => void;
  onSave: () => void;
  canSave: boolean;
  children: React.ReactNode;
}

export function TechniqueCard({
  title,
  description,
  techniqueNumber,
  isComplete,
  isSaving,
  onToggleComplete,
  onSave,
  canSave,
  children,
}: TechniqueCardProps) {
  return (
    <div
      className={`rounded-lg border bg-white p-4 transition-opacity ${
        isComplete ? 'opacity-70' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={isComplete}
          onChange={onToggleComplete}
          disabled={isSaving}
          className="mt-1 h-4 w-4 rounded border-gray-300 accent-primary cursor-pointer"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="shrink-0 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
              {techniqueNumber}/6
            </span>
            <h3
              className={`font-medium text-sm ${
                isComplete ? 'line-through text-muted-foreground' : ''
              }`}
            >
              {title}
            </h3>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        </div>
      </div>

      <div className="mt-3 ml-7">{children}</div>

      <div className="mt-3 ml-7 flex justify-end">
        <button
          onClick={onSave}
          disabled={!canSave || isSaving}
          className="rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-40 transition-colors"
        >
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
        </button>
      </div>
    </div>
  );
}
