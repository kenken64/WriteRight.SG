"use client";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from "recharts";

interface DimensionRadarProps {
  data: { dimension: string; score: number; maxScore: number }[];
}

export function DimensionRadar({ data }: DimensionRadarProps) {
  const normalized = data.map((d) => ({
    dimension: d.dimension,
    score: d.score,
    fullMark: d.maxScore,
  }));

  return (
    <div className="w-full h-[250px] sm:h-[300px]">
      <h3 className="text-sm font-medium text-gray-500 mb-2">Dimension Breakdown</h3>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={normalized}>
          <PolarGrid stroke="#e5e7eb" />
          <PolarAngleAxis dataKey="dimension" fontSize={11} />
          <PolarRadiusAxis domain={[0, 10]} tick={false} />
          <Tooltip />
          <Radar name="Score" dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} strokeWidth={2} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
