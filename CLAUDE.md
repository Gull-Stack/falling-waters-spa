# Falling Waters Day Spa — site repo

Static site for www.fallingwatersdayspa.com. A push to `main` deploys
production. Plans live in `docs/roadmap.md`; durable facts in `docs/notes.md`.

## Session Log

### 2026-09-18 — Plan to put the spa live on Cinch
- Bryce set the goal: Falling Waters on Cinch as soon as possible, replacing Booker.
- Found: `/book` preview (18 May) has the real menu; Cinch has only a demo
  tenant on the shared DB; the 19 May email to Erika and Erin got no reply.
- Wrote the four-phase plan in `docs/roadmap.md`. Fresh Cinch instance, not a
  cutover, because the shared rows are demo data.
- Blocked on Bryce: deal confirmed, owner contact, price.
- Next for Claude: cinch-app PR for a production seed with the real menu,
  then provision `cinch-fallingwaters`.
