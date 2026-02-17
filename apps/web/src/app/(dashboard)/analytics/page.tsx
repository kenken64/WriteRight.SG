import { createServerSupabaseClient } from '@/lib/supabase/server';
import { ScoreTrend } from '@/components/charts/score-trend';
import { ErrorCategories } from '@/components/charts/error-categories';
import { BandProgression } from '@/components/charts/band-progression';
import { SubmissionFrequency } from '@/components/charts/submission-frequency';

export default async function AnalyticsPage() {
  const supabase = await createServerSupabaseClient();

  const [scoreTrendResult, evaluationsResult] = await Promise.all([
    supabase
      .from('student_score_trend')
      .select('*')
      .order('evaluated_at', { ascending: true }),
    supabase
      .from('evaluations')
      .select('weaknesses'),
  ]);

  const scoreTrendData = scoreTrendResult.data ?? [];
  const evaluations = evaluationsResult.data ?? [];

  // Transform score trend for ScoreTrend and BandProgression charts
  const scoreTrendChart = scoreTrendData.map((row) => ({
    date: row.evaluated_at,
    score: row.total_score,
    band: row.band,
  }));

  const bandProgressionChart = scoreTrendData.map((row) => ({
    date: row.evaluated_at,
    band: row.band,
  }));

  // Extract weakness text and count occurrences for error categories chart
  const weaknessMap: Record<string, number> = {};
  for (const row of evaluations) {
    const weaknesses = row.weaknesses as { text: string; quote: string; suggestion?: string }[];
    if (!Array.isArray(weaknesses)) continue;
    for (const w of weaknesses) {
      const category = w.text.length > 60 ? w.text.slice(0, 57) + '...' : w.text;
      weaknessMap[category] = (weaknessMap[category] ?? 0) + 1;
    }
  }
  const errorCategoriesChart = Object.entries(weaknessMap)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  // Group by ISO week for submission frequency chart
  const weekCounts: Record<string, number> = {};
  for (const row of scoreTrendData) {
    const d = new Date(row.evaluated_at);
    const startOfYear = new Date(d.getFullYear(), 0, 1);
    const weekNum = Math.ceil(
      ((d.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7,
    );
    const weekKey = `W${weekNum}`;
    weekCounts[weekKey] = (weekCounts[weekKey] ?? 0) + 1;
  }
  const submissionFrequencyChart = Object.entries(weekCounts).map(([week, count]) => ({
    week,
    count,
  }));

  return (
    <div>
      <h1 className="text-2xl font-bold md:text-3xl">📊 Analytics</h1>

      {scoreTrendData.length === 0 && (
        <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border bg-white py-20 px-6 text-center animate-fade-in">
          <span className="text-6xl">📊</span>
          <h3 className="mt-6 text-xl font-bold text-gray-900">Submit your first essay to see analytics</h3>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Your score trends, error patterns, and progress charts will appear here after your first submission.
          </p>
        </div>
      )}

      <div className={`mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2 ${scoreTrendData.length === 0 ? 'hidden' : ''}`}>
        <div className="rounded-lg border bg-white p-6">
          <h2 className="font-medium">Score Trend</h2>
          <div className="mt-4">
            <ScoreTrend data={scoreTrendChart} />
          </div>
        </div>

        <div className="rounded-lg border bg-white p-6">
          <h2 className="font-medium">Band Progression</h2>
          <div className="mt-4">
            <BandProgression data={bandProgressionChart} />
          </div>
        </div>

        <div className="rounded-lg border bg-white p-6">
          <h2 className="font-medium">Error Categories</h2>
          <div className="mt-4">
            <ErrorCategories data={errorCategoriesChart} />
          </div>
        </div>

        <div className="rounded-lg border bg-white p-6">
          <h2 className="font-medium">Submission Frequency</h2>
          <div className="mt-4">
            <SubmissionFrequency data={submissionFrequencyChart} />
          </div>
        </div>
      </div>
    </div>
  );
}
