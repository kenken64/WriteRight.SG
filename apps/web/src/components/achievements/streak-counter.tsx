'use client';

import { Flame } from 'lucide-react';

interface StreakCounterProps {
  currentStreak: number;
  longestStreak: number;
  lastSubmissionDate: string | null;
}

export function StreakCounter({ currentStreak, longestStreak, lastSubmissionDate }: StreakCounterProps) {
  return (
    <div className="flex gap-4">
      <div className="flex items-center gap-3 rounded-lg border bg-white p-4">
        <Flame className={`h-8 w-8 ${currentStreak > 0 ? 'text-orange-500' : 'text-gray-300'}`} />
        <div>
          <p className="text-2xl font-bold">{currentStreak}</p>
          <p className="text-xs text-muted-foreground">Day Streak</p>
        </div>
      </div>
      <div className="flex items-center gap-3 rounded-lg border bg-white p-4">
        <div>
          <p className="text-2xl font-bold">{longestStreak}</p>
          <p className="text-xs text-muted-foreground">Best Streak</p>
        </div>
      </div>
      {lastSubmissionDate && (
        <div className="flex items-center gap-3 rounded-lg border bg-white p-4">
          <div>
            <p className="text-sm font-medium">
              {new Date(lastSubmissionDate).toLocaleDateString('en-SG', {
                day: 'numeric',
                month: 'short',
              })}
            </p>
            <p className="text-xs text-muted-foreground">Last submission</p>
          </div>
        </div>
      )}
    </div>
  );
}
