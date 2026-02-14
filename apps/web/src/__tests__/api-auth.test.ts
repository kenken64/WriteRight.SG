import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockSupabase, createMockChain } from './helpers/mock-supabase';

const mockSupabase = createMockSupabase();
vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: () => mockSupabase,
}));

// Mock next/headers for cookies
vi.mock('next/headers', () => ({ cookies: () => ({ get: vi.fn(), set: vi.fn() }) }));

describe('POST /api/v1/auth/register', () => {
  beforeEach(() => {
    vi.resetModules();
    mockSupabase.auth.signUp.mockReset();
  });

  it('validates required fields', async () => {
    const { POST } = await import('@/app/api/v1/auth/register/route');
    const req = new Request('http://localhost/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email: 'bad' }),
    });
    const res = await POST(req as any);
    expect(res.status).toBe(422);
  });

  it('rejects invalid email format', async () => {
    const { POST } = await import('@/app/api/v1/auth/register/route');
    const req = new Request('http://localhost/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email: 'notanemail', password: '12345678', role: 'parent', displayName: 'Test' }),
    });
    const res = await POST(req as any);
    expect(res.status).toBe(422);
  });

  it('rejects password too short', async () => {
    const { POST } = await import('@/app/api/v1/auth/register/route');
    const req = new Request('http://localhost/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@test.com', password: '123', role: 'parent', displayName: 'Test' }),
    });
    const res = await POST(req as any);
    expect(res.status).toBe(422);
  });

  it('rejects invalid role', async () => {
    const { POST } = await import('@/app/api/v1/auth/register/route');
    const req = new Request('http://localhost/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@test.com', password: '12345678', role: 'admin', displayName: 'Test' }),
    });
    const res = await POST(req as any);
    expect(res.status).toBe(422);
  });

  it('returns 400 on Supabase auth error', async () => {
    mockSupabase.auth.signUp.mockResolvedValue({ data: { user: null }, error: { message: 'Email taken' } });
    const { POST } = await import('@/app/api/v1/auth/register/route');
    const req = new Request('http://localhost/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@test.com', password: '12345678', role: 'parent', displayName: 'Test' }),
    });
    const res = await POST(req as any);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Email taken');
  });

  it('returns 201 on success', async () => {
    mockSupabase.auth.signUp.mockResolvedValue({
      data: { user: { id: 'u1' }, session: { access_token: 'tok' } },
      error: null,
    });
    const usersChain = createMockChain();
    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'users') return usersChain;
      return createMockChain();
    });

    const { POST } = await import('@/app/api/v1/auth/register/route');
    const req = new Request('http://localhost/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@test.com', password: '12345678', role: 'parent', displayName: 'Test' }),
    });
    const res = await POST(req as any);
    expect(res.status).toBe(201);
  });
});

describe('POST /api/v1/auth/login', () => {
  beforeEach(() => {
    mockSupabase.auth.signInWithPassword.mockReset();
  });

  it('validates email format', async () => {
    const { POST } = await import('@/app/api/v1/auth/login/route');
    const req = new Request('http://localhost/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'bad', password: 'x' }),
    });
    const res = await POST(req as any);
    expect(res.status).toBe(422);
  });

  it('rejects empty password', async () => {
    const { POST } = await import('@/app/api/v1/auth/login/route');
    const req = new Request('http://localhost/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@test.com', password: '' }),
    });
    const res = await POST(req as any);
    expect(res.status).toBe(422);
  });

  it('returns 401 on wrong credentials', async () => {
    mockSupabase.auth.signInWithPassword.mockResolvedValue({ data: {}, error: { message: 'Invalid credentials' } });
    const { POST } = await import('@/app/api/v1/auth/login/route');
    const req = new Request('http://localhost/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@test.com', password: 'wrongpass' }),
    });
    const res = await POST(req as any);
    expect(res.status).toBe(401);
  });
});
