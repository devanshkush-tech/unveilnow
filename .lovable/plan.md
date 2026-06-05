# Free access for women

Whenever a user's `profiles.gender = 'Woman'`, the app treats them as a fully paid, active member on both the main app and Blind Date. They never see `/payment`, `/payment/review`, `/pricing` CTAs, the Blind Date payment page, or any "upgrade" UI.

## 1. Database — auto-activate female accounts (migration)

Create a trigger on `public.profiles` (INSERT and UPDATE of `gender`) that, when `gender = 'Woman'`, sets:

- `account_status = 'active'`
- `payment_status = 'approved'`
- `selected_plan = 'elite'`, `plan = 'elite'`
- `plan_started_at = now()`, `plan_period_end = now() + interval '100 years'`, `plan_expires_at = same`
- `matches_used_this_period = 0`, `match_period_start = now()`

And mirrors to `blind_date_profiles` (upsert by `user_id`): `paid = true`, `plan = 'elite'`, `chats_remaining = 9999`.

This guarantees backend gates (RequireAuth's profile gate, `BlindDateGate`) pass without any payment record. Run a one-time backfill in the same migration for all existing rows where `gender = 'Woman'`.

## 2. Onboarding finish — skip `/payment`

In `src/pages/Onboarding.tsx` (line ~398), after marking `onboarded = true`, branch on `gender`:

- `gender === 'Woman'` → `navigate('/dashboard')` (trigger has already activated them).
- otherwise → existing `navigate('/payment')`.

Also at the hydrate redirect (line ~132): if `prof.gender === 'Woman'` skip the `/payment` redirect and send to `/dashboard`.

## 3. RequireAuth — no change needed

Because the trigger sets `account_status='active'` + `payment_status='approved'`, the existing gate in `src/components/auth/RequireAuth.tsx` passes automatically. No code change.

## 4. Hide payment/upgrade UI for women

Add a small helper `useIsFreeAccess()` (reads `profiles.gender` via existing `useAuth`/profile fetch, returns `true` for `Woman`). Use it to:

- **`src/pages/Payment.tsx` and `src/pages/PaymentReview.tsx`**: if free-access, redirect to `/dashboard` immediately.
- **`src/components/landing/Pricing.tsx`** + **`src/pages/PricingPage.tsx`**: if free-access, replace the plan grid CTA with a single "You have full free access" card linking to `/dashboard`. Public (logged-out) view stays unchanged so marketing pricing still shows.
- **Dashboard upgrade prompts** — `src/components/dating/MatchUsageBanner.tsx` and any "Upgrade" CTA: hide for free-access.
- **Blind Date**: `src/features/blind-date/pages/PaymentPage.tsx` and `PaymentReview.tsx` redirect free-access users to `/blind-date/onboarding` (or matching). `BlindDateGate` already passes because trigger set `paid=true`.
- **Premium / "out of chats"** screens (`src/features/blind-date/pages/Premium.tsx`): hide upgrade CTAs for free-access.

## 5. Floating signup CTA / promo popups

`FloatingSignupCTA`, `PromoPopup`, and any "Upgrade now" notification: gated by `useIsFreeAccess()`.

## Technical notes

- The trigger is the source of truth — every frontend hide is defense-in-depth so users never see a dead-end payment screen.
- `gender` is set on Onboarding step 0; the trigger fires on that update, so by the time the user reaches the finish step they're already active.
- Admin "Mark paid" flows and Stripe/manual payment paths are untouched — they just become no-ops for women since they're already active.
- No changes to pricing copy on the public landing page (marketing remains accurate; the free-for-women policy is enforced after signup).

## Out of scope

- Refunding women who previously paid (one-off, can do separately on request).
- Showing a "Free for women" badge on the marketing pricing page (can add if you want).
