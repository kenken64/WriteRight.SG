"use client";

import React from "react";

interface WordCountBarProps {
  wordCount: number;
  min: number;
  max: number;
}

export function WordCountBar({ wordCount, min, max }: WordCountBarProps) {
  const percent = Math.min((wordCount / max) * 100, 120);
  const isUnder = wordCount < min;
  const isOver = wordCount > max;
  const isInRange = !isUnder && !isOver;

  const barColor = isOver
    ? "bg-red-500"
    : isUnder
      ? wordCount > 0
        ? "bg-amber-400"
        : "bg-gray-300"
      : "bg-green-500";

  const textColor = isOver ? "text-red-600" : isInRange ? "text-green-600" : "text-gray-600";

  return (
    <div className="flex items-center gap-3 text-sm">
      <span className={`font-medium tabular-nums ${textColor}`}>
        {wordCount} / {min}–{max} words
      </span>
      <div className="h-2 w-32 rounded-full bg-gray-200 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${barColor}`}
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>
      {isOver && <span className="text-xs text-red-500 font-medium">Over limit!</span>}
      {isInRange && <span className="text-xs text-green-500">✓</span>}
    </div>
  );
}
