import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const role = user.user_metadata?.role;
  if (role !== 'parent') {
    return NextResponse.json({ error: 'Only teachers can access class codes' }, { status: 403 });
  }

  // Get active class code
  const { data: classCode } = await supabase
    .from('class_codes')
    .select('id, code, class_name, created_at')
    .eq('teacher_id', user.id)
    .eq('is_active', true)
    .single();

  if (!classCode) {
    return NextResponse.json({ classCode: null, studentCount: 0 });
  }

  // Count linked students
  const { count } = await supabase
    .from('parent_student_links')
    .select('id', { count: 'exact', head: true })
    .eq('parent_id', user.id);

  return NextResponse.json({
    classCode,
    studentCount: count ?? 0,
  });
}
