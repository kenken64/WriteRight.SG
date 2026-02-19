import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

const VALID_TECHNIQUE_KEYS = [
  'so_what_chain',
  'five_senses_snapshot',
  'person_quote_detail',
  'before_during_after',
  'contrast_sentence',
  'zoom_structure',
] as const;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabase
    .from('guided_rewrite_responses')
    .select('*')
    .eq('submission_id', id)
    .order('created_at', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ responses: data });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { technique_key, response_data, is_complete } = body;

  if (!VALID_TECHNIQUE_KEYS.includes(technique_key)) {
    return NextResponse.json(
      { error: `Invalid technique_key. Must be one of: ${VALID_TECHNIQUE_KEYS.join(', ')}` },
      { status: 400 },
    );
  }

  // Look up the student profile for the current user
  const { data: profile } = await supabase
    .from('student_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: 'Student profile not found' }, { status: 403 });
  }

  const { data, error } = await supabase
    .from('guided_rewrite_responses')
    .upsert(
      {
        submission_id: id,
        student_id: profile.id,
        technique_key,
        response_data: response_data ?? {},
        is_complete: is_complete ?? false,
      },
      { onConflict: 'submission_id,student_id,technique_key' },
    )
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ response: data }, { status: 201 });
}
