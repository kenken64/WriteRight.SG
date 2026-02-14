"use client";

import React from "react";

interface Section {
  label: string;
  detected: boolean;
}

interface StructureTrackerProps {
  sections: Section[];
}

export function StructureTracker({ sections }: StructureTrackerProps) {
  if (!sections.length) return null;

  return (
    <div className="flex items-center gap-1 text-xs flex-wrap">
      <span className="text-gray-500 font-medium mr-1">Structure:</span>
      {sections.map((s, i) => (
        <React.Fragment key={s.label}>
          <span className={s.detected ? "text-green-600" : "text-gray-400"}>
            {s.detected ? "✅" : "🔲"} {s.label}
          </span>
          {i < sections.length - 1 && <span className="text-gray-300">→</span>}
        </React.Fragment>
      ))}
    </div>
  );
}
