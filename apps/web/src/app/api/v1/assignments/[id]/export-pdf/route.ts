import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: assignment } = await supabase
    .from("assignments")
    .select("*, submissions(*, evaluations(*), rewrites(*))")
    .eq("id", params.id)
    .single();

  if (!assignment) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // TODO: Generate PDF with @react-pdf/renderer or puppeteer
  // For now, return structured JSON that can be rendered client-side
  const pdfData = {
    title: assignment.prompt,
    essayType: assignment.essay_type,
    submissions: assignment.submissions?.map((s: any) => ({
      ocrText: s.ocr_text,
      evaluation: s.evaluations?.[0] ?? null,
      rewrite: s.rewrites?.[0] ?? null,
    })),
    exportedAt: new Date().toISOString(),
  };

  return NextResponse.json(pdfData, {
    headers: { "Content-Type": "application/json" },
  });
}
