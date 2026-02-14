import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const mode = body.mode ?? "exam_optimised";

  const { data: submission } = await supabase
    .from("submissions")
    .select("*, evaluations(*)")
    .eq("id", params.id)
    .single();

  if (!submission) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!submission.ocr_text) return NextResponse.json({ error: "No text to rewrite" }, { status: 400 });

  // TODO: Call AI rewrite engine from packages/ai
  const rewrite = {
    submission_id: params.id,
    mode,
    rewritten_text: `[Rewritten version of submission in ${mode} mode]\n\n${submission.ocr_text}`,
    diff_payload: { changes: [] },
    rationale: { overall: "Improved paragraph structure and vocabulary" },
    target_band: (submission.evaluations?.[0]?.band ?? 3) + 1,
  };

  const { data, error } = await supabase.from("rewrites").insert(rewrite).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ rewrite: data }, { status: 201 });
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data } = await supabase.from("rewrites").select("*").eq("submission_id", params.id).order("created_at", { ascending: false });
  return NextResponse.json({ rewrites: data ?? [] });
}
