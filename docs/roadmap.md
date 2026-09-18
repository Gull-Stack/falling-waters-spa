# Falling Waters — roadmap

## Goal (Bryce, 18 Sep 2026)

Falling Waters Day Spa live on Cinch **as soon as possible**, replacing Booker
(go.booker.com/#/location/fallingwaters) as the spa's online booking and front-desk
book. Erika (GM) told Bryce at the gym on 18 Sep that she "really wants" it online.

## Where it stands (end of 18 Sep 2026)

| Piece | State |
|---|---|
| Real menu in Cinch (117 services, 8 categories, 5 couples) | MERGED — cinch-app #2341 (`fa297f9`) |
| Guest booking end to end, couples, desk alerts, spa sender, Utah timezone | PR **#2345** open, unmerged, CI running |
| Own instance `cinch-falling-waters` + Neon DB | NOT created — `scripts/provision-cinch-instance.sh` ready for Bryce to run |
| Domain `fallingwaters.usecinch.com` → new project | Needs **Josh's written go** (docs/PRODUCTION-LIVE-DB-SAFETY.md) |
| Staff, hours, services per provider | Waiting on Erika |
| Email to Erika (5 asks) | Gmail draft, **unsent** |
| Stripe (card payments, online gift cards) | Later — needs the owner's KYC |
| SMS | OFF at launch — no consent box on the guest form, no 10DLC |

## How launch goes, in order

1. **Merge #2345** (review it; it touches public booking for every appointments tenant).
2. **Bryce runs** `bash scripts/provision-cinch-instance.sh` from this repo. It refuses
   to run until #2345 is on main. It creates the project, the Neon DB through the
   Marketplace installation, fresh sensitive secrets, a Resend key (pasted), and the
   first production deploy, then checks `/api/version` says `instance: falling-waters`.
3. **Claude** reads the build log (`[falling-waters] seeded — live instance, 117 real
   services`), walks `cinch-falling-waters.vercel.app/t/falling-waters/book`.
4. **Erika's answers** → Claude loads providers, weekly hours, services each performs,
   cancellation policy, `booking_policy.opsNotifyEmails` (desk alerts) and
   `tenants.email_reply_to` (guest replies).
5. **Josh's go** → attach `fallingwaters.usecinch.com` to `cinch-falling-waters`; add the
   instance to cinch-app `scripts/instances.json` with `expect: ["email"]`; confirm the
   host and alias both report `instance: falling-waters`.
6. **One real test booking** from a phone; confirm the email lands in an inbox.
7. **Switch the "Book" buttons** on this site from Booker to
   `https://fallingwaters.usecinch.com/t/falling-waters/book`. A push to `main` here
   deploys production — that push is the go-live moment.
8. **Booker export** (clients, gift-card balances, future appointments) → import, then
   cancel Booker before its renewal.
9. **Retire the shared-DB demo** (Josh's go + backup): drop `seedFallingWaters` from the
   shared seed tail, then delete the shared `falling-waters` rows.

## Later

- Stripe Connect (owner KYC at /admin/settings/account → Direct payouts) → online gift
  cards; per-instance webhook; fee is Bryce's decision.
- SMS: consent checkbox + Terms page, 10DLC under the spa's own EIN, then SignalWire env.
- Public-flow deposits and intake (prenatal) — not built for guest bookings today.
- Desk bookings should capture guest email/phone; no-show fee is not charged.
- Admin rail shows Kitchen / Stays for a spa (Josh's 17 Aug "every group renders" ruling).
