## Why phones aren't showing

Two independent bugs combine to wipe out the phone column for every new user.

### Bug 1 — Phone never lands in `profiles`
`src/pages/Signup.tsx` calls `supabase.from("profiles").update({ phone })` immediately after `supabase.auth.signUp()`. When email confirmation is required, there is no session yet, so the update is silently blocked by RLS (`id = auth.uid()` fails because `auth.uid()` is null). Confirmed: the last 7 profiles in the DB all have `phone = NULL`, while their `signup_leads` rows hold the phone correctly.

### Bug 2 — Admin merge short-circuits on empty string
In `supabase/functions/admin-data/index.ts`:

```ts
phone: u.phone ?? '',                                // auth phone → '' (not null)
phone: p.phone ?? a?.phone ?? lead?.phone ?? '',     // '' is truthy for ??, so lead.phone is never reached
```

So even when the lead row has the phone, the admin response sends `''`.

## Fix

### 1. Persist phone via the auth trigger (no RLS dependency)
Update `handle_new_user()` to read `phone` out of `raw_user_meta_data` (Signup.tsx already passes it there) and write it on the initial profile insert. This runs as `SECURITY DEFINER`, so it works regardless of session state.

Migration:
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', NEW.raw_user_meta_data ->> 'name'),
    NULLIF(NEW.raw_user_meta_data ->> 'phone', '')
  );
  RETURN NEW;
END; $$;
```

Also backfill existing profiles from `signup_leads` so older accounts get their phone too:
```sql
UPDATE public.profiles p
SET phone = l.phone
FROM public.signup_leads l
WHERE p.phone IS NULL
  AND l.auth_user_id = p.id
  AND l.phone IS NOT NULL;
```

### 2. Remove the doomed client-side update
In `src/pages/Signup.tsx`, drop the `await supabase.from("profiles").update({ phone })` block — the trigger now handles it.

### 3. Fix the admin merge fallback
In `supabase/functions/admin-data/index.ts`:
- Line 138: `phone: u.phone ?? ''` → `phone: u.phone || null`
- Line 172: change to `phone: p.phone || a?.phone || lead?.phone || ''` so empty strings fall through.

### Result
- New signups: phone written by the trigger immediately on account creation.
- Existing users: backfilled from leads.
- Admin list: even if a profile is somehow missing a phone, the lead's phone is shown.