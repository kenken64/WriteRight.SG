# WriteRight Merge Plan: SG + International → Single Repo

## Current State: Two Separate Repos

| | **WriteRight.AI** (this repo) | **WriteRight-International** |
|---|---|---|
| **Target** | Singapore O-Level (MOE 1184) | Cambridge/IGCSE/IELTS/NYT standards |
| **Rubrics** | MOE-aligned dimensions & bands | Cambridge/IELTS-aligned dimensions & bands |
| **Prompts** | "Singapore O-Level examiner, Paper 1" | "Cambridge/IELTS standards examiner" |
| **Landing page** | SG-focused copy & branding | Global/international copy & branding |
| **Locale** | en-SG | en-GB |
| **Student levels** | sec1–sec5 | sec3–sec5 / year9–11 |
| **Domain** | writeright.sg | international domain |

Both share **~90% identical code** — same monorepo structure (Turborepo + pnpm), same tech stack (Next.js 16, Supabase, OpenAI, Google Cloud Vision), same features (OCR, evaluation, rewrite, achievements, streaks, gallery, Stripe billing).

## Goal: Single Repo, Env Var Toggle

One environment variable (e.g. `NEXT_PUBLIC_VARIANT=sg` or `NEXT_PUBLIC_VARIANT=international`) that switches:

1. **Rubrics** — which scoring criteria/bands are loaded from `packages/ai/src/marking/rubrics/`
2. **Prompts** — which marking prompts are used (MOE-aligned vs Cambridge/IELTS-aligned)
3. **Landing page** — different hero, copy, testimonials, FAQ depending on variant
4. **Branding** — domain name, app title, locale references
5. **Student levels** — which level options are available
6. **Essay types/subtypes** — if there are any differences in supported types
7. **Topic generation** — Singapore context vs international/global context

A single deployment on Railway with `VARIANT=sg` serves the SG version, and another deployment with `VARIANT=international` serves the international version — same codebase, same Docker image, different config.

## Architecture

```
ENV: NEXT_PUBLIC_VARIANT = "sg" | "international"
                │
    ┌───────────┴───────────┐
    │                       │
  "sg"               "international"
    │                       │
  MOE rubrics         Cambridge/IELTS rubrics
  SG prompts          International prompts
  SG landing page     International landing page
  en-SG locale        en-GB locale
  sec1-sec5 levels    sec3-sec5/year9-11 levels
  writeright.sg       international domain
```

## Tricky Parts

1. **Rubrics & prompts are the core divergence** — these aren't just config strings, they're structured TypeScript objects with different band descriptors, dimension names, and scoring logic
2. **Landing page** — likely entire page components differ, not just text swaps
3. **Database schema** — student levels enum may need to be a superset of both (`sec1`–`sec5` + `year9`–`year11`), and the `rubric_templates` table needs to hold both variants
4. **Supabase migrations** — need to reconcile any schema differences between the two repos
5. **Prompt text** — the system prompts reference specific exam boards; toggling needs to happen cleanly in the prompt registry
