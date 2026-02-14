import Link from 'next/link';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { formatStatus, formatRelativeDate } from '@/lib/utils/format';

export default async function SubmissionsPage() {
  const supabase = createServerSupabaseClient();
  const { data: submissions } = await supabase
    .from('submissions')
    .select('*, assignment:assignments(prompt, essay_type)')
    .order('created_at', { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-bold md:text-3xl">Submissions</h1>
      <div className="mt-6 space-y-4">
        {submissions && submissions.length > 0 ? (
          submissions.map((sub: any) => {
            const status = formatStatus(sub.status);
            return (
              <Link
                key={sub.id}
                href={`/submissions/${sub.id}`}
                className="block rounded-lg border bg-white p-4 transition-shadow hover:shadow-md"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="font-medium">
                      {sub.assignment?.prompt?.slice(0, 80)}...
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {sub.assignment?.essay_type} · {formatRelativeDate(sub.created_at)}
                    </p>
                  </div>
                  <span className={`rounded-full px-2 py-1 text-xs ${status.color}`}>
                    {status.label}
                  </span>
                </div>
              </Link>
            );
          })
        ) : (
          <div className="rounded-lg border bg-white p-12 text-center">
            <p className="text-muted-foreground">No submissions yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
