'use client';

interface FeedbackItemProps {
  type: 'strength' | 'weakness';
  text: string;
  quote: string;
  suggestion?: string;
}

export function FeedbackItem({ type, text, quote, suggestion }: FeedbackItemProps) {
  const borderColor = type === 'strength' ? 'border-l-green-500' : 'border-l-orange-500';

  return (
    <div className={`rounded-lg border border-l-4 ${borderColor} bg-white p-4`}>
      <p className="text-sm font-medium">{text}</p>
      <blockquote className="mt-2 border-l-2 border-muted pl-3 text-sm italic text-muted-foreground">
        &ldquo;{quote}&rdquo;
      </blockquote>
      {suggestion && (
        <div className="mt-3 rounded-md bg-blue-50 p-3">
          <p className="text-xs font-medium text-blue-700">💡 Suggested improvement:</p>
          <p className="mt-1 text-sm text-blue-900">{suggestion}</p>
        </div>
      )}
    </div>
  );
}
