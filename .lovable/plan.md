## Goal
Fix three layout/flow issues on the Payment + PaymentReview screens.

---

### 1. "Missed the QR / UPI ID? Go back" should actually return to the plan + QR page

**Problem:** The button on `/payment/review` does `navigate("/payment")`, but `Payment.tsx` auto-redirects back to `/payment/review` whenever `payment_status === "pending"`. So clicking the button does nothing visible.

**Fix in `src/pages/PaymentReview.tsx`:**
- Change the button to `navigate("/payment?revisit=1")`.

**Fix in `src/pages/Payment.tsx`:**
- Read `useSearchParams()`. If `revisit=1` is present, skip the `payment_status === "pending"` → `/payment/review` redirect so the user can see the QR, UPI ID, and plan cards again.
- All other redirects (active account → dashboard, missing profile → onboarding) stay intact.

---

### 2. Buttons overflowing the card on `/payment/review`

**Problem:** Four buttons sit in a `flex flex-col sm:flex-row` row inside a max-width card; on small/medium widths they wrap awkwardly and clip the card edge.

**Fix in `src/pages/PaymentReview.tsx`:**
- Switch the action row to a responsive grid that wraps cleanly:
  - Mobile: stacked full-width buttons (`grid-cols-1`).
  - ≥sm: `grid-cols-2` so 2×2 layout (or 2×1 when only two buttons).
- Add `w-full` and `whitespace-normal` (or shorten label to "Missed QR? Go back") so long text doesn't push past the card.
- Constrain action area with `max-w-md mx-auto`.

---

### 3. Hero text on `/payment` and the QR section

**Problem:** Hero headline "Pay a Small Fee to Keep Unveil Now Genuine" wraps awkwardly at this viewport, and the QR section (`grid md:grid-cols-2`) feels cramped.

**Fix in `src/pages/Payment.tsx`:**
- Shorten and rebalance the hero:
  - H1: **"Keep Unveil Now genuine."**
  - Sub (single tighter paragraph, replacing the two existing paragraphs):
    *"A small one-time fee filters out fake profiles and timepassers — so everyone here is serious about a real connection."*
- Tighten typography: `text-3xl md:text-4xl`, `leading-tight tracking-tight`, `max-w-xl mx-auto`, single `mt-3` paragraph.
- QR section: add `gap-10`, ensure the right column image is centered on mobile (already ok), and add `text-balance` to the H2 "Pay … via any UPI app." so it doesn't break mid-price.

Apply the same hero shortening to `src/features/blind-date/pages/PaymentPage.tsx` for consistency (headline → "Pick your Blind Date plan." stays; just tighten widths if needed — minor).

---

### Files touched
- `src/pages/PaymentReview.tsx` — button grid + new query param on Go back link.
- `src/pages/Payment.tsx` — honor `?revisit=1`, shorten hero copy, tighten layout.

No backend, schema, or business-logic changes.
