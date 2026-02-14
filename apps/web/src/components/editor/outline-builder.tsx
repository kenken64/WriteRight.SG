"use client";

import React, { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";

interface OutlineSection {
  section: string;
  label: string;
  value: string;
  suggestion?: string;
}

interface OutlineBuilderProps {
  sections: OutlineSection[];
  onChange: (sections: OutlineSection[]) => void;
  onRequestSuggestions?: () => Promise<void>;
  loadingSuggestions?: boolean;
}

const DEFAULT_SECTIONS: OutlineSection[] = [
  { section: "hook", label: "Hook", value: "" },
  { section: "purpose", label: "State Purpose", value: "" },
  { section: "body1_point", label: "Body 1 — Point", value: "" },
  { section: "body1_evidence", label: "Body 1 — Evidence", value: "" },
  { section: "body2_point", label: "Body 2 — Point", value: "" },
  { section: "body2_evidence", label: "Body 2 — Evidence", value: "" },
  { section: "body3_point", label: "Body 3 — Point", value: "" },
  { section: "body3_evidence", label: "Body 3 — Evidence", value: "" },
  { section: "conclusion", label: "Conclusion", value: "" },
  { section: "call_to_action", label: "Call to Action", value: "" },
];

export { DEFAULT_SECTIONS };

export function OutlineBuilder({ sections, onChange, onRequestSuggestions, loadingSuggestions }: OutlineBuilderProps) {
  const updateSection = (index: number, value: string) => {
    const updated = [...sections];
    updated[index] = { ...updated[index], value };
    onChange(updated);
  };

  const filledCount = sections.filter((s) => s.value.trim()).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-sm text-gray-700">📋 Essay Outline</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">{filledCount}/{sections.length} filled</span>
          {onRequestSuggestions && (
            <button
              onClick={onRequestSuggestions}
              disabled={loadingSuggestions}
              className="flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-purple-50 text-purple-600 hover:bg-purple-100 disabled:opacity-50 transition-colors"
            >
              {loadingSuggestions ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
              AI Suggest
            </button>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {sections.map((section, i) => (
          <div key={section.section} className="space-y-1">
            <label className="text-xs font-medium text-gray-500">{section.label}</label>
            <input
              type="text"
              value={section.value}
              onChange={(e) => updateSection(i, e.target.value)}
              placeholder={section.suggestion || `Enter ${section.label.toLowerCase()}...`}
              className="w-full rounded-md border border-gray-200 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            {section.suggestion && !section.value && (
              <p className="text-xs text-purple-400 italic pl-1">💡 {section.suggestion}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
