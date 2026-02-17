import { NextRequest, NextResponse } from "next/server";
import { requireParentOrStudent, isAuthError } from "@/lib/middleware/rbac";
import { createAdminSupabaseClient } from "@/lib/supabase/server";
import { sanitizeInput } from "@/lib/middleware/sanitize";

export async function GET(req: NextRequest, { params }: { params: Promise<{ studentId: string }> }) {
  const { studentId } = await params;
  const auth = await requireParentOrStudent(req, studentId);
  if (isAuthError(auth)) return auth;

  // Reconcile: unlock any locked items whose achievement is already earned
  const { data: lockedItems } = await auth.supabase
    .from("wishlist_items")
    .select("id, required_achievement_id")
    .eq("student_id", studentId)
    .eq("status", "locked")
    .not("required_achievement_id", "is", null);

  if (lockedItems && lockedItems.length > 0) {
    const achievementIds = lockedItems.map((i: any) => i.required_achievement_id);
    const { data: unlocked } = await auth.supabase
      .from("student_achievements")
      .select("achievement_id")
      .eq("student_id", studentId)
      .in("achievement_id", achievementIds);

    const unlockedSet = new Set((unlocked ?? []).map((u: any) => u.achievement_id));
    const toUnlock = lockedItems.filter((i: any) => unlockedSet.has(i.required_achievement_id));

    if (toUnlock.length > 0) {
      const admin = createAdminSupabaseClient();
      await admin
        .from("wishlist_items")
        .update({ status: "claimable" })
        .in("id", toUnlock.map((i: any) => i.id));
    }
  }

  const { data, error } = await auth.supabase
    .from("wishlist_items")
    .select("*")
    .eq("student_id", studentId)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ items: data });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ studentId: string }> }) {
  const { studentId } = await params;
  const auth = await requireParentOrStudent(req, studentId);
  if (isAuthError(auth)) return auth;

  const body = await req.json();
  const { data, error } = await auth.supabase.from("wishlist_items").insert({
    student_id: studentId,
    created_by: body.createdBy ?? "student",
    title: sanitizeInput(body.title),
    description: body.description ? sanitizeInput(body.description) : null,
    image_url: body.imageUrl ?? null,
    reward_type: body.rewardType ?? "custom",
    required_achievement_id: body.requiredAchievementId ?? null,
    is_surprise: body.isSurprise ?? false,
    status: body.createdBy === "parent" ? "locked" : "pending_parent",
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ item: data }, { status: 201 });
}
