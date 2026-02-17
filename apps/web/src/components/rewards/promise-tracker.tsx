'use client';

import { useState } from 'react';
import { useAcknowledgeRedemption, useFulfilRedemption } from '@/lib/api/client';
import { useRouter } from 'next/navigation';

export type RedemptionStatus =
  | 'claimed'
  | 'acknowledged'
  | 'pending_fulfilment'
  | 'completed'
  | 'overdue'
  | 'rescheduled'
  | 'withdrawn';

export interface RedemptionData {
  id: string;
  status: RedemptionStatus;
  fulfilment_deadline: string;
  claimed_at: string;
  fulfilled_at: string | null;
  kid_confirmed: boolean;
  wishlist_item?: { title: string; reward_type: string };
}

interface PromiseTrackerProps {
  redemption: RedemptionData;
  viewAs: 'parent' | 'student';
}

const steps: { key: RedemptionStatus[]; label: string; emoji: string }[] = [
  { key: ['claimed'], label: 'Claimed', emoji: '🎫' },
  { key: ['acknowledged'], label: 'Acknowledged', emoji: '👍' },
  { key: ['pending_fulfilment', 'rescheduled'], label: 'In Progress', emoji: '⏳' },
  { key: ['completed'], label: 'Fulfilled', emoji: '🎉' },
];

function getStepIndex(status: RedemptionStatus): number {
  if (status === 'completed') return 3;
  if (status === 'pending_fulfilment' || status === 'rescheduled') return 2;
  if (status === 'acknowledged') return 1;
  return 0;
}

function getDaysRemaining(deadline: string): number {
  const now = new Date();
  const dl = new Date(deadline);
  return Math.ceil((dl.getTime() - now.getTime()) / 86400000);
}

export function PromiseTracker({ redemption, viewAs }: PromiseTrackerProps) {
  const router = useRouter();
  const acknowledgeMutation = useAcknowledgeRedemption();
  const fulfilMutation = useFulfilRedemption();
  const [processing, setProcessing] = useState(false);
  const currentStep = getStepIndex(redemption.status);
  const isOverdue = redemption.status === 'overdue';
  const isWithdrawn = redemption.status === 'withdrawn';
  const isCompleted = redemption.status === 'completed';
  const daysLeft = getDaysRemaining(redemption.fulfilment_deadline);
  const title = redemption.wishlist_item?.title ?? 'Reward';

  const canAcknowledge = viewAs === 'parent' && redemption.status === 'claimed';
  const canFulfil = viewAs === 'parent' && ['acknowledged', 'pending_fulfilment'].includes(redemption.status);

  async function handleAcknowledge() {
    setProcessing(true);
    try {
      await acknowledgeMutation.mutateAsync(redemption.id);
      router.refresh();
    } finally {
      setProcessing(false);
    }
  }

  async function handleFulfil() {
    setProcessing(true);
    try {
      await fulfilMutation.mutateAsync({ id: redemption.id });
      router.refresh();
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className={`rounded-xl border p-5 ${isOverdue ? 'border-red-300 bg-red-50' : isCompleted ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-white'}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-base">{title}</h3>
        {isWithdrawn && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 text-gray-500">Withdrawn</span>
        )}
      </div>

      {/* Timeline */}
      {!isWithdrawn && (
        <div className="flex items-center gap-1 mb-4">
          {steps.map((step, i) => {
            const isActive = i <= currentStep;
            const isCurrent = i === currentStep;
            return (
              <div key={step.label} className="flex-1 flex flex-col items-center">
                <div className="flex items-center w-full">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 transition-all ${
                      isActive
                        ? isCurrent
                          ? 'bg-primary text-white ring-2 ring-primary/30 ring-offset-2'
                          : 'bg-primary/80 text-white'
                        : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    {step.emoji}
                  </div>
                  {i < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-1 ${i < currentStep ? 'bg-primary' : 'bg-gray-200'}`} />
                  )}
                </div>
                <span className={`text-[10px] mt-1 ${isActive ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Status details */}
      <div className="space-y-1 text-sm">
        <p className="text-muted-foreground">
          Claimed on {new Date(redemption.claimed_at).toLocaleDateString('en-SG', { day: 'numeric', month: 'short' })}
        </p>

        {!isCompleted && !isWithdrawn && (
          <p className={daysLeft < 0 ? 'text-red-600 font-semibold' : daysLeft <= 2 ? 'text-amber-600 font-medium' : 'text-muted-foreground'}>
            {daysLeft < 0
              ? `⚠️ Overdue by ${Math.abs(daysLeft)} day${Math.abs(daysLeft) !== 1 ? 's' : ''}`
              : daysLeft === 0
                ? '⏰ Due today!'
                : `${daysLeft} day${daysLeft !== 1 ? 's' : ''} remaining`}
          </p>
        )}

        {isCompleted && redemption.fulfilled_at && (
          <p className="text-green-600 font-medium">
            ✅ Fulfilled on {new Date(redemption.fulfilled_at).toLocaleDateString('en-SG', { day: 'numeric', month: 'short' })}
          </p>
        )}

        {isCompleted && !redemption.kid_confirmed && viewAs === 'student' && (
          <p className="text-blue-600 text-xs">Did you receive your reward? Tap to confirm!</p>
        )}

        {viewAs === 'parent' && !isCompleted && !isWithdrawn && (
          <p className="text-xs text-muted-foreground mt-2">
            💡 Fulfil this reward to build trust and keep your child motivated!
          </p>
        )}
      </div>

      {/* Action buttons for parent */}
      {(canAcknowledge || canFulfil) && (
        <div className="mt-4 flex gap-2">
          {canAcknowledge && (
            <button
              onClick={handleAcknowledge}
              disabled={processing}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
            >
              {processing ? 'Acknowledging...' : 'Acknowledge'}
            </button>
          )}
          {canFulfil && (
            <button
              onClick={handleFulfil}
              disabled={processing}
              className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-700 disabled:opacity-50"
            >
              {processing ? 'Fulfilling...' : 'Mark as Fulfilled'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
