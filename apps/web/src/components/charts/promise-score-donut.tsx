"use client";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface PromiseScoreDonutProps {
  fulfilled: number;
  pending: number;
  overdue: number;
}

const COLORS = ["#10b981", "#f59e0b", "#ef4444"];

export function PromiseScoreDonut({ fulfilled, pending, overdue }: PromiseScoreDonutProps) {
  const data = [
    { name: "Fulfilled", value: fulfilled },
    { name: "Pending", value: pending },
    { name: "Overdue", value: overdue },
  ].filter((d) => d.value > 0);

  const total = fulfilled + pending + overdue;
  const score = total > 0 ? Math.round((fulfilled / total) * 100) : 0;

  return (
    <div className="w-full h-[300px] relative">
      <h3 className="text-sm font-medium text-gray-500 mb-2">Promise Score</h3>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" paddingAngle={2}>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center">
          <div className="text-3xl font-bold text-gray-900">{score}%</div>
          <div className="text-xs text-gray-500">Promise Score</div>
        </div>
      </div>
    </div>
  );
}
