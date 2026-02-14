"use client";

import React from "react";

export type WritingMode = "practice" | "timed" | "exam";

interface ModeSelectorProps {
  value: WritingMode;
  onChange: (mode: WritingMode) => void;
  disabled?: boolean;
}

const MODES: { value: WritingMode; label: string; desc: string; icon: string }[] = [
  { value: "practice", label: "Practice", desc: "Full AI assistance, no timer", icon: "📝" },
  { value: "timed", label: "Timed Practice", desc: "Limited hints, configurable timer", icon: "⏱️" },
  { value: "exam", label: "Exam Simulation", desc: "No AI, strict timing", icon: "🎯" },
];

export function ModeSelector({ value, onChange, disabled }: ModeSelectorProps) {
  return (
    <div className="flex gap-1">
      {MODES.map((mode) => (
        <button
          key={mode.value}
          onClick={() => onChange(mode.value)}
          disabled={disabled}
          title={mode.desc}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
            value === mode.value
              ? "bg-blue-100 text-blue-700 border border-blue-300"
              : "bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100"
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {mode.icon} {mode.label}
        </button>
      ))}
    </div>
  );
}
