import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockSupabase, createMockChain } from './helpers/mock-supabase';
import { rbacOverrides } from './helpers/mock-rbac';

const mockSupabase = createMockSupabase();
vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: () => mockSupabase,
}));
vi.mock('next/headers', () => ({ cookies: () => ({ get: vi.fn(), set: vi.fn() }) }));

beforeEach(() => {
  vi.clearAllMocks();
  mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
});

describe('GET /api/v1/wishlist/students/[studentId]', () => {
  it('returns 401 if not authenticated', async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({ data: { user: null } });
    const { GET } = await import('@/app/api/v1/wishlist/students/[studentId]/route');
    const res = await GET(new Request('http://localhost') as any, { params: { studentId: 's1' } });
    expect(res.status).toBe(401);
  });

  it('returns wishlist items', async () => {
    const items = [{ id: 'w1', title: 'Ice cream' }];
    const overrides = rbacOverrides('student', 'u1', 's1');
    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'wishlist_items') return createMockChain(items);
      if (overrides[table as keyof typeof overrides]) return overrides[table as keyof typeof overrides];
      return createMockChain();
    });

    const { GET } = await import('@/app/api/v1/wishlist/students/[studentId]/route');
    const res = await GET(new Request('http://localhost') as any, { params: { studentId: 's1' } });
    const json = await res.json();
    expect(json.items).toEqual(items);
  });
});

describe('POST /api/v1/wishlist/students/[studentId]', () => {
  it('creates item with pending_parent status for student', async () => {
    const overrides = rbacOverrides('student', 'u1', 's1');
    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'wishlist_items') return createMockChain({ id: 'w1', status: 'pending_parent' });
      if (overrides[table as keyof typeof overrides]) return overrides[table as keyof typeof overrides];
      return createMockChain();
    });

    const { POST } = await import('@/app/api/v1/wishlist/students/[studentId]/route');
    const req = new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({ title: 'Ice cream', rewardType: 'treat' }),
    });
    const res = await POST(req as any, { params: { studentId: 's1' } });
    expect(res.status).toBe(201);
  });
});

describe('POST /api/v1/wishlist/items/[itemId]/claim', () => {
  it('returns 404 for non-existent item', async () => {
    const overrides = rbacOverrides('student', 'u1', 's1');
    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'wishlist_items') return createMockChain(null);
      if (overrides[table as keyof typeof overrides]) return overrides[table as keyof typeof overrides];
      return createMockChain();
    });

    const { POST } = await import('@/app/api/v1/wishlist/items/[itemId]/claim/route');
    const res = await POST(new Request('http://localhost', { method: 'POST' }) as any, { params: { itemId: 'w1' } });
    expect(res.status).toBe(404);
  });

  it('returns 400 for non-claimable item', async () => {
    const overrides = rbacOverrides('student', 'u1', 's1');
    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'wishlist_items') return createMockChain({ id: 'w1', status: 'locked', student_id: 's1' });
      if (table === 'student_profiles') return createMockChain({ id: 's1', user_id: 'u1' });
      if (overrides[table as keyof typeof overrides]) return overrides[table as keyof typeof overrides];
      return createMockChain();
    });

    const { POST } = await import('@/app/api/v1/wishlist/items/[itemId]/claim/route');
    const res = await POST(new Request('http://localhost', { method: 'POST' }) as any, { params: { itemId: 'w1' } });
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain('not claimable');
  });
});
