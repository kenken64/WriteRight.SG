import { NextRequest, NextResponse } from "next/server";
import { requireParentOrStudent, isAuthError } from "@/lib/middleware/rbac";

export async function GET(req: NextRequest, { params }: { params: { studentId: string } }) {
  const auth = await requireParentOrStudent(req, params.studentId);
  if (isAuthError(auth)) return auth;

  const { data, error } = await auth.supabase
    .from("student_streaks")
    .select("*")
    .eq("student_id", params.studentId)
    .single();

  if (error) return NextResponse.json({ currentStreak: 0, longestStreak: 0, lastSubmissionDate: null });
  return NextResponse.json({
    currentStreak: data.current_streak,
    longestStreak: data.longest_streak,
    lastSubmissionDate: data.last_submission_date,
  });
}
