'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useTopics } from '@/lib/api/client';
import { TopicCard } from '@/components/dashboard/topic-card';
import { createClient } from '@/lib/supabase/client';
import { Pagination } from '@/components/ui/pagination';
import { DEFAULT_PAGE_SIZE, computeTotalPages } from '@/lib/utils/pagination';
import { createBuildHref } from '@/lib/utils/build-pagination-href';

const categoryFilters = [
  { label: 'All', value: '' },
  { label: 'Environment', value: 'environment' },
  { label: 'Technology', value: 'technology' },
  { label: 'Social Issues', value: 'social_issues' },
  { label: 'Education', value: 'education' },
  { label: 'Health', value: 'health' },
  { label: 'Current Affairs', value: 'current_affairs' },
];

export default function TopicsPage() {
  const searchParams = useSearchParams();
  const category = searchParams.get('category') ?? '';
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10) || 1);

  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
    });
  }, []);

  const filters = category ? { category } : undefined;
  const { data, isLoading } = useTopics(filters, page, DEFAULT_PAGE_SIZE);
  const topics = data?.topics;
  const total = data?.total ?? 0;
  const totalPages = computeTotalPages(total, DEFAULT_PAGE_SIZE);

  const existingParams: Record<string, string> = {};
  if (category) existingParams.category = category;

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold md:text-3xl">Topic Bank</h1>
        <Link
          href="/topics/generate"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
        >
          Generate Topics
        </Link>
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-wrap gap-3">
        {categoryFilters.map((cat) => {
          const href = cat.value
            ? `/topics?category=${cat.value}`
            : '/topics';
          return (
            <Link
              key={cat.value}
              href={href}
              className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                category === cat.value
                  ? 'border-primary bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              {cat.label}
            </Link>
          );
        })}
      </div>

      {isLoading && (
        <div className="mt-8 text-center text-sm text-muted-foreground">Loading topics...</div>
      )}

      {!isLoading && (!topics || topics.length === 0) && (
        <div className="mt-8 text-center">
          <p className="text-muted-foreground">No topics found.</p>
          <Link
            href="/topics/generate"
            className="mt-2 inline-block text-sm text-primary hover:underline"
          >
            Generate your first topic
          </Link>
        </div>
      )}

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {topics?.map((topic) => (
          <TopicCard
            key={topic.id}
            topic={topic}
            isOwner={userId === topic.created_by}
          />
        ))}
      </div>

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        buildHref={createBuildHref('/topics', existingParams)}
      />
    </div>
  );
}
