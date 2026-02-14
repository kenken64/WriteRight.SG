'use client';

import { formatScore, formatBand, getBandColor, formatConfidence } from '@/lib/utils/format';

interface DimensionScore {
  name: string;
  score: number;
  maxScore: number;
  band: number;
  justification: string;
}

interface ScoreCardProps {
  totalScore: number;
  band: number;
  dimensions: DimensionScore[];
  confidence: number;
  reviewRecommended: boolean;
}

export function ScoreCard({ totalScore, band, dimensions, confidence, reviewRecommended }: ScoreCardProps) {
  return (
    <div className="mt-6 rounded-lg border bg-white p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Total Score</p>
          <p className="text-4xl font-bold">{formatScore(totalScore, 30)}</p>
          <p className={`mt-1 text-lg font-medium ${getBandColor(band)}`}>{formatBand(band)}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">
            AI Confidence: {formatConfidence(confidence)}
          </p>
          {reviewRecommended && (
            <p className="mt-1 rounded bg-orange-100 px-2 py-1 text-xs text-orange-700">
              ⚠️ Review recommended
            </p>
          )}
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {dimensions.map((dim) => (
          <div key={dim.name} className="rounded-md border p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">{dim.name}</h3>
              <div className="text-right">
                <span className="text-lg font-bold">{formatScore(dim.score, dim.maxScore)}</span>
                <span className={`ml-2 text-sm ${getBandColor(dim.band)}`}>
                  Band {dim.band}
                </span>
              </div>
            </div>
            <div className="mt-2 h-2 rounded-full bg-muted">
              <div
                className="h-2 rounded-full bg-primary"
                style={{ width: `${(dim.score / dim.maxScore) * 100}%` }}
              />
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{dim.justification}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
