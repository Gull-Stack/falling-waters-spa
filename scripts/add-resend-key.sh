#!/usr/bin/env bash
# Add (or replace) RESEND_API_KEY on cinch-falling-waters from the macOS
# clipboard, then redeploy production so the running build sees it.
#   Copy the key in Resend, then:  bash scripts/add-resend-key.sh
set -euo pipefail
PROJECT="cinch-falling-waters"
vercel whoami >/dev/null 2>&1 || { echo "run: vercel login" >&2; exit 1; }
TOKEN=$(python3 -c "import json,sys;print(json.load(open(sys.argv[1]))['token'])" "$HOME/Library/Application Support/com.vercel.cli/auth.json")
TEAM_ID=$(curl -fsS -H "Authorization: Bearer $TOKEN" "https://api.vercel.com/v2/teams?limit=100" | python3 -c "import json,sys;print(next(t['id'] for t in json.load(sys.stdin)['teams'] if t['slug']=='gull-stack'))")
KEY=$(pbpaste | tr -d '[:space:]')
case "$KEY" in re_*) ;; *) echo "clipboard does not hold a Resend key (re_…)" >&2; exit 1 ;; esac
# Built in single quotes: macOS bash 3.2 mangles quotes nested in "$(…)".
BODY=$(V="$KEY" python3 -c 'import json,os;print(json.dumps({"key":"RESEND_API_KEY","value":os.environ["V"],"type":"sensitive","target":["production"]}))')
curl -fsS -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  "https://api.vercel.com/v10/projects/$PROJECT/env?teamId=$TEAM_ID&upsert=true" \
  -d "$BODY" >/dev/null
echo "RESEND_API_KEY set on $PROJECT. Redeploy production (or tell Claude) so it takes effect."
