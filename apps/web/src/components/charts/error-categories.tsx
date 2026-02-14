"use client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface ErrorCategoriesProps {
  data: { category: string; count: number }[];
}

export function ErrorCategories({ data }: ErrorCategoriesProps) {
  const sorted = [...data].sort((a, b) => b.count - a.count);

  return (
    <div className="w-full h-[300px]">
      <h3 className="text-sm font-medium text-gray-500 mb-2">Common Error Categories</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={sorted} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 80 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis type="number" fontSize={12} />
          <YAxis type="category" dataKey="category" fontSize={12} width={75} />
          <Tooltip />
          <Bar dataKey="count" fill="#f59e0b" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
