"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Clock, Play, Pause, RotateCcw } from "lucide-react";

interface TimerProps {
  durationMinutes: number;
  onTimeUp?: () => void;
  autoStart?: boolean;
}

export function Timer({ durationMinutes, onTimeUp, autoStart = false }: TimerProps) {
  const totalSeconds = durationMinutes * 60;
  const [remaining, setRemaining] = useState(totalSeconds);
  const [running, setRunning] = useState(autoStart);
  const [finished, setFinished] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (running && remaining > 0) {
      intervalRef.current = setInterval(() => {
        setRemaining((prev) => {
          if (prev <= 1) {
            clearTimer();
            setRunning(false);
            setFinished(true);
            onTimeUp?.();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return clearTimer;
  }, [running, remaining, clearTimer, onTimeUp]);

  const toggle = () => {
    if (finished) return;
    setRunning((r) => !r);
  };

  const reset = () => {
    clearTimer();
    setRemaining(totalSeconds);
    setRunning(false);
    setFinished(false);
  };

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const pct = (remaining / totalSeconds) * 100;
  const urgent = remaining <= 300 && remaining > 0; // last 5 min

  return (
    <div className={`flex items-center gap-2 text-sm ${finished ? "text-red-600 animate-pulse" : urgent ? "text-amber-600" : "text-gray-700"}`}>
      <Clock className="h-4 w-4" />
      <span className="font-mono font-medium tabular-nums">
        {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
      </span>
      {finished && <span className="text-xs font-bold">TIME'S UP!</span>}

      <button
        onClick={toggle}
        className="p-1 rounded hover:bg-gray-100 transition-colors"
        title={running ? "Pause" : "Start"}
      >
        {running ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
      </button>
      <button
        onClick={reset}
        className="p-1 rounded hover:bg-gray-100 transition-colors"
        title="Reset"
      >
        <RotateCcw className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
