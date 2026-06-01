The crash is coming from the dashboard notification bell, not the payment approval logic.

What I found:
- The on-screen error is: `cannot add postgres_changes callbacks for realtime:notifications:<user-id> after subscribe()`.
- The stack points to the `NotificationBell` inside `DashboardLayout`.
- The source is `src/hooks/useNotifications.tsx`, where the notifications realtime channel uses the same topic name for the user. With the current realtime client, duplicate/reused channels can throw if callbacks are attached after a channel is already joining/subscribed.

Plan:
1. Update `src/hooks/useNotifications.tsx` so the notification realtime channel uses a unique channel topic per mounted hook instance instead of reusing `notifications:<user-id>`.
2. Keep all `.on('postgres_changes', ...)` listeners registered before `.subscribe()`.
3. Add defensive cleanup/error handling so notification realtime can never crash the dashboard; if realtime fails, the existing manual refresh/poll-style fetch still keeps the UI usable.
4. Verify by checking the dashboard no longer throws the same console/runtime error.

No database change is needed for this specific crash.