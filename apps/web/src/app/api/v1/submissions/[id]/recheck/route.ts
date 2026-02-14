import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Check recheck limits (max 2 per submission)
  const { count } = await supabase
    .from("evaluations")
    .select("*", { count: "exact", head: true })
    .eq("submission_id", params.id);

  if ((count ?? 0) >= 3) {
    return NextResponse.json({ error: "Maximum recheck limit reached (2 rechecks)" }, { status: 429 });
  }

  // Reset to evaluating and re-trigger
  await supabase.from("submissions").update({ status: "evaluating", updated_at: new Date().toISOString() }).eq("id", params.id);

  // TODO: Re-run AI marking with different temperature/prompt variation
  return NextResponse.json({ message: "Recheck initiated", attempt: (count ?? 0) + 1 });
}
