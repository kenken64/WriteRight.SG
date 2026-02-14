import { NextRequest, NextResponse } from "next/server";
import { requireRole, isAuthError } from "@/lib/middleware/rbac";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireRole(req, 'parent');
  if (isAuthError(auth)) return auth;

  const { data: redemption } = await auth.supabase
    .from("redemptions")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!redemption) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data, error } = await auth.supabase
    .from("redemptions")
    .update({ status: "withdrawn" })
    .eq("id", params.id)
    .select()
    .single();
  if (!error) {
    await auth.supabase.from("wishlist_items").update({ status: "claimable", claimed_at: null }).eq("id", redemption.wishlist_item_id);
  }

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ redemption: data });
}
