I’ll fix the persistent loading/redirect loop by making the auth gate refresh its profile state when the route changes and by removing competing navigation between Onboarding and the payment route guard.

Planned changes:

1. Update `src/components/auth/RequireAuth.tsx`
   - Reset `checking` to `true` whenever the current user or route changes.
   - Refetch the profile gate on route changes, not only when the session user changes.
   - Clear stale `gate` state when there is no session.
   - Add safe error handling so a failed profile lookup does not leave the page stuck on the spinner forever.
   - Keep all redirects declarative with `<Navigate />`.

2. Update `src/pages/Onboarding.tsx`
   - After `finish()` successfully marks `onboarded: true`, navigate directly to `/payment` without the delayed `setTimeout`.
   - Avoid leaving `saving`/loading state active during navigation.
   - Optionally add a small query flag or state signal if needed so the payment guard refetches immediately after completion.

3. Review `src/pages/Payment.tsx`
   - Ensure its own hydration state always resolves in every branch.
   - Keep the payment page from doing unnecessary redirects that fight with `RequireAuth`.

Expected result:

```text
Finish onboarding
→ profile updates to onboarded=true
→ navigate to /payment
→ RequireAuth refetches profile for /payment
→ gate sees onboarded=true
→ Payment page renders
```

I will not change the database schema for this fix. The issue is in frontend guard state/navigation, not RLS or tables.