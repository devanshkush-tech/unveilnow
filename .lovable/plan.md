# Blind Date — Full Feature Build

The Blind Date scaffold already exists at `/blind-date/*` with a 5-question setup, mock matching, timed chat, decision, matched, full chat, and a premium teaser page. This plan upgrades it into the production feature you described.

## 1. Database (new tables, RLS-protected)

- `blind_date_profiles` — one row per user
  - `user_id` (PK, FK auth.users)
  - `answers` jsonb (full questionnaire)
  - `compat_vector` jsonb (derived numeric vector — server only)
  - `plan` text (`free` | `expert` | `unlimited`)
  - `sessions_used`, `sessions_limit`, `period_start`
- `blind_date_sessions`
  - `id`, `user_a`, `user_b`, `status` (`active` | `decided` | `revealed` | `expired`)
  - `started_at`, `ends_at`, `decision_a`, `decision_b`, `revealed_at`
- `blind_date_messages`
  - `id`, `session_id`, `sender_id`, `body`, `created_at`
- `blind_date_payments` — mirrors existing `payment_submissions` but tagged `feature='blind_date'` (we will actually reuse `payment_submissions` with a new `feature` column instead of a separate table to keep admin tooling unified)

RLS:
- Users read/write only their own `blind_date_profiles`
- Sessions/messages: only participants can read; messages insert only while session active
- Admins (via `has_role`) full read; can insert sessions (manual matchmaking)
- `compat_vector` never returned to client (column-level: kept server-side via RPC only)

## 2. Questionnaire (15 sections, ~25 questions)

Categories: communication style, introvert/extrovert, relationship intent, hobbies, lifestyle, work-life balance, humour, emotional compatibility, travel, music/movies, future goals, sleep schedule, social energy, core values, dealbreakers. Mix of single-select, multi-select chips, and slider scales. Saved progressively to `blind_date_profiles.answers`. Premium aesthetic: glass cards, gradient progress, framer-motion transitions, category chips at top.

## 3. Matching

- Edge function `bd-find-match`:
  - Loads current user's vector
  - Pulls candidate pool (opposite preference, active in last 14d, not previously matched/blocked)
  - Computes cosine similarity on weighted dimensions
  - Returns top match + compatibility % (only the % is sent to client; raw vectors stay server-side)
- Fallback to mock when no candidates exist (preserves current demo).

## 4. Session lifecycle

- Edge function `bd-start-session` creates session, sets 60s `ends_at`
- Realtime subscription on `blind_date_messages` for live chat
- Edge function `bd-decide` accepts `continue|pass`; when both `continue` → set `revealed_at`, unlock `/blind-date/chat/full`

## 5. Pricing & payment

Plans:
- Free: 3 sessions / month
- Blind Date Expert: ₹499 (₹399 for active Unveil subscribers) — 50 sessions
- Blind Date Unlimited: ₹999 (₹399 for active Unveil subscribers) — unlimited

Reuse existing UPI QR + screenshot + WhatsApp flow:
- New page `/blind-date/payment` mirrors `Payment.tsx` structure
- New page `/blind-date/payment/review` mirrors `PaymentReview.tsx`
- Insert into `payment_submissions` with `feature='blind_date'` and `plan` set to bd plan id
- Discount auto-applied via `has_active_subscription()` check on the page

Migration: add `feature text default 'core'` column to `payment_submissions`.

## 6. Admin panel

Add a top-level toggle in `/admindashboard` to switch between **Core** and **Blind Date** views. Blind Date view contains tabs:
- **Users** — list of `blind_date_profiles` with plan, sessions used, last active
- **Responses** — view a user's questionnaire answers
- **Manual match** — pick two users → create session
- **Payments** — filter `payment_submissions` where `feature='blind_date'`, approve/reject (reuses existing `AdminPayments` component with a feature filter)
- **Active sessions** — live list with countdown
- **Analytics** — funnel: setup → matched → continued → revealed → paid; conversion %

## 7. Analytics & privacy

- Track only generic events: `bd_setup_started`, `bd_setup_completed`, `bd_match_found`, `bd_session_started`, `bd_decision_made` (value: continue/pass count, not which user), `bd_revealed`, `bd_purchase` (with INR currency + value)
- Existing `metaCapi.sanitize()` already strips compatibility/personality/chat fields — extend allowlist of stripped keys to cover new field names (`answers`, `compat_score`, `compat_vector`, `vibes`, `decision`, `session_id`, `match_id`)
- No questionnaire data, no message bodies, no compatibility scores ever sent to Meta Pixel / CAPI

## 8. UI updates

- Header switch (already added) keeps working
- Setup page: redesign into category-grouped flow with slider/chip inputs
- Matching page: connect to real `bd-find-match` (keep current animation)
- Decision page: call `bd-decide`
- Premium page: real plans, "₹100 OFF for Unveil members" badge when active sub detected, CTA → `/blind-date/payment?plan=expert|unlimited`

## Technical notes

- All new edge functions: JWT-validated, CORS, Zod input validation, never return `compat_vector`
- New supabase tables get standard `updated_at` trigger
- `blind_date_profiles.compat_vector` populated by SECURITY DEFINER function `bd_compute_vector(answers jsonb)` on insert/update
- Realtime: `ALTER PUBLICATION supabase_realtime ADD TABLE blind_date_messages, blind_date_sessions`
- Frontend store (`src/features/blind-date/store.ts`) extended to hold session id + remote match data; no compat vector stored client-side

## Out of scope for this iteration

- Voice/video in blind chat
- Group blind dates
- Cross-city matching weights tuning (uses simple cosine v1)

After approval I'll execute the migration first, then edge functions + frontend + admin in one pass.