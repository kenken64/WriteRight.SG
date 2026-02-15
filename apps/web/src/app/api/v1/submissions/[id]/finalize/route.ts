import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { extractTextFromImages } from "@writeright/ai/ocr/vision-client";
import { evaluateEssay } from "@writeright/ai/marking/engine";

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
  if (!submission.image_refs?.length) {
    return NextResponse.json({ error: "No images uploaded" }, { status: 400 });
  }

  // Transition to processing
  const { data: updated, error: updateErr } = await supabase
    .from("submissions")
    .update({ status: "processing", updated_at: new Date().toISOString() })
    .eq("id", params.id)
    .eq("status", "draft")
    .select()
    .single();

  if (updateErr || !updated) {
    return NextResponse.json({ error: "Cannot finalize - submission may not be in draft state" }, { status: 409 });
  }

  try {
    // Step 1: OCR if not already done
    let ocrText = submission.ocr_text;
    if (!ocrText) {
      // Build public URLs for the images
      const imageUrls = submission.image_refs.map((ref: string) => {
        const { data } = supabase.storage.from("submissions").getPublicUrl(ref);
        return data.publicUrl;
      });

      const ocrResult = await extractTextFromImages(imageUrls);
      ocrText = ocrResult.text;

      await supabase.from("submissions").update({
        ocr_text: ocrResult.text,
        ocr_confidence: ocrResult.confidence,
        status: "ocr_complete",
        updated_at: new Date().toISOString(),
      }).eq("id", params.id);
    }

    // Step 2: Auto-evaluate
    await supabase.from("submissions").update({ status: "evaluating", updated_at: new Date().toISOString() }).eq("id", params.id);

    const result = await evaluateEssay({
      essayText: ocrText,
      essayType: submission.assignment?.essay_type ?? "continuous",
      essaySubType: submission.assignment?.essay_sub_type ?? undefined,
      prompt: submission.assignment?.prompt ?? "",
      guidingPoints: submission.assignment?.guiding_points ?? undefined,
      level: "sec4",
    });

    const evaluation = {
      submission_id: params.id,
      essay_type: result.essayType,
      rubric_version: result.rubricVersion,
      model_id: result.modelId,
      prompt_version: result.promptVersion,
      dimension_scores: result.dimensionScores,
      total_score: result.totalScore,
      band: result.band,
      strengths: result.strengths,
      weaknesses: result.weaknesses,
      next_steps: result.nextSteps,
      confidence: result.confidence,
      review_recommended: result.reviewRecommended,
    };

    const { data: evalData, error: evalErr } = await supabase.from("evaluations").insert(evaluation).select().single();

    if (evalErr) {
      await supabase.from("submissions").update({ status: "failed", failure_reason: evalErr.message, updated_at: new Date().toISOString() }).eq("id", params.id);
      return NextResponse.json({ error: evalErr.message }, { status: 500 });
    }

    await supabase.from("submissions").update({ status: "evaluated", updated_at: new Date().toISOString() }).eq("id", params.id);

    return NextResponse.json({ submission: { ...updated, ocr_text: ocrText, status: "evaluated" }, evaluation: evalData }, { status: 201 });
  } catch (err: any) {
    await supabase.from("submissions").update({ status: "failed", failure_reason: err.message, updated_at: new Date().toISOString() }).eq("id", params.id);
    return NextResponse.json({ error: err.message ?? "Finalize failed" }, { status: 500 });
  }
}
