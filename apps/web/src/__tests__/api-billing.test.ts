import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockSupabase, createMockChain } from './helpers/mock-supabase';
import { rbacOverrides } from './helpers/mock-rbac';

const mockSupabase = createMockSupabase();
vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: () => mockSupabase,
}));
vi.mock('next/headers', () => ({ cookies: () => ({ get: vi.fn(), set: vi.fn() }) }));

// Mock Stripe
vi.mock('stripe', () => {
  return {
    default: class Stripe {
      customers = { create: vi.fn().mockResolvedValue({ id: 'cus_123' }) };
      checkout = { sessions: { create: vi.fn().mockResolvedValue({ url: 'https://checkout.stripe.com/pay' }) } };
      subscriptions = { update: vi.fn().mockResolvedValue({}) };
    },
  };
});

function setupParentMock() {
  const overrides = rbacOverrides('parent', 'u1');
  mockSupabase.from.mockImplementation((table: string) => {
    if (overrides[table as keyof typeof overrides]) return overrides[table as keyof typeof overrides];
    return createMockChain();
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'u1', email: 'test@test.com' } } });
  setupParentMock();
});

describe('POST /api/v1/billing/subscribe', () => {
  it('returns 401 if not authenticated', async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({ data: { user: null } });
    const { POST } = await import('@/app/api/v1/billing/subscribe/route');
    const req = new Request('http://localhost', { method: 'POST', body: JSON.stringify({ plan: 'plus_monthly' }) });
    const res = await POST(req as any);
    expect(res.status).toBe(401);
  });

  it('returns 400 for invalid plan', async () => {
    const overrides = rbacOverrides('parent', 'u1');
    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'users') {
        // First call: role check returns parent, second call: profile query
        const chain = createMockChain({ role: 'parent', email: 'test@test.com', stripe_customer_id: null });
        return chain;
      }
      if (overrides[table as keyof typeof overrides]) return overrides[table as keyof typeof overrides];
      return createMockChain();
    });

    const { POST } = await import('@/app/api/v1/billing/subscribe/route');
    const req = new Request('http://localhost', { method: 'POST', body: JSON.stringify({ plan: 'enterprise' }) });
    const res = await POST(req as any);
    expect(res.status).toBe(400);
  });
});

describe('POST /api/v1/billing/cancel', () => {
  it('returns 401 if not authenticated', async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({ data: { user: null } });
    const { POST } = await import('@/app/api/v1/billing/cancel/route');
    const res = await POST(new Request('http://localhost', { method: 'POST' }) as any);
    expect(res.status).toBe(401);
  });

  it('returns 400 if no active subscription', async () => {
    const overrides = rbacOverrides('parent', 'u1');
    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'subscriptions') return createMockChain(null);
      if (overrides[table as keyof typeof overrides]) return overrides[table as keyof typeof overrides];
      return createMockChain();
    });
    const { POST } = await import('@/app/api/v1/billing/cancel/route');
    const res = await POST(new Request('http://localhost', { method: 'POST' }) as any);
    expect(res.status).toBe(400);
  });
});

describe('GET /api/v1/billing/usage', () => {
  it('returns 401 if not authenticated', async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({ data: { user: null } });
    const { GET } = await import('@/app/api/v1/billing/usage/route');
    const res = await GET(new Request('http://localhost') as any);
    expect(res.status).toBe(401);
  });

  it('returns usage data with free limits', async () => {
    const subChain = createMockChain({ plan: 'free' });
    const evalChain = createMockChain(null);
    (evalChain as any).count = 3;
    const topicChain = createMockChain(null);
    (topicChain as any).count = 1;

    let callNum = 0;
    mockSupabase.from.mockImplementation(() => {
      callNum++;
      if (callNum === 1) return subChain;
      if (callNum === 2) return evalChain;
      return topicChain;
    });

    const { GET } = await import('@/app/api/v1/billing/usage/route');
    const res = await GET(new Request('http://localhost') as any);
    const json = await res.json();
    expect(json.plan).toBe('free');
    expect(json.limits.evaluations).toBe(10);
  });
});
