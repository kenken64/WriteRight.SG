# WriteRight Codebase Drift Report

**Generated:** 2026-02-16  
**SG repo:** `~/projects/WriteRight-SG`  
**International repo:** `~/projects/WriteRight-International`  
**Fork date:** 2026-02-15  

## Executive Summary

The International repo was forked from SG just one day ago. Most differences are **intentional branding/curriculum changes** (WriteRight SG → Sharpener, MOE → Cambridge/IELTS, sec3-5 → year9-11). However, there is **one significant structural divergence** in the OCR module that needs attention.

**329 files shared, 3 files SG-only, 1 file Intl-only.** Package dependencies are identical.

---

## 1. Structural Drift (Action Required)

### 🔴 OCR Module — Major Refactor in International

**Files affected:**
- `packages/ai/src/ocr/vision-client.ts` (SG: 81 lines → Intl: 187 lines)
- `packages/ai/src/ocr/pdf-extractor.ts` (SG-only, 80 lines)
- `packages/ai/src/ocr/word-extractor.ts` (SG-only, 41 lines)
- `packages/ai/src/index.ts` (SG-only — barrel exports)

**What happened:** International **inlined** `pdf-extractor.ts` and `word-extractor.ts` into `vision-client.ts`, using `mammoth` (direct import) and `pdf-parse/lib/pdf-parse` (require hack to avoid test file load at import time). SG keeps them as separate modules with a barrel `index.ts`.

**Assessment:** The International approach fixes a real issue (`pdf-parse` index.js tries to read a test file at import time). This is a **bug fix + refactor** that should be backported to SG.

**Recommendation:**
- **Backport** the `pdf-parse/lib/pdf-parse` require workaround to SG
- **Decide on architecture**: separate files (SG, cleaner) vs inlined (Intl, simpler). Recommend keeping separate files but applying the pdf-parse fix.
- SG's `packages/ai/src/index.ts` barrel file is missing in International — add it back or confirm it's not needed

### 🟡 `.npmrc` — International Only

International has an `.npmrc` file that SG lacks. Check if it contains registry config or other settings that SG should also have.

---

## 2. Intentional Differences (No Action Needed)

These are expected branding/curriculum adaptations:

| Category | SG | International |
|---|---|---|
| Brand name | WriteRight SG | Sharpener |
| Curriculum | MOE 1184 / O-Level | Cambridge IGCSE / IELTS / NYT standards |
| Levels | sec3, sec4, sec5 | year9, year10, year11 (labels only — values still `sec3`/`sec4`/`sec5`) |
| Default level | `"sec4"` | `"year10"` |
| Context | Singapore-specific | Global/international |
| Marketing copy | MOE-aligned, Singapore students | Students worldwide |

**Files with branding-only changes (26 files):**
- All 4 auth pages (login, register, forgot-password, reset-password)
- Marketing landing page, layout.tsx, sidebar, onboarding flow
- All AI prompts (marking-cw, marking-sw, rewrite, topic-gen)
- All writing assistant modules (analyzer, coach, grammar-checker, live-scorer, outline-generator, suggester)
- Topic generator (from-trending.ts)
- API routes (evaluate, finalize, recheck, topics/generate) — only `level` default changed
- Test file (confidence.test.ts) — removed "Singapore" from test strings

---

## 3. Potential Issues to Watch

### ⚠️ Level Values vs Labels Mismatch (International)
In `student-onboard-flow.tsx`, International changed labels to "Year 9/10/11" but the **type and values remain `sec3`/`sec4`/`sec5`**. This means the database stores `sec3` for a "Year 9" student. This is fine short-term but creates confusion. Consider renaming the values to `year9`/`year10`/`year11` in International (requires DB migration + all references).

### ⚠️ Marketing Page Divergence
The marketing page `(marketing)/page.tsx` has significant copy and layout changes beyond branding. International simplified/rewrote sections. Future shared UI improvements will need manual merging.

### ⚠️ No Shared Package Abstraction
Curriculum-specific strings are hardcoded throughout. Consider extracting a `config.ts` or `locale.ts` per product to make future syncing easier:
```ts
// packages/ai/src/config.ts
export const PRODUCT_NAME = "Sharpener"; // or "WriteRight SG"
export const CURRICULUM = "Cambridge IGCSE"; // or "MOE O-Level"
export const LEVEL_MAP = { ... };
```

---

## 4. Package Dependencies

✅ **No dependency drift.** Root `package.json` dependencies are identical between both repos.

Note: International's `vision-client.ts` imports `mammoth` directly (for Word extraction) — verify it's in the ai package's dependencies.

---

## 5. Sync Recommendations (Priority Order)

| # | Action | Priority | Effort |
|---|---|---|---|
| 1 | Backport `pdf-parse` require workaround from Intl → SG | 🔴 High | Low |
| 2 | Decide on OCR module architecture (separate files vs inlined) and align | 🔴 High | Medium |
| 3 | Add `packages/ai/src/index.ts` barrel to International (or confirm not needed) | 🟡 Medium | Low |
| 4 | Check `.npmrc` in International, add to SG if needed | 🟡 Medium | Low |
| 5 | Rename `sec3`/`sec4`/`sec5` values to `year9`/`year10`/`year11` in International | 🟡 Medium | Medium |
| 6 | Extract shared config/locale to reduce future drift | 🟢 Nice-to-have | Medium |

---

## 6. Files Summary

- **329 shared files** (identical or branding-only changes)
- **3 SG-only files**: `packages/ai/src/index.ts`, `pdf-extractor.ts`, `word-extractor.ts`
- **1 Intl-only file**: `.npmrc`
- **~27 diverged files**: 26 branding-only + 1 structural (vision-client.ts)
