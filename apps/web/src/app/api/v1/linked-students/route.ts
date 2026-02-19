import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const role = user.user_metadata?.role;
  if (role !== 'parent') {
    return NextResponse.json({ error: 'Only parents/teachers can access linked students' }, { status: 403 });
  }

  const { data: links } = await supabase
    .from('parent_student_links')
    .select('student_id, student_profiles(id, display_name, level)')
    .eq('parent_id', user.id);

  const students = (links ?? [])
    .map((link: Record<string, unknown>) => {
      const profile = link.student_profiles as { id: string; display_name: string; level: string } | null;
      if (!profile) return null;
      return {
        id: profile.id,
        displayName: profile.display_name,
        level: profile.level,
      };
    })
    .filter(Boolean);

  return NextResponse.json({ students });
}
