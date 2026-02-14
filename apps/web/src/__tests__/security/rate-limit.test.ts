import { describe, it, expect, beforeEach } from 'vitest';
import { rateLimit, _clearStore } from '@/lib/middleware/rate-limit';

beforeEach(() => {
  _clearStore();
});

describe('rateLimit', () => {
  it('allows requests within the limit', () => {
    const config = { windowMs: 60000, maxRequests: 3 };
    expect(rateLimit('test-key', config)).toBeNull();
    expect(rateLimit('test-key', config)).toBeNull();
    expect(rateLimit('test-key', config)).toBeNull();
  });

  it('blocks requests exceeding the limit', () => {
    const config = { windowMs: 60000, maxRequests: 2 };
    rateLimit('test-key', config);
    rateLimit('test-key', config);
    const result = rateLimit('test-key', config);
    expect(result).not.toBeNull();
    expect(result!.status).toBe(429);
  });

  it('returns Retry-After header on 429', async () => {
    const config = { windowMs: 60000, maxRequests: 1 };
    rateLimit('test-key', config);
    const result = rateLimit('test-key', config);
    expect(result!.headers.get('Retry-After')).toBeTruthy();
  });

  it('isolates different keys', () => {
    const config = { windowMs: 60000, maxRequests: 1 };
    expect(rateLimit('key-a', config)).toBeNull();
    expect(rateLimit('key-b', config)).toBeNull();
    expect(rateLimit('key-a', config)).not.toBeNull();
  });

  it('allows requests after window expires', () => {
    const config = { windowMs: 10, maxRequests: 1 };
    rateLimit('test-key', config);

    // Wait for window to expire
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        expect(rateLimit('test-key', config)).toBeNull();
        resolve();
      }, 20);
    });
  });
});
