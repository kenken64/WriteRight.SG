import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: submission } = await supabase
    .from("submissions")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!submission) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!submission.image_refs?.length) {
    return NextResponse.json({ error: "No images uploaded" }, { status: 400 });
  }

  // Transition to processing - triggers OCR pipeline
  const { data, error } = await supabase
    .from("submissions")
    .update({ status: "processing", updated_at: new Date().toISOString() })
    .eq("id", params.id)
    .eq("status", "draft")
    .select()
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Cannot finalize - submission may not be in draft state" }, { status: 409 });
  }

  // TODO: Trigger OCR background job via edge function or queue
  return NextResponse.json({ submission: data });
}
