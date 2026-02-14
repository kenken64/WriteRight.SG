import { createMockChain } from './mock-supabase';

/**
 * Creates table overrides for RBAC checks.
 * Use with createMockSupabase({ ...rbacOverrides(...) })
 */
export function rbacOverrides(role: 'parent' | 'student', userId = 'u1', studentId = 's1') {
  const userChain = createMockChain({ role });
  const studentProfileChain = createMockChain({ user_id: userId });
  const parentLinkChain = createMockChain({ id: 'link-1' });
  // For parent link count queries
  (parentLinkChain as any).count = 1;

  return {
    users: userChain,
    student_profiles: studentProfileChain,
    parent_student_links: parentLinkChain,
  };
}
