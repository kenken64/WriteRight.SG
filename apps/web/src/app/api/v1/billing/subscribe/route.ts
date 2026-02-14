import { NextRequest, NextResponse } from "next/server";
import { requireRole, isAuthError } from "@/lib/middleware/rbac";
import { auditLog } from "@/lib/middleware/audit";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-06-20" });

const PRICE_MAP: Record<string, string> = {
  plus_monthly: process.env.STRIPE_PRICE_PLUS_MONTHLY!,
  plus_annual: process.env.STRIPE_PRICE_PLUS_ANNUAL!,
};

export async function POST(req: NextRequest) {
  const auth = await requireRole(req, 'parent');
  if (isAuthError(auth)) return auth;

  const body = await req.json();
  const plan = body.plan as string;
  const priceId = PRICE_MAP[plan];
  if (!priceId) return NextResponse.json({ error: "Invalid plan" }, { status: 400 });

  const { data: profile } = await auth.supabase.from("users").select("email, stripe_customer_id").eq("id", auth.user.id).single();
  let customerId = profile?.stripe_customer_id;

  if (!customerId) {
    const customer = await stripe.customers.create({ email: profile?.email ?? auth.user.email!, metadata: { userId: auth.user.id } });
    customerId = customer.id;
    await auth.supabase.from("users").update({ stripe_customer_id: customerId }).eq("id", auth.user.id);
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?billing=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?billing=cancel`,
    metadata: { userId: auth.user.id, plan },
  });

  await auditLog(auth.supabase, { actorId: auth.user.id, action: 'subscription_initiated', entityType: 'billing', metadata: { plan } });

  return NextResponse.json({ url: session.url });
}
