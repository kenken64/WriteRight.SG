import { MODEL_PRIMARY } from "@writeright/ai/shared/model-config";
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: submission } = await supabase
    .from("submissions")
    .select("*, assignment:assignments(*)")
    .eq("id", params.id)
    .single();

  if (!submission) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!submission.ocr_text) {
    return NextResponse.json({ error: "OCR not complete" }, { status: 400 });
  }

  // Update status to evaluating
  await supabase.from("submissions").update({ status: "evaluating", updated_at: new Date().toISOString() }).eq("id", params.id);

  // TODO: Call AI marking engine from packages/ai
  const evaluation = {
    submission_id: params.id,
    essay_type: submission.assignment?.essay_type ?? "continuous",
    rubric_version: "v1.0",
    model_id: MODEL_PRIMARY,
    prompt_version: "marking-v1",
    dimension_scores: [
      { name: "Content", score: 6, maxScore: 10, band: 3, justification: "Good development of ideas" },
      { name: "Language", score: 7, maxScore: 10, band: 4, justification: "Varied vocabulary with minor errors" },
      { name: "Organisation", score: 5, maxScore: 10, band: 3, justification: "Logical flow with room for improvement" },
    ],
    total_score: 18,
    band: 3,
    strengths: [{ text: "Clear thesis statement", quote: "", suggestion: "" }],
    weaknesses: [{ text: "Limited use of examples", quote: "", suggestion: "Add specific real-world examples" }],
    next_steps: ["Focus on paragraph transitions", "Expand vocabulary for formal register"],
    confidence: 0.82,
    review_recommended: false,
  };

  const { data: evalData, error } = await supabase.from("evaluations").insert(evaluation).select().single();

  await supabase.from("submissions").update({ status: "evaluated", updated_at: new Date().toISOString() }).eq("id", params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ evaluation: evalData }, { status: 201 });
}
