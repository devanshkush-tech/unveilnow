# Add Couple Photos as Background Accents

Goal: Layer 1–2 AI-generated candid couple images into the landing page as soft background/decorative accents — without removing or modifying any existing sections, copy, or components.

## What I'll do

1. **Generate 2 candid couple images** (AI, lifestyle style, warm/natural tones matching the plum-peach palette):
   - `src/assets/couple-warm.jpg` — diverse young Indian couple laughing together, golden hour, candid
   - `src/assets/couple-quiet.jpg` — couple sharing a quiet moment (coffee/walk), soft natural light

2. **Place them as background accents** (low opacity, decorative, `aria-hidden`, behind content):
   - **Hero section** (`Hero.tsx`) — add one couple image as a soft, masked, low-opacity decorative layer behind the existing gradient blobs (positioned bottom-left, ~15-20% opacity, blurred/feathered edges via mask-image). The existing HeroCard, headline, CTAs, and gradient backdrop all stay untouched.
   - **WhyDifferent section** (`WhyDifferent.tsx`) — add the second couple image as a faint background wash behind the section (positioned top-right, low opacity, masked). Existing comparison cards remain on top, fully visible.

## Technical notes

- Images placed in `src/assets/` and imported as ES6 imports.
- Rendered via absolutely-positioned `<div>` with `background-image`, `aria-hidden`, `pointer-events-none`, behind content (`-z-10` or stacked under existing children).
- Use CSS `mask-image` linear/radial gradients so edges blend seamlessly into the page background.
- Opacity capped at ~15–25% so photos read as ambient texture, not focal content. No layout shift, no copy removed.
- No backend, routing, or business-logic changes.

## Files

- **Create:** `src/assets/couple-warm.jpg`, `src/assets/couple-quiet.jpg`
- **Edit:** `src/components/landing/Hero.tsx` (add one decorative bg layer), `src/components/landing/WhyDifferent.tsx` (add one decorative bg layer)
