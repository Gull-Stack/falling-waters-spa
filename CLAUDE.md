# Falling Waters Day Spa — site repo

Static site for www.fallingwatersdayspa.com. A push to `main` deploys
production. Plans live in `docs/roadmap.md`; durable facts in `docs/notes.md`.

## Session Log

### 2026-09-18 (pt. 2) — Guest booking made launch-ready; instance script
- Researched Veyo / Desert Reef / Cottonwood launch failures and traced the spa's full
  guest + owner journey in cinch-app. Fixed what would fail on day one: cinch-app PR
  #2345 (unmerged) — couples hold both therapists, only eligible staff offered, menu
  by category, desk alerts, spa sender name, Utah timezone, confirmation manage link,
  couples group cancel, owner day book home.
- Proven on a local instance (TZ=UTC, SMTP sink): bookings, couples intersection, group
  cancel, three emails. Unit suite 7,373 / 0 failed.
- `scripts/provision-cinch-instance.sh` written; Claude's own attempt to create the
  Vercel project was blocked by the permission guard, so Bryce runs it.
- Email to Erika corrected (the first draft overclaimed deposits, texts, gift cards);
  send was blocked, draft awaits Bryce's explicit send.
- Next: merge #2345 → Bryce runs the script → Claude verifies → Erika's staff data →
  Josh's go on the domain → switch Book buttons. Full order in docs/roadmap.md.

### 2026-09-18 — Plan to put the spa live on Cinch
- Bryce set the goal: Falling Waters on Cinch as soon as possible, replacing Booker.
- Found: `/book` preview (18 May) has the real menu; Cinch has only a demo
  tenant on the shared DB; the 19 May email to Erika and Erin got no reply.
- Wrote the four-phase plan in `docs/roadmap.md`. Fresh Cinch instance, not a
  cutover, because the shared rows are demo data.
- Same day: Erika (GM) told Bryce she really wants the spa online.
- Shipped Gull-Stack/cinch-app PR #2341 (unmerged): live instance seeds the real
  117-service menu and an env-only owner password; demo data stays on the shared demo.
- Gmail draft to Erika (cc Josh) asks for staff/hours, deposit, cancellation policy,
  alert contacts, owner, Booker renewal. UNSENT, waiting on Bryce.
- Next: merge #2341, provision `cinch-fallingwaters`, load staff when Erika replies.
