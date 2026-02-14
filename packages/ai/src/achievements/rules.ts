export interface AchievementRule {
  code: string;
  name: string;
  description: string;
  category: "practice" | "improvement" | "mastery" | "streak" | "special";
  badgeEmoji: string;
  check: (ctx: AchievementContext) => boolean;
  sortOrder: number;
}

export interface AchievementContext {
  totalSubmissions: number;
  totalEvaluations: number;
  currentStreak: number;
  longestStreak: number;
  highestBand: number;
  averageBand: number;
  bandHistory: number[];
  improvementCount: number; // times score improved from previous
  perfectScores: number;
  essayTypesAttempted: Set<string>;
}

export const ACHIEVEMENT_RULES: AchievementRule[] = [
  // Practice
  { code: "FIRST_SUBMIT", name: "First Steps", description: "Submit your first essay", category: "practice", badgeEmoji: "✏️", sortOrder: 1,
    check: (ctx) => ctx.totalSubmissions >= 1 },
  { code: "FIVE_SUBMITS", name: "Getting Started", description: "Submit 5 essays", category: "practice", badgeEmoji: "📝", sortOrder: 2,
    check: (ctx) => ctx.totalSubmissions >= 5 },
  { code: "TEN_SUBMITS", name: "Dedicated Writer", description: "Submit 10 essays", category: "practice", badgeEmoji: "📚", sortOrder: 3,
    check: (ctx) => ctx.totalSubmissions >= 10 },
  { code: "TWENTY_FIVE_SUBMITS", name: "Essay Machine", description: "Submit 25 essays", category: "practice", badgeEmoji: "🏭", sortOrder: 4,
    check: (ctx) => ctx.totalSubmissions >= 25 },

  // Improvement
  { code: "FIRST_IMPROVE", name: "Levelling Up", description: "Improve your score from the previous essay", category: "improvement", badgeEmoji: "📈", sortOrder: 10,
    check: (ctx) => ctx.improvementCount >= 1 },
  { code: "THREE_IMPROVES", name: "On a Roll", description: "Improve 3 times in a row", category: "improvement", badgeEmoji: "🔥", sortOrder: 11,
    check: (ctx) => ctx.improvementCount >= 3 },

  // Mastery
  { code: "BAND_4", name: "Strong Writer", description: "Achieve Band 4 on any essay", category: "mastery", badgeEmoji: "⭐", sortOrder: 20,
    check: (ctx) => ctx.highestBand >= 4 },
  { code: "BAND_5", name: "Master Writer", description: "Achieve Band 5 on any essay", category: "mastery", badgeEmoji: "🏆", sortOrder: 21,
    check: (ctx) => ctx.highestBand >= 5 },
  { code: "BOTH_TYPES", name: "Versatile Writer", description: "Attempt both situational and continuous writing", category: "mastery", badgeEmoji: "🎭", sortOrder: 22,
    check: (ctx) => ctx.essayTypesAttempted.size >= 2 },

  // Streak
  { code: "STREAK_3", name: "Three-peat", description: "Maintain a 3-day streak", category: "streak", badgeEmoji: "3️⃣", sortOrder: 30,
    check: (ctx) => ctx.currentStreak >= 3 || ctx.longestStreak >= 3 },
  { code: "STREAK_7", name: "Week Warrior", description: "Maintain a 7-day streak", category: "streak", badgeEmoji: "7️⃣", sortOrder: 31,
    check: (ctx) => ctx.currentStreak >= 7 || ctx.longestStreak >= 7 },
  { code: "STREAK_30", name: "Monthly Master", description: "Maintain a 30-day streak", category: "streak", badgeEmoji: "📅", sortOrder: 32,
    check: (ctx) => ctx.currentStreak >= 30 || ctx.longestStreak >= 30 },

  // Special
  { code: "NIGHT_OWL", name: "Night Owl", description: "Submit an essay after 10pm", category: "special", badgeEmoji: "🦉", sortOrder: 40,
    check: () => false }, // checked separately with timestamp
];
