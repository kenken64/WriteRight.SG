'use client';

import { useState } from 'react';
import { ProgressBar } from '../achievements/progress-bar';

export type WishlistStatus = 'pending_parent' | 'locked' | 'claimable' | 'claimed' | 'fulfilled' | 'expired';

export interface WishlistItemData {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  reward_type: string;
  status: WishlistStatus;
  is_surprise: boolean;
  required_achievement_id: string | null;
  claimed_at: string | null;
  fulfilled_at: string | null;
}

export interface AchievementProgress {
  current_value: number;
  target_value: number;
  achievement_name: string;
}

interface WishlistCardProps {
  item: WishlistItemData;
  progress?: AchievementProgress;
  onClaim?: (itemId: string) => Promise<void>;
}

const rewardEmojis: Record<string, string> = {
  treat: '🍦',
  screen_time: '🎮',
  book: '📖',
  activity: '🏊',
  money: '💰',
  creative: '🎨',
  custom: '🎁',
};

const statusStyles: Record<WishlistStatus, { bg: string; text: string; label: string }> = {
  pending_parent: { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', label: 'Awaiting Approval' },
  locked: { bg: 'bg-gray-50 border-gray-200', text: 'text-gray-500', label: 'Locked' },
  claimable: { bg: 'bg-green-50 border-green-200', text: 'text-green-700', label: 'Ready to Claim!' },
  claimed: { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700', label: 'Claimed' },
  fulfilled: { bg: 'bg-purple-50 border-purple-200', text: 'text-purple-700', label: 'Fulfilled ✨' },
  expired: { bg: 'bg-red-50 border-red-200', text: 'text-red-400', label: 'Expired' },
};

export function WishlistCard({ item, progress, onClaim }: WishlistCardProps) {
  const [claiming, setClaiming] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const style = statusStyles[item.status];
  const emoji = rewardEmojis[item.reward_type] ?? '🎁';
  const isLocked = item.status === 'locked';
  const isClaimable = item.status === 'claimable';

  async function handleClaim() {
    if (!onClaim || claiming) return;
    setClaiming(true);
    try {
      await onClaim(item.id);
      setClaimed(true);
    } finally {
      setClaiming(false);
    }
  }

  return (
    <div className={`rounded-xl border-2 p-4 transition-all ${style.bg} ${isLocked ? 'opacity-70' : ''} ${isClaimable ? 'ring-2 ring-green-400 ring-offset-2' : ''}`}>
      <div className="flex items-start gap-3">
        <span className={`text-3xl ${isLocked ? 'grayscale' : ''}`}>{emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className={`font-semibold truncate ${isLocked ? 'text-gray-400' : ''}`}>
              {item.is_surprise && item.status === 'locked' ? '🎁 Surprise Reward' : item.title}
            </h3>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${style.text} ${style.bg}`}>
              {style.label}
            </span>
          </div>

          {item.description && !item.is_surprise && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
          )}

          {isLocked && progress && (
            <div className="mt-3">
              <p className="text-xs text-muted-foreground mb-1">
                🎯 {progress.achievement_name}
              </p>
              <ProgressBar current={progress.current_value} target={progress.target_value} />
            </div>
          )}

          {isClaimable && !claimed && (
            <button
              onClick={handleClaim}
              disabled={claiming}
              className="mt-3 w-full rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-700 disabled:opacity-50"
            >
              {claiming ? 'Claiming...' : '🎉 Claim Reward!'}
            </button>
          )}

          {claimed && (
            <p className="mt-3 text-sm font-medium text-green-600">✅ Claimed! Your parent has been notified.</p>
          )}

          {item.fulfilled_at && (
            <p className="mt-2 text-xs text-muted-foreground">
              Fulfilled on {new Date(item.fulfilled_at).toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
