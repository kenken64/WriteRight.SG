import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { generateTopicRequestSchema } from "@/lib/validators/schemas";

export async function POST(req: NextRequest) {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const params = generateTopicRequestSchema.parse(body);

    // Check subscription usage limits
    const { data: sub } = await supabase
      .from("subscriptions")
      .select("plan")
      .eq("user_id", user.id)
      .single();

    const plan = sub?.plan ?? "free";
    const { count } = await supabase
      .from("topics")
      .select("*", { count: "exact", head: true })
      .gte("created_at", new Date(Date.now() - 30 * 86400000).toISOString());

    const limit = plan === "free" ? 5 : 50;
    if ((count ?? 0) >= limit) {
      return NextResponse.json({ error: "Monthly topic generation limit reached" }, { status: 429 });
    }

    // TODO: Call AI topic generation from packages/ai
    const generatedPrompts = {
      title: `Generated ${params.essayType} writing prompt`,
      prompt: params.articleText
        ? `Based on the article provided, write a ${params.essayType} composition...`
        : `Write a ${params.essayType} composition on a trending topic...`,
      guidingPoints: [
        "Consider the social implications",
        "Provide concrete examples",
        "Address potential counterarguments",
      ],
    };

    const { data: topic, error } = await supabase.from("topics").insert({
      source: params.source === "upload" ? "upload" : "trending",
      source_text: params.articleText ?? null,
      essay_type: params.essayType,
      level: params.level ?? null,
      generated_prompts: generatedPrompts,
    }).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ topic }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Bad request" }, { status: 400 });
  }
}
