'use client';

import { useMemo } from 'react';

const CSRF_COOKIE = 'csrf-token';

function getCsrfToken(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${CSRF_COOKIE}=`));
  return match ? match.split('=')[1] ?? null : null;
}

/**
 * React hook that reads the CSRF cookie and returns the token.
 */
export function useCsrfToken(): string | null {
  return useMemo(() => getCsrfToken(), []);
}

/**
 * Non-hook version for use in API client.
 */
export function readCsrfToken(): string | null {
  return getCsrfToken();
}
