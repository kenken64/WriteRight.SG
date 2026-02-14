"use client";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface BandProgressionProps {
  data: { date: string; band: number }[];
}

export function BandProgression({ data }: BandProgressionProps) {
  const formatted = data.map((d) => ({
    ...d,
    date: new Date(d.date).toLocaleDateString("en-SG", { day: "numeric", month: "short" }),
  }));

  return (
    <div className="w-full h-[300px]">
      <h3 className="text-sm font-medium text-gray-500 mb-2">Band Progression</h3>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={formatted} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="date" fontSize={12} />
          <YAxis domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} fontSize={12} />
          <Tooltip formatter={(value: number) => [`Band ${value}`, "Band"]} />
          <defs>
            <linearGradient id="bandGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="band" stroke="#6366f1" fill="url(#bandGradient)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
