# Falling Waters — roadmap

## Goal (set 18 Sep 2026 by Bryce)

Put Falling Waters Day Spa live on Cinch **as soon as possible**. Cinch
replaces Booker (go.booker.com/#/location/fallingwaters) as the spa's
booking system, front-desk calendar, and card processor.

## Where it stands, 18 Sep 2026

- **This site is live** at www.fallingwatersdayspa.com. Every "Book" button
  still goes to Booker.
- **`/book` preview exists** (commits 087eabf–8d9abd1, 18 May). It carries the
  full service menu from the spa's Booker export. It is a demo. It books
  nothing.
- **Bryce emailed Erika and Erin (@tacfitness.com) on 19 May** with the
  preview and a list of what we need. Gmail shows no reply.
- **Cinch has a Falling Waters tenant**, but only as a demo row on the
  SHARED Cinch database (`app.usecinch.com/t/falling-waters`). Seed:
  `src/db/seed-fallingwaters.ts` in Gull-Stack/cinch-app. It has 10
  services, 5 staff and 4 appointments, partly invented fill-ins.
- **Cinch rule (Josh, 6 Aug):** every client gets its own instance: own
  Vercel project, own Neon DB, `CINCH_INSTANCE=falling-waters`. See
  cinch-app `docs/INSTANCE-PER-CLIENT-2026-07.md`. Falling Waters is one of
  three clients still to pull off the shared DB.
- The spa engine is complete (cinch-app `docs/SPA-ENGINE-AND-HOTSPRINGS-2026-09-04.md`):
  guest booking with no login, deposits, card hold, reminders, waitlist,
  intake forms, per-therapist calendar feeds. Nothing is missing in code.
  The missing parts are real data, an instance, and the spa's decisions.

## The plan

### Phase 0 — The deal (Bryce)
Confirm the spa said yes, who signs, and the price. Pricing is Bryce's call.

### Phase 1 — Own instance (Claude, about 1 day)
1. cinch-app PR: make `seed-fallingwaters.ts` a production seed. Load the
   real Booker menu from this repo's `book.html`. Remove invented staff,
   reviews and demo appointments. No migration, so no `ruled` label.
2. Provision: `scripts/provision-instance.mjs --slug falling-waters`
   (Vercel project `cinch-fallingwaters` + its own Neon DB, fresh
   AUTH_SECRET / CRON_SECRET).
3. **Fresh instance, not a cutover.** The shared-DB rows are demo data, so
   `instance-migrate.mjs` has nothing worth copying. After the new instance
   is verified, delete the `falling-waters` rows from the shared DB and
   drop its call from the shared seed tail (cutover step 7).
4. Re-point `fallingwaters.usecinch.com` to the new project. Add the entry
   to `scripts/instances.json` with `expect: ["email"]`.

### Phase 2 — Real data (spa supplies, Claude loads)
- Staff: names, what each performs, weekly hours.
- Policies: deposit or pay-at-spa, cancellation / no-show fee, text or
  email confirmations, booking notification email + phone.
- Booker export: clients, gift-card balances, future appointments. The spa
  requests it from Booker (Mindbody). Claude drafts the request.
- Booker renewal date, so the switch lands before it and nobody pays twice.

### Phase 3 — Money and messages
- Stripe: spa owner opens `/admin/wallet` → Connect → Stripe KYC (their EIN
  and bank). Claude mints the per-instance webhook
  (`scripts/wallet/setup-webhook.mjs`).
- Email: SendGrid key on the new project (sensitive vars cannot be copied
  between projects; a human pastes it). Sender on fallingwatersdayspa.com
  needs DNS access for DKIM.
- SMS reminders: optional at launch.

### Phase 4 — Go live
1. Staff walk-through of the front desk on the new instance.
2. Parallel run: Cinch takes new online bookings; Booker keeps the
   appointments already on it until they run out.
3. Point every "Book" button on this site to Cinch. **A push to `main` here
   deploys production** (.github/workflows/deploy.yml), so that push is the
   go-live moment.
4. Cancel Booker before its renewal.

## Next

Bryce: Phase 0 and the owner contact. Claude: Phase 1 now; it does not wait
on the spa.
