import { describe, it, expect } from 'vitest';
import { NextResponse } from 'next/server';
import { applySecurityHeaders } from '@/lib/middleware/security-headers';

describe('applySecurityHeaders', () => {
  it('sets X-Content-Type-Options', () => {
    const res = NextResponse.next();
    applySecurityHeaders(res);
    expect(res.headers.get('X-Content-Type-Options')).toBe('nosniff');
  });

  it('sets X-Frame-Options', () => {
    const res = NextResponse.next();
    applySecurityHeaders(res);
    expect(res.headers.get('X-Frame-Options')).toBe('DENY');
  });

  it('sets X-XSS-Protection', () => {
    const res = NextResponse.next();
    applySecurityHeaders(res);
    expect(res.headers.get('X-XSS-Protection')).toBe('1; mode=block');
  });

  it('sets Referrer-Policy', () => {
    const res = NextResponse.next();
    applySecurityHeaders(res);
    expect(res.headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
  });

  it('sets Permissions-Policy', () => {
    const res = NextResponse.next();
    applySecurityHeaders(res);
    expect(res.headers.get('Permissions-Policy')).toBe('camera=(), microphone=(), geolocation=()');
  });

  it('sets Content-Security-Policy', () => {
    const res = NextResponse.next();
    applySecurityHeaders(res);
    const csp = res.headers.get('Content-Security-Policy');
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain('supabase.co');
  });
});
