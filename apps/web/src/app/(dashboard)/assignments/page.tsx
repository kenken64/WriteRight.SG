import Link from 'next/link';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export default async function AssignmentsPage() {
  const supabase = createServerSupabaseClient();
  const { data: assignments } = await supabase
    .from('assignments')
    .select('*, topic:topics(*)')
    .order('created_at', { ascending: false });

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold md:text-3xl">Assignments</h1>
        <Link
          href="/assignments/new"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 min-h-[44px] flex items-center justify-center"
        >
          New Assignment
        </Link>
      </div>

      <div className="mt-6 space-y-4">
        {assignments && assignments.length > 0 ? (
          assignments.map((a: any) => (
            <Link
              key={a.id}
              href={`/assignments/${a.id}`}
              className="block rounded-lg border bg-white p-4 transition-shadow hover:shadow-md"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="font-medium">{a.prompt.slice(0, 100)}...</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {a.essay_type} · {a.essay_sub_type ?? 'General'} · {a.word_count_min}-{a.word_count_max} words
                  </p>
                </div>
                <span className="rounded-full bg-muted px-2 py-1 text-xs capitalize">
                  {a.status}
                </span>
              </div>
            </Link>
          ))
        ) : (
          <div className="rounded-lg border bg-white p-12 text-center">
            <p className="text-muted-foreground">No assignments yet.</p>
            <Link href="/assignments/new" className="mt-2 inline-block text-sm text-primary hover:underline">
              Create your first assignment →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
