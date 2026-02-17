/**
 * Achievement rules integration test.
 *
 * Part 1: In-memory — verifies every rule triggers correctly with mock context
 * Part 2: Live DB — verifies real student's backfilled achievements are intact
 *                    and that DB queries return the expected shape
 *
 * Usage:  node scripts/test-achievements.mjs
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envText = readFileSync(resolve(__dirname, '..', 'apps', 'web', '.env.local'), 'utf-8');
const env = (k) => { const m = envText.match(new RegExp(`^${k}="?([^"\\n]+)"?`, 'm')); return m?.[1]; };

const SUPABASE_URL = env('NEXT_PUBLIC_SUPABASE_URL');
const KEY = env('SUPABASE_SERVICE_ROLE_KEY');
const REST = `${SUPABASE_URL}/rest/v1`;
const HEADERS = { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' };

async function get(path) {
  const res = await fetch(`${REST}/${path}`, { headers: HEADERS });
  if (!res.ok) throw new Error(`GET ${path}: ${res.status}`);
  return res.json();
}

// ── Achievement rules (identical to edge function + backfill) ───────
const RULES = [
  { code: 'first_steps', check: (c) => c.totalSubmissions >= 1, progress: (c) => ({ current: Math.min(c.totalSubmissions, 1), target: 1 }) },
  { code: 'getting_started', check: (c) => c.totalSubmissions >= 5, progress: (c) => ({ current: Math.min(c.totalSubmissions, 5), target: 5 }) },
  { code: 'dedicated_writer', check: (c) => c.totalSubmissions >= 20, progress: (c) => ({ current: Math.min(c.totalSubmissions, 20), target: 20 }) },
  { code: 'writing_machine', check: (c) => c.totalSubmissions >= 50, progress: (c) => ({ current: Math.min(c.totalSubmissions, 50), target: 50 }) },
  { code: 'century_club', check: (c) => c.totalSubmissions >= 100, progress: (c) => ({ current: Math.min(c.totalSubmissions, 100), target: 100 }) },
  { code: 'levelling_up', check: (c) => c.improvementCount >= 1, progress: (c) => ({ current: Math.min(c.improvementCount, 1), target: 1 }) },
  { code: 'band_breaker', check: (c) => c.improvementCount >= 1, progress: (c) => ({ current: Math.min(c.improvementCount, 1), target: 1 }) },
  { code: 'band_3_unlocked', check: (c) => c.highestBand >= 3, progress: (c) => ({ current: Math.min(c.highestBand, 3), target: 3 }) },
  { code: 'band_4_unlocked', check: (c) => c.highestBand >= 4, progress: (c) => ({ current: Math.min(c.highestBand, 4), target: 4 }) },
  { code: 'band_5_unlocked', check: (c) => c.highestBand >= 5, progress: (c) => ({ current: Math.min(c.highestBand, 5), target: 5 }) },
  { code: 'streak_3', check: (c) => c.longestStreak >= 3, progress: (c) => ({ current: Math.min(c.currentStreak, 3), target: 3 }) },
  { code: 'streak_7', check: (c) => c.longestStreak >= 7, progress: (c) => ({ current: Math.min(c.currentStreak, 7), target: 7 }) },
  { code: 'streak_30', check: (c) => c.longestStreak >= 30, progress: (c) => ({ current: Math.min(c.currentStreak, 30), target: 30 }) },
  { code: 'comeback_kid', check: (c) => (c.daysSinceLastSubmission ?? 0) >= 14, progress: () => ({ current: 0, target: 1 }) },
  { code: 'topic_explorer', check: (c) => c.categoriesAttempted.size >= 5, progress: (c) => ({ current: Math.min(c.categoriesAttempted.size, 5), target: 5 }) },
  { code: 'all_rounder', check: (c) => c.essayTypesAttempted.size >= 2, progress: (c) => ({ current: Math.min(c.essayTypesAttempted.size, 2), target: 2 }) },
];

// ════════════════════════════════════════════════════════════════════
// PART 1: In-memory rule testing
// ════════════════════════════════════════════════════════════════════
function testRulesInMemory() {
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║  PART 1: In-Memory Achievement Rules Test       ║');
  console.log('╚══════════════════════════════════════════════════╝\n');

  // Context designed to trigger EVERY rule
  const fullCtx = {
    totalSubmissions: 120,
    totalEvaluations: 120,
    currentStreak: 35,
    longestStreak: 35,
    highestBand: 5,
    improvementCount: 8,
    essayTypesAttempted: new Set(['situational', 'continuous']),
    categoriesAttempted: new Set(['environment', 'technology', 'social_issues', 'education', 'health']),
    daysSinceLastSubmission: 20,
  };

  console.log('  Mock context:');
  console.log(`    Submissions:  ${fullCtx.totalSubmissions}`);
  console.log(`    Highest band: ${fullCtx.highestBand}`);
  console.log(`    Improvements: ${fullCtx.improvementCount}`);
  console.log(`    Streak:       ${fullCtx.currentStreak} / ${fullCtx.longestStreak}`);
  console.log(`    Essay types:  [${[...fullCtx.essayTypesAttempted].join(', ')}]`);
  console.log(`    Categories:   [${[...fullCtx.categoriesAttempted].join(', ')}]`);
  console.log(`    Gap (days):   ${fullCtx.daysSinceLastSubmission}\n`);

  let passed = 0;
  let failed = 0;

  for (const rule of RULES) {
    const ok = rule.check(fullCtx);
    const prog = rule.progress(fullCtx);
    if (ok) {
      console.log(`  ✅ ${rule.code.padEnd(20)} PASS   (${prog.current}/${prog.target})`);
      passed++;
    } else {
      console.log(`  ❌ ${rule.code.padEnd(20)} FAIL   (${prog.current}/${prog.target})`);
      failed++;
    }
  }

  console.log(`\n  Result: ${passed}/${RULES.length} passed\n`);

  // ── Edge case tests ───────────────────────────────────────────
  console.log('  ── Edge case tests ──\n');
  let edgePassed = 0;
  let edgeTotal = 0;

  function assert(label, actual, expected) {
    edgeTotal++;
    if (actual === expected) {
      console.log(`  ✅ ${label}`);
      edgePassed++;
    } else {
      console.log(`  ❌ ${label}  (got ${actual}, expected ${expected})`);
    }
  }

  // Zero submissions — nothing should unlock
  const emptyCtx = {
    totalSubmissions: 0, totalEvaluations: 0, currentStreak: 0, longestStreak: 0,
    highestBand: 0, improvementCount: 0, essayTypesAttempted: new Set(),
    categoriesAttempted: new Set(), daysSinceLastSubmission: null,
  };
  for (const rule of RULES) {
    assert(`Empty ctx → ${rule.code} should NOT pass`, rule.check(emptyCtx), false);
  }

  // Exactly-at-threshold tests
  const thresholdCtx = {
    totalSubmissions: 1, totalEvaluations: 1, currentStreak: 3, longestStreak: 3,
    highestBand: 3, improvementCount: 0, essayTypesAttempted: new Set(['situational']),
    categoriesAttempted: new Set(['env']), daysSinceLastSubmission: 13,
  };
  assert('1 submission  → first_steps passes', RULES[0].check(thresholdCtx), true);
  assert('1 submission  → getting_started fails', RULES[1].check(thresholdCtx), false);
  assert('band 3        → band_3_unlocked passes', RULES[7].check(thresholdCtx), true);
  assert('band 3        → band_4_unlocked fails', RULES[8].check(thresholdCtx), false);
  assert('streak 3      → streak_3 passes', RULES[10].check(thresholdCtx), true);
  assert('streak 3      → streak_7 fails', RULES[11].check(thresholdCtx), false);
  assert('13-day gap    → comeback_kid fails', RULES[13].check(thresholdCtx), false);
  assert('1 essay type  → all_rounder fails', RULES[15].check(thresholdCtx), false);

  // Progress values
  const progCtx = { ...thresholdCtx, totalSubmissions: 15 };
  const dedProg = RULES[2].progress(progCtx); // dedicated_writer (20 target)
  assert('15/20 progress → dedicated_writer current=15', dedProg.current, 15);
  assert('15/20 progress → dedicated_writer target=20', dedProg.target, 20);

  const wmProg = RULES[3].progress(progCtx); // writing_machine (50 target)
  assert('15/50 progress → writing_machine current=15', wmProg.current, 15);

  console.log(`\n  Edge cases: ${edgePassed}/${edgeTotal} passed\n`);

  return { rulesPassed: passed, rulesFailed: failed, edgePassed, edgeTotal };
}

// ════════════════════════════════════════════════════════════════════
// PART 2: Live DB verification
// ════════════════════════════════════════════════════════════════════
async function verifyLiveDB() {
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║  PART 2: Live Database Verification             ║');
  console.log('╚══════════════════════════════════════════════════╝\n');

  const REAL_STUDENT = 'd46dee84-9b49-435d-b5fa-b800dc818da0';
  let passed = 0;
  let total = 0;

  function check(label, ok) {
    total++;
    if (ok) { console.log(`  ✅ ${label}`); passed++; }
    else { console.log(`  ❌ ${label}`); }
  }

  // 1. Achievement definitions exist
  const achievements = await get('achievements?select=id,code,name&order=sort_order.asc');
  check(`Achievement definitions: ${achievements.length} in DB (expect >= 23)`, achievements.length >= 23);
  const byCode = new Map(achievements.map((a) => [a.code, a]));

  // Every rule code maps to a DB achievement
  for (const rule of RULES) {
    check(`Rule "${rule.code}" maps to DB achievement`, byCode.has(rule.code));
  }

  // 2. Real student unlocked achievements
  const unlocked = await get(
    `student_achievements?select=achievement:achievements(code,name)&student_id=eq.${REAL_STUDENT}`
  );
  check(`Real student has ${unlocked.length} unlocked achievements (expect 8)`, unlocked.length === 8);

  const expectedCodes = [
    'first_steps', 'getting_started', 'levelling_up', 'band_breaker',
    'band_3_unlocked', 'band_4_unlocked', 'band_5_unlocked', 'all_rounder',
  ];
  const unlockedCodes = new Set(unlocked.map((u) => u.achievement.code));
  for (const code of expectedCodes) {
    check(`  "${code}" is unlocked`, unlockedCodes.has(code));
  }

  // 3. Progress records
  const progress = await get(
    `achievement_progress?select=current_value,target_value,achievement:achievements(code)&student_id=eq.${REAL_STUDENT}`
  );
  check(`Real student has ${progress.length} progress records (expect >= 15)`, progress.length >= 15);

  // Verify specific progress values
  const progByCode = new Map(progress.map((p) => [p.achievement.code, p]));

  const firstSteps = progByCode.get('first_steps');
  check('first_steps progress: 1/1', firstSteps?.current_value === 1 && firstSteps?.target_value === 1);

  const gettingStarted = progByCode.get('getting_started');
  check('getting_started progress: 5/5', gettingStarted?.current_value === 5 && gettingStarted?.target_value === 5);

  const dedicatedWriter = progByCode.get('dedicated_writer');
  check('dedicated_writer progress: 5/20', dedicatedWriter?.current_value === 5 && dedicatedWriter?.target_value === 20);

  const band5 = progByCode.get('band_5_unlocked');
  check('band_5_unlocked progress: 5/5', band5?.current_value === 5 && band5?.target_value === 5);

  const allRounder = progByCode.get('all_rounder');
  check('all_rounder progress: 2/2', allRounder?.current_value === 2 && allRounder?.target_value === 2);

  // 4. Submissions & evaluations exist
  const subs = await get(
    `submissions?select=id,status,assignment:assignments!inner(student_id)&assignments.student_id=eq.${REAL_STUDENT}&status=eq.evaluated`
  );
  check(`Real student has ${subs.length} evaluated submissions (expect >= 5)`, subs.length >= 5);

  const evalCount = await get(
    'evaluations?select=id&limit=1'
  );
  check('Evaluations table is not empty', evalCount.length > 0);

  // 5. Achievements page query shape test (same query as the page uses)
  const pageQuery = await get(
    'achievements?select=*,student_achievements(unlocked_at),achievement_progress(current_value,target_value)&order=sort_order'
  );
  check(`Achievements page query returns ${pageQuery.length} rows (expect >= 23)`, pageQuery.length >= 23);

  // Verify joined shape
  const firstAch = pageQuery.find((a) => a.code === 'first_steps');
  check('Page query includes student_achievements join', Array.isArray(firstAch?.student_achievements));
  check('Page query includes achievement_progress join', Array.isArray(firstAch?.achievement_progress));

  console.log(`\n  Result: ${passed}/${total} passed\n`);
  return { passed, total };
}

// ════════════════════════════════════════════════════════════════════
async function main() {
  console.log('');

  const mem = testRulesInMemory();
  const db = await verifyLiveDB();

  const allPassed = mem.rulesFailed === 0 && (mem.edgePassed === mem.edgeTotal) && (db.passed === db.total);

  console.log('╔══════════════════════════════════════════════════╗');
  if (allPassed) {
    console.log('║  ALL TESTS PASSED                               ║');
  } else {
    console.log('║  SOME TESTS FAILED                              ║');
  }
  console.log('╠══════════════════════════════════════════════════╣');
  console.log(`║  Rules:      ${mem.rulesPassed}/${RULES.length} passed                          ║`);
  console.log(`║  Edge cases: ${mem.edgePassed}/${mem.edgeTotal} passed                         ║`);
  console.log(`║  DB checks:  ${db.passed}/${db.total} passed                         ║`);
  console.log('╚══════════════════════════════════════════════════╝');

  process.exit(allPassed ? 0 : 1);
}

main().catch((err) => { console.error('FATAL:', err.message); process.exit(1); });
