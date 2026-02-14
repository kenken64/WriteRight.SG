'use client';

interface ProgressBarProps {
  current: number;
  target: number;
  showLabel?: boolean;
}

export function ProgressBar({ current, target, showLabel = true }: ProgressBarProps) {
  const percent = Math.min(Math.round((current / target) * 100), 100);

  return (
    <div>
      <div className="h-2 rounded-full bg-muted">
        <div
          className="h-2 rounded-full bg-primary transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
      {showLabel && (
        <p className="mt-1 text-xs text-muted-foreground">
          {current} / {target} ({percent}%)
        </p>
      )}
    </div>
  );
}
