'use client';

import { useState } from 'react';
import { RotateCcw, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { readCsrfToken } from '@/lib/hooks/use-csrf-token';

interface ReEvaluateButtonProps {
  submissionId: string;
  status: string;
}

export function ReEvaluateButton({ submissionId, status }: ReEvaluateButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Only show for stuck/failed statuses
  if (!['ocr_complete', 'evaluating', 'failed'].includes(status)) return null;

  const handleReEvaluate = async () => {
    setLoading(true);
    setError(null);

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      const csrfToken = readCsrfToken();
      if (csrfToken) headers['x-csrf-token'] = csrfToken;

      const res = await fetch(`/api/v1/submissions/${submissionId}/evaluate`, {
        method: 'POST',
        headers,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Re-evaluation failed');
      }

      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4">
      <button
        onClick={handleReEvaluate}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-md bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <RotateCcw className="h-4 w-4" />
        )}
        {loading ? 'Re-evaluating...' : 'Re-evaluate'}
      </button>
      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
    </div>
  );
}
