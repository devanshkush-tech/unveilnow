## What the user is seeing

For some users, after going through the onboarding steps, the payment page never appears — they land back on `/onboarding` step 1 instead.

## What I found

I logged in attempt for `devanshkush@gmail.com` failed with HTTP 400 (wrong credentials), so I diagnosed against the database and code instead.

DB state for that user: `onboarded=false`, `onboarding_step=0`, `updated_at == created_at`. Looking at the last 25 signups, several users sit at the same default — they signed up but their profile never moved from step 0, even though they "filled details." Others reach `onboarded=true, step=5, payment_status=none` and never reappear (abandoned at payment).

Reading the code, there are several real failure modes that all manifest as "onboarding starts again":

1. `Onboarding.persistStep()` calls `supabase.from('profiles').update(...)` and `.delete()/.insert()` on prompts/interests **without checking the returned `error`**. If RLS or a transient network blip silently rejects the write, the local UI advances but nothing was saved. On the next visit the profile still says `onboarding_step=0` and the user restarts.
2. `finish()` updates `onboarded=true` and immediately `navigate('/payment')`. `RequireAuth` then runs a fresh `SELECT onboarded` against Postgres. On a slow network or a token refresh in flight, the gate fetch can return `data=null` / error → `RequireAuth` falls back to `onboarded:false` and bounces to `/onboarding`. Onboarding then sees `onboarded=true` → bounces to `/payment` → loop / flicker that some users abandon.
3. `RequireAuth`'s gate fetch has no retry. A single transient failure permanently mis-classifies the user for that render.
4. The session-confirm link from email opens `/onboarding` in a new tab. If the user already had onboarding open in another tab and finished there, the second tab can re-write older state with stale form values. Today there is no "already done — go to payment" guard at the top of `next()`.

## Plan

### 1. Make profile writes loud, not silent (`src/pages/Onboarding.tsx`)

- In `persistStep`, capture and check `{ error }` for every `update`/`delete`/`insert`. On error: `throw` so the existing `next()` try/catch surfaces a toast and **does not advance** the local `step` state. This stops the "filled details but nothing saved" class of bug.
- In `finish()`, also check the error from each storage upload + photos insert (already done) and the final profile update (already done) — keep, but add structured `console.error('[onboarding] finish failed', { step: 'profiles.update', error })` so we can trace it in real users via console.

### 2. Confirm the write before navigating (`src/pages/Onboarding.tsx`)

After `update({ onboarded: true })` succeeds, re-read the row with `.select('onboarded').eq('id', user.id).maybeSingle()` and only `navigate('/payment')` once it returns `onboarded=true`. Retry the read up to 3× with a 250 ms back-off. If it still reads false, surface a toast ("Saved, but couldn't confirm — please refresh") instead of bouncing the user.

### 3. Make `RequireAuth` resilient to a single bad fetch (`src/components/auth/RequireAuth.tsx`)

- On gate-fetch error or `data=null`, retry once after 400 ms before deciding.
- If the retry also fails, do **not** set `onboarded:false` blindly — keep the previous gate value if we have one, and only fall back to a redirect if there is truly no prior data. This stops a single 401 during token refresh from triggering the `/payment → /onboarding` bounce.
- Add `console.warn('[RequireAuth] gate fetch failed, retrying', { path, error })` so we see this happening for real users.

### 4. Add a "skip ahead" guard at the top of `Onboarding` (`src/pages/Onboarding.tsx`)

The hydrate effect already redirects when `prof.onboarded === true && !editMode`. Reinforce it by also redirecting when `account_status === 'active'` regardless of `onboarded`. This covers users who paid then somehow re-land on `/onboarding`.

### 5. Diagnostic instrumentation (temporary)

Add `console.info('[onboarding] step advance', { from, to, savedOk })` and `console.info('[RequireAuth] gate', { onboarded, account_status, payment_status, path })` so the next time a user reports this we can pull their console via the session-replay/console tools and confirm which step lost the write. We can remove these once the report rate drops.

### 6. Out of scope (intentionally not changing)

- The `Payment.tsx` hydration flow already handles `account_status='active' → /dashboard` and `payment_status='pending' → /payment/review`. No change.
- The signup → email-verify → `/onboarding` redirect chain is correct. No change.
- Database schema, triggers, and RLS policies — no migration needed; the RLS policies already allow the user to update their own row. The fix is in the client.

## Technical details

- Files touched: `src/pages/Onboarding.tsx`, `src/components/auth/RequireAuth.tsx`. No backend migration.
- All Supabase calls already use the typed client; the change is to switch from `await supabase.from(...).update(...)` to `const { error } = await ...; if (error) throw error;`.
- The read-back-after-write is a `maybeSingle()` with `.eq('id', user.id)` — same RLS path the rest of the page uses.
- The `RequireAuth` retry uses an in-effect `setTimeout` cleared by the `cancelled` flag that is already in the file.

## How we will verify

1. After deploy, sign up a fresh test user, complete all 6 steps, confirm landing on `/payment` with no flicker.
2. In DevTools, throttle to "Slow 3G" and repeat — gate retry should swallow the slow fetch instead of bouncing.
3. Open `/onboarding` in two tabs, finish in tab A, switch to tab B and click "Next" — tab B should detect `onboarded=true` on hydrate and redirect, not overwrite.
4. Query `profiles` for new signups over the next 24 h — the share stuck at `onboarded=true, payment_status=none` should match real abandonment, and we should see no new users with `onboarding_step` going *backwards*.
