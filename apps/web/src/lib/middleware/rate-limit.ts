import { NextRequest, NextResponse } from 'next/server';

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

interface RateLimitEntry {
  timestamps: number[];
}

// In-memory store — resets on server restart (fine for Edge/serverless per-instance limiting)
const store = new Map<string, RateLimitEntry>();

// Periodic cleanup to prevent memory leak
const CLEANUP_INTERVAL = 60_000;
let lastCleanup = Date.now();

function cleanup(windowMs: number) {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  for (const [key, entry] of store) {
    entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);
    if (entry.timestamps.length === 0) store.delete(key);
  }
}

/**
 * Sliding-window rate limiter.
 * Returns null if allowed, or a 429 NextResponse if rate limited.
 */
export function rateLimit(
  key: string,
  config: RateLimitConfig,
): NextResponse | null {
  const now = Date.now();
  cleanup(config.windowMs);

  const entry = store.get(key) ?? { timestamps: [] };
  // Remove timestamps outside the window
  entry.timestamps = entry.timestamps.filter((t) => now - t < config.windowMs);

  if (entry.timestamps.length >= config.maxRequests) {
    const oldest = entry.timestamps[0]!;
    const retryAfterSec = Math.ceil((oldest + config.windowMs - now) / 1000);
    return NextResponse.json(
      { error: 'Too Many Requests' },
      {
        status: 429,
        headers: { 'Retry-After': String(retryAfterSec) },
      },
    );
  }

  entry.timestamps.push(now);
  store.set(key, entry);
  return null;
}

/**
 * Extract rate-limit key from request.
 * Uses user ID if authenticated (from Supabase cookie), otherwise IP.
 */
export function getRateLimitKey(req: NextRequest, prefix: string): string {
  // Try to extract user id from supabase auth cookie (sb-*-auth-token)
  const authCookie = Array.from(req.cookies.getAll()).find((c) =>
    c.name.includes('-auth-token'),
  );
  if (authCookie?.value) {
    try {
      // The cookie value is base64 JSON with access_token containing a JWT
      const parsed = JSON.parse(authCookie.value);
      const sub = parsed?.user?.id;
      if (sub) return `${prefix}:user:${sub}`;
    } catch {
      // Fall through to IP
    }
  }

  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown';
  return `${prefix}:ip:${ip}`;
}

export function isAuthenticated(req: NextRequest): boolean {
  const authCookie = Array.from(req.cookies.getAll()).find((c) =>
    c.name.includes('-auth-token'),
  );
  return !!authCookie?.value;
}

// ─── Presets ───

const ONE_MINUTE = 60_000;

export const RATE_LIMIT_DEFAULT_AUTH: RateLimitConfig = { windowMs: ONE_MINUTE, maxRequests: 60 };
export const RATE_LIMIT_DEFAULT_UNAUTH: RateLimitConfig = { windowMs: ONE_MINUTE, maxRequests: 20 };
export const RATE_LIMIT_STRICT: RateLimitConfig = { windowMs: ONE_MINUTE, maxRequests: 5 };
export const RATE_LIMIT_UPLOAD: RateLimitConfig = { windowMs: ONE_MINUTE, maxRequests: 10 };
export const RATE_LIMIT_AUTH_ENDPOINT: RateLimitConfig = { windowMs: ONE_MINUTE, maxRequests: 5 };

/**
 * Apply rate limiting based on URL pattern.
 * Returns null if allowed, or a 429 response.
 */
export function applyRateLimit(req: NextRequest): NextResponse | null {
  const path = req.nextUrl.pathname;

  // Only rate-limit API routes
  if (!path.startsWith('/api/')) return null;

  let config: RateLimitConfig;
  let prefix: string;

  // AI endpoints — strict
  if (
    path.match(/\/api\/v1\/drafts\/[^/]+\/ai\//) ||
    path.match(/\/api\/v1\/submissions\/[^/]+\/evaluate/) ||
    path.match(/\/api\/v1\/submissions\/[^/]+\/rewrite/) ||
    path.startsWith('/api/v1/tts')
  ) {
    config = RATE_LIMIT_STRICT;
    prefix = 'ai';
  }
  // Auth endpoints — brute force protection
  else if (path.startsWith('/api/v1/auth/')) {
    config = RATE_LIMIT_AUTH_ENDPOINT;
    prefix = 'auth';
  }
  // Upload endpoints
  else if (path.match(/\/api\/v1\/submissions\/[^/]+\/finalize/)) {
    config = RATE_LIMIT_UPLOAD;
    prefix = 'upload';
  }
  // Default
  else {
    config = isAuthenticated(req) ? RATE_LIMIT_DEFAULT_AUTH : RATE_LIMIT_DEFAULT_UNAUTH;
    prefix = 'default';
  }

  const key = getRateLimitKey(req, prefix);
  return rateLimit(key, config);
}

// Export for testing
export function _clearStore() {
  store.clear();
}
