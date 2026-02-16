import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// ── Pricing map (USD per 1M tokens) ────────────────────────────────
const PRICING: Record<string, { input: number; output: number }> = {
  "gpt-5": { input: 1.75, output: 14.0 },
  "gpt-5.2": { input: 1.75, output: 14.0 },
  "gpt-4o": { input: 2.5, output: 10.0 },
  "gpt-4o-mini": { input: 0.15, output: 0.6 },
};

function estimateCost(model: string, inputTokens: number, outputTokens: number): number {
  // Find pricing — try exact match first, then prefix match
  const pricing =
    PRICING[model] ??
    Object.entries(PRICING).find(([k]) => model.startsWith(k))?.[1] ??
    PRICING["gpt-4o"]; // fallback
  return (inputTokens * pricing.input + outputTokens * pricing.output) / 1_000_000;
}

// ── Supabase admin client (lazy singleton) ─────────────────────────
let _admin: SupabaseClient | null = null;

function getAdminClient(): SupabaseClient | null {
  if (_admin) return _admin;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  _admin = createClient(url, key, { auth: { persistSession: false } });
  return _admin;
}

// ── Public API ─────────────────────────────────────────────────────
export interface TrackUsageParams {
  submissionId?: string;
  userId?: string;
  operation: string;
  model: string;
  usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
  durationMs: number;
  status: "success" | "error";
  error?: string;
}

/**
 * Fire-and-forget: logs API usage to Supabase.
 * Never throws — silently swallows errors so it can't break the main flow.
 */
export function trackUsage(params: TrackUsageParams): void {
  try {
    const client = getAdminClient();
    if (!client) return;

    const inputTokens = params.usage?.prompt_tokens ?? 0;
    const outputTokens = params.usage?.completion_tokens ?? 0;
    const totalTokens = params.usage?.total_tokens ?? inputTokens + outputTokens;

    // Don't await — fire and forget
    client
      .from("api_usage_logs")
      .insert({
        submission_id: params.submissionId ?? null,
        user_id: params.userId ?? null,
        operation: params.operation,
        model: params.model,
        input_tokens: inputTokens,
        output_tokens: outputTokens,
        total_tokens: totalTokens,
        estimated_cost_usd: estimateCost(params.model, inputTokens, outputTokens),
        duration_ms: params.durationMs,
        status: params.status,
        error_message: params.error ?? null,
      })
      .then(({ error }: { error: any }) => {
        if (error) console.error("[usage-tracker] insert failed:", error.message);
      });
  } catch {
    // silently ignore
  }
}
