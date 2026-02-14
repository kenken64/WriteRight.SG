import { describe, it, expect, vi } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { isAuthError } from '@/lib/middleware/rbac';

// Mock Supabase
vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: vi.fn(),
}));

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { requireAuth, requireRole, requireParentOf, requireStudentOwner, requireParentOrStudent } from '@/lib/middleware/rbac';

function makeReq(path = '/api/v1/test') {
  return new NextRequest(`http://localhost:3000${path}`);
}

function mockSupabase(user: { id: string } | null, extras: Record<string, any> = {}) {
  const mock = {
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user } }) },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: extras.profile ?? null }),
          ...extras.selectEq,
        }),
        ...extras.select,
      }),
      ...extras.from,
    }),
  };
  (createServerSupabaseClient as any).mockReturnValue(mock);
  return mock;
}

describe('requireAuth', () => {
  it('returns 401 when no user', async () => {
    mockSupabase(null);
    const result = await requireAuth(makeReq());
    expect(isAuthError(result)).toBe(true);
    expect((result as NextResponse).status).toBe(401);
  });

  it('returns user when authenticated', async () => {
    mockSupabase({ id: 'user-1' });
    const result = await requireAuth(makeReq());
    expect(isAuthError(result)).toBe(false);
    if (!isAuthError(result)) {
      expect(result.user.id).toBe('user-1');
    }
  });
});

describe('requireRole', () => {
  it('returns 403 when role does not match', async () => {
    const mock = mockSupabase({ id: 'user-1' });
    mock.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: { role: 'student' } }),
        }),
      }),
    });
    const result = await requireRole(makeReq(), 'parent');
    expect(isAuthError(result)).toBe(true);
    expect((result as NextResponse).status).toBe(403);
  });

  it('allows matching role', async () => {
    const mock = mockSupabase({ id: 'user-1' });
    mock.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: { role: 'parent' } }),
        }),
      }),
    });
    const result = await requireRole(makeReq(), 'parent');
    expect(isAuthError(result)).toBe(false);
  });
});

describe('isAuthError', () => {
  it('detects NextResponse as error', () => {
    expect(isAuthError(NextResponse.json({}, { status: 401 }))).toBe(true);
  });

  it('detects AuthResult as success', () => {
    expect(isAuthError({ user: { id: '1' }, supabase: {} as any })).toBe(false);
  });
});
