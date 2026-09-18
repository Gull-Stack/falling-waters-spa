#!/usr/bin/env bash
# Stand up Falling Waters' OWN Cinch: Vercel project cinch-falling-waters +
# its own Neon database (Vercel Marketplace, the same installation every live
# instance uses) + fresh per-instance secrets + a first production deploy.
#
# Run it YOURSELF (it writes to the GullStack Vercel team):
#   bash scripts/provision-cinch-instance.sh
#
# What it deliberately does NOT do — Josh's docs/PRODUCTION-LIVE-DB-SAFETY.md
# needs his explicit go for these, separately:
#   - move fallingwaters.usecinch.com off the shared `cinch` project
#   - delete the demo falling-waters rows from the shared database
# Until the domain moves, the instance is reachable at its vercel.app URL.
#
# Lessons baked in (Veyo, Desert Reef, Cottonwood, Plato's):
#   - refuses to run until main carries the timezone fix (PR #2345): a NULL
#     timezone stores a 9:00 AM massage as 3:00 AM on Vercel
#   - secrets are `sensitive`, fresh per instance, never printed
#   - the owner password goes to your macOS Keychain, not to the screen
#   - RESEND_API_KEY is pasted by you (sensitive keys cannot be copied between
#     projects); trimmed so a stray shell glyph cannot ride along (Clutch)
#   - the build refuses to seed an owner without FALLINGWATERS_OWNER_PASSWORD
set -euo pipefail

TEAM_SLUG="gull-stack"
PROJECT="cinch-falling-waters"
SLUG="falling-waters"
REPO="Gull-Stack/cinch-app"
NEON_INSTALLATION="icfg_oSOQA3Ph8OM2LVwinyZ5DF1S"
# The bootstrap owner is GullStack's, so we can load the team and hours
# ourselves. Erika (GM) is then invited from Team access with her OWN login —
# nobody signs in under someone else's name.
OWNER_EMAIL="${OWNER_EMAIL:-bryce@gullstack.com}"

say() { printf '\n\033[1m%s\033[0m\n' "$*"; }
die() { printf '\n\033[31mSTOP: %s\033[0m\n' "$*" >&2; exit 1; }

AUTH_FILE="$HOME/Library/Application Support/com.vercel.cli/auth.json"
[ -f "$AUTH_FILE" ] || die "Vercel CLI is not logged in (run: vercel login)"
# The saved token expires (auth.json carries expiresAt); any CLI call refreshes it.
vercel whoami >/dev/null 2>&1 || die "vercel whoami failed — run: vercel login"
TOKEN=$(python3 -c "import json,sys;print(json.load(open(sys.argv[1]))['token'])" "$AUTH_FILE")
API="https://api.vercel.com"
# GET /v2/teams/<slug> answers 403 for this token; the team LIST does not.
TEAM_ID=$(curl -fsS -H "Authorization: Bearer $TOKEN" "$API/v2/teams?limit=100" \
  | python3 -c "import json,sys;print(next(t['id'] for t in json.load(sys.stdin)['teams'] if t['slug']==sys.argv[1]))" "$TEAM_SLUG") \
  || die "could not find team $TEAM_SLUG for this Vercel login"
echo "  team $TEAM_SLUG = $TEAM_ID"

say "0. Pre-flight"
# Read the file first, THEN test it: `grep -q` exits on the first match and,
# under pipefail, the SIGPIPE it hands base64 fails the whole pipeline.
SEED_SRC=$(gh api "repos/$REPO/contents/src/db/seed-fallingwaters.ts?ref=main" -q .content | base64 -d) \
  || die "could not read seed-fallingwaters.ts from main (is gh logged in?)"
case "$SEED_SRC" in
  *'timezone: "America/Denver"'*) ;;
  *) die "main does not set Falling Waters' timezone yet — merge PR #2345 first." ;;
esac
echo "  main carries the timezone fix"
code=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $TOKEN" "$API/v9/projects/$PROJECT?teamId=$TEAM_ID")
[ "$code" = "404" ] || die "project $PROJECT already exists (HTTP $code) — nothing created"
echo "  $PROJECT is free"
echo "  owner login will be: $OWNER_EMAIL  (override: OWNER_EMAIL=... bash $0)"
read -r -p "  Create $PROJECT on team $TEAM_SLUG now? [y/N] " yn
[ "$yn" = "y" ] || die "cancelled — nothing created"

say "1. Vercel project"
REPO_ID=$(gh api "repos/$REPO" -q .id)
curl -fsS -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  "$API/v11/projects?teamId=$TEAM_ID" \
  -d "{\"name\":\"$PROJECT\",\"framework\":\"nextjs\",\"gitRepository\":{\"type\":\"github\",\"repo\":\"$REPO\"},\"commandForIgnoringBuildStep\":\"bash scripts/vercel-ignore.sh\",\"serverlessFunctionRegion\":\"iad1\"}" \
  | python3 -c "import json,sys;p=json.load(sys.stdin);print('  created',p['name'],p['id'])"
curl -fsS -X PATCH -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  "$API/v9/projects/$PROJECT?teamId=$TEAM_ID" -d '{"nodeVersion":"24.x"}' >/dev/null && echo "  node 24.x (matches the fleet)"

say "2. Secrets (fresh, sensitive, never printed)"
rnd() { python3 -c "import secrets;print(secrets.token_urlsafe(32))"; }
AUTH_SECRET=$(rnd)
OWNER_PW="FW-$(python3 -c "import secrets;print(secrets.token_urlsafe(12))")"
put_env() { # key value type
  curl -fsS -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
    "$API/v10/projects/$PROJECT/env?teamId=$TEAM_ID&upsert=true" \
    -d "$(python3 -c "import json,sys;print(json.dumps({'key':sys.argv[1],'value':sys.argv[2],'type':sys.argv[3],'target':['production']}))" "$1" "$2" "$3")" >/dev/null
  echo "  $1 ($3)"
}
put_env CINCH_INSTANCE "$SLUG" encrypted
put_env AUTH_SECRET "$AUTH_SECRET" sensitive
put_env NEXTAUTH_SECRET "$AUTH_SECRET" sensitive
put_env CRON_SECRET "$(rnd)" sensitive
put_env QR_SIGNING_SECRET "$(rnd)" sensitive
put_env QUOTE_SIGNING_SECRET "$(rnd)" sensitive
put_env FALLINGWATERS_OWNER_EMAIL "$OWNER_EMAIL" encrypted
put_env FALLINGWATERS_OWNER_PASSWORD "$OWNER_PW" sensitive
security add-generic-password -U -a "$OWNER_EMAIL" -s "cinch-falling-waters-owner" -w "$OWNER_PW"
echo "  owner password saved to Keychain: service cinch-falling-waters-owner"

say "3. Email (Resend) — paste a key; it is not echoed"
echo "  Resend dashboard → API Keys → Create (Sending access). Enter to skip for now."
read -r -s -p "  RESEND_API_KEY: " RESEND_KEY; echo
RESEND_KEY=$(printf '%s' "$RESEND_KEY" | tr -d '[:space:]' | tr -cd 'A-Za-z0-9_-')
if [ -n "$RESEND_KEY" ]; then put_env RESEND_API_KEY "$RESEND_KEY" sensitive
else echo "  skipped — guests get no confirmation email until this is set"; fi

say "4. Database — Neon via the Vercel Marketplace installation"
WORK=$(mktemp -d)
( cd "$WORK" && vercel link --yes --project "$PROJECT" --scope "$TEAM_SLUG" >/dev/null \
  && vercel integration add neon --name "$PROJECT-db" --installation-id "$NEON_INSTALLATION" \
       -e production -e preview -e development --no-env-pull --scope "$TEAM_SLUG" )
curl -fsS -H "Authorization: Bearer $TOKEN" "$API/v9/projects/$PROJECT/env?teamId=$TEAM_ID" \
  | python3 -c "import json,sys;k={e['key'] for e in json.load(sys.stdin)['envs']};print('  DATABASE_URL present' if 'DATABASE_URL' in k else '  !! DATABASE_URL MISSING — do not deploy');sys.exit(0 if 'DATABASE_URL' in k else 1)"

say "5. First production deploy (from main)"
DEP=$(curl -fsS -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  "$API/v13/deployments?teamId=$TEAM_ID" \
  -d "{\"name\":\"$PROJECT\",\"project\":\"$PROJECT\",\"target\":\"production\",\"gitSource\":{\"type\":\"github\",\"repoId\":$REPO_ID,\"ref\":\"main\"}}")
DEP_URL=$(printf '%s' "$DEP" | python3 -c "import json,sys;print(json.load(sys.stdin)['url'])")
echo "  building https://$DEP_URL"
for i in $(seq 1 90); do
  st=$(curl -fsS -H "Authorization: Bearer $TOKEN" "$API/v13/deployments/$DEP_URL?teamId=$TEAM_ID" | python3 -c "import json,sys;print(json.load(sys.stdin)['readyState'])")
  [ "$st" = "READY" ] || [ "$st" = "ERROR" ] || [ "$st" = "CANCELED" ] && break
  sleep 10
done
echo "  state: $st"
[ "$st" = "READY" ] || die "deploy did not go READY — open it in Vercel and read the build log"

say "6. Verify"
curl -fsS "https://$PROJECT.vercel.app/api/version" | python3 -c "
import json,sys;v=json.load(sys.stdin)
print('  instance:',v['instance'],' commit:',v['commitShort'])
print('  capabilities:',', '.join(k for k,on in v['capabilities'].items() if on) or 'none')
sys.exit(0 if v['instance']=='falling-waters' else 1)"
echo "  guest page: https://$PROJECT.vercel.app/t/$SLUG/book"
say "Done. Tell Claude it ran — next: the build-log check, the live walk, then Josh's go on the domain."
