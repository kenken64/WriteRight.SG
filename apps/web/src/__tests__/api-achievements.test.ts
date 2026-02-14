import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockSupabase, createMockChain } from './helpers/mock-supabase';
import { rbacOverrides } from './helpers/mock-rbac';

const mockSupabase = createMockSupabase(rbacOverrides('student', 'u1', 's1'));
vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: () => mockSupabase,
}));
vi.mock('next/headers', () => ({ cookies: () => ({ get: vi.fn(), set: vi.fn() }) }));

beforeEach(() => {
  vi.clearAllMocks();
  // Re-apply RBAC overrides after clear
  const overrides = rbacOverrides('student', 'u1', 's1');
  mockSupabase.from.mockImplementation((table: string) => {
    if (overrides[table as keyof typeof overrides]) return overrides[table as keyof typeof overrides];
    return createMockChain();
  });
});

describe('GET /api/v1/achievements/[studentId]', () => {
  it('returns 401 if not authenticated', async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({ data: { user: null } });
    const { GET } = await import('@/app/api/v1/achievements/[studentId]/route');
    const res = await GET(new Request('http://localhost') as any, { params: { studentId: 's1' } });
    expect(res.status).toBe(401);
  });

  it('returns achievements list', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
    const achievements = [{ id: 'a1', code: 'FIRST_SUBMIT' }];
    const overrides = rbacOverrides('student', 'u1', 's1');
    const achievementsChain = createMockChain(achievements);
    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'student_achievements') return achievementsChain;
      if (overrides[table as keyof typeof overrides]) return overrides[table as keyof typeof overrides];
      return createMockChain();
    });

    const { GET } = await import('@/app/api/v1/achievements/[studentId]/route');
    const res = await GET(new Request('http://localhost') as any, { params: { studentId: 's1' } });
    const json = await res.json();
    expect(json.achievements).toEqual(achievements);
  });
});

describe('GET /api/v1/achievements/[studentId]/streaks', () => {
  it('returns streak data', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
    const overrides = rbacOverrides('student', 'u1', 's1');
    const streakChain = createMockChain({ current_streak: 5, longest_streak: 10, last_submission_date: '2024-06-15' });
    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'student_streaks') return streakChain;
      if (overrides[table as keyof typeof overrides]) return overrides[table as keyof typeof overrides];
      return createMockChain();
    });

    const { GET } = await import('@/app/api/v1/achievements/[studentId]/streaks/route');
    const res = await GET(new Request('http://localhost') as any, { params: { studentId: 's1' } });
    const json = await res.json();
    expect(json.currentStreak).toBe(5);
    expect(json.longestStreak).toBe(10);
  });

  it('returns zeros when no streak data', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
    const overrides = rbacOverrides('student', 'u1', 's1');
    const streakChain = createMockChain(null, { message: 'not found' });
    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'student_streaks') return streakChain;
      if (overrides[table as keyof typeof overrides]) return overrides[table as keyof typeof overrides];
      return createMockChain();
    });

    const { GET } = await import('@/app/api/v1/achievements/[studentId]/streaks/route');
    const res = await GET(new Request('http://localhost') as any, { params: { studentId: 's1' } });
    const json = await res.json();
    expect(json.currentStreak).toBe(0);
  });
});

describe('GET /api/v1/achievements/[studentId]/next', () => {
  it('returns next achievements', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
    const overrides = rbacOverrides('student', 'u1', 's1');
    const unlockedChain = createMockChain([{ achievement_id: 'ach1' }]);
    const nextChain = createMockChain([{ id: 'ach2', name: 'Next' }]);
    let achievementCallCount = 0;
    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'student_achievements') return unlockedChain;
      if (table === 'achievements') return nextChain;
      if (overrides[table as keyof typeof overrides]) return overrides[table as keyof typeof overrides];
      return createMockChain();
    });

    const { GET } = await import('@/app/api/v1/achievements/[studentId]/next/route');
    const res = await GET(new Request('http://localhost') as any, { params: { studentId: 's1' } });
    const json = await res.json();
    expect(json.next).toBeDefined();
  });
});
