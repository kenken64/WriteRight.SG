# Supabase Query Performance Report

**Date:** 2026-02-18

## Summary

| Metric | Value |
|--------|-------|
| Total Queries Tracked | 20 |
| Total Execution Time | ~46,554 ms |
| Most Called Query | `SELECT sessions.*` (7,909 calls) |
| Slowest Avg Query | `pg_backup_start` (206.7 ms/call) |
| Biggest Time Consumer | `SELECT name FROM pg_timezone_names` (39.6% of total) |

## Top Queries by Total Time

| # | Query | Role | Calls | Mean (ms) | Min (ms) | Max (ms) | Total (ms) | Rows Read | Cache Hit % | % Total Time |
|---|-------|------|------:|----------:|----------:|----------:|-----------:|----------:|------------:|-------------:|
| 1 | `SELECT name FROM pg_timezone_names` | authenticator | 102 | 180.91 | 52.55 | 1,010.63 | 18,452.54 | 121,788 | 0.00 | 39.64 |
| 2 | `LOCK TABLE "realtime"."schema_migrations"` | supabase_admin | 95 | 106.02 | 0.01 | 2,060.45 | 10,072.35 | 0 | 100.00 | 21.64 |
| 3 | `SELECT e.name, n.nspname AS schema...` (pg_available_extensions) | postgres | 45 | 90.90 | 2.24 | 313.71 | 4,090.58 | 3,510 | 100.00 | 8.79 |
| 4 | `WITH functions AS (...)` (pg_proc introspection) | postgres | 15 | 169.03 | 107.38 | 279.42 | 2,535.40 | 1,499 | 100.00 | 5.45 |
| 5 | `WITH base_types AS (...)` (PostgREST schema cache - functions) | authenticator | 102 | 24.36 | 17.95 | 125.89 | 2,484.68 | 118 | 99.86 | 5.34 |
| 6 | `WITH base_types AS (...)` (PostgREST schema cache - tables) | authenticator | 102 | 11.55 | 1.17 | 148.03 | 1,177.81 | 4,529 | 99.89 | 2.53 |
| 7 | `CREATE OR REPLACE FUNCTION pg_temp.count_estimate(...)` | postgres | 37 | 23.48 | 2.39 | 68.00 | 868.78 | 0 | 99.99 | 1.87 |
| 8 | `SELECT CASE WHEN pg_is_in_recovery()...` (pg_backup_start) | supabase_admin | 4 | 206.69 | 122.19 | 293.12 | 826.76 | 4 | 0.00 | 1.78 |
| 9 | `SELECT set_config('search_path', ...)` | authenticated | 7,234 | 0.09 | 0.02 | 12.03 | 644.04 | 7,234 | 100.00 | 1.38 |
| 10 | `INSERT INTO "refresh_tokens" (...)` | supabase_auth_admin | 101 | 6.19 | 0.12 | 32.01 | 625.47 | 101 | 99.86 | 1.34 |
| 11 | `SELECT * FROM pgbouncer.get_auth($1)` | pgbouncer | 232 | 2.68 | 0.05 | 48.49 | 622.54 | 232 | 100.00 | 1.34 |
| 12 | `SELECT sessions.* FROM sessions WHERE id = $1` | supabase_auth_admin | 7,909 | 0.07 | 0.01 | 5.54 | 538.63 | 7,908 | 100.00 | 1.16 |
| 13 | `SELECT users.* FROM users WHERE instance_id = $1 AND id = $2` | supabase_auth_admin | 7,820 | 0.07 | 0.01 | 12.43 | 528.95 | 7,800 | 100.00 | 1.14 |
| 14 | `WITH tables AS (...)` (Supabase Studio tables) | postgres | 27 | 19.05 | 0.15 | 45.03 | 514.37 | 382 | 100.00 | 1.11 |
| 15 | `SELECT "public"."users"."onboarded" FROM "public"."users"` | authenticated | 5,426 | 0.09 | 0.04 | 8.12 | 489.27 | 5,426 | 100.00 | 1.05 |
| 16 | `WITH tables AS (...), columns AS (...)` (Studio tables+columns) | postgres | 3 | 155.10 | 83.27 | 231.14 | 465.31 | 79 | 100.00 | 1.00 |
| 17 | `UPDATE "refresh_tokens" SET "revoked" = $1` | supabase_auth_admin | 69 | 6.18 | 0.05 | 13.68 | 426.14 | 69 | 100.00 | 0.92 |
| 18 | `WITH RECURSIVE pks_fks AS (...)` (PostgREST FK/PK resolution) | authenticator | 102 | 4.04 | 1.56 | 44.75 | 411.89 | 1,014 | 99.89 | 0.88 |
| 19 | `SELECT "public"."submissions".* ... JOIN assignments` | authenticated | 85 | 4.75 | 0.66 | 44.52 | 403.33 | 85 | 100.00 | 0.87 |
| 20 | `INSERT INTO "sessions" (...)` | supabase_auth_admin | 32 | 11.48 | 0.15 | 39.41 | 367.28 | 32 | 100.00 | 0.79 |

## Key Findings

### Queries with 0% Cache Hit Rate

| Query | Calls | Total Time (ms) | Rows Read |
|-------|------:|----------------:|----------:|
| `SELECT name FROM pg_timezone_names` | 102 | 18,452.54 | 121,788 |
| `pg_backup_start(...)` | 4 | 826.76 | 4 |

### Most Frequently Called (App Queries)

| Query | Calls | Mean (ms) | Cache Hit % |
|-------|------:|----------:|------------:|
| `SELECT sessions.* WHERE id = $1` | 7,909 | 0.07 | 100.00 |
| `SELECT users.* WHERE instance_id = $1 AND id = $2` | 7,820 | 0.07 | 100.00 |
| `set_config('search_path', ...)` | 7,234 | 0.09 | 100.00 |
| `SELECT users.onboarded` | 5,426 | 0.09 | 100.00 |

### Optimization Opportunities

1. **`pg_timezone_names` (39.6% of total time)** - This query reads 121,788 rows per execution with 0% cache hit rate. It is called 102 times and dominates total execution time. This is an internal Supabase/PostgREST query and may not be directly optimizable, but worth investigating if timezone data can be cached at the application level.

2. **Realtime schema migrations lock (21.6%)** - The `LOCK TABLE "realtime"."schema_migrations"` query has a max time of 2,060ms suggesting occasional lock contention. This is internal Supabase Realtime infrastructure.

3. **PostgREST schema introspection (5.3% + 2.5% + 0.9%)** - Three schema cache queries together account for ~8.7% of total time. These run on every PostgREST reload (102 calls each). Consider reducing schema reload frequency if possible.

4. **App queries are well-optimized** - The actual application queries (`sessions`, `users`, `submissions`) all have 100% cache hit rates and sub-millisecond mean times. No index advisor recommendations were triggered.

### Query Distribution by Role

| Role | Queries | Total Time (ms) | % Total |
|------|--------:|----------------:|--------:|
| authenticator | 4 | 22,526.93 | 48.39 |
| supabase_admin | 2 | 10,899.11 | 23.42 |
| postgres | 5 | 8,474.44 | 18.21 |
| supabase_auth_admin | 4 | 1,960.28 | 4.21 |
| authenticated | 3 | 1,536.64 | 3.30 |
| pgbouncer | 1 | 622.54 | 1.34 |
