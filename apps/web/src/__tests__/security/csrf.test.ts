import { describe, it, expect } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { csrfProtection } from '@/lib/middleware/csrf';

function makeReq(method: string, path: string, cookies: Record<string, string> = {}, headers: Record<string, string> = {}) {
  const url = `http://localhost:3000${path}`;
  const req = new NextRequest(url, { method, headers });
  for (const [k, v] of Object.entries(cookies)) {
    req.cookies.set(k, v);
  }
  for (const [k, v] of Object.entries(headers)) {
    (req.headers as any).set(k, v);
  }
  return req;
}

describe('csrfProtection', () => {
  it('skips non-API routes', () => {
    const req = makeReq('POST', '/dashboard');
    const res = NextResponse.next();
    expect(csrfProtection(req, res)).toBeNull();
  });

  it('skips stripe webhook', () => {
    const req = makeReq('POST', '/api/v1/webhooks/stripe');
    const res = NextResponse.next();
    expect(csrfProtection(req, res)).toBeNull();
  });

  it('sets cookie on GET requests without existing token', () => {
    const req = makeReq('GET', '/api/v1/assignments');
    const res = NextResponse.next();
    csrfProtection(req, res);
    const cookie = res.cookies.get('csrf-token');
    expect(cookie?.value).toBeTruthy();
    expect(cookie!.value.length).toBe(64); // 32 bytes hex
  });

  it('rejects POST without CSRF token', () => {
    const req = makeReq('POST', '/api/v1/assignments');
    const res = NextResponse.next();
    const result = csrfProtection(req, res);
    expect(result).not.toBeNull();
    expect(result!.status).toBe(403);
  });

  it('rejects POST with mismatched tokens', () => {
    const req = makeReq('POST', '/api/v1/assignments', { 'csrf-token': 'abc' }, { 'x-csrf-token': 'xyz' });
    const res = NextResponse.next();
    const result = csrfProtection(req, res);
    expect(result).not.toBeNull();
    expect(result!.status).toBe(403);
  });

  it('allows POST with matching tokens', () => {
    const token = 'a'.repeat(64);
    const req = makeReq('POST', '/api/v1/assignments', { 'csrf-token': token }, { 'x-csrf-token': token });
    const res = NextResponse.next();
    const result = csrfProtection(req, res);
    expect(result).toBeNull();
  });
});
