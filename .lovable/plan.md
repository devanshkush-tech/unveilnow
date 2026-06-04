# Admin split: Main App ↔ Blind Date

Add a top-level toggle in `/admindashboard` to switch between two consoles. Keep the existing main admin intact and move all Blind Date features into a new dedicated console with its own sub-navigation.

## 1. Mode toggle (Admin shell)

In `src/pages/Admin.tsx`:
- Add a segmented toggle in the header: **Main App Admin** | **Blind Date Admin** (state persisted in `localStorage`).
- When **Main App** is active → render existing tabs MINUS the current `✦ Blind Date` tab (remove it from `TabsList` + content).
- When **Blind Date** is active → render new `<BlindDateAdminConsole />` (no main-app tabs visible).

## 2. Blind Date Admin Console

New file `src/components/admin/blind-date/BlindDateAdminConsole.tsx` with its own `Tabs`:
`Dashboard · Users · Dummy Accounts · Questions · Packages · Payments · Matches · Notifications`.

### 2a. Dashboard
Stats cards: total BD users, paid users, trial users, revenue (sum of approved `payment_submissions` where `feature='blind_date'`), matches used (sum `sessions_used`), pending payments, and a city-wise users table (joining `blind_date_profiles` → `profiles.city`).

### 2b. Users
Table of BD users (join `blind_date_profiles` + `profiles` + `auth.users` email via existing admin edge function). Columns: name, phone, email, gender, age, city, package, payment status, trial status, matches used, matches remaining. Row actions: View, Edit, Approve (mark paid), Delete, Assign package.

### 2c. Dummy Accounts
Form to create a fake account (name, phone, email, gender, age, city, trial duration days, trial match credits, expiry date, notes). Stored as a real `auth` user via the admin edge function so it's indistinguishable from real users; flagged internally via `profiles.is_admin_created=true` (already exists) plus a new `blind_date_profiles.notes` column. No "dummy" label is shown anywhere user-facing.

### 2d. Questions
CRUD + reorder for a new `blind_date_questions` table (id, key, prompt, type, options jsonb, position, active). Admin-only RLS. Replaces the current hardcoded `questions.ts` list at runtime when present (fallback to hardcoded).

### 2e. Packages
Backed by `app_settings` key `blind_date_packages` (jsonb array). Defaults seeded: ₹199/10, ₹299/30, ₹499/100. Admin can edit price, matches, enable/disable, and assign manually to a user (writes `blind_date_profiles.plan + chats_remaining + paid`).

### 2f. Payments
Reuses existing `payment_submissions` filtered to `feature='blind_date'` with approve/reject + notes (already supported). Adds a "Mark user paid" quick action.

### 2g. Matches
Lists `blind_date_sessions`. Create manual match (already exists in current AdminBlindDate — moved here). Approve/Reject (sets status). Refund: increment both users' `chats_remaining` by 1.

### 2h. Notifications
Reuses `AdminNotifications` audience resolver, extended with BD audiences: trial users, paid users, city-wise, payment pending. Writes to existing `notifications` table.

## 3. Database changes (one migration)

- `blind_date_questions` table + admin RLS + GRANTs.
- `blind_date_profiles`: add `notes text`, `trial_expires_at timestamptz`, `is_trial boolean default false`.
- Seed `app_settings` row `blind_date_packages` if missing.

## 4. Edge function additions

Extend `supabase/functions/admin-data/index.ts` with actions: `bd_metrics`, `bd_list_users`, `bd_create_dummy`, `bd_assign_package`, `bd_delete_user`, `bd_refund_match`, `bd_mark_paid`. All gated by existing admin session check.

## Out of scope / preserved
- Existing main-app admin tabs (Users, Payments, Payment history, Tickets, Chemistry, Moderation, Notifications) unchanged.
- BD user-facing flows (`/blind-date/*`) untouched aside from picking up question/package overrides from DB when present.

## Technical notes
- All new components in `src/components/admin/blind-date/*`.
- New types added to `src/integrations/supabase/types.ts` after migration runs.
- Existing `src/components/admin/AdminBlindDate.tsx` deleted after its features are migrated.
