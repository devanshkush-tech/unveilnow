## Scope

This is a large platform-wide change touching pricing, subscription/match validation, in-app + email notifications, an admin notification panel, the ₹99 add-on flow, and seed-profile tooling. I'll split it into clear phases. Approve and I'll execute end-to-end.

---

## Phase 1 — Pricing update (everywhere)

Replace all old prices with the new plans:

- **Starter** — ₹149 / week — "Get going" — 5 mutual matches/week, unlimited likes, standard visibility, voice intros & prompts
- **Premium** — ₹299 / month — "Most loved" — 10 mutual matches/month, unlimited likes, 2× visibility, priority matching, see who liked you
- **Elite** — ₹399 / month — "Hand-picked" — unlimited mutual matches, unlimited likes, 4× visibility, concierge support

Centralize plan config in a single source of truth: `src/lib/plans.ts` (id, name, badge, priceLabel, priceInr, billingPeriod `week|month`, matchLimit `number|null`, features[]). Refactor all of these to read from it:

- `src/components/landing/Pricing.tsx`
- `src/lib/payment.ts` + `src/pages/Payment.tsx`
- `src/pages/PricingPage.tsx`
- Signup/onboarding plan picker
- Admin plan assignment UI
- Any other hardcoded `₹99 / ₹199 / ₹299` references (sweep with ripgrep)

Note: Blind Date plans (₹199/₹299/₹499) stay separate — they live in `src/features/blind-date/lib/plans.ts` and are unchanged.

---

## Phase 2 — Subscription & match validation

Database migration:

- Add to `profiles`: `plan_period_end timestamptz` (computed on plan assignment: +7 days for Starter, +30 days for Premium/Elite).
- Update `match_limit_for_plan(plan)` → 5 / 10 / NULL (already correct values; keep semantics but interpret period as weekly for Starter, monthly for Premium).
- Update `refresh_match_period(_user_id)` to roll over based on plan: 7 days for Starter, 30 days for Premium/Elite.
- Update `get_my_match_usage()` to return `plan_period_end` and use the correct period length.
- Update `create_match_on_mutual_like()` — already enforces caps correctly, just needs to use the per-plan refresh.

Frontend:

- Likes/interests stay unlimited — no UI change.
- Mutual match capped server-side (already enforced by trigger). When the cap is hit, show a clear "Renew/Upgrade" prompt on Discover/Matches (`src/components/dating/MatchUsageBanner.tsx` + `EmptyState`).
- Surface plan info in dashboard: plan name, start date, expiry, days remaining, matches used / limit.

Admin panel:

- In `AdminPayments` / user detail: show plan, plan_started_at, plan_period_end, days remaining, matches_used, limit.
- Allow admin to change plan (writes `selected_plan`, `plan_started_at=now()`, recomputes `plan_period_end`, resets `matches_used_this_period=0`).

---

## Phase 3 — ₹99 "Unlock Interest" add-on

- New table `interest_unlocks (id, user_id, target_user_id, payment_id, created_at)` with RLS (user views own).
- New `payment_submissions.feature` value: `unlock_interest` (column already exists). Amount ₹99.
- New page `/unlock-interest/:fromUserId` — shows a UPI payment screen (reuses `src/pages/Payment.tsx` styling) and creates a `payment_submissions` row with `feature='unlock_interest'` and a metadata column carrying `target_user_id`. Add `payment_submissions.target_user_id uuid` (nullable) for this.
- After admin approves, webhook/admin-data inserts an `interest_unlocks` row → user can view the profile that liked them.
- Notification "Someone showed interest in your profile. Unlock to view who it was." links here. Only fires from a real `interest_requests` / `likes` insert (trigger).

---

## Phase 4 — In-app notifications

Database:

```sql
create table notifications (
  id uuid pk, user_id uuid not null,
  type text not null, -- like|match|profile_approved|payment_success|plan_expiring|announcement|interest|unlock_interest_cta
  title text not null, body text not null,
  cta_text text, cta_link text,
  read_at timestamptz, created_at timestamptz default now()
);
-- RLS: user sees/updates own; admin manages all
```

Triggers that auto-insert notifications:

- on `likes` insert → notify `liked_id`
- on `matches` insert → notify both
- on `interest_requests` insert → notify `receiver_id` with unlock CTA
- on `payment_submissions.status='approved'` → notify user
- on `profiles.account_status` → 'active' transition → notify
- daily cron-style check (or computed on read) for `plan_expiring_soon` (≤3 days)

Frontend:

- `<NotificationBell />` in `Navbar` with unread count + dropdown.
- `/notifications` page with full list, mark-as-read, CTA buttons.
- Realtime subscription on `notifications` table for the current user.

---

## Phase 5 — Email notifications

Use Lovable Email (auth emails already work). Scaffold transactional email infra and add a `send-notification-email` edge function called from the same DB triggers / edge functions for:

- Signup confirmation (already handled by Supabase auth)
- Payment submitted / approved
- Match received
- Like / interest received
- Plan expiring soon
- Admin announcements

This requires an email domain. If none is configured, I'll prompt setup before scaffolding.

---

## Phase 6 — Admin notification panel

New tab `AdminNotifications.tsx` in admin:

- Compose form: title, message, type, optional CTA text/link, in-app toggle, email toggle.
- Audience filters: single user (search), all users, by plan, by city, by gender.
- Submit → edge function `admin-send-notification` resolves audience, bulk-inserts `notifications`, queues emails.
- History table reading from new `notification_campaigns` table: title, audience filter (jsonb), sent count, sent_at, sent_by, email_status.

---

## Phase 7 — Improve seed profile creation

`AdminCreateProfile` already exists — extend it to support:

- name, age, gender, city, bio, prompts, interests, relationship intent, voice intro upload, photo upload, visibility toggle.
- Sets `profiles.is_admin_created=true` (column already exists) — internal only, never exposed to regular users.
- Activate/deactivate via `account_status`.

No fake notifications, no fake messages — these are normal-looking profiles flagged internally.

---

## Phase 8 — Sweep & test

- ripgrep for old amounts (`₹99|₹199` outside Blind Date) and replace.
- Manually verify each flow per the testing checklist in the request.

---

## Technical notes

- All plan checks centralized in `src/lib/plans.ts` (frontend) + `match_limit_for_plan` / `get_my_match_usage` (DB).
- RLS on every new table; admin-only writes for `notification_campaigns`; user-scoped writes for `interest_unlocks` is admin-only after payment approval.
- Email setup is conditional on an email domain being configured — I'll surface the setup dialog if missing.
- This is roughly 5–7 migrations and ~25 file edits/creates. I'll batch sensibly and verify build after each phase.

---

## Open question

**Email domain** — do you already have a sender domain configured for Unveil, or should I run the setup dialog when I reach Phase 5? (Phases 1–4, 6–8 don't depend on it and can ship first either way.)
