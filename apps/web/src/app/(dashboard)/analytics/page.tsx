import { createServerSupabaseClient } from '@/lib/supabase/server';
import { ScoreTrend } from '@/components/charts/score-trend';
import { ErrorCategories } from '@/components/charts/error-categories';
import { BandProgression } from '@/components/charts/band-progression';
import { SubmissionFrequency } from '@/components/charts/submission-frequency';

export default async function AnalyticsPage() {
  const supabase = createServerSupabaseClient();

  const { data: scoreTrend } = await supabase
    .from('student_score_trend')
    .select('*')
    .order('evaluated_at', { ascending: true });

  const { data: errorCategories } = await supabase
    .from('student_error_categories')
    .select('*');

  return (
    <div>
      <h1 className="text-2xl font-bold">📊 Analytics</h1>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border bg-white p-6">
          <h2 className="font-medium">Score Trend</h2>
          <div className="mt-4">
            <ScoreTrend data={scoreTrend ?? []} />
          </div>
        </div>

        <div className="rounded-lg border bg-white p-6">
          <h2 className="font-medium">Band Progression</h2>
          <div className="mt-4">
            <BandProgression data={scoreTrend ?? []} />
          </div>
        </div>

        <div className="rounded-lg border bg-white p-6">
          <h2 className="font-medium">Error Categories</h2>
          <div className="mt-4">
            <ErrorCategories data={errorCategories ?? []} />
          </div>
        </div>

        <div className="rounded-lg border bg-white p-6">
          <h2 className="font-medium">Submission Frequency</h2>
          <div className="mt-4">
            <SubmissionFrequency data={scoreTrend ?? []} />
          </div>
        </div>
      </div>
    </div>
  );
}
