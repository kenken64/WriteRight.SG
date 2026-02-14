"use client";

import React from "react";
import { Check, X, Lightbulb } from "lucide-react";

interface AiSuggestionCardProps {
  type: string;
  text: string;
  example?: string;
  onAccept?: () => void;
  onDismiss?: () => void;
}

const TYPE_ICONS: Record<string, string> = {
  opening: "🎬",
  transition: "🔗",
  vocabulary: "📚",
  structure: "🏗️",
  conclusion: "🎯",
  run_on: "✂️",
  connector: "🔗",
  word_limit: "⚠️",
  refocus: "🎯",
  general: "💡",
};

export function AiSuggestionCard({ type, text, example, onAccept, onDismiss }: AiSuggestionCardProps) {
  return (
    <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-3 text-sm space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2">
          <span className="text-base">{TYPE_ICONS[type] ?? "💡"}</span>
          <p className="text-gray-700 select-none">{text}</p>
        </div>
      </div>

      {example && (
        <div className="ml-7 text-xs text-gray-500 italic border-l-2 border-blue-200 pl-2 select-none">
          Example: {example}
        </div>
      )}

      <div className="flex gap-1.5 ml-7">
        {onAccept && (
          <button
            onClick={onAccept}
            className="flex items-center gap-1 px-2 py-1 rounded text-xs bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
          >
            <Check className="h-3 w-3" /> Helpful
          </button>
        )}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="flex items-center gap-1 px-2 py-1 rounded text-xs bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
          >
            <X className="h-3 w-3" /> Dismiss
          </button>
        )}
      </div>
    </div>
  );
}
