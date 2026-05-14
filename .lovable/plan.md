## Plan to complete the Blind Date requirements

### 1. Fix the main flow order
- Update Phase A setup so completing the first questionnaire sends users to `/blind-date/payment`, not directly to matching.
- Keep the gate order as: login → Phase A setup → payment/review → extended onboarding → matching/chat.
- Make `/blind-date` smart enough to route returning users to the correct next step instead of making them feel stuck.

### 2. Complete payment and credit logic
- Keep the three Blind Date plans:
  - Starter: ₹199, 10 chats
  - Premium: ₹299, 30 chats
  - Elite: ₹499, 100 chats
- Ensure admin approval adds credits, sets `paid=true`, and preserves any previous unused credits.
- Add clearer “out of credits” handling so users are sent back to plan purchase when `chats_remaining` reaches 0.

### 3. Harden backend validation
- Update the Blind Date decision function so credits are consumed only when both users choose Continue and the response status matches the database trigger behavior.
- Add validation that users cannot continue/reveal a session if they are unpaid or have no credits.
- Keep `bd-match` protected against direct URL/function bypass with auth + paid + credits + completed setup checks.

### 4. Remove old/bot/placeholder behavior fully
- Confirm no mock matches or automated bot replies remain.
- Ensure the matching screen only creates sessions with real paid Blind Date profiles.
- Replace any remaining “coming soon” or generic placeholder copy related to Blind Date with the live flow.

### 5. Finish onboarding persistence
- Keep Phase A answers in `answers` and Phase B detailed answers in `extended_answers`.
- Ensure refresh/login/logout keeps the user at the correct stage using server state, not temporary client state.
- After extended onboarding completion, send users to matching.

### 6. Improve Blind Date messaging across key screens
- Add/strengthen required platform copy in Blind Date entry, payment, matching, and empty states:
  - “We focus on quality over endless swiping.”
  - “Blind Date is designed for serious and genuine connections.”
  - “Feel the connection first, then reveal more.”
- Keep the existing premium Blind Date aesthetic.

### 7. Admin tooling completion
- Improve the Blind Date admin tab so it supports practical management:
  - View users with setup/payment/credit status.
  - Edit chats remaining.
  - Approve/reject Blind Date payments via the existing payments tab.
  - Add a “Create Blind Date Profile” path or button if not already available.
- Make responses modal show both Phase A and extended onboarding answers.

### Technical notes
- This will require frontend edits across Blind Date pages/components and edge function fixes.
- A small database migration may be needed only if backend RPC validation needs to be tightened beyond the current trigger/function setup.
- I will not edit generated Cloud client/type files manually.