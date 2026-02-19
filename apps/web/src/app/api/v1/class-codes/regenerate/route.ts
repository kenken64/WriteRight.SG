import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { generateCode } from '@/lib/utils/generate-code';

export async function POST() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const role = user.user_metadata?.role;
  if (role !== 'parent') {
    return NextResponse.json({ error: 'Only teachers can regenerate class codes' }, { status: 403 });
  }

  // Deactivate current active code
  await supabase
    .from('class_codes')
    .update({ is_active: false })
    .eq('teacher_id', user.id)
    .eq('is_active', true);

  // Generate new code with retry on collision
  let code = '';
  let inserted = false;
  for (let attempt = 0; attempt < 10; attempt++) {
    code = generateCode();
    const { error } = await supabase
      .from('class_codes')
      .insert({
        teacher_id: user.id,
        code,
        is_active: true,
      });

    if (!error) {
      inserted = true;
      break;
    }
    if (!error.message.includes('unique') && !error.message.includes('duplicate')) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  if (!inserted) {
    return NextResponse.json({ error: 'Failed to generate unique class code' }, { status: 500 });
  }

  return NextResponse.json({ classCode: code });
}
