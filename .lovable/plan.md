## Why the page just keeps loading

The Payment page (`src/pages/Payment.tsx`) is stuck in an infinite mount/unmount loop. The session replay confirms this — the loading spinner is added and removed every ~200ms.

### Root cause: Rules of Hooks violation

In `src/pages/Payment.tsx`, the component does this:

```text
useState(...)            // hooks
useEffect(title)         // hook
if (authLoading) return  // ❌ early return BEFORE later hooks
if (!user) return <Navigate /> // ❌ early return
useEffect(load profile)  // hook (sometimes runs, sometimes doesn't)
useMemo(...)             // hook
```

When `authLoading` flips from `true` → `false`, the number of hooks called changes between renders. React throws "Rendered more hooks than during the previous render", the `ErrorBoundary` catches it, re-renders, the same thing happens again → infinite loop showing only the loader.

There is also a duplicate loading guard later (`if (authLoading || hydrating)`), so the early returns on lines 38–48 are redundant anyway.

## Fix

In `src/pages/Payment.tsx`:

1. **Remove** the early `if (authLoading) return ...` and `if (!user) return <Navigate />` blocks (lines 37–48). They sit between hooks and break the rules.
2. **Guard inside the profile-loading `useEffect`** instead: `if (!user) return;` at the top of the effect, so it no-ops until auth resolves.
3. **Handle the unauthenticated case in the render path** (after all hooks have run) using the existing `authLoading || hydrating` spinner, plus a `Navigate to="/login"` when `!authLoading && !user`.

Result: hook order stays stable across renders, the loop stops, and unauthenticated users still get redirected to login.

No other files need to change. The TypeScript syntax error from the previous turn is already fixed.
