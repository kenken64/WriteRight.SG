"use client";

import React from "react";
import { Check, Loader2, FileText } from "lucide-react";

export type SaveState = "idle" | "saving" | "saved" | "error";

interface DraftStatusProps {
  state: SaveState;
  versionNumber?: number;
  lastSavedAt?: Date | null;
}

export function DraftStatus({ state, versionNumber, lastSavedAt }: DraftStatusProps) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-gray-500">
      {state === "saving" && (
        <>
          <Loader2 className="h-3 w-3 animate-spin" />
          <span>Saving...</span>
        </>
      )}
      {state === "saved" && (
        <>
          <Check className="h-3 w-3 text-green-500" />
          <span className="text-green-600">Saved</span>
        </>
      )}
      {state === "error" && <span className="text-red-500">Save failed</span>}
      {state === "idle" && <span>Draft</span>}
      {versionNumber && (
        <span className="ml-1 text-gray-400">
          <FileText className="inline h-3 w-3 mr-0.5" />
          v{versionNumber}
        </span>
      )}
    </div>
  );
}
