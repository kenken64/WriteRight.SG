import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; techniqueKey: string }> },
) {
  const { id, techniqueKey } = await params;
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const updates: Record<string, unknown> = {};
  if (body.response_data !== undefined) updates.response_data = body.response_data;
  if (body.is_complete !== undefined) updates.is_complete = body.is_complete;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('guided_rewrite_responses')
    .update(updates)
    .eq('submission_id', id)
    .eq('technique_key', techniqueKey)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ response: data });
}
