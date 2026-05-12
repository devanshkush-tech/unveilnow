## Grant admin role to devanshkush@gmail.com

Found the account: user id `3cc8cbff-27ef-48ec-822a-56c302688f3a`, currently no admin role.

### Action
Insert one row into `user_roles`:

```sql
INSERT INTO public.user_roles (user_id, role)
VALUES ('3cc8cbff-27ef-48ec-822a-56c302688f3a', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;
```

### Result
After this runs, signing in as `devanshkush@gmail.com` and visiting `/blind-date` will pass the `BlindDateGate` (which checks `useIsAdmin`) and show the full Blind Date flow instead of the "Coming soon" screen. The same account will also gain access to `/admindashboard`.

No code changes are needed.