# Add Legal Pages: Terms & Privacy

## Goal
Replace the current 3-item Legal section in the footer with exactly 2 links — **Terms & Conditions** and **Privacy Policy** — wired to two new full-content pages using the copy you provided.

## Changes

### 1. New page: `src/pages/Terms.tsx`
- Route: `/terms`
- Layout: `<Navbar />` + main + `<Footer />` (matches `Trust.tsx` pattern)
- Hero: "Terms and Conditions" title, effective date "27 April 2026", website link
- Body: All 18 sections from your provided text, rendered as styled headings (`font-display`) + paragraphs + bullet lists, wrapped in a `prose`-like container (`max-w-3xl mx-auto`)

### 2. New page: `src/pages/Privacy.tsx`
- Route: `/privacy`
- Same layout pattern as Terms
- Hero: "Privacy Policy" title, effective date, website link
- Body: All 16 sections from your provided text, including subsections A/B/C in section 1

### 3. Register routes in `src/App.tsx`
Add two new `<Route>` entries:
- `<Route path="/terms" element={<Terms />} />`
- `<Route path="/privacy" element={<Privacy />} />`

### 4. Update `src/components/layout/Footer.tsx` — Legal section
Replace the current 3 items:
```
Privacy / Terms / Community guidelines
```
With exactly 2 items as `<Link>` (react-router) entries:
```
Terms & Conditions  → /terms
Privacy Policy      → /privacy
```
The other footer columns (Product, Company) remain untouched.

## Styling Notes
- Use existing design tokens (`text-muted-foreground`, `font-display`, `text-gradient`) so the legal pages match the rest of the site
- Numbered section headings as `h2` with `font-display text-2xl mt-10`
- Lists use `list-disc pl-6 space-y-2 text-muted-foreground`
- Smooth scroll to top on route change is already handled by the app shell

## Files Touched
- **Create:** `src/pages/Terms.tsx`
- **Create:** `src/pages/Privacy.tsx`
- **Edit:** `src/App.tsx` (add 2 routes)
- **Edit:** `src/components/layout/Footer.tsx` (Legal column → 2 links)

No backend, schema, or auth changes needed.
