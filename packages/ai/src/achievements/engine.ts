import { ACHIEVEMENT_RULES, type AchievementContext, type AchievementRule } from "./rules";
import type { AchievementCheck } from "../shared/types";

export function checkAchievements(
  context: AchievementContext,
  alreadyUnlocked: Set<string>
): AchievementCheck[] {
  const results: AchievementCheck[] = [];

  for (const rule of ACHIEVEMENT_RULES) {
    if (alreadyUnlocked.has(rule.code)) continue;

    const unlocked = rule.check(context);
    const progress = getProgress(rule, context);

    results.push({
      achievementCode: rule.code,
      unlocked,
      progress: progress.current,
      target: progress.target,
    });
  }

  return results;
}

export function getNewlyUnlocked(
  context: AchievementContext,
  alreadyUnlocked: Set<string>
): AchievementRule[] {
  return ACHIEVEMENT_RULES.filter(
    (rule) => !alreadyUnlocked.has(rule.code) && rule.check(context)
  );
}

function getProgress(rule: AchievementRule, ctx: AchievementContext): { current: number; target: number } {
  switch (rule.code) {
    case "FIRST_SUBMIT": return { current: Math.min(ctx.totalSubmissions, 1), target: 1 };
    case "FIVE_SUBMITS": return { current: Math.min(ctx.totalSubmissions, 5), target: 5 };
    case "TEN_SUBMITS": return { current: Math.min(ctx.totalSubmissions, 10), target: 10 };
    case "TWENTY_FIVE_SUBMITS": return { current: Math.min(ctx.totalSubmissions, 25), target: 25 };
    case "FIRST_IMPROVE": return { current: Math.min(ctx.improvementCount, 1), target: 1 };
    case "THREE_IMPROVES": return { current: Math.min(ctx.improvementCount, 3), target: 3 };
    case "BAND_4": return { current: Math.min(ctx.highestBand, 4), target: 4 };
    case "BAND_5": return { current: Math.min(ctx.highestBand, 5), target: 5 };
    case "STREAK_3": return { current: Math.min(ctx.longestStreak, 3), target: 3 };
    case "STREAK_7": return { current: Math.min(ctx.longestStreak, 7), target: 7 };
    case "STREAK_30": return { current: Math.min(ctx.longestStreak, 30), target: 30 };
    default: return { current: 0, target: 1 };
  }
}
