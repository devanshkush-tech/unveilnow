# Redesign `/lp` — Electric Midnight

A complete visual + copy overhaul of `src/pages/LP.tsx`. Self-contained — does not touch the main landing page, backend, auth, payments, or any business logic.

## Direction

- **Vibe:** Electric Midnight — near-black canvas, electric indigo/violet glow, soft white type, subtle grain.
- **Typography:** Instrument Serif (display, italic accents) + Work Sans (body / UI). Loaded locally to this page only, scoped via CSS so it doesn't override the rest of the site.
- **Layout:** Full-width cinematic sections, stacked, each one breathing its own atmosphere.
- **Copy:** Rewritten — sharper, members-club tone, city-first, friends-first.

## Color palette (scoped to `/lp` only)

```text
bg          #07070C   near-black canvas
surface     #0F0F18   raised panels
border      rgba(255,255,255,0.08)
text        #F4F4F8
muted       rgba(244,244,248,0.6)
indigo      #6366F1   electric primary
violet      #A78BFA   glow accent
aurora      radial gradients: indigo → violet → transparent
```

Scoped via a `.lp-theme` wrapper class with CSS variables — no changes to `index.css` or `tailwind.config.ts`.

## New section structure

1. **Marquee top strip** — thin animated ticker: "Mumbai · Delhi · Bengaluru · Invite-only · Friends first · …"
2. **Hero** — full-viewport. Huge Instrument Serif headline with italic accent, aurora glow blob behind, small "Invite-only · 2026 cohort" eyebrow, two CTAs (Request invite / See the room), trust microcopy.
3. **"The room" intro** — full-width band, single big editorial paragraph + a quiet animated counter row (cities open, members reviewed this week, avg response time).
4. **Pillars (4)** — full-width dark section, 4 horizontal rows (not a grid) with number, serif title, body. Topics: Invite-only, Friends-first, City-native, Quietly verified.
5. **Lifestyle / "Your kind of nights"** — split full-width band with the `couple-quiet` image used as a duotone (indigo/violet) backdrop; lifestyle tag pills overlay; pull-quote.
6. **The Cities** — full-width strip, city names rendered large as serif words with subtle hover glow.
7. **How it works (3 steps)** — full-width, numbered, minimal, no cards. Apply → Reviewed quietly → Step into the room.
8. **Members say** — single rotating editorial pull-quote (reuse text only, no avatars), full-width centered.
9. **Pricing** — reuse existing `<Pricing />` component, wrapped in a dark-themed container so it visually fits.
10. **FAQ** — reuse existing `<FAQ />`, wrapped in a dark container.
11. **Final CTA** — full-width aurora gradient block: "The city is quieter than your feed. Step in." + Request invite button.
12. **Footer** — existing `<Footer />`.

## Technical notes

- Edit only `src/pages/LP.tsx`. Keep route `/lp` unchanged.
- Add Google Fonts (`Instrument Serif`, `Work Sans`) via a `<link>` injected in the page's `useEffect` (so it loads only on this route), and apply via inline `style={{ fontFamily }}` or a scoped class.
- Wrap whole page in `<div className="lp-theme">` with a scoped `<style>` block defining CSS vars + utility classes (`.lp-h1`, `.lp-eyebrow`, `.lp-btn`, etc.) — keeps it isolated from the rest of the app's design tokens.
- Reuse `<Navbar />`, `<Footer />`, `<Pricing />`, `<FAQ />` as-is. Wrap `Pricing` and `FAQ` in dark-themed sections (background + subtle filter) since those components use the global light theme.
- Keep existing `trackMetaEvent("ViewContent", …)` call and update `document.title` / meta description for the new positioning.
- Keep `couple-warm.jpg` / `couple-quiet.jpg` imports; render as low-opacity duotone backdrops via CSS `mix-blend-mode` + indigo overlay.
- Add subtle motion: fade-up on scroll using existing `animate-fade-up` utility classes already in the project; one aurora blob with a slow CSS `@keyframes` drift defined in the scoped `<style>` block.
- No new dependencies. No backend changes. No changes to `App.tsx` (route already exists).

## Files

- **Edit:** `src/pages/LP.tsx` (full rewrite of the page body; route + imports preserved)

## Out of scope

- Main landing page (`/`) — untouched
- Global theme, tokens, Tailwind config — untouched
- Auth, payments, pricing logic, FAQ content — untouched (components reused)
