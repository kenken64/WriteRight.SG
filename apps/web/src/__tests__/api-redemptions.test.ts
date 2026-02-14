import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockSupabase, createMockChain } from './helpers/mock-supabase';
import { rbacOverrides } from './helpers/mock-rbac';

const mockSupabase = createMockSupabase();
vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: () => mockSupabase,
}));
vi.mock('next/headers', () => ({ cookies: () => ({ get: vi.fn(), set: vi.fn() }) }));

function setupRole(role: 'parent' | 'student') {
  const overrides = rbacOverrides(role, 'u1');
  mockSupabase.from.mockImplementation((table: string) => {
    if (overrides[table as keyof typeof overrides]) return overrides[table as keyof typeof overrides];
    return createMockChain();
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
});

describe('POST /api/v1/redemptions/[id]/acknowledge', () => {
  it('returns 404 for non-existent redemption', async () => {
    const overrides = rbacOverrides('parent', 'u1');
    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'redemptions') return createMockChain(null);
      if (overrides[table as keyof typeof overrides]) return overrides[table as keyof typeof overrides];
      return createMockChain();
    });
    const { POST } = await import('@/app/api/v1/redemptions/[id]/acknowledge/route');
    const res = await POST(new Request('http://localhost', { method: 'POST' }) as any, { params: { id: 'r1' } });
    expect(res.status).toBe(404);
  });

  it('returns 400 if not in claimed state', async () => {
    const overrides = rbacOverrides('parent', 'u1');
    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'redemptions') return createMockChain({ id: 'r1', status: 'completed' });
      if (overrides[table as keyof typeof overrides]) return overrides[table as keyof typeof overrides];
      return createMockChain();
    });
    const { POST } = await import('@/app/api/v1/redemptions/[id]/acknowledge/route');
    const res = await POST(new Request('http://localhost', { method: 'POST' }) as any, { params: { id: 'r1' } });
    expect(res.status).toBe(400);
  });

  it('acknowledges claimed redemption', async () => {
    const overrides = rbacOverrides('parent', 'u1');
    let redemptionCall = 0;
    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'redemptions') {
        redemptionCall++;
        if (redemptionCall === 1) return createMockChain({ id: 'r1', status: 'claimed' });
        return createMockChain({ id: 'r1', status: 'acknowledged' });
      }
      if (overrides[table as keyof typeof overrides]) return overrides[table as keyof typeof overrides];
      return createMockChain();
    });
    const { POST } = await import('@/app/api/v1/redemptions/[id]/acknowledge/route');
    const res = await POST(new Request('http://localhost', { method: 'POST' }) as any, { params: { id: 'r1' } });
    const json = await res.json();
    expect(json.redemption.status).toBe('acknowledged');
  });
});

describe('POST /api/v1/redemptions/[id]/fulfil', () => {
  it('returns 400 if not in acknowledged/pending state', async () => {
    const overrides = rbacOverrides('parent', 'u1');
    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'redemptions') return createMockChain({ id: 'r1', status: 'claimed' });
      if (overrides[table as keyof typeof overrides]) return overrides[table as keyof typeof overrides];
      return createMockChain();
    });
    const { POST } = await import('@/app/api/v1/redemptions/[id]/fulfil/route');
    const res = await POST(new Request('http://localhost', { method: 'POST' }) as any, { params: { id: 'r1' } });
    expect(res.status).toBe(400);
  });
});

describe('POST /api/v1/redemptions/[id]/reschedule', () => {
  it('requires newDeadline', async () => {
    const overrides = rbacOverrides('parent', 'u1');
    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'redemptions') return createMockChain({ id: 'r1', status: 'acknowledged' });
      if (overrides[table as keyof typeof overrides]) return overrides[table as keyof typeof overrides];
      return createMockChain();
    });
    const { POST } = await import('@/app/api/v1/redemptions/[id]/reschedule/route');
    const req = new Request('http://localhost', { method: 'POST', body: JSON.stringify({}) });
    const res = await POST(req as any, { params: { id: 'r1' } });
    expect(res.status).toBe(400);
  });
});

describe('POST /api/v1/redemptions/[id]/confirm', () => {
  it('returns 400 if not completed', async () => {
    const overrides = rbacOverrides('student', 'u1');
    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'redemptions') return createMockChain({ id: 'r1', status: 'acknowledged' });
      if (overrides[table as keyof typeof overrides]) return overrides[table as keyof typeof overrides];
      return createMockChain();
    });
    const { POST } = await import('@/app/api/v1/redemptions/[id]/confirm/route');
    const res = await POST(new Request('http://localhost', { method: 'POST' }) as any, { params: { id: 'r1' } });
    expect(res.status).toBe(400);
  });
});

describe('POST /api/v1/redemptions/[id]/withdraw', () => {
  it('withdraws and resets wishlist item', async () => {
    const overrides = rbacOverrides('parent', 'u1');
    let redemptionCall = 0;
    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'redemptions') {
        redemptionCall++;
        if (redemptionCall === 1) return createMockChain({ id: 'r1', status: 'claimed', wishlist_item_id: 'w1' });
        return createMockChain({ id: 'r1', status: 'withdrawn' });
      }
      if (table === 'wishlist_items') return createMockChain({ id: 'w1', status: 'claimable' });
      if (overrides[table as keyof typeof overrides]) return overrides[table as keyof typeof overrides];
      return createMockChain();
    });
    const { POST } = await import('@/app/api/v1/redemptions/[id]/withdraw/route');
    const res = await POST(new Request('http://localhost', { method: 'POST' }) as any, { params: { id: 'r1' } });
    const json = await res.json();
    expect(json.redemption.status).toBe('withdrawn');
  });
});

describe('POST /api/v1/redemptions/[id]/nudge', () => {
  it('returns 400 if not in nudgeable state', async () => {
    const overrides = rbacOverrides('student', 'u1');
    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'redemptions') return createMockChain({ id: 'r1', status: 'completed' });
      if (overrides[table as keyof typeof overrides]) return overrides[table as keyof typeof overrides];
      return createMockChain();
    });
    const { POST } = await import('@/app/api/v1/redemptions/[id]/nudge/route');
    const res = await POST(new Request('http://localhost', { method: 'POST' }) as any, { params: { id: 'r1' } });
    expect(res.status).toBe(400);
  });
});
