import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { joinClassSchema } from '@/lib/validators/schemas';
import { z } from 'zod';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const role = user.user_metadata?.role;
    if (role !== 'student') {
      return NextResponse.json({ error: 'Only students can join a class' }, { status: 403 });
    }

    const body = await req.json();
    const { classCode } = joinClassSchema.parse(body);

    // Get student profile
    const { data: profile } = await supabase
      .from('student_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Student profile not found' }, { status: 404 });
    }

    // Look up active class code
    const { data: codeRecord, error: lookupError } = await supabase
      .from('class_codes')
      .select('teacher_id, class_name')
      .eq('code', classCode.toUpperCase())
      .eq('is_active', true)
      .single();

    if (lookupError || !codeRecord) {
      return NextResponse.json({ error: 'Invalid or inactive class code' }, { status: 404 });
    }

    // Create parent-student link (ignore duplicate)
    const { error: linkError } = await supabase
      .from('parent_student_links')
      .insert({
        parent_id: codeRecord.teacher_id,
        student_id: profile.id,
      });

    if (linkError) {
      const isDuplicate = linkError.message.includes('duplicate') || linkError.message.includes('unique');
      if (!isDuplicate) {
        return NextResponse.json({ error: linkError.message }, { status: 500 });
      }
      // Already linked — that's fine
    }

    // Get teacher display name
    const { data: teacher } = await supabase
      .from('users')
      .select('display_name')
      .eq('id', codeRecord.teacher_id)
      .single();

    return NextResponse.json({
      linked: true,
      teacherName: teacher?.display_name ?? 'Teacher',
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: err.errors }, { status: 422 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
