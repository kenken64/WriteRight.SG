'use client';

import { ProgressBar } from './progress-bar';

interface AchievementWithProgress {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  badge_emoji: string;
  student_achievements?: Array<{ unlocked_at: string }>;
  achievement_progress?: Array<{ current_value: number; target_value: number }>;
}

interface BadgeWallProps {
  achievements: AchievementWithProgress[];
}

const categoryLabels: Record<string, string> = {
  practice: '📝 Practice',
  improvement: '📈 Improvement',
  mastery: '🏆 Mastery',
  streak: '🔥 Streak',
  special: '🎓 Special',
};

export function BadgeWall({ achievements }: BadgeWallProps) {
  const grouped = achievements.reduce(
    (acc, a) => {
      const cat = a.category;
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(a);
      return acc;
    },
    {} as Record<string, AchievementWithProgress[]>,
  );

  return (
    <div className="space-y-8">
      {Object.entries(grouped).map(([category, items]) => (
        <div key={category}>
          <h2 className="text-lg font-semibold">{categoryLabels[category] ?? category}</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((achievement) => {
              const isUnlocked = (achievement.student_achievements?.length ?? 0) > 0;
              const progress = achievement.achievement_progress?.[0];

              return (
                <div
                  key={achievement.id}
                  className={`rounded-lg border p-4 transition-all ${
                    isUnlocked ? 'bg-white shadow-sm' : 'bg-muted/50 opacity-60'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className={`text-3xl ${isUnlocked ? '' : 'grayscale'}`}>
                      {achievement.badge_emoji}
                    </span>
                    <div className="flex-1">
                      <h3 className="font-medium">{achievement.name}</h3>
                      <p className="text-xs text-muted-foreground">{achievement.description}</p>
                      {isUnlocked ? (
                        <p className="mt-2 text-xs text-green-600">
                          ✅ Unlocked {new Date(achievement.student_achievements![0].unlocked_at).toLocaleDateString('en-SG')}
                        </p>
                      ) : progress ? (
                        <div className="mt-2">
                          <ProgressBar current={progress.current_value} target={progress.target_value} />
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
