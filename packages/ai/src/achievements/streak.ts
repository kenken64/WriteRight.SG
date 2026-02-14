import type { StreakData } from "../shared/types";

export function calculateStreak(submissionDates: string[]): StreakData {
  if (!submissionDates.length) {
    return { currentStreak: 0, longestStreak: 0, lastSubmissionDate: null, streakActive: false };
  }

  // Sort dates descending and deduplicate by date
  const uniqueDays = [...new Set(
    submissionDates.map((d) => new Date(d).toISOString().split("T")[0])
  )].sort().reverse();

  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  // Current streak
  let currentStreak = 0;
  const isActiveToday = uniqueDays[0] === today || uniqueDays[0] === yesterday;

  if (isActiveToday) {
    let expectedDate = new Date(uniqueDays[0]);
    for (const day of uniqueDays) {
      const dayDate = new Date(day);
      const expected = expectedDate.toISOString().split("T")[0];
      if (day === expected) {
        currentStreak++;
        expectedDate = new Date(expectedDate.getTime() - 86400000);
      } else {
        break;
      }
    }
  }

  // Longest streak
  let longestStreak = 0;
  let tempStreak = 1;
  for (let i = 1; i < uniqueDays.length; i++) {
    const prev = new Date(uniqueDays[i - 1]).getTime();
    const curr = new Date(uniqueDays[i]).getTime();
    if (prev - curr === 86400000) {
      tempStreak++;
    } else {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak, currentStreak);

  return {
    currentStreak,
    longestStreak,
    lastSubmissionDate: uniqueDays[0],
    streakActive: isActiveToday,
  };
}
