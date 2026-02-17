'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApproveWishlistItem, useRejectWishlistItem } from '@/lib/api/client';

export interface PendingItem {
  id: string;
  title: string;
  description: string | null;
  reward_type: string;
  student_name: string;
  created_at: string;
}

export interface AchievementOption {
  id: string;
  name: string;
  description: string;
  badge_emoji: string;
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

interface PendingWishApprovalsProps {
  items: PendingItem[];
  achievements: AchievementOption[];
}

export function PendingWishApprovals({ items, achievements }: PendingWishApprovalsProps) {
  const router = useRouter();
  const approveMutation = useApproveWishlistItem();
  const rejectMutation = useRejectWishlistItem();
  const [selectedAchievements, setSelectedAchievements] = useState<Record<string, string>>({});
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  if (items.length === 0) return null;

  async function handleApprove(itemId: string) {
    const achievementId = selectedAchievements[itemId];
    if (!achievementId) return;

    setProcessingIds((prev) => new Set(prev).add(itemId));
    try {
      await approveMutation.mutateAsync({ itemId, requiredAchievementId: achievementId });
      router.refresh();
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }
  }

  async function handleReject(itemId: string) {
    setProcessingIds((prev) => new Set(prev).add(itemId));
    try {
      await rejectMutation.mutateAsync(itemId);
      router.refresh();
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }
  }

  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold">Pending Wish Approvals</h2>
      <div className="mt-4 space-y-4">
        {items.map((item) => {
          const emoji = rewardEmojis[item.reward_type] ?? '🎁';
          const isProcessing = processingIds.has(item.id);
          const hasAchievement = !!selectedAchievements[item.id];

          return (
            <div
              key={item.id}
              className="rounded-xl border-2 border-amber-200 bg-amber-50 p-4"
            >
              <div className="flex items-start gap-3">
                <span className="text-3xl">{emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold truncate">{item.title}</h3>
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium text-amber-700 bg-amber-100">
                      Awaiting Approval
                    </span>
                  </div>

                  <p className="text-sm text-muted-foreground mt-1">
                    {item.student_name} &middot;{' '}
                    {new Date(item.created_at).toLocaleDateString('en-SG', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </p>

                  {item.description && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {item.description}
                    </p>
                  )}

                  <div className="mt-3">
                    <label
                      htmlFor={`ach-${item.id}`}
                      className="text-xs font-medium text-muted-foreground"
                    >
                      Link to achievement:
                    </label>
                    <select
                      id={`ach-${item.id}`}
                      className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                      value={selectedAchievements[item.id] ?? ''}
                      onChange={(e) =>
                        setSelectedAchievements((prev) => ({
                          ...prev,
                          [item.id]: e.target.value,
                        }))
                      }
                      disabled={isProcessing}
                    >
                      <option value="">Select an achievement...</option>
                      {achievements.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.badge_emoji} {a.name} — {a.description}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => handleApprove(item.id)}
                      disabled={!hasAchievement || isProcessing}
                      className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-700 disabled:opacity-50"
                    >
                      {isProcessing ? 'Approving...' : 'Approve'}
                    </button>
                    <button
                      onClick={() => handleReject(item.id)}
                      disabled={isProcessing}
                      className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:opacity-50"
                    >
                      {isProcessing ? 'Declining...' : 'Decline'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
