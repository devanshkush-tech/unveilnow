## Goal

Move the admin console to `https://unveilnow.in/admindashboard`, locked to the verified account `Devanshkush@gmail.com` via a server-enforced admin role. No passwords are ever stored in code.

## Security note (please read)

You shared a real password in chat. That message is now in conversation history.

- Treat that password as compromised. Change it from the login page after we wire this up.
- The admin gate uses your Supabase `user_roles` table + `has_role()` RLS function. Anyone trying to access `/admindashboard` who is not signed in (or who is signed in without the `admin` role) will be bounced to login or back to the dashboard. The check happens both client-side (route guard) and server-side (RLS on every admin query).

## What I'll change

### 1. New route at `/admindashboard`
- Add `<Route path="/admindashboard">` in `src/App.tsx`, wrapped in the existing `RequireAdmin` guard.
- Old `/admin` becomes a redirect to `/admindashboard` so any old links keep working.

### 2. Promote your account to admin (one-time DB action)
Run a single SQL statement that finds the user id for `devanshkush@gmail.com` in `auth.users` (case-insensitive) and inserts a row into `public.user_roles` with role `admin`, idempotent via `ON CONFLICT DO NOTHING`. If the email is not found, the migration raises a clear notice and does nothing — meaning the account hasn't been signed up / the email is spelled differently.

### 3. Polish the existing admin console
The console already has Overview / Funnel / Users / Prompts / Announcements / Moderation. Small refinements while we're in there:
- Show the signed-in admin's email in the header (instead of just the word "Admin"), with a Sign out button.
- Add a "Promote to admin" action on the Users tab so you can grant admin to other accounts later without touching the database.
- Add a "Mark resolved" action on the Moderation tab (updates `reports.status`).
- Apply the same skeleton/empty-state polish used elsewhere.

### 4. What I will NOT do
- I will not store `Devanshkush@gmail.com` or the password in any file, env var, or secret. Auth happens through the normal login form.
- I will not bypass email verification or RLS. If the account isn't email-verified yet, the login will be blocked by Supabase as designed.

## How you'll use it

1. After I deploy, go to `https://unveilnow.in/login` and sign in with your existing email + password.
2. Navigate to `https://unveilnow.in/admindashboard`. The admin role check will pass and you'll see the console.
3. Change your password from inside the app for safety, since the old one was shared in chat.

## Files touched

- `src/App.tsx` — add `/admindashboard` route, redirect `/admin`.
- `src/pages/Admin.tsx` — header polish, sign-out button, promote-user action, resolve-report action.
- New migration — grant `admin` role to the user with email `devanshkush@gmail.com`.
