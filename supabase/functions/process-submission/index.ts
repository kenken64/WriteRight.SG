import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')!;

interface RequestBody {
  submissionId: string;
}

serve(async (req: Request) => {
  try {
    const { submissionId } = (await req.json()) as RequestBody;
    if (!submissionId) {
      return new Response(JSON.stringify({ error: 'submissionId required' }), { status: 400 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // 1. Fetch submission
    const { data: submission, error: fetchErr } = await supabase
      .from('submissions')
      .select('*, assignments(*)')
      .eq('id', submissionId)
      .single();

    if (fetchErr || !submission) {
      return new Response(JSON.stringify({ error: 'Submission not found' }), { status: 404 });
    }

    // Update status to processing
    await supabase.from('submissions').update({ status: 'processing', updated_at: new Date().toISOString() }).eq('id', submissionId);

    // 2. OCR via OpenAI Vision (if image refs exist)
    let ocrText = submission.ocr_text;
    let ocrConfidence = submission.ocr_confidence ?? 0;

    if (!ocrText && submission.image_refs?.length) {
      const ocrResult = await runOcr(submission.image_refs);
      ocrText = ocrResult.text;
      ocrConfidence = ocrResult.confidence;

      await supabase.from('submissions').update({
        ocr_text: ocrText,
        ocr_confidence: ocrConfidence,
        status: 'ocr_complete',
        updated_at: new Date().toISOString(),
      }).eq('id', submissionId);
    }

    if (!ocrText) {
      await supabase.from('submissions').update({
        status: 'failed',
        failure_reason: 'No text could be extracted',
        updated_at: new Date().toISOString(),
      }).eq('id', submissionId);
      return new Response(JSON.stringify({ error: 'OCR failed — no text' }), { status: 422 });
    }

    // 3. Confidence check — flag for review if low
    const needsReview = ocrConfidence < 0.7;

    // 4. Run marking engine
    await supabase.from('submissions').update({ status: 'evaluating', updated_at: new Date().toISOString() }).eq('id', submissionId);

    const essayType = submission.assignments?.essay_type ?? 'continuous';
    const evaluation = await runMarkingEngine(ocrText, essayType);

    // 5. Store evaluation
    const { data: evalRecord, error: evalErr } = await supabase.from('evaluations').insert({
      submission_id: submissionId,
      essay_type: essayType,
      rubric_version: 'v1',
      model_id: 'gpt-4o',
      prompt_version: 'v1',
      dimension_scores: evaluation.dimensionScores,
      total_score: evaluation.totalScore,
      band: evaluation.band,
      strengths: evaluation.strengths,
      weaknesses: evaluation.weaknesses,
      next_steps: evaluation.nextSteps,
      confidence: evaluation.confidence,
      review_recommended: needsReview || evaluation.reviewRecommended,
    }).select().single();

    if (evalErr) throw new Error(`Evaluation insert failed: ${evalErr.message}`);

    // 6. Update submission status
    await supabase.from('submissions').update({
      status: 'evaluated',
      updated_at: new Date().toISOString(),
    }).eq('id', submissionId);

    // 7. Trigger achievement check
    const studentId = submission.assignments?.student_id;
    if (studentId) {
      await supabase.functions.invoke('check-achievements', {
        body: { studentId, submissionId, evaluationId: evalRecord.id },
      });
    }

    // 8. Send notification (insert into notifications or use Supabase Realtime)
    if (studentId) {
      await supabase.from('audit_logs').insert({
        user_id: studentId,
        action: 'submission_evaluated',
        details: { submissionId, band: evaluation.band, totalScore: evaluation.totalScore },
      });
    }

    return new Response(JSON.stringify({
      success: true,
      submissionId,
      evaluationId: evalRecord.id,
      band: evaluation.band,
      totalScore: evaluation.totalScore,
      reviewRecommended: needsReview,
    }), { status: 200 });

  } catch (err) {
    console.error('process-submission error:', err);
    return new Response(JSON.stringify({ error: (err as Error).message }), { status: 500 });
  }
});

// ─── OCR Helper ───
async function runOcr(imageRefs: string[]): Promise<{ text: string; confidence: number }> {
  const pages: string[] = [];

  for (const ref of imageRefs) {
    const imageUrl = ref.startsWith('http') ? ref : `${SUPABASE_URL}/storage/v1/object/public/submissions/${ref}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${OPENAI_API_KEY}` },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: 'Transcribe the handwritten text in this image exactly as written. Mark illegible portions as [illegible]. Mark crossed-out text as [crossed out: text]. Preserve paragraph breaks.' },
            { type: 'image_url', image_url: { url: imageUrl, detail: 'high' } },
          ],
        }],
        max_tokens: 4000,
        temperature: 0,
      }),
    });

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content ?? '';
    pages.push(text);
  }

  const fullText = pages.join('\n\n---\n\n');
  const confidence = calculateOcrConfidence(fullText);
  return { text: fullText, confidence };
}

function calculateOcrConfidence(text: string): number {
  if (!text.trim()) return 0;
  let score = 1.0;
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length === 0) return 0;

  const illegible = (text.match(/\[illegible\]/gi) || []).length;
  score -= (illegible / words.length) * 2;

  const unusual = (text.match(/[^a-zA-Z0-9\s.,!?;:'"()\-\n]/g) || []).length;
  score -= (unusual / text.length) * 1.5;

  if (words.length < 50) score -= 0.2;
  return Math.max(0, Math.min(1, score));
}

// ─── Marking Helper ───
async function runMarkingEngine(text: string, essayType: string) {
  const systemPrompt = essayType === 'situational'
    ? 'You are an expert Singapore English teacher marking a Situational Writing essay for O-Level. Score across: Task Fulfilment (0-6), Language & Vocabulary (0-6), Organisation (0-6), Grammar & Mechanics (0-6), Tone & Register (0-6). Total out of 30. Assign band 0-5.'
    : 'You are an expert Singapore English teacher marking a Continuous Writing essay for O-Level. Score across: Content & Ideas (0-6), Language & Vocabulary (0-6), Organisation (0-6), Grammar & Mechanics (0-6), Style & Voice (0-6). Total out of 30. Assign band 0-5.';

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${OPENAI_API_KEY}` },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Mark this essay and return JSON:\n\n${text}\n\nReturn: {"dimensionScores":[{"name":"...","score":N,"maxScore":6,"band":N,"justification":"..."}],"totalScore":N,"band":N,"strengths":[{"text":"...","quote":"..."}],"weaknesses":[{"text":"...","quote":"...","suggestion":"..."}],"nextSteps":["..."],"confidence":0.N,"reviewRecommended":bool}` },
      ],
      max_tokens: 3000,
      temperature: 0.2,
      response_format: { type: 'json_object' },
    }),
  });

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content ?? '{}';
  return JSON.parse(content);
}
