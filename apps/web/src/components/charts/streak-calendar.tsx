"use client";
import { useMemo } from "react";

interface StreakCalendarProps {
  submissionDates: string[];
  weeks?: number;
}

export function StreakCalendar({ submissionDates, weeks = 12 }: StreakCalendarProps) {
  const calendarData = useMemo(() => {
    const dateSet = new Set(submissionDates.map((d) => new Date(d).toISOString().split("T")[0]));
    const today = new Date();
    const days: { date: string; active: boolean; dayOfWeek: number }[] = [];

    for (let i = weeks * 7 - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      days.push({ date: dateStr, active: dateSet.has(dateStr), dayOfWeek: d.getDay() });
    }

    return days;
  }, [submissionDates, weeks]);

  const weekColumns: typeof calendarData[] = [];
  for (let i = 0; i < calendarData.length; i += 7) {
    weekColumns.push(calendarData.slice(i, i + 7));
  }

  return (
    <div className="w-full">
      <h3 className="text-sm font-medium text-gray-500 mb-2">Activity</h3>
      <div className="flex gap-1">
        {weekColumns.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map((day) => (
              <div
                key={day.date}
                className={`w-3 h-3 rounded-sm ${
                  day.active ? "bg-green-500" : "bg-gray-100"
                }`}
                title={`${day.date}${day.active ? " ✓" : ""}`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
