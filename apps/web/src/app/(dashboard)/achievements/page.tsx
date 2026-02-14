import { createServerSupabaseClient } from '@/lib/supabase/server';
import { BadgeWall } from '@/components/achievements/badge-wall';
import { StreakCounter } from '@/components/achievements/streak-counter';

export default async function AchievementsPage() {
  const supabase = createServerSupabaseClient();

  const { data: achievements } = await supabase
    .from('achievements')
    .select('*, student_achievements(unlocked_at), achievement_progress(current_value, target_value)')
    .order('sort_order');

  const { data: streak } = await supabase.from('student_streaks').select('*').single();

  return (
    <div>
      <h1 className="text-2xl font-bold md:text-3xl">🏆 Achievements</h1>

      {streak && (
        <div className="mt-6">
          <StreakCounter
            currentStreak={streak.current_streak}
            longestStreak={streak.longest_streak}
            lastSubmissionDate={streak.last_submission_date}
          />
        </div>
      )}

      <div className="mt-8">
        <BadgeWall achievements={achievements ?? []} />
      </div>
    </div>
  );
}
