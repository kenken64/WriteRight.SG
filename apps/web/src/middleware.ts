import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { applySecurityHeaders } from '@/lib/middleware/security-headers';
import { applyRateLimit } from '@/lib/middleware/rate-limit';
import { csrfProtection } from '@/lib/middleware/csrf';

export async function middleware(request: NextRequest) {
  // 1. Auth session refresh + redirects (returns a response we'll augment)
  const response = await updateSession(request);

  // 2. Security headers (all requests)
  applySecurityHeaders(response);

  // 3. Rate limiting (API requests only)
  const rateLimitResponse = applyRateLimit(request);
  if (rateLimitResponse) {
    applySecurityHeaders(rateLimitResponse);
    return rateLimitResponse;
  }

  // 4. CSRF validation (mutating API requests)
  const csrfResponse = csrfProtection(request, response);
  if (csrfResponse) {
    applySecurityHeaders(csrfResponse);
    return csrfResponse;
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
