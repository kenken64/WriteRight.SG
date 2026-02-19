# Test Accounts

> These accounts are created by running the mock data scripts against your Supabase database.

## Setup

```bash
# Create teacher + 3 students
node scripts/create-mock-teacher.mjs

# Create achievement tester student + parent
node scripts/create-mock-student.mjs
```

---

## Teacher

| Field | Value |
|---|---|
| Email | `teacher-tester@writeright.test` |
| Password | `WriteRight2026!` |
| Role | `parent` (parent_type: `school_teacher`) |
| Display name | Mrs. Chen |
| Class name | 3A English |
| Class code | *(generated on each run)* |

---

## Students (Teacher's Class)

All use password: **`WriteRight2026!`**

| Name | Email | Level |
|---|---|---|
| Alice Tan | `student-alice@writeright.test` | sec3 |
| Bob Lim | `student-bob@writeright.test` | sec3 |
| Carol Wong | `student-carol@writeright.test` | sec4 |

Each student has:
- 2 evaluated submissions (situational + technology topics)
- 1 open assignment (continuous writing)
- Linked to teacher via `parent_student_links`

---

## Achievement Tester (Student)

| Field | Value |
|---|---|
| Email | `achievement-tester@writeright.test` |
| Password | `WriteRight2026!` |
| Role | `student` |
| Display name | Achievement Tester |
| Level | sec4 |

This account has:
- 102 evaluated submissions
- All 17 achievements unlocked
- 35-day streak
- 5 fulfilled wishlist rewards (Trophy Case)
- Topics across 5 categories + continuous writing

---

## Parent

| Field | Value |
|---|---|
| Email | `parent-tester@writeright.test` |
| Password | `WriteRight2026!` |
| Role | `parent` (parent_type: `parent`) |
| Display name | Mock Parent |

Linked to the Achievement Tester student account.

---

## Notes

- The class code is randomly generated each time `create-mock-teacher.mjs` runs. Check the script output for the actual code.
- Both scripts clean up previous mock data before creating new data, so they are safe to re-run.
- All scripts read credentials from `apps/web/.env.local` (`NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`).
