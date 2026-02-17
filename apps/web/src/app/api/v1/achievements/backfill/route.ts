import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient, createAdminSupabaseClient } from "@/lib/supabase/server";

/**
 * POST /api/v1/achievements/backfill
 *
 * Retroactively checks and awards achievements for all students (or a single
 * student when ?studentId=... is provided).  Meant to be called once to
 * backfill after the check-achievements edge function code-mismatch fix.
 */
export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createAdminSupabaseClient();

  const { searchParams } = new URL(req.url);
  const singleStudentId = searchParams.get("studentId");

  // Resolve student ids to process
  let studentIds: string[] = [];
  if (singleStudentId) {
    studentIds = [singleStudentId];
  } else {
    const { data: profiles } = await admin.from("student_profiles").select("id");
    studentIds = (profiles ?? []).map((p: any) => p.id);
  }

  if (studentIds.length === 0) {
    return NextResponse.json({ message: "No students found" });
  }

  // Load all achievements
  const { data: allAchievements } = await admin.from("achievements").select("*");
  if (!allAchievements || allAchievements.length === 0) {
    return NextResponse.json({ error: "No achievements found in database" }, { status: 500 });
  }
  const achievementsByCode = new Map(allAchievements.map((a: any) => [a.code, a]));

  const results: Array<{ studentId: string; newlyUnlocked: string[]; progressUpdated: number }> = [];

  for (const studentId of studentIds) {
    // Gather student data
    const [submissionsRes, evaluationsRes, streakRes, existingRes] = await Promise.all([
      admin
        .from("submissions")
        .select("id, created_at, assignment:assignments!inner(essay_type, student_id, topic:topics(category))")
        .eq("assignments.student_id", studentId)
        .eq("status", "evaluated")
        .order("created_at", { ascending: true }),
      admin
        .from("evaluations")
        .select("band, total_score, submission_id, created_at")
        .order("created_at", { ascending: true }),
      admin.from("student_streaks").select("*").eq("student_id", studentId).single(),
      admin.from("student_achievements").select("achievement_id, achievements(code)").eq("student_id", studentId),
    ]);

    const submissions = submissionsRes.data ?? [];
    const submissionIds = new Set(submissions.map((s: any) => s.id));
    const evaluations = (evaluationsRes.data ?? []).filter((e: any) => submissionIds.has(e.submission_id));
    const streak = streakRes.data;
    const existingCodes = new Set(
      (existingRes.data ?? []).map((sa: any) => sa.achievements?.code).filter(Boolean),
    );

    const bands = evaluations.map((e: any) => e.band as number);
    const essayTypes = new Set(submissions.map((s: any) => (s.assignment as any)?.essay_type).filter(Boolean));
    const categories = new Set(
      submissions.map((s: any) => (s.assignment as any)?.topic?.category).filter(Boolean),
    );

    let improvementCount = 0;
    for (let i = 1; i < bands.length; i++) {
      if (bands[i] > bands[i - 1]) improvementCount++;
    }

    let daysSinceLastSubmission: number | null = null;
    if (submissions.length >= 2) {
      const sorted = submissions
        .map((s: any) => new Date(s.created_at).getTime())
        .sort((a: number, b: number) => a - b);
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

    // Same rules as the edge function (must stay in sync)
    const rules = [
      { code: "first_steps", check: () => ctx.totalSubmissions >= 1, progress: () => ({ current: Math.min(ctx.totalSubmissions, 1), target: 1 }) },
      { code: "getting_started", check: () => ctx.totalSubmissions >= 5, progress: () => ({ current: Math.min(ctx.totalSubmissions, 5), target: 5 }) },
      { code: "dedicated_writer", check: () => ctx.totalSubmissions >= 20, progress: () => ({ current: Math.min(ctx.totalSubmissions, 20), target: 20 }) },
      { code: "writing_machine", check: () => ctx.totalSubmissions >= 50, progress: () => ({ current: Math.min(ctx.totalSubmissions, 50), target: 50 }) },
      { code: "century_club", check: () => ctx.totalSubmissions >= 100, progress: () => ({ current: Math.min(ctx.totalSubmissions, 100), target: 100 }) },
      { code: "levelling_up", check: () => ctx.improvementCount >= 1, progress: () => ({ current: Math.min(ctx.improvementCount, 1), target: 1 }) },
      { code: "band_breaker", check: () => ctx.improvementCount >= 1, progress: () => ({ current: Math.min(ctx.improvementCount, 1), target: 1 }) },
      { code: "band_3_unlocked", check: () => ctx.highestBand >= 3, progress: () => ({ current: Math.min(ctx.highestBand, 3), target: 3 }) },
      { code: "band_4_unlocked", check: () => ctx.highestBand >= 4, progress: () => ({ current: Math.min(ctx.highestBand, 4), target: 4 }) },
      { code: "band_5_unlocked", check: () => ctx.highestBand >= 5, progress: () => ({ current: Math.min(ctx.highestBand, 5), target: 5 }) },
      { code: "streak_3", check: () => ctx.longestStreak >= 3, progress: () => ({ current: Math.min(ctx.currentStreak, 3), target: 3 }) },
      { code: "streak_7", check: () => ctx.longestStreak >= 7, progress: () => ({ current: Math.min(ctx.currentStreak, 7), target: 7 }) },
      { code: "streak_30", check: () => ctx.longestStreak >= 30, progress: () => ({ current: Math.min(ctx.currentStreak, 30), target: 30 }) },
      { code: "comeback_kid", check: () => (ctx.daysSinceLastSubmission ?? 0) >= 14, progress: () => ({ current: 0, target: 1 }) },
      { code: "topic_explorer", check: () => ctx.categoriesAttempted.size >= 5, progress: () => ({ current: Math.min(ctx.categoriesAttempted.size, 5), target: 5 }) },
      { code: "all_rounder", check: () => ctx.essayTypesAttempted.size >= 2, progress: () => ({ current: Math.min(ctx.essayTypesAttempted.size, 2), target: 2 }) },
    ];

    const newlyUnlocked: string[] = [];
    let progressUpdated = 0;

    for (const rule of rules) {
      const achievement = achievementsByCode.get(rule.code);
      if (!achievement) continue;

      const prog = rule.progress();
      await admin.from("achievement_progress").upsert(
        {
          student_id: studentId,
          achievement_id: achievement.id,
          current_value: prog.current,
          target_value: prog.target,
        },
        { onConflict: "student_id,achievement_id" },
      );
      progressUpdated++;

      if (!existingCodes.has(rule.code) && rule.check()) {
        newlyUnlocked.push(rule.code);
        existingCodes.add(rule.code); // prevent double-insert
        await admin.from("student_achievements").upsert(
          {
            student_id: studentId,
            achievement_id: achievement.id,
            unlocked_at: new Date().toISOString(),
          },
          { onConflict: "student_id,achievement_id" },
        );
      }
    }

    results.push({ studentId, newlyUnlocked, progressUpdated });
  }

  return NextResponse.json({ success: true, studentsProcessed: results.length, results });
}
