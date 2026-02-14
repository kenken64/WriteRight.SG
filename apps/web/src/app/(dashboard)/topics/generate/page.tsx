'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGenerateTopic } from '@/lib/api/client';

export default function GenerateTopicsPage() {
  const [source, setSource] = useState<'upload' | 'trending'>('trending');
  const [essayType, setEssayType] = useState<'situational' | 'continuous'>('situational');
  const [articleText, setArticleText] = useState('');
  const router = useRouter();
  const generateTopic = useGenerateTopic();

  const handleGenerate = async () => {
    await generateTopic.mutateAsync({
      source,
      essayType,
      articleText: source === 'upload' ? articleText : undefined,
    });
    router.push('/topics');
  };

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold">Generate Topics</h1>

      <div className="mt-6 space-y-6">
        <div>
          <label className="block text-sm font-medium">Source</label>
          <div className="mt-2 flex gap-3">
            <button
              onClick={() => setSource('trending')}
              className={`rounded-md border px-4 py-2 text-sm ${
                source === 'trending' ? 'border-primary bg-primary/10 text-primary' : ''
              }`}
            >
              🌐 From Trending News
            </button>
            <button
              onClick={() => setSource('upload')}
              className={`rounded-md border px-4 py-2 text-sm ${
                source === 'upload' ? 'border-primary bg-primary/10 text-primary' : ''
              }`}
            >
              📰 From Article
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium">Essay Type</label>
          <div className="mt-2 flex gap-3">
            {(['situational', 'continuous'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setEssayType(t)}
                className={`rounded-md border px-4 py-2 text-sm capitalize ${
                  essayType === t ? 'border-primary bg-primary/10 text-primary' : ''
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {source === 'upload' && (
          <div>
            <label className="block text-sm font-medium">Article Text</label>
            <textarea
              value={articleText}
              onChange={(e) => setArticleText(e.target.value)}
              rows={8}
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
              placeholder="Paste the article text here..."
            />
          </div>
        )}

        <button
          onClick={handleGenerate}
          disabled={generateTopic.isPending}
          className="w-full rounded-md bg-primary py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
        >
          {generateTopic.isPending ? 'Generating...' : 'Generate Topics'}
        </button>
      </div>
    </div>
  );
}
