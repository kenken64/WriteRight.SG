import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient, createAdminSupabaseClient } from "@/lib/supabase/server";
import { createAssignmentSchema } from "@/lib/validators/schemas";
import { parsePaginationParams, toSupabaseRange } from "@/lib/utils/pagination";

export async function GET(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const admin = createAdminSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get("studentId");
  const { page, pageSize } = parsePaginationParams(searchParams);
  const { from, to } = toSupabaseRange({ page, pageSize });

  let query = admin.from("assignments").select("*, topic:topics(*)", { count: "exact" }).order("created_at", { ascending: false });
  if (studentId) query = query.eq("student_id", studentId);
  query = query.range(from, to);

  const { data, error, count } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ assignments: data, total: count ?? 0 });
}

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const admin = createAdminSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    console.log("[assignments:POST] body:", JSON.stringify(body));
    const parsed = createAssignmentSchema.parse(body);

    // Resolve student_profile.id from auth user if not provided
    let studentId = parsed.student_id;
    if (!studentId) {
      // Try student profile first (if user is a student)
      const { data: profile } = await admin.from("student_profiles").select("id").eq("user_id", user.id).single();
      if (profile) {
        studentId = profile.id;
      } else {
        // If not a student, check if user is a parent linked to a student
        const { data: link } = await admin.from("parent_student_links").select("student_id").eq("parent_id", user.id).limit(1).single();
        if (!link) return NextResponse.json({ error: "No linked student found. Please complete onboarding." }, { status: 400 });
        studentId = link.student_id;
      }
    }

    const { data, error } = await admin.from("assignments").insert({
      ...parsed,
      student_id: studentId,
      language: "en",
    }).select().single();

    if (error) {
      return NextResponse.json({ error: error.message, details: error, debug: { userId: user.id, parsed } }, { status: 500 });
    }
    return NextResponse.json({ assignment: data }, { status: 201 });
  } catch (err: any) {
    console.error("[assignments:POST] error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
