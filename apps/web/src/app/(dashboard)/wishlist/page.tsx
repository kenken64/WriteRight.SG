'use client';

import { useState } from 'react';
import { WishlistCard } from '@/components/rewards/wishlist-card';
import { useWishlist, useAddWishlistItem, useClaimReward } from '@/lib/api/client';
import { getRewardEmoji } from '@/lib/utils/format';

const rewardTypes = ['treat', 'screen_time', 'book', 'activity', 'money', 'creative', 'custom'] as const;

export default function WishlistPage() {
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState('');
  const [rewardType, setRewardType] = useState<typeof rewardTypes[number]>('treat');

  // TODO: Get studentId from auth context
  const studentId = '';
  const { data: items } = useWishlist(studentId);
  const addItem = useAddWishlistItem();
  const claimReward = useClaimReward();

  const handleAdd = async () => {
    await addItem.mutateAsync({
      student_id: studentId,
      title,
      reward_type: rewardType,
      created_by: 'student',
    } as any);
    setShowAdd(false);
    setTitle('');
  };

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold md:text-3xl">⭐ My Wishlist</h1>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white"
        >
          + Add Wish
        </button>
      </div>

      {showAdd && (
        <div className="mt-4 rounded-lg border bg-white p-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What do you wish for?"
            className="w-full rounded-md border px-3 py-2 text-sm"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            {rewardTypes.map((rt) => (
              <button
                key={rt}
                onClick={() => setRewardType(rt)}
                className={`rounded-full border px-3 py-1 text-sm ${
                  rewardType === rt ? 'border-primary bg-primary/10' : ''
                }`}
              >
                {getRewardEmoji(rt)} {rt.replace('_', ' ')}
              </button>
            ))}
          </div>
          <button
            onClick={handleAdd}
            disabled={!title || addItem.isPending}
            className="mt-3 rounded-md bg-primary px-4 py-2 text-sm text-white disabled:opacity-50"
          >
            Add to Wishlist
          </button>
        </div>
      )}

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {items?.map((item) => (
          <WishlistCard
            key={item.id}
            item={item}
            onClaim={async () => { claimReward.mutate(item.id); }}
          />
        ))}
      </div>
    </div>
  );
}
