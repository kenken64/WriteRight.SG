import type { SupabaseClient, User } from '@supabase/supabase-js';

/**
 * Ensures a row exists in the public.users table for the given auth user.
 * Supabase Auth creates auth.users but there's no trigger to auto-create
 * the public.users row, so we upsert it during onboarding.
 */
export async function ensureUserRow(
  supabase: SupabaseClient,
  user: User,
): Promise<{ error: string | null }> {
  const { error } = await supabase.from('users').upsert(
    {
      id: user.id,
      role: user.user_metadata?.role ?? 'student',
      email: user.email,
      display_name: user.user_metadata?.display_name ?? null,
    },
    { onConflict: 'id', ignoreDuplicates: true },
  );

  if (error) return { error: error.message };
  return { error: null };
}

/**
 * Marks the user as onboarded. Creates the users row first if it doesn't exist.
 */
export async function markOnboarded(
  supabase: SupabaseClient,
  user: User,
): Promise<{ error: string | null }> {
  const ensureResult = await ensureUserRow(supabase, user);
  if (ensureResult.error) return ensureResult;

  const { error } = await supabase
    .from('users')
    .update({ onboarded: true })
    .eq('id', user.id);

  if (error) return { error: error.message };
  return { error: null };
}
