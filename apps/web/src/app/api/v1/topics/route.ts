import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { sanitizeInput } from "@/lib/middleware/sanitize";
import { parsePaginationParams, toSupabaseRange } from "@/lib/utils/pagination";

export async function GET(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const essayType = searchParams.get("essayType");
  const category = searchParams.get("category");
  const { page, pageSize } = parsePaginationParams(searchParams);
  const { from, to } = toSupabaseRange({ page, pageSize });

  let query = supabase.from("topics").select("*", { count: "exact" }).order("created_at", { ascending: false });
  if (essayType) query = query.eq("essay_type", essayType);
  if (category) query = query.eq("category", category);
  query = query.range(from, to);

  const { data, error, count } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ topics: data, total: count ?? 0 });
}

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { data, error } = await supabase.from("topics").insert({
    source: body.source ?? "manual",
    source_text: body.sourceText ? sanitizeInput(body.sourceText) : null,
    essay_type: body.essayType,
    category: body.category ?? null,
    level: body.level ?? null,
    generated_prompts: body.generatedPrompts ?? null,
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ topic: data }, { status: 201 });
}
