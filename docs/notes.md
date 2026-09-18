# Falling Waters — notes

Durable facts. Newest first inside each section.

## Who
- Falling Waters Day Spa & Salon, 1101 E Draper Parkway, Draper UT. Est.
  1998. Inside the Treehouse Athletic Club building.
- **Erika (erika@tacfitness.com) is the spa's GM.** 18 Sep 2026: Bryce ran into
  her at the gym; she "really wants us to get the spa online." Intent, not a
  signed deal: no price agreed, no acceptance row yet.
- Other contact: erin@tacfitness.com (tacfitness = Treehouse). Lead-form mail
  goes to Spa@tacfitness.com. Business owner (the Stripe signer): unknown.
- Notion: GullStack Flight Deck → Treehouse Athletic Club + Cinch → Utah Golf
  Pipeline → "Falling Waters Day Spa" (stage: Proposal, segment "Warm —
  inside Treehouse").

## Links
- Live site: www.fallingwatersdayspa.com (this repo; push to main deploys).
- Booking preview: www.fallingwatersdayspa.com/book (unlisted, demo only).
- Cinch proposal: usecinch.com/welcome/falling-waters.
- Cinch demo tenant: app.usecinch.com/t/falling-waters (shared DB).
- Booker today: go.booker.com/#/location/fallingwaters.

## Decisions
- 18 Sep 2026: own instance, FRESH (not an instance-migrate cutover). The shared-DB
  falling-waters rows are demo data with invented staff and prices.
- 18 Sep 2026: bootstrap owner login is bryce@gullstack.com; Erika gets her own login
  via Team access. Owner password lives in Bryce's Keychain (cinch-falling-waters-owner).
- 18 Sep 2026: guests pay at the spa at launch; no online deposits, no SMS.

## Gotchas
- The contact form's September "leads" are virtual-assistant spam
  (vasdirect.com, vas4hire.com, virtualeaseservice.com). None are guests.
- Cloudflare dropped fallingwatersdayspa.com on 20 May 2026 for incomplete
  nameserver setup. DNS host for the domain: unconfirmed.
- Josh's production rules (cinch-app docs/PRODUCTION-LIVE-DB-SAFETY.md) need his
  explicit go to move fallingwaters.usecinch.com or delete shared-DB rows.
- fallingwatersdayspa.com DNS is at Wix with Google Workspace MX and NO SPF/DKIM/DMARC.
  Never move the nameservers (Workspace mail dies). Launch sends from the platform
  address with the spa's name; a spa-domain sender needs Resend DKIM records in Wix.
- A guest who replies to a confirmation reaches a no-reply address until
  `tenants.email_reply_to` is set to the spa's desk email.
