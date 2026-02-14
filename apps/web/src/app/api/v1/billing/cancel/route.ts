import { NextRequest, NextResponse } from "next/server";
import { requireRole, isAuthError } from "@/lib/middleware/rbac";
import { auditLog } from "@/lib/middleware/audit";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-06-20" });

export async function POST(req: NextRequest) {
  const auth = await requireRole(req, 'parent');
  if (isAuthError(auth)) return auth;

  const { data: sub } = await auth.supabase
    .from("subscriptions")
    .select("stripe_subscription_id")
    .eq("user_id", auth.user.id)
    .eq("status", "active")
    .single();

  if (!sub?.stripe_subscription_id) {
    return NextResponse.json({ error: "No active subscription" }, { status: 400 });
  }

  await stripe.subscriptions.update(sub.stripe_subscription_id, { cancel_at_period_end: true });
  await auth.supabase.from("subscriptions").update({ status: "canceled" }).eq("user_id", auth.user.id);

  await auditLog(auth.supabase, { actorId: auth.user.id, action: 'subscription_canceled', entityType: 'billing' });

  return NextResponse.json({ message: "Subscription will cancel at period end" });
}
