import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

/**
 * Cron function: runs daily to check overdue/approaching-deadline redemptions.
 * Escalation schedule: day 3 (gentle), day 5 (reminder), day 7 (urgent), day 14+ (final).
 */

interface EscalationLevel {
  minDays: number;
  severity: 'gentle' | 'reminder' | 'urgent' | 'final';
  message: (title: string, days: number) => string;
}

const ESCALATION: EscalationLevel[] = [
  { minDays: 14, severity: 'final', message: (t, d) => `⚠️ "${t}" is ${d} days overdue. Your child's trust depends on keeping promises. Please fulfil or reschedule today.` },
  { minDays: 7, severity: 'urgent', message: (t, d) => `🔴 "${t}" is now ${d} days overdue. Your child is waiting — please take action soon!` },
  { minDays: 5, severity: 'reminder', message: (t, d) => `🟡 Friendly reminder: "${t}" was promised ${d} days ago. Your child is looking forward to it!` },
  { minDays: 3, severity: 'gentle', message: (t, d) => `👋 Just a nudge — "${t}" was claimed ${d} days ago. Don't forget to fulfil it when you can!` },
];

function getEscalation(daysSinceClaim: number): EscalationLevel | null {
  for (const level of ESCALATION) {
    if (daysSinceClaim >= level.minDays) return level;
  }
  return null;
}

serve(async (_req: Request) => {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    const now = new Date();

    // Fetch all pending redemptions (not completed/withdrawn)
    const { data: redemptions, error } = await supabase
      .from('redemptions')
      .select('id, parent_id, student_id, status, claimed_at, fulfilment_deadline, wishlist_items(title)')
      .in('status', ['claimed', 'acknowledged', 'pending_fulfilment', 'overdue']);

    if (error) throw error;
    if (!redemptions?.length) {
      return new Response(JSON.stringify({ message: 'No pending redemptions', nudgesSent: 0 }), { status: 200 });
    }

    let nudgesSent = 0;
    const notifications: Array<{ user_id: string; action: string; details: Record<string, unknown> }> = [];

    for (const r of redemptions) {
      const claimedAt = new Date(r.claimed_at);
      const daysSinceClaim = Math.floor((now.getTime() - claimedAt.getTime()) / 86400000);
      const deadline = new Date(r.fulfilment_deadline);
      const isOverdue = now > deadline;

      // Update status to overdue if past deadline
      if (isOverdue && r.status !== 'overdue') {
        await supabase.from('redemptions').update({ status: 'overdue' }).eq('id', r.id);
      }

      const escalation = getEscalation(daysSinceClaim);
      if (!escalation) continue;

      // Check if we already sent this severity level (prevent daily spam)
      const { data: recentNudges } = await supabase
        .from('audit_logs')
        .select('id')
        .eq('user_id', r.parent_id)
        .eq('action', `nudge_${escalation.severity}`)
        .gte('created_at', new Date(now.getTime() - 86400000 * 2).toISOString()) // within 2 days
        .limit(1);

      if (recentNudges?.length) continue; // Already nudged at this level recently

      const title = (r as any).wishlist_items?.title ?? 'Reward';
      const message = escalation.message(title, daysSinceClaim);

      notifications.push({
        user_id: r.parent_id,
        action: `nudge_${escalation.severity}`,
        details: {
          redemptionId: r.id,
          severity: escalation.severity,
          daysSinceClaim,
          isOverdue,
          message,
        },
      });

      nudgesSent++;
    }

    if (notifications.length > 0) {
      await supabase.from('audit_logs').insert(notifications);
    }

    return new Response(JSON.stringify({
      success: true,
      checked: redemptions.length,
      nudgesSent,
    }), { status: 200 });

  } catch (err) {
    console.error('redemption-nudges error:', err);
    return new Response(JSON.stringify({ error: (err as Error).message }), { status: 500 });
  }
});
