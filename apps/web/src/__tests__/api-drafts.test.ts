import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockSupabase, createMockChain } from './helpers/mock-supabase';

const mockSupabase = createMockSupabase();
vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: () => mockSupabase,
}));
vi.mock('next/headers', () => ({ cookies: () => ({ get: vi.fn(), set: vi.fn() }) }));

beforeEach(() => {
  mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
});

describe('POST /api/v1/drafts', () => {
  it('returns 401 if not authenticated', async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({ data: { user: null } });
    const { POST } = await import('@/app/api/v1/drafts/route');
    const req = new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({ assignment_id: '550e8400-e29b-41d4-a716-446655440000' }),
    });
    const res = await POST(req as any);
    expect(res.status).toBe(401);
  });

  it('returns 404 if student profile not found', async () => {
    const studentChain = createMockChain(null);
    mockSupabase.from.mockReturnValue(studentChain);

    const { POST } = await import('@/app/api/v1/drafts/route');
    const req = new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({ assignment_id: '550e8400-e29b-41d4-a716-446655440000' }),
    });
    const res = await POST(req as any);
    expect(res.status).toBe(404);
  });

  it('validates input schema', async () => {
    const studentChain = createMockChain({ id: 's1' });
    mockSupabase.from.mockReturnValue(studentChain);

    const { POST } = await import('@/app/api/v1/drafts/route');
    const req = new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({ assignment_id: 'not-a-uuid' }),
    });
    const res = await POST(req as any);
    expect(res.status).toBe(422);
  });
});

describe('GET /api/v1/drafts/[draftId]', () => {
  it('returns 401 if not authenticated', async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({ data: { user: null } });
    const { GET } = await import('@/app/api/v1/drafts/[draftId]/route');
    const res = await GET(new Request('http://localhost') as any, { params: { draftId: 'd1' } });
    expect(res.status).toBe(401);
  });

  it('returns 404 for missing draft', async () => {
    mockSupabase.from.mockReturnValue(createMockChain(null, { message: 'not found' }));
    const { GET } = await import('@/app/api/v1/drafts/[draftId]/route');
    const res = await GET(new Request('http://localhost') as any, { params: { draftId: 'd1' } });
    expect(res.status).toBe(404);
  });
});

describe('POST /api/v1/drafts/[draftId]/submit', () => {
  it('returns 404 for missing draft', async () => {
    mockSupabase.from.mockReturnValue(createMockChain(null, { message: 'not found' }));
    const { POST } = await import('@/app/api/v1/drafts/[draftId]/submit/route');
    const res = await POST(new Request('http://localhost', { method: 'POST' }) as any, { params: { draftId: 'd1' } });
    expect(res.status).toBe(404);
  });

  it('returns 400 if already submitted', async () => {
    mockSupabase.from.mockReturnValue(createMockChain({ id: 'd1', status: 'submitted' }));
    const { POST } = await import('@/app/api/v1/drafts/[draftId]/submit/route');
    const res = await POST(new Request('http://localhost', { method: 'POST' }) as any, { params: { draftId: 'd1' } });
    expect(res.status).toBe(400);
  });
});

describe('GET /api/v1/drafts/[draftId]/versions', () => {
  it('returns version history', async () => {
    const versions = [{ version_number: 2 }, { version_number: 1 }];
    const chain = createMockChain(versions);
    mockSupabase.from.mockReturnValue(chain);

    const { GET } = await import('@/app/api/v1/drafts/[draftId]/versions/route');
    const res = await GET(new Request('http://localhost') as any, { params: { draftId: 'd1' } });
    const json = await res.json();
    expect(json).toEqual(versions);
  });
});
