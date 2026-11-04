# NazProject — Session Notes

Running log for the French courses + mathematics learning platform.
Keep this updated each step so we never lose track.

---

## 1. What we're building

A **fully professional, production-ready** e-learning platform (in **French**) that
publishes **French language courses** and **mathematics courses**, targeting
**kids and students** across multiple categories and levels.

- Public website: students browse, register, learn, track progress.
- Backoffice (admin panel): full CMS to manage all content, students, media, analytics.
- Buy a domain later and deploy to production.

### Stack
- **Next.js 16.4.5** (App Router, TypeScript, Tailwind CSS v4, Turbopack) — `src/` dir, `@/*` alias
- **React 19.3**
- **Supabase** — Postgres DB, Auth, Storage, Row Level Security
- Deploy target: **Vercel** (frontend) + **Supabase cloud** (backend)

### ⚠️ Next.js 16 specifics (verified against bundled docs, not assumed)
- **`middleware` → `proxy`**: file is `src/proxy.ts`, exported fn is `proxy()`. Runs on **nodejs** runtime (no edge). This is where auth session refresh + route guards live.
- **Turbopack** is the default bundler (no flags needed in scripts).
- **Async request APIs enforced**: `cookies()`, `headers()`, `params`, `searchParams` must all be `await`ed. All our code does.
- **`cacheComponents` (PPR)**: scaffolder enabled it; we turned it OFF in `next.config.ts` because the app reads per-request Supabase auth everywhere, which fights the cached-by-default model. Revisit later if desired.
- **`next lint` removed**: use `eslint` CLI (`npm run lint`).
- `next/image`: Supabase storage host registered in `remotePatterns` from env.

---

## 2. Decisions locked (2026-11-04)

| Topic | Decision |
|---|---|
| Lesson formats | **All four**: written articles, video lessons, PDF/downloads, quizzes/exercises |
| Access model | **Mixed** — some courses free, some premium (paid/unlockable) |
| Backoffice scope | **Full**: content CMS, student management, media uploads, analytics dashboard |
| Catalog structure | **Category → Level → Course → Lesson**, single admin |
| Language | **French** UI throughout |
| Audience | Kids + students, multiple categories & levels |

### Catalog hierarchy
```
Category (e.g. "Français", "Mathématiques")
  └─ Level (e.g. "Primaire", "Collège", "Lycée" / "A1", "A2"...)
       └─ Course (e.g. "Grammaire CE1", "Algèbre 3ème")
            └─ Lesson (article | video | pdf | quiz)  ← free or premium
```

---

## 3. Payment approach (audience: FRANCE 🇫🇷, EUR €)

**Correction (2026-11-04):** clients are **French (France)**, not Tunisian.
So Stripe is fully supported and is the primary premium flow. Currency = **EUR (€)**.

- **Primary:** **Stripe Checkout** — student clicks "Débloquer" → Stripe Checkout
  session → on success, a webhook grants the `entitlement` (status `granted`).
  Clean, production-standard, works in France.
- **Fallback (kept):** admin can also grant access **manually** in the backoffice
  (for offline sales, bank transfer, promos, or comps). The "request access"
  flow still exists for non-card buyers.
- Schema unchanged — `entitlements` rows back both paths. Added a
  `stripe_customers` / price mapping via course `price` (EUR) + env Stripe keys.

---

## 4. Database schema (plan)

Tables:
- `profiles` — 1:1 with auth.users; `role` ('student' | 'admin'), name, avatar
- `categories` — name, slug, description, icon, order
- `levels` — belongs to category; name, slug, order
- `courses` — belongs to level; title, slug, description, cover, is_premium, price, status(draft/published), order
- `lessons` — belongs to course; title, slug, type(article/video/pdf/quiz), content(jsonb), video_url, file_url, is_premium, order, status
- `quizzes` / `quiz_questions` / `quiz_options` — for quiz-type lessons
- `enrollments` — student ↔ course
- `lesson_progress` — student ↔ lesson (completed, last_viewed)
- `quiz_attempts` — student quiz scores
- `entitlements` — student ↔ course premium access (granted_by, granted_at) ← payment Phase 1
- `page_views` — lightweight analytics

RLS: students read published content + own rows; admin full access.
Storage buckets: `covers`, `videos`, `pdfs`, `avatars`.

---

## 5. Progress log

- [x] **2026-11-04** — Requirements gathered, decisions locked
- [x] **2026-11-04** — Next.js project scaffolded (`naz-platform/`)
- [x] **2026-11-04** — Supabase helpers (client/server/admin) + env.example + auth middleware
- [x] **2026-11-04** — SQL schema `0001_init.sql` (13 tables, enums, RLS, triggers) + `0002_storage_and_helpers.sql` (buckets, `has_course_access`) + `seed.sql` + TS types
- [x] **2026-11-04** — Design system: "cahier" palette, Fraunces + Nunito **self-hosted** (next/font/local — build no longer depends on Google Fonts), light/dark, globals.css
- [x] **2026-11-04** — Auth: login/signup (`/connexion`, `/inscription`), French error messages, email-confirm callback route, sign-out
- [x] **2026-11-04** — Public site: landing, `/cours` index, category page (levels+courses), course detail (progress bar + access panel), lesson player (article/video/pdf/quiz, premium gating server-side, prev/next, complete-toggle)
- [x] **2026-11-04** — Learning server actions: progress, enroll, request-premium, quiz attempts
- [x] **2026-11-04** — **Production build passes clean** (8 routes, TS OK, proxy middleware recognized)
- [x] **2026-11-04** — Backoffice: admin layout + sidebar, dashboard (live stats + recent signups + top courses), full catalogue CMS (4-level tree, create/edit/delete, draft/publish), media uploads to Storage, students table (role management), premium access queue (approve/revoke)
- [x] **2026-11-04** — **Stripe Checkout** premium flow (EUR) — checkout action + webhook (`/api/stripe/webhook`) grants entitlement on payment; manual request-access kept as fallback; Stripe fully optional via env
- [x] **2026-11-04** — Student space `/mon-espace` (enrolled courses + progress), page-view analytics tracker
- [x] **2026-11-04** — **Final build clean: 14 routes.** README + deploy + domain guide written
- [x] **2026-11-04** — Audience corrected to **France 🇫🇷 / EUR €** (not Tunisia); Stripe is now the primary payment path

## 6b. Brand identity (2026-11-04)
- **Name:** Naz Académie (owl mascot — "le hibou" = wisdom, warm for kids)
- **Mark:** geometric owl; its two eyes carry the subject colors (coral = français, blue = maths); yellow beak
- **Wordmark:** "Naz" in Fraunces + yellow marker swoosh underline, "ACADÉMIE" label beneath
- **Components:** `src/components/brand/owl-logo.tsx` — `<OwlMark>` (ink/light/francais tones, optional blink) + `<BrandLockup>`
- **Wired into:** site header, footer, auth pages, admin sidebar; **favicon** at `src/app/icon.svg` (owl in rounded square); metadata title updated
- **Animated showcase** published as a Claude artifact ("Naz Brand") — owl blink + entrance animation, color system, lockups
- Verified visually with a real browser screenshot — logo renders correctly in the header.

## 7. STATUS: ✅ COMPLETE & PRODUCTION-READY (+ brand)
Everything builds, type-checks, and the auth guard is verified (admin → 307 redirect when signed out). Remaining to go live: create a Supabase project + run the 2 migrations, set env vars, deploy to Vercel, (optionally) wire Stripe, buy + point the domain. All steps are in README.md.

### Fix log (non-obvious)
- Supabase typed client returned `never` for every table. Cause: hand-written `Database` type used `Partial<T>` for Insert/Update, which TS defers; combined with a populated `Functions` map it collapsed the schema to `never`. Fix: explicit mapped types `{ [K in keyof T]?: T[K] }` in the `Table<T>` helper (resolves eagerly). Verified by isolated probes.
- `next/font/google` hard-fails the **production build** when offline/behind a restrictive proxy (dev only warns). Switched to self-hosted variable fonts via `@fontsource-variable/*` copied into `src/app/fonts/` + `next/font/local`. Also better for prod perf/privacy.

---

## 6. How to run (will finalize at the end)

```bash
cd naz-platform
cp .env.example .env.local   # fill Supabase keys
npm install
npm run dev
```

Full setup, Supabase project creation, migrations, and domain steps
go in `README.md` at the end.
