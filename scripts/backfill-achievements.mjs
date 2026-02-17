/**
 * One-time script to retroactively award achievements for all students.
 *
 * Usage:  node scripts/backfill-achievements.mjs
 *
 * Reads SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from apps/web/.env.local
 */

import { createClient } from '../apps/web/node_modules/@supabase/supabase-js/dist/module/index.js';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, '..', 'apps', 'web', '.env.local');
const envText = readFileSync(envPath, 'utf-8');

function getEnv(key) {
  const match = envText.match(new RegExp(`^${key}="?([^"\\n]+)"?`, 'm'));
  return match?.[1];
}

const SUPABASE_URL = getEnv('NEXT_PUBLIC_SUPABASE_URL');
const SUPABASE_KEY = getEnv('SUPABASE_SERVICE_ROLE_KEY');

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Same rules as the edge function — codes must match achievements.code in DB
const RULES = [
  { code: 'first_steps', check: (c) => c.totalSubmissions >= 1, progress: (c) => ({ current: Math.min(c.totalSubmissions, 1), target: 1 }) },
  { code: 'getting_started', check: (c) => c.totalSubmissions >= 5, progress: (c) => ({ current: Math.min(c.totalSubmissions, 5), target: 5 }) },
  { code: 'dedicated_writer', check: (c) => c.totalSubmissions >= 20, progress: (c) => ({ current: Math.min(c.totalSubmissions, 20), target: 20 }) },
  { code: 'writing_machine', check: (c) => c.totalSubmissions >= 50, progress: (c) => ({ current: Math.min(c.totalSubmissions, 50), target: 50 }) },
  { code: 'century_club', check: (c) => c.totalSubmissions >= 100, progress: (c) => ({ current: Math.min(c.totalSubmissions, 100), target: 100 }) },
  { code: 'levelling_up', check: (c) => c.improvementCount >= 1, progress: (c) => ({ current: Math.min(c.improvementCount, 1), target: 1 }) },
  { code: 'band_breaker', check: (c) => c.improvementCount >= 1, progress: (c) => ({ current: Math.min(c.improvementCount, 1), target: 1 }) },
  { code: 'band_3_unlocked', check: (c) => c.highestBand >= 3, progress: (c) => ({ current: Math.min(c.highestBand, 3), target: 3 }) },
  { code: 'band_4_unlocked', check: (c) => c.highestBand >= 4, progress: (c) => ({ current: Math.min(c.highestBand, 4), target: 4 }) },
  { code: 'band_5_unlocked', check: (c) => c.highestBand >= 5, progress: (c) => ({ current: Math.min(c.highestBand, 5), target: 5 }) },
  { code: 'streak_3', check: (c) => c.longestStreak >= 3, progress: (c) => ({ current: Math.min(c.currentStreak, 3), target: 3 }) },
  { code: 'streak_7', check: (c) => c.longestStreak >= 7, progress: (c) => ({ current: Math.min(c.currentStreak, 7), target: 7 }) },
  { code: 'streak_30', check: (c) => c.longestStreak >= 30, progress: (c) => ({ current: Math.min(c.currentStreak, 30), target: 30 }) },
  { code: 'comeback_kid', check: (c) => (c.daysSinceLastSubmission ?? 0) >= 14, progress: () => ({ current: 0, target: 1 }) },
  { code: 'topic_explorer', check: (c) => c.categoriesAttempted.size >= 5, progress: (c) => ({ current: Math.min(c.categoriesAttempted.size, 5), target: 5 }) },
  { code: 'all_rounder', check: (c) => c.essayTypesAttempted.size >= 2, progress: (c) => ({ current: Math.min(c.essayTypesAttempted.size, 2), target: 2 }) },
];

async function main() {
  console.log('=== Achievement Backfill ===\n');

  // Load all achievements
  const { data: allAchievements, error: achErr } = await supabase.from('achievements').select('*');
  if (achErr || !allAchievements?.length) {
    console.error('Failed to load achievements:', achErr?.message ?? 'No achievements in DB');
    process.exit(1);
  }
  console.log(`Loaded ${allAchievements.length} achievement definitions\n`);
  const achievementsByCode = new Map(allAchievements.map((a) => [a.code, a]));

  // Load all students
  const { data: students } = await supabase.from('student_profiles').select('id, user_id, display_name');
  if (!students?.length) {
    console.log('No students found.');
    return;
  }
  console.log(`Found ${students.length} student(s)\n`);

  let totalUnlocked = 0;

  for (const student of students) {
    const studentId = student.id;
    console.log(`--- Student: ${student.display_name ?? studentId} ---`);

    // Gather data
    const [submissionsRes, evaluationsRes, streakRes, existingRes] = await Promise.all([
      supabase
        .from('submissions')
        .select('id, created_at, assignment:assignments!inner(essay_type, student_id, topic:topics(category))')
        .eq('assignments.student_id', studentId)
        .eq('status', 'evaluated')
        .order('created_at', { ascending: true }),
      supabase
        .from('evaluations')
        .select('band, total_score, submission_id, created_at')
        .order('created_at', { ascending: true }),
      supabase.from('student_streaks').select('*').eq('student_id', studentId).single(),
      supabase.from('student_achievements').select('achievement_id, achievements(code)').eq('student_id', studentId),
    ]);

    const submissions = submissionsRes.data ?? [];
    const submissionIds = new Set(submissions.map((s) => s.id));
    const evaluations = (evaluationsRes.data ?? []).filter((e) => submissionIds.has(e.submission_id));
    const streak = streakRes.data;
    const existingCodes = new Set(
      (existingRes.data ?? []).map((sa) => sa.achievements?.code).filter(Boolean),
    );

    const bands = evaluations.map((e) => e.band);
    const essayTypes = new Set(submissions.map((s) => s.assignment?.essay_type).filter(Boolean));
    const categories = new Set(
      submissions.map((s) => s.assignment?.topic?.category).filter(Boolean),
    );

    let improvementCount = 0;
    for (let i = 1; i < bands.length; i++) {
      if (bands[i] > bands[i - 1]) improvementCount++;
    }

    let daysSinceLastSubmission = null;
    if (submissions.length >= 2) {
      const sorted = submissions.map((s) => new Date(s.created_at).getTime()).sort((a, b) => a - b);
      const lastGap = sorted[sorted.length - 1] - sorted[sorted.length - 2];
      daysSinceLastSubmission = Math.floor(lastGap / (1000 * 60 * 60 * 24));
    }

    const ctx = {
      totalSubmissions: submissions.length,
      totalEvaluations: evaluations.length,
      currentStreak: streak?.current_streak ?? 0,
      longestStreak: streak?.longest_streak ?? 0,
      highestBand: bands.length > 0 ? Math.max(...bands) : 0,
      improvementCount,
      essayTypesAttempted: essayTypes,
      categoriesAttempted: categories,
      daysSinceLastSubmission,
    };

    console.log(`  Submissions: ${ctx.totalSubmissions}, Evaluations: ${ctx.totalEvaluations}, Highest band: ${ctx.highestBand}, Improvements: ${ctx.improvementCount}`);
    console.log(`  Streak: ${ctx.currentStreak} current / ${ctx.longestStreak} longest`);
    console.log(`  Essay types: [${[...essayTypes].join(', ')}], Categories: [${[...categories].join(', ')}]`);
    console.log(`  Already unlocked: [${[...existingCodes].join(', ')}]`);

    const newlyUnlocked = [];

    for (const rule of RULES) {
      const achievement = achievementsByCode.get(rule.code);
      if (!achievement) continue;

      const prog = rule.progress(ctx);

      // Upsert progress
      await supabase.from('achievement_progress').upsert(
        {
          student_id: studentId,
          achievement_id: achievement.id,
          current_value: prog.current,
          target_value: prog.target,
        },
        { onConflict: 'student_id,achievement_id' },
      );

      // Unlock if not already
      if (!existingCodes.has(rule.code) && rule.check(ctx)) {
        newlyUnlocked.push(rule.code);
        existingCodes.add(rule.code);
        const { error: insertErr } = await supabase.from('student_achievements').upsert(
          {
            student_id: studentId,
            achievement_id: achievement.id,
            unlocked_at: new Date().toISOString(),
          },
          { onConflict: 'student_id,achievement_id' },
        );
        if (insertErr) {
          console.error(`  ERROR unlocking ${rule.code}:`, insertErr.message);
        }
      }
    }

    if (newlyUnlocked.length > 0) {
      console.log(`  >> NEWLY UNLOCKED: ${newlyUnlocked.join(', ')}`);
      totalUnlocked += newlyUnlocked.length;
    } else {
      console.log('  (no new achievements)');
    }
    console.log('');
  }

  console.log(`=== Done! ${totalUnlocked} achievement(s) unlocked across ${students.length} student(s) ===`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
