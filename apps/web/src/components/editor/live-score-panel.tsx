"use client";

import React from "react";
import { TrendingUp, ChevronDown, ChevronUp, Minimize2 } from "lucide-react";

interface DimensionScore {
  name: string;
  score: number;
  maxScore: number;
  status: string;
  details: string[];
}

interface NextBandTip {
  dimension: string;
  tip: string;
  potentialGain: number;
}

interface ScoreHistoryPoint {
  paragraphCount: number;
  score: number;
  band: number;
  timestamp: number;
}

interface LiveScorePanelProps {
  totalScore: number;
  maxScore: number;
  band: number;
  dimensions: DimensionScore[];
  nextBandTips: NextBandTip[];
  scoreHistory: ScoreHistoryPoint[];
  loading?: boolean;
  onMinimize?: () => void;
}

function ScoreSparkline({ history }: { history: ScoreHistoryPoint[] }) {
  if (history.length < 2) return null;

  const maxS = Math.max(...history.map((h) => h.score), 1);
  const w = 160;
  const h = 40;
  const points = history.map((p, i) => {
    const x = (i / (history.length - 1)) * w;
    const y = h - (p.score / maxS) * (h - 4);
    return `${x},${y}`;
  });

  const trending = history.length >= 2 && history[history.length - 1].score > history[history.length - 2].score;

  return (
    <div className="flex items-center gap-2">
      <svg width={w} height={h} className="overflow-visible">
        <polyline fill="none" stroke="#3b82f6" strokeWidth="2" points={points.join(" ")} />
        {history.map((p, i) => {
          const x = (i / (history.length - 1)) * w;
          const y = h - (p.score / maxS) * (h - 4);
          return <circle key={i} cx={x} cy={y} r="2.5" fill="#3b82f6" />;
        })}
      </svg>
      {trending && (
        <span className="text-xs text-green-600 flex items-center gap-0.5">
          <TrendingUp className="h-3 w-3" /> Up!
        </span>
      )}
    </div>
  );
}

function DimensionBar({ dim }: { dim: DimensionScore }) {
  const pct = (dim.score / dim.maxScore) * 100;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-gray-700">{dim.name}</span>
        <span className="text-gray-500 tabular-nums">{dim.score}/{dim.maxScore}</span>
      </div>
      <div className="h-1.5 rounded-full bg-gray-200 overflow-hidden">
        <div
          className="h-full rounded-full bg-blue-500 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      {dim.details.length > 0 && (
        <ul className="text-xs text-gray-500 pl-2 space-y-0.5">
          {dim.details.map((d, i) => (
            <li key={i}>├ {d}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function LiveScorePanel({
  totalScore,
  maxScore,
  band,
  dimensions,
  nextBandTips,
  scoreHistory,
  loading,
  onMinimize,
}: LiveScorePanelProps) {
  const [expanded, setExpanded] = React.useState(true);
  const bandPct = (totalScore / maxScore) * 100;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 space-y-3 text-sm">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-gray-700 flex items-center gap-1.5">
          📊 Live Score <span className="text-xs text-gray-400 font-normal">Estimate</span>
        </h3>
        <div className="flex items-center gap-1">
          <button onClick={() => setExpanded(!expanded)} className="p-0.5 rounded hover:bg-gray-100">
            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
          {onMinimize && (
            <button onClick={onMinimize} className="p-0.5 rounded hover:bg-gray-100">
              <Minimize2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600 tabular-nums">
            {loading ? "..." : totalScore}
            <span className="text-sm text-gray-400 font-normal">/{maxScore}</span>
          </div>
          <div className="text-xs text-gray-500">Band {band}</div>
        </div>
        <div className="flex-1">
          <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
            <div
              className="h-full rounded-full bg-blue-500 transition-all duration-700"
              style={{ width: `${bandPct}%` }}
            />
          </div>
        </div>
      </div>

      {expanded && (
        <>
          {dimensions.length > 0 && (
            <div className="space-y-2.5">
              {dimensions.map((dim) => (
                <DimensionBar key={dim.name} dim={dim} />
              ))}
            </div>
          )}

          {nextBandTips.length > 0 && (
            <div className="bg-amber-50 rounded-md p-2 space-y-1">
              <p className="text-xs font-medium text-amber-700">
                💡 To reach Band {band + 1}:
              </p>
              <ul className="text-xs text-amber-600 space-y-0.5 pl-1">
                {nextBandTips.map((tip, i) => (
                  <li key={i}>• {tip.tip} {tip.potentialGain > 0 && `(+${tip.potentialGain})`}</li>
                ))}
              </ul>
            </div>
          )}

          {scoreHistory.length >= 2 && (
            <div>
              <p className="text-xs text-gray-400 mb-1">Score progression</p>
              <ScoreSparkline history={scoreHistory} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
