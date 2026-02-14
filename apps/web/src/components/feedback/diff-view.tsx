'use client';

interface DiffViewProps {
  original: string;
  rewritten: string;
  rationale?: Array<{ category: string; explanation: string }>;
}

export function DiffView({ original, rewritten, rationale }: DiffViewProps) {
  return (
    <div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border bg-white p-4">
          <h3 className="mb-3 text-sm font-medium text-muted-foreground">📝 Original</h3>
          <p className="whitespace-pre-wrap text-sm">{original}</p>
        </div>
        <div className="rounded-lg border border-green-200 bg-green-50/50 p-4">
          <h3 className="mb-3 text-sm font-medium text-green-700">✨ Rewrite (Reference Model Answer)</h3>
          <p className="whitespace-pre-wrap text-sm">{rewritten}</p>
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
