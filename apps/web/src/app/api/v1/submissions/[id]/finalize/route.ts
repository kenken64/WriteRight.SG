import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient, createAdminSupabaseClient } from "@/lib/supabase/server";
import { extractTextFromFiles } from "@writeright/ai/ocr/vision-client";
import { evaluateEssay } from "@writeright/ai/marking/engine";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  console.log(`[finalize] Starting finalization for submission ${id}`);

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.log(`[finalize] Unauthorized - no user session`);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  console.log(`[finalize] Authenticated user: ${user.id}`);

  // Use admin client for DB mutations (RLS already verified via auth above)
  const admin = createAdminSupabaseClient();

  const { data: submission, error: fetchErr } = await admin
    .from("submissions")
    .select("*, assignment:assignments(*)")
    .eq("id", id)
    .single();

  if (fetchErr) {
    console.error(`[finalize] Failed to fetch submission:`, fetchErr.message);
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (!submission) return NextResponse.json({ error: "Not found" }, { status: 404 });

  console.log(`[finalize] Submission found — status: ${submission.status}, image_refs: ${submission.image_refs?.length ?? 0}, has ocr_text: ${!!submission.ocr_text}`);
  console.log(`[finalize] Assignment: ${submission.assignment?.id ?? "none"}, essay_type: ${submission.assignment?.essay_type ?? "unknown"}`);

  if (!submission.image_refs?.length) {
    console.log(`[finalize] No files uploaded — aborting`);
    return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
  }

  // Transition to processing
  const { data: updated, error: updateErr } = await admin
    .from("submissions")
    .update({ status: "processing", updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("status", "draft")
    .select()
    .single();

  if (updateErr || !updated) {
    console.error(`[finalize] Status transition failed — current status: ${submission.status}, error:`, updateErr?.message ?? "no rows matched");
    return NextResponse.json({ error: "Cannot finalize - submission may not be in draft state" }, { status: 409 });
  }
  console.log(`[finalize] Status transitioned to 'processing'`);

  try {
    // Step 1: OCR / text extraction if not already done
    let ocrText = submission.ocr_text;
    if (!ocrText) {
      console.log(`[finalize] Starting OCR — generating signed URLs for ${submission.image_refs.length} file(s)`);

      // Build signed URLs for the uploaded files (bucket is private)
      const fileUrls: string[] = [];
      for (const ref of submission.image_refs as string[]) {
        const { data, error: urlErr } = await admin.storage
          .from("submissions")
          .createSignedUrl(ref, 600); // 10 minute expiry
        if (urlErr || !data?.signedUrl) {
          console.error(`[finalize] Signed URL failed for "${ref}":`, urlErr?.message ?? "no signedUrl returned");
          throw new Error(`Failed to create signed URL for ${ref}: ${urlErr?.message ?? "unknown"}`);
        }
        fileUrls.push(data.signedUrl);
      }
      console.log(`[finalize] Generated ${fileUrls.length} signed URL(s)`);

      // Detect file type from the first file's extension
      const firstRef: string = submission.image_refs[0];
      const ext = firstRef.split(".").pop()?.toLowerCase() ?? "";
      const mimeByExt: Record<string, string> = {
        pdf: "application/pdf",
        docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        doc: "application/msword",
      };
      const detectedType = mimeByExt[ext] ?? "image/*";
      console.log(`[finalize] Detected file type: ${detectedType} (ext: ${ext})`);

      console.log(`[finalize] Calling extractTextFromFiles...`);
      const ocrResult = await extractTextFromFiles(fileUrls, detectedType);
      ocrText = ocrResult.text;
      console.log(`[finalize] OCR complete — text length: ${ocrText?.length ?? 0}, confidence: ${ocrResult.confidence}`);

      await admin.from("submissions").update({
        ocr_text: ocrResult.text,
        ocr_confidence: ocrResult.confidence,
        status: "ocr_complete",
        updated_at: new Date().toISOString(),
      }).eq("id", id);
      console.log(`[finalize] Status updated to 'ocr_complete'`);
    } else {
      console.log(`[finalize] OCR text already present — skipping extraction (length: ${ocrText.length})`);
    }

    // Step 2: Auto-evaluate
    console.log(`[finalize] Starting evaluation...`);
    await admin.from("submissions").update({ status: "evaluating", updated_at: new Date().toISOString() }).eq("id", id);

    const result = await evaluateEssay({
      essayText: ocrText,
      essayType: submission.assignment?.essay_type ?? "continuous",
      essaySubType: submission.assignment?.essay_sub_type ?? undefined,
      prompt: submission.assignment?.prompt ?? "",
      guidingPoints: submission.assignment?.guiding_points ?? undefined,
      level: "sec4",
    });
    console.log(`[finalize] Evaluation complete — score: ${result.totalScore}, band: ${result.band}`);

    const evaluation = {
      submission_id: id,
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

    const { data: evalData, error: evalErr } = await admin.from("evaluations").insert(evaluation).select().single();

    if (evalErr) {
      console.error(`[finalize] Evaluation insert failed:`, evalErr.message);
      await admin.from("submissions").update({ status: "failed", failure_reason: evalErr.message, updated_at: new Date().toISOString() }).eq("id", id);
      return NextResponse.json({ error: evalErr.message }, { status: 500 });
    }
    console.log(`[finalize] Evaluation saved — id: ${evalData.id}`);

    await admin.from("submissions").update({ status: "evaluated", updated_at: new Date().toISOString() }).eq("id", id);
    console.log(`[finalize] Done — submission ${id} fully evaluated`);

    return NextResponse.json({ submission: { ...updated, ocr_text: ocrText, status: "evaluated" }, evaluation: evalData }, { status: 201 });
  } catch (err: any) {
    console.error(`[finalize] Error during finalization:`, err.message, err.stack);
    await admin.from("submissions").update({ status: "failed", failure_reason: err.message, updated_at: new Date().toISOString() }).eq("id", id);
    return NextResponse.json({ error: err.message ?? "Finalize failed" }, { status: 500 });
  }
}
