'use client';

import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';

interface OcrTextDisplayProps {
  text: string;
}

export function OcrTextDisplay({ text }: OcrTextDisplayProps) {
  return (
    <div className="mt-4 prose prose-sm max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        components={{
          pre: ({ children }) => (
            <pre className="bg-gray-50 text-gray-900 border border-gray-200 rounded-md p-4 overflow-x-auto whitespace-pre-wrap">
              {children}
            </pre>
          ),
          code: ({ children, className }) =>
            className ? (
              <code className="text-gray-900">{children}</code>
            ) : (
              <code className="bg-gray-100 text-gray-900 px-1 py-0.5 rounded text-sm">{children}</code>
            ),
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}
