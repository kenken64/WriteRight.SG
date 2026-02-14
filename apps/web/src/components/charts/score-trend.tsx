"use client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

interface ScoreTrendProps {
  data: { date: string; score: number; band: number }[];
}

export function ScoreTrend({ data }: ScoreTrendProps) {
  const formatted = data.map((d) => ({
    ...d,
    date: new Date(d.date).toLocaleDateString("en-SG", { day: "numeric", month: "short" }),
  }));

  return (
    <div className="w-full h-[300px]">
      <h3 className="text-sm font-medium text-gray-500 mb-2">Score Trend</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={formatted} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="date" fontSize={12} />
          <YAxis domain={[0, 30]} fontSize={12} />
          <Tooltip formatter={(value: number) => [`${value}/30`, "Score"]} />
          <ReferenceLine y={18} stroke="#94a3b8" strokeDasharray="5 5" label="Band 3" />
          <ReferenceLine y={24} stroke="#3b82f6" strokeDasharray="5 5" label="Band 4" />
          <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
