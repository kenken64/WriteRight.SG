'use client';

export interface TrophyData {
  id: string;
  reward_title: string;
  reward_type: string;
  achievement_name: string;
  achievement_emoji: string;
  fulfilled_at: string;
  parent_photo_url?: string | null;
}

interface TrophyCardProps {
  trophy: TrophyData;
}

const rewardEmojis: Record<string, string> = {
  treat: '🍦', screen_time: '🎮', book: '📖', activity: '🏊',
  money: '💰', creative: '🎨', custom: '🎁',
};

export function TrophyCard({ trophy }: TrophyCardProps) {
  const emoji = rewardEmojis[trophy.reward_type] ?? '🎁';
  const date = new Date(trophy.fulfilled_at).toLocaleDateString('en-SG', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  return (
    <div className="group relative overflow-hidden rounded-xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 p-5 shadow-sm transition-all hover:shadow-md hover:border-amber-300">
      {/* Decorative sparkles */}
      <div className="absolute top-2 right-2 text-amber-300 opacity-50 group-hover:opacity-100 transition-opacity">✨</div>
      <div className="absolute bottom-2 left-3 text-amber-200 opacity-30 group-hover:opacity-60 transition-opacity text-xs">⭐</div>

      <div className="flex items-start gap-3">
        <div className="text-4xl shrink-0">{emoji}</div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-amber-900 truncate">{trophy.reward_title}</h3>

          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-sm">{trophy.achievement_emoji}</span>
            <span className="text-xs text-amber-700 font-medium">{trophy.achievement_name}</span>
          </div>

          <p className="text-xs text-amber-600/70 mt-2">🏆 Earned on {date}</p>
        </div>
      </div>

      {trophy.parent_photo_url && (
        <div className="mt-3 rounded-lg overflow-hidden border border-amber-200">
          <img
            src={trophy.parent_photo_url}
            alt="Reward moment"
            className="w-full h-32 object-cover"
            loading="lazy"
          />
        </div>
      )}
    </div>
  );
}
