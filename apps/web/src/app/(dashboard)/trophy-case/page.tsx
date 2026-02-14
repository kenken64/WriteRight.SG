import { createServerSupabaseClient } from '@/lib/supabase/server';
import { TrophyCard } from '@/components/rewards/trophy-card';

export default async function TrophyCasePage() {
  const supabase = createServerSupabaseClient();
  const { data: trophies } = await supabase
    .from('redemptions')
    .select('*, wishlist_item:wishlist_items(*), achievement:achievements(*)')
    .eq('status', 'completed')
    .eq('kid_confirmed', true)
    .order('fulfilled_at', { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-bold">🏆 Trophy Case</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        All your earned and received rewards!
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {trophies && trophies.length > 0 ? (
          trophies.map((trophy: any) => (
            <TrophyCard
              key={trophy.id}
              trophy={{
                id: trophy.id,
                reward_title: trophy.wishlist_item?.title ?? 'Reward',
                reward_type: trophy.wishlist_item?.reward_type ?? 'custom',
                achievement_name: trophy.achievement?.name ?? '',
                achievement_emoji: trophy.achievement?.badge_emoji ?? '🎁',
                fulfilled_at: trophy.fulfilled_at,
                parent_photo_url: trophy.fulfilment_photo_url,
              }}
            />
          ))
        ) : (
          <div className="col-span-full rounded-lg border bg-white p-12 text-center">
            <p className="text-4xl">🏆</p>
            <p className="mt-4 text-muted-foreground">
              Your trophy case is empty. Keep earning achievements to get rewards!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
