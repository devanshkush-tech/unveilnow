
## Goal

One account, one payment unlocks both Unveil and Blind Date. Remove the parallel Blind Date signup / payment / approval loop. Consolidate the admin panel into a single unified console showing everything about each user (core + BD activity) with combined metrics.

## User-facing changes

### 1. Blind Date landing (`/blind-date`)
- Keep as a marketing feature page.
- Primary CTA "Start Blind Date":
  - Logged out → `/signup?next=/dashboard?bd=1`
  - Onboarded but unpaid → `/payment` (main plan picker)
  - Paid → `/dashboard` with BD toggle turned on (opens BD experience)
- Remove separate "Sign in" wording aimed at BD-only members — a single Sign in button routes to `/login?next=/dashboard`.

### 2. Remove Blind Date's own signup / payment flow
- Delete routes: `/blind-date/payment`, `/blind-date/payment/review`, `/blind-date/onboarding` (extended questionnaire is folded into normal onboarding as an optional step, see below).
- Delete/retire pages: `PaymentPage.tsx`, `PaymentReview.tsx` under blind-date, `Premium.tsx`.
- `BlindDateGate` simplifies to: must be authenticated, must be onboarded, must have `account_status = 'active'` (i.e. paid). No separate BD paid flag needed for gating.

### 3. Extended BD questions become part of main onboarding
- The public `/blind-date/setup` (Phase A social-energy quiz) still exists for lead capture / SEO, but its answers are also stored against the user after signup.
- Extended (Phase B) questions move into an optional final onboarding step titled "Personalize matches (optional)". Skipping still activates the account after payment.

### 4. Single payment maps to combined entitlement
- Core plans (`starter` / `premium` / `elite`) now grant Blind Date chat credits on approval:
  - Starter → 10 chats
  - Premium → 30 chats
  - Elite → unlimited (stored as a large sentinel, e.g. 9999, plus `plan = 'elite'`)
- Approval trigger (`sync_core_payment_approval`) also upserts `blind_date_profiles` with `paid = true`, `plan = <core plan>`, and the mapped `chats_remaining` (added, not overwritten, so re-approvals stack).
- Blind Date-only plans (`bd_starter`/`bd_premium`/`bd_elite`) are deprecated. Existing rows keep working; no new ones are created.

### 5. Dashboard integration
- Dashboard sidebar/mobile header already has the Blind Date toggle — keep it, and add a "Blind Date" summary card on Discover showing chats remaining + a "Enter Blind Date" button that routes into the existing BD experience.
- Pricing page + landing pricing block updated to advertise "Includes Blind Date access" on every tier with the mapped chat count.

## Admin console changes

Merge `Main App Admin` and `Blind Date Admin` into one console (drop the top-level toggle in `Admin.tsx`). New tab structure:

1. **Dashboard** — combined KPIs:
   - Total users, women vs men breakdown
   - Active subscriptions by plan
   - Pending payments (all features)
   - BD sessions today / this week, mutual continues, average chat length
   - Revenue this month (from approved `payment_submissions`)
2. **Users** — unified table with columns: name, gender, city, plan, payment status, joined, last active, **BD chats remaining**, **BD sessions used**, **BD extended completed?**, actions (impersonate, suspend, notes, grant chats).
3. **Payments** — every `payment_submissions` row with feature filter (core / blind_date / unlock_interest).
4. **Blind Date ops** — the deep tools that don't fit user rows: dummy accounts, question library CRUD, live sessions/matches viewer, template messages.
5. **Content & comms** — blog, notifications, announcements, tickets, leads (existing tabs collapsed under one heading).

Edge function `admin-data` gets:
- A new `users_unified_list` action that joins `profiles`, `user_roles`, `blind_date_profiles`, latest `payment_submissions`, and BD session counts.
- A new `dashboard_combined_metrics` action returning the KPIs above in one call.
- A new `grant_bd_chats` action (admin-only) so support can top up a specific user without a fake payment.

## Data model changes

Single migration:

- Update `sync_core_payment_approval()` to also upsert `blind_date_profiles` (paid, plan, chats_remaining += mapped amount, updated_at).
- Add helper `public.bd_chats_for_core_plan(plan text) returns int`.
- Backfill: for every currently-active core-paid user missing a `blind_date_profiles` row, insert one with the mapped chats (idempotent).
- Optional: mark deprecated BD-only plan rows in a comment; no destructive changes to existing data.

No table structure changes are required beyond the trigger + helper.

## Files touched

**Delete / retire**
- `src/features/blind-date/pages/PaymentPage.tsx`
- `src/features/blind-date/pages/PaymentReview.tsx`
- `src/features/blind-date/pages/ExtendedSetup.tsx` (logic moves into `Onboarding.tsx`)
- `src/features/blind-date/pages/Premium.tsx`
- `src/features/blind-date/lib/plans.ts` (or reduce to a mapping helper only)

**Edit**
- `src/App.tsx` — remove deleted routes, simplify BD routes.
- `src/features/blind-date/components/BlindDateGate.tsx` — gate on `account_status='active'` only.
- `src/features/blind-date/pages/Landing.tsx` — new CTAs.
- `src/pages/Onboarding.tsx` — append optional Phase B questions step; save via `save_my_bd_answers` + `save_my_bd_extended`.
- `src/pages/dashboard/Discover.tsx` — add BD summary card.
- `src/components/landing/Pricing.tsx`, `src/pages/PricingPage.tsx` — mention BD access per tier.
- `src/pages/Admin.tsx` — remove toggle, wire unified tabs.
- `src/components/admin/blind-date/BlindDateAdminConsole.tsx` — split: user-facing columns move into the main Users tab; keep this file only for dummy accounts / question library / live sessions.
- `src/components/admin/AdminPayments.tsx`, `AdminPaymentHistory.tsx` — add feature filter.
- `supabase/functions/admin-data/index.ts` — new actions listed above.

**New**
- `supabase/migrations/<ts>_unify_core_and_bd_entitlement.sql`
- `src/components/dashboard/BlindDateEntryCard.tsx`
- `src/components/admin/UnifiedUsersTable.tsx`
- `src/components/admin/DashboardCombinedMetrics.tsx`

## Rollout order

1. DB migration (trigger update + helper + backfill).
2. Edge function `admin-data` new actions.
3. Frontend: gate simplification, route removal, landing + onboarding updates, dashboard BD card.
4. Admin console consolidation.
5. Pricing copy update.
6. Manual smoke: signup → onboarding → payment → admin approves → dashboard → toggle BD → chat.

## Out of scope

- No changes to payment provider or UPI flow.
- No changes to women's free access (they continue to receive full access + BD via the existing trigger).
- Existing BD-only payment submissions in the database are left untouched.
