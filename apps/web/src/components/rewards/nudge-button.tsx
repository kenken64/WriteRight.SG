'use client';

import { useState, useEffect } from 'react';

interface NudgeButtonProps {
  redemptionId: string;
  lastNudgedAt: string | null;
  onNudge: (redemptionId: string) => Promise<void>;
}

function isToday(dateStr: string): boolean {
  const d = new Date(dateStr);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
}

export function NudgeButton({ redemptionId, lastNudgedAt, onNudge }: NudgeButtonProps) {
  const [nudging, setNudging] = useState(false);
  const [nudgedToday, setNudgedToday] = useState(
    lastNudgedAt ? isToday(lastNudgedAt) : false,
  );
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (showConfirm) {
      const timer = setTimeout(() => setShowConfirm(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showConfirm]);

  async function handleNudge() {
    if (nudgedToday || nudging) return;
    setNudging(true);
    try {
      await onNudge(redemptionId);
      setNudgedToday(true);
      setShowConfirm(true);
    } finally {
      setNudging(false);
    }
  }

  if (showConfirm) {
    return (
      <div className="flex items-center gap-2 text-sm text-green-600 font-medium animate-in fade-in slide-in-from-bottom-1">
        <span>✅</span> Nudge sent!
      </div>
    );
  }

  return (
    <button
      onClick={handleNudge}
      disabled={nudgedToday || nudging}
      title={nudgedToday ? 'You can nudge again tomorrow' : 'Send a gentle reminder to your parent'}
      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
        nudgedToday
          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
          : 'bg-blue-50 text-blue-600 hover:bg-blue-100 active:scale-95'
      }`}
    >
      {nudging ? (
        <>
          <span className="animate-spin text-xs">⏳</span> Sending...
        </>
      ) : nudgedToday ? (
        <>🔔 Nudged today</>
      ) : (
        <>👋 Gentle nudge</>
      )}
    </button>
  );
}
