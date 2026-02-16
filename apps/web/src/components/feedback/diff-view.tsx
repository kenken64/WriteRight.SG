'use client';

import { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';

interface DiffChange {
  type: 'add' | 'remove' | 'unchanged';
  value: string;
}

interface DiffViewProps {
  original: string;
  rewritten: string;
  diffPayload?: DiffChange[];
  rationale?: Array<{ category: string; explanation: string }>;
}

/**
 * Simple word-level diff when no pre-computed diff_payload is provided.
 * Uses a basic LCS approach on word tokens.
 */
function computeWordDiff(original: string, rewritten: string): DiffChange[] {
  const oldWords = original.split(/(\s+)/);
  const newWords = rewritten.split(/(\s+)/);

  // Simple diff using two-pointer with LCS
  const m = oldWords.length;
  const n = newWords.length;

  // For performance, use a simple O(mn) DP
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (oldWords[i - 1] === newWords[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Backtrack
  const changes: DiffChange[] = [];
  let i = m, j = n;
  const stack: DiffChange[] = [];
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldWords[i - 1] === newWords[j - 1]) {
      stack.push({ type: 'unchanged', value: oldWords[i - 1] });
      i--; j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      stack.push({ type: 'add', value: newWords[j - 1] });
      j--;
    } else {
      stack.push({ type: 'remove', value: oldWords[i - 1] });
      i--;
    }
  }
  stack.reverse();

  // Merge consecutive same-type changes
  for (const change of stack) {
    const last = changes[changes.length - 1];
    if (last && last.type === change.type) {
      last.value += change.value;
    } else {
      changes.push({ ...change });
    }
  }

  return changes;
}

function DiffHighlightedText({ diff, side }: { diff: DiffChange[]; side: 'original' | 'rewritten' }) {
  return (
    <span className="whitespace-pre-wrap text-sm leading-relaxed">
      {diff.map((change, i) => {
        if (change.type === 'unchanged') {
          return <span key={i}>{change.value}</span>;
        }
        if (side === 'original' && change.type === 'remove') {
          return (
            <span key={i} className="bg-red-100 text-red-800 line-through decoration-red-400">
              {change.value}
            </span>
          );
        }
        if (side === 'rewritten' && change.type === 'add') {
          return (
            <span key={i} className="bg-green-100 text-green-800">
              {change.value}
            </span>
          );
        }
        // Skip: removals on rewritten side, additions on original side
        return null;
      })}
    </span>
  );
}

export function DiffView({ original, rewritten, diffPayload, rationale }: DiffViewProps) {
  const diff = useMemo(() => {
    if (diffPayload && diffPayload.length > 0) return diffPayload;
    if (!original || !rewritten) return [];
    return computeWordDiff(original, rewritten);
  }, [original, rewritten, diffPayload]);

  const hasDiff = diff.length > 0;

  return (
    <div>
      {/* Side-by-side on desktop, stacked on mobile */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <div className="rounded-lg border bg-white p-4">
          <h3 className="mb-3 text-sm font-medium text-muted-foreground">📝 Original</h3>
          {hasDiff ? (
            <DiffHighlightedText diff={diff} side="original" />
          ) : (
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>{original}</ReactMarkdown>
            </div>
          )}
        </div>
        <div className="rounded-lg border border-green-200 bg-green-50/50 p-4">
          <h3 className="mb-3 text-sm font-medium text-green-700">✨ Rewrite (Reference Model Answer)</h3>
          {hasDiff ? (
            <DiffHighlightedText diff={diff} side="rewritten" />
          ) : (
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>{rewritten}</ReactMarkdown>
            </div>
          )}
        </div>
      </div>

      {rationale && rationale.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-medium">Why these changes?</h3>
          <div className="mt-3 space-y-2">
            {rationale.map((r, i) => (
              <div key={i} className="rounded-md border bg-white p-3">
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
                  {r.category}
                </span>
                <p className="mt-1 text-sm text-muted-foreground">{r.explanation}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
