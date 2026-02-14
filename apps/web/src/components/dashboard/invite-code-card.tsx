'use client';

import { useState } from 'react';
import { useInviteCode, useRegenerateInviteCode } from '@/lib/api/client';
import { Copy, Check, RefreshCw } from 'lucide-react';

export function InviteCodeCard() {
  const [copied, setCopied] = useState(false);
  const { data, isLoading, error } = useInviteCode();
  const regenerate = useRegenerateInviteCode();

  const code = data?.inviteCode?.code;

  const handleCopy = async () => {
    if (!code) return;
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerate = () => {
    regenerate.mutate();
  };

  if (isLoading) {
    return (
      <section className="rounded-lg border bg-white p-6">
        <h2 className="text-lg font-semibold">Invite Code</h2>
        <div className="mt-4 h-12 animate-pulse rounded bg-gray-100" />
      </section>
    );
  }

  if (error) {
    return (
      <section className="rounded-lg border bg-white p-6">
        <h2 className="text-lg font-semibold">Invite Code</h2>
        <p className="mt-2 text-sm text-muted-foreground">No invite code found.</p>
      </section>
    );
  }

  return (
    <section className="rounded-lg border bg-white p-6">
      <h2 className="text-lg font-semibold">Invite Code</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Share this code with your parent so they can link their account.
      </p>

      <div className="mt-4 flex items-center gap-3">
        <div className="flex-1 rounded-lg border bg-gray-50 px-4 py-3">
          <span className="font-mono text-xl font-bold tracking-[0.3em] text-primary">
            {regenerate.data?.inviteCode ?? code}
          </span>
        </div>

        <button
          onClick={handleCopy}
          className="rounded-md border p-2.5 text-muted-foreground hover:bg-gray-50 hover:text-foreground transition-colors"
          title="Copy code"
        >
          {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
        </button>

        <button
          onClick={handleRegenerate}
          disabled={regenerate.isPending}
          className="rounded-md border p-2.5 text-muted-foreground hover:bg-gray-50 hover:text-foreground disabled:opacity-50 transition-colors"
          title="Generate new code"
        >
          <RefreshCw className={`h-4 w-4 ${regenerate.isPending ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {copied && <p className="mt-2 text-xs text-green-600">Copied to clipboard!</p>}
      {regenerate.isSuccess && <p className="mt-2 text-xs text-green-600">New code generated!</p>}
      {regenerate.isError && <p className="mt-2 text-xs text-destructive">Failed to regenerate code</p>}
    </section>
  );
}
