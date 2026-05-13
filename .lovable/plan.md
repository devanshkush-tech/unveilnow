# Blind Date Revamp Plan

A focused rebuild of the Blind Date feature: real-user-only matching, mandatory auth → onboarding → payment, richer compatibility questionnaire, chat-credit-based plans, and admin controls.

## 1. Pricing & Credits Model

Replace current Blind Date plans with chat-based credits:

| Plan    | Price | Chats |
|---------|-------|-------|
| Starter | ₹199  | 10    |
| Premium | ₹299  | 30    |
| Elite   | ₹499  | 100   |

- A "chat" = one mutual blind-date match started.
- Deduct **only on mutual match** (decision_a = continue AND decision_b = continue). Likes/rejects do not deduct.
- When credits hit 0, user must buy another plan to get new matches. Existing chats remain accessible.

## 2. Database Changes (single migration)

Update `blind_date_profiles`:
- Add `chats_remaining int not null default 0`
- Add `paid boolean not null default false`
- Add `extended_answers jsonb not null default '{}'` (post-payment detailed questions)
- Add `extended_completed boolean not null default false`
- Keep `plan`, `sessions_used`, `sessions_limit` for back-compat but stop relying on them.

Update `payment_submissions`:
- Already has `feature` column → use `feature='blind_date'` and `plan in ('bd_starter','bd_premium','bd_elite')`.

New helper RPC `bd_consume_chat(_user_id uuid)` (security definer): atomically decrement `chats_remaining` if > 0; returns boolean.

New trigger on `blind_date_sessions` AFTER UPDATE: when both decisions become 'continue' and status flips to 'matched', call `bd_consume_chat` for both users (or just the initiating side — decide: deduct one credit per user per mutual match).

Admin RPC `admin_set_bd_credits(_user_id uuid, _chats int, _plan text)` for manual adjustments.

## 3. Remove AI/Bot Chats

- Delete mock match fallback in `src/features/blind-date/store.ts` (`MOCK_MATCHES`, `pickMatch`).
- Audit `bd-match` edge function and Chat page — remove any auto-generated bot replies. Only show messages from `blind_date_messages` table written by a real opposite participant.
- If no real opponent is available, show a "Searching for a match…" waiting state (poll every few seconds) instead of fabricating a partner.
- Admin-created profiles in admin panel should be matchable (real auth users created via existing `AdminCreateProfile`). Add a flag/section so admin can also create dedicated Blind Date profiles answering the questionnaire on behalf of a user.

## 4. Auth-Gated Onboarding

Wrap all `/blind-date/*` setup routes in `RequireAuth`:
- `/blind-date` landing remains public (marketing).
- `/blind-date/setup`, `/matching`, `/chat`, `/decision`, `/matched`, `/chat/full` → require auth + bdPaid.
- Replace current `BlindDateGate` (admin-only) with `BlindDateAccessGate` that:
  1. If not logged in → redirect `/login?redirect=/blind-date/setup`.
  2. If logged in but `extended_completed=false` → `/blind-date/setup`.
  3. If logged in and onboarding done but `paid=false` or `chats_remaining=0` → `/blind-date/payment`.
  4. Otherwise allow access.

Admin bypass retained.

## 5. Onboarding Questions

Two phases:

**Phase A — Compatibility (existing `BD_QUESTIONS`)**: shown after signup, before payment. Trimmed to lightweight vibe questions (keep current set).

**Phase B — Detailed profile (NEW, shown immediately after payment success)**: 
salary range, profession, education, smoking, drinking, relationship goals, religion, height, fitness, sleep schedule, introvert/extrovert, weekend, travel, languages, family preferences, future goals, preferred age range, preferred city, intention seriousness, hobbies.

Stored in `extended_answers`. Multi-step mobile-first wizard with progress bar and smooth transitions (framer-motion already used). Save-as-you-go via `save_my_bd_answers` RPC variant `save_my_bd_extended`.

## 6. Payment Flow

New `/blind-date/payment` page using existing manual-UPI pattern (`UPI_ID`, WhatsApp screenshot upload) — mirror `src/pages/Payment.tsx` + `PaymentReview.tsx`:
- Show 3 BD plans with credit counts.
- Submit → insert into `payment_submissions` with `feature='blind_date'`, `plan='bd_*'`.
- Redirect to `/blind-date/payment/review` (already exists — update to BD plans).
- On admin approval, set `blind_date_profiles.paid=true`, `chats_remaining = plan credits`, `plan = bd_*`.

Premium messaging copy on payment page:
> "We keep Blind Date exclusive and serious by charging a small access fee."
> "Quality over endless swiping."

## 7. Admin Panel

Extend `src/components/admin/AdminBlindDate.tsx`:
- Table of all BD users: name, email, plan, chats remaining, paid status, last session.
- Inline actions: edit credits, change plan, reset count, mark paid/unpaid.
- Approve/reject BD payment_submissions (filter `feature='blind_date'`) — reuse `AdminPayments` with feature filter chip.
- "Create BD Profile" button → opens form to create a real auth user + pre-fill BD answers (extends `AdminCreateProfile`).

## 8. Routing & Validation

- All BD routes server-validate via RLS + edge functions check `paid=true AND chats_remaining > 0` before issuing match.
- `bd-match` edge function rejects with 402 if not paid / no credits.
- `BlindDateAccessGate` enforces client-side; backend enforces truth.
- After signup OAuth callback, if `?redirect=` param present, send user there.

## 9. UI Polish

- Reuse existing `GlowButton`, `BlindDateLayout`, theme.css.
- Add credits badge in `BlindDateLayout` header: "X chats remaining".
- Subtle framer-motion transitions between onboarding steps.
- Banner messaging across landing/setup/payment with the quality-focused taglines.

## Technical Notes (for engineers)

- Migration adds columns + RPCs + trigger; no data backfill required (defaults).
- `payments-webhook` / manual payment approval path in `admin-data` edge function must branch on `feature` to credit BD vs core plan.
- Update `src/features/blind-date/lib/plans.ts` to new credit-based plan list.
- Update `src/features/blind-date/store.ts` to remove mock data; expose `chatsRemaining`.
- New hook `useBlindDateProfile` reads `get_my_bd_profile` (extend RPC to return new fields).

## Out of Scope

- Real-time matchmaking algorithm changes (keeps current vector approach).
- Refunds / partial credit returns.
- Email notifications for credit exhaustion (can follow later).
