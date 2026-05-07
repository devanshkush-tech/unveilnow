## Goal

Keep a single Google Sheet always in sync with Unveil user data — one row per user, keyed by `user_id`, updating live whenever anything important changes (signup, profile, onboarding, payment, status, last active).

## Approach

Use the simplest, most reliable path that satisfies your requirements:

```text
Supabase (profiles / payment_submissions / signup_leads)
        │  on insert/update
        ▼
Postgres trigger → pg_net HTTP POST
        ▼
Edge Function: sync-user-to-sheets  (server-side, holds secrets)
        ▼
Zapier / Make webhook (Catch Hook)
        ▼
Google Sheets "Lookup row by user_id" → Update row, else Create row
```

Why Zapier/Make instead of direct Google Sheets API:
- No per-user OAuth, no token refresh code, no Google API keys in our code.
- You configure the Zap once: Webhook → Lookup Spreadsheet Row (user_id) → Update/Create Row.
- Matches exactly what you described in "Suggested approach".

Direct Google Sheets API via the connector is also possible, but it would sync from *your* Google account only and adds OAuth complexity. The webhook approach is cleaner for production.

## What gets built

### 1. Database — change-detection triggers

A new function `notify_user_sync(user_id)` that:
- Builds the full user payload (joins `profiles`, `auth.users` for email/email_confirmed_at, latest approved `payment_submissions`, aggregated `profile_interests`, `profile_prompts`).
- Calls `net.http_post` to the edge function with the `user_id` and an HMAC signature.
- Writes a row to a new `sheet_sync_log` table (status: pending/success/failed, attempts, last_error, payload_hash).

Triggers (AFTER INSERT OR UPDATE) on:
- `profiles` (covers name, phone, gender, age, city, story, plan, payment_status, account_status, onboarded, last_active_at, etc.)
- `payment_submissions` (covers payment status changes + amount + completed date)
- `signup_leads` (covers pre-verification leads so they appear in the sheet too)

Triggers fire only when relevant columns actually change (compare OLD vs NEW) to avoid noisy duplicate webhooks.

### 2. Edge Function — `sync-user-to-sheets`

- Receives `{ user_id }` (and `lead_id` for unverified leads).
- Re-reads the user with service role to assemble a clean, current snapshot.
- POSTs JSON to `SHEETS_WEBHOOK_URL` (Zapier/Make Catch Hook).
- Retries on 5xx / network errors with exponential backoff (3 attempts).
- Updates `sheet_sync_log` with status + error.
- Returns 200 quickly so the DB trigger does not block writes.

Payload shape (one user per call):
```json
{
  "user_id": "...",
  "lead_id": null,
  "name": "...",
  "email": "...",
  "phone": "+91...",
  "gender": "...", "age": 28, "city": "...",
  "story": "...",
  "interests": "music, hiking, food",
  "prompts": "Q1: A1 | Q2: A2",
  "selected_plan": "premium",
  "payment_status": "paid",
  "payment_amount": "₹199",
  "payment_completed_at": "2026-05-07T...",
  "account_status": "active",
  "onboarded": true,
  "onboarding_step": 5,
  "email_verified": true,
  "created_at": "...", "last_active_at": "...",
  "utm_source": "...", "utm_campaign": "...",
  "updated_at": "..."
}
```

### 3. Retry worker (cron)

A second small edge function `sync-user-to-sheets-retry` scheduled every 5 min via `pg_cron`:
- Picks up rows in `sheet_sync_log` with `status = 'failed'` and `attempts < 5`.
- Re-invokes `sync-user-to-sheets` for each.

### 4. Admin Panel — backup controls

In `src/pages/Admin.tsx` user drawer:
- "Resync to Google Sheet" button (calls edge function for that user_id).
- A new "Sheet Sync" tab showing recent failed rows from `sheet_sync_log` with one-click retry.
- Existing CSV export stays as-is (your "backup" requirement).

### 5. Secrets

Stored as Supabase secrets (server-only):
- `SHEETS_WEBHOOK_URL` — the Zapier/Make Catch Hook URL.
- `SHEETS_WEBHOOK_SECRET` — used to HMAC-sign the payload so Zapier can verify authenticity.

Nothing Google-related ever touches the frontend.

## Zap/Scenario you set up once (outside Lovable)

In Zapier (or Make):
1. Trigger: **Webhook → Catch Hook** → copy URL → give it to us as `SHEETS_WEBHOOK_URL`.
2. Action: **Google Sheets → Lookup Spreadsheet Row** by `user_id`.
3. Path A (row found): **Update Spreadsheet Row** with the webhook fields.
4. Path B (row not found): **Create Spreadsheet Row**.

This guarantees one row per user_id (your dedup requirement) and lets you change column order in the sheet without touching code.

## Files to be created / changed

**New**
- `supabase/migrations/<ts>_sheet_sync.sql` — `sheet_sync_log` table + RLS, triggers on `profiles`, `payment_submissions`, `signup_leads`, helper function `build_user_sheet_payload(uuid)`.
- `supabase/functions/sync-user-to-sheets/index.ts`
- `supabase/functions/sync-user-to-sheets-retry/index.ts`
- pg_cron job (via insert tool, not migration) to run retry every 5 min.

**Edited**
- `src/pages/Admin.tsx` — add "Resync to Sheet" action + Sheet Sync log section.
- `supabase/config.toml` — register the two new functions if needed.

## Open items I will default on (tell me if you want different)

- Provider: **Zapier** flow described above. Make.com works identically — just give us the Make webhook URL instead.
- Throttling: trigger debounces noisy `last_active_at` updates by only firing if it changed by ≥ 5 minutes (otherwise every page view would call Zapier).
- Lead rows: unverified leads (from `signup_leads`) sync with `user_id` empty and `lead_id` set so they're visible but distinguishable in the sheet.

## What you need to do after I implement

1. Create a Zap/Make scenario as above and paste the Catch Hook URL when I ask for the secret.
2. Pre-create a Google Sheet with a header row matching the payload field names (I'll give you the exact list).

Once approved, I'll implement everything and ask you for the webhook URL at the right moment.
