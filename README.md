# WriteRight.AI

AI-powered English essay marking platform for Singapore O-Level students. Get instant, MOE-aligned feedback on situational and continuous writing — no more waiting weeks for teacher markings.

## What It Does

- **Handwriting OCR** — Upload photos of handwritten essays; Google Cloud Vision extracts the text
- **AI Marking** — GPT-4o scores essays against official MOE 1184 rubrics with band-level feedback
- **Rewrite Engine** — Get an improved version of your essay targeting one band above, with a diff view
- **Topic Bank** — Browse or auto-generate MOE-style essay prompts from trending Singapore news
- **Achievements & Streaks** — Gamified progress tracking with badges and streaks
- **Wishlist & Rewards** — Parents set real-world rewards tied to achievements; kids claim them when earned
- **Parent Dashboard** — Analytics, score trends, error breakdowns, and a promise-score tracker

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), React 18, Tailwind CSS, shadcn/ui |
| State | TanStack Query |
| Editor | Tiptap (rich text) |
| Backend | Next.js API Routes |
| Database | Supabase (Postgres + RLS) |
| Auth | Supabase Auth (email/password) |
| Storage | Supabase Storage (S3-compatible) |
| AI | OpenAI GPT-4o, Google Cloud Vision |
| Billing | Stripe |
| Email | Resend |
| Monorepo | Turborepo + pnpm workspaces |
| Testing | Vitest |

## Project Structure

```
writeright-sg/
├── apps/web/                # Next.js web application
│   ├── src/app/
│   │   ├── (marketing)/     # Landing page (SSR, public)
│   │   ├── (auth)/          # Login, register
│   │   ├── (dashboard)/     # Authenticated pages
│   │   └── api/v1/          # REST API routes
│   ├── src/components/      # React components
│   └── src/lib/             # Utilities, validators, API client
├── packages/ai/             # AI pipeline package
│   ├── src/marking/         # Essay marking engine + rubrics
│   ├── src/ocr/             # OCR + image preprocessing
│   ├── src/rewrite/         # Rewrite engine + diff
│   ├── src/topics/          # Topic generation + categorisation
│   ├── src/achievements/    # Achievement engine + streak logic
│   └── src/prompts/         # Versioned prompt templates
└── supabase/
    ├── migrations/          # SQL migrations (RLS, tables, policies)
    ├── functions/           # Supabase Edge Functions
    └── seed.sql             # Test data
```

## Getting Started

### Prerequisites

- Node.js >= 18
- pnpm 9.x (`corepack enable && corepack prepare pnpm@9.12.3`)
- Supabase CLI (`brew install supabase/tap/supabase`)
- A Supabase project (free tier works)

### Setup

1. **Clone the repo**
   ```bash
   git clone https://github.com/kenken64/WriteRight.AI.git
   cd WriteRight.AI
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env.local
   ```
   Fill in your Supabase, OpenAI, Google Cloud, and Stripe keys.

4. **Run database migrations**
   ```bash
   supabase db push
   ```

5. **Start the dev server**
   ```bash
   pnpm dev
   ```
   The app runs at [http://localhost:3005](http://localhost:3005).

## Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start all apps in development mode |
| `pnpm build` | Build all apps |
| `pnpm test` | Run all tests (Vitest) |
| `pnpm test:coverage` | Run tests with coverage report |
| `pnpm lint` | Lint all packages |
| `pnpm format` | Format code with Prettier |
| `pnpm type-check` | TypeScript type checking |
| `pnpm db:reset` | Reset local Supabase database |

## API Overview

All API routes are under `/api/v1/`:

| Route | Methods | Description |
|---|---|---|
| `/auth/login` | POST | Email/password login |
| `/auth/register` | POST | Create account |
| `/auth/logout` | POST | Sign out |
| `/topics` | GET, POST | Browse/create topics |
| `/topics/generate` | POST | AI-generate topic from article or trending |
| `/topics/:id` | GET, PATCH, DELETE | Single topic CRUD |
| `/assignments` | GET, POST | List/create assignments |
| `/assignments/:id` | GET, PATCH, DELETE | Single assignment CRUD |
| `/submissions` | GET, POST | List/create submissions |
| `/submissions/:id/evaluate` | POST | Trigger AI evaluation |
| `/submissions/:id/feedback` | GET | Get evaluation results |
| `/submissions/:id/rewrite` | POST | Generate improved rewrite |
| `/achievements/:studentId` | GET | Student achievements |
| `/wishlist` | GET, POST | Wishlist items |
| `/redemptions` | GET | Reward redemptions |
| `/billing/subscribe` | POST | Start Stripe subscription |

## Security

- **Row-Level Security (RLS)** — Every table has policies; parents see only linked students' data
- **CSRF Protection** — Cookie + header token validation on all mutating API requests
- **Rate Limiting** — 60 req/min (free), 120 req/min (paid), 5 req/min (AI endpoints)
- **Input Sanitisation** — Zod validation on all API inputs
- **Security Headers** — CSP, HSTS, X-Frame-Options via middleware

## License

Proprietary. All rights reserved.
