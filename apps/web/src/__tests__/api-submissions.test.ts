import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockSupabase, createMockChain } from './helpers/mock-supabase';

const mockSupabase = createMockSupabase();
vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: () => mockSupabase,
}));
vi.mock('next/headers', () => ({ cookies: () => ({ get: vi.fn(), set: vi.fn() }) }));

describe('GET /api/v1/submissions', () => {
  it('returns 401 if not authenticated', async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({ data: { user: null } });
    const { GET } = await import('@/app/api/v1/submissions/route');
    const req = new Request('http://localhost/api/v1/submissions');
    const res = await GET(req as any);
    expect(res.status).toBe(401);
  });

  it('returns submissions on success', async () => {
    const submissions = [{ id: 's1', status: 'evaluated' }];
    const chain = createMockChain(submissions);
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
    mockSupabase.from.mockReturnValue(chain);

    const { GET } = await import('@/app/api/v1/submissions/route');
    const req = new Request('http://localhost/api/v1/submissions');
    const res = await GET(req as any);
    const json = await res.json();
    expect(json.submissions).toEqual(submissions);
  });
});

describe('POST /api/v1/submissions', () => {
  beforeEach(() => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
  });

  it('returns 401 if not authenticated', async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({ data: { user: null } });
    const { POST } = await import('@/app/api/v1/submissions/route');
    const req = new Request('http://localhost/api/v1/submissions', {
      method: 'POST',
      body: JSON.stringify({ assignmentId: 'a1' }),
    });
    const res = await POST(req as any);
    expect(res.status).toBe(401);
  });

  it('creates submission with draft status', async () => {
    const chain = createMockChain({ id: 's1', status: 'draft' });
    mockSupabase.from.mockReturnValue(chain);

    const { POST } = await import('@/app/api/v1/submissions/route');
    const req = new Request('http://localhost/api/v1/submissions', {
      method: 'POST',
      body: JSON.stringify({ assignmentId: 'a1', imageRefs: ['img.jpg'] }),
    });
    const res = await POST(req as any);
    expect(res.status).toBe(201);
  });
});
