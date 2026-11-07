#!/usr/bin/env bash
# privacy_scan.sh: scan files in this repo for private data and secrets before a commit.
# Usage:  02 Refs/Skills/scripts/privacy_scan.sh            (all tracked files)
#         02 Refs/Skills/scripts/privacy_scan.sh --staged  (only what is staged for commit)
# Output: BLOCK = do not commit until fixed. REVIEW = ask Jimmy. INFO = noted, not a problem.
# Exit status: 1 if anything is BLOCK, else 0.
set -u
top="$(git rev-parse --show-toplevel 2>/dev/null)" || { echo "not a git repo"; exit 2; }
cd "$top" || exit 2

if [ "${1:-}" = "--staged" ]; then
  files="$(git diff --cached --name-only --diff-filter=ACM)"
else
  files="$(git ls-files)"
fi

blocks=0; reviews=0
say() { printf '%-7s %s\n' "$1" "$2"; }

# 1. File names and locations
while IFS= read -r f; do
  [ -z "$f" ] && continue
  case "$f" in
    *.env|*.env.*|.env|*.pem|*.key|*.p12|*id_rsa*) say BLOCK "$f  secret-looking file name"; blocks=$((blocks+1));;
  esac
  case "$f" in
    */private/*|private/*) say BLOCK "$f  private/ folder is tracked (it must be gitignored)"; blocks=$((blocks+1));;
  esac
  case "$f" in
    *.jpg|*.jpeg|*.png|*.heic|*.webp|*.mov|*.mp4)
      case "$f" in
        */renders/*|*/assets/*|*/vendor/*|*/icons/*|*/screenshots/*) ;;
        *) say REVIEW "$f  photo or video outside renders/assets: is it a real place or person?"; reviews=$((reviews+1));;
      esac;;
  esac
done <<< "$files"

# 2. Content checks (text files only)
scan() { # $1 = label, $2 = severity, $3 = extended regex, $4 = optional exclude regex
  local label="$1" sev="$2" re="$3" ex="${4:-^$}" hits
  while IFS= read -r f; do
    [ -z "$f" ] && continue
    [ -f "$f" ] || continue
    grep -Iq . "$f" 2>/dev/null || continue
    hits="$(grep -nE -e "$re" "$f" 2>/dev/null | grep -vE "$ex" || true)"
    [ -z "$hits" ] && continue
    while IFS= read -r h; do
      say "$sev" "$f:${h%%:*}  $label"
      if [ "$sev" = BLOCK ]; then blocks=$((blocks+1)); elif [ "$sev" = REVIEW ]; then reviews=$((reviews+1)); fi
    done <<< "$hits"
  done <<< "$files"
}

# Personal email addresses (CSS at-rules, placeholders and bot addresses are not personal)
scan "personal email address" BLOCK \
  '[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}' \
  '@(media|import|keyframes|font-face|types|supported|page|layer|container)|noreply|@example\.(com|org|net)|users\.noreply'

# Secret keys
scan "Supabase secret key (sb_secret_)" BLOCK 'sb_secret_[A-Za-z0-9_]{8,}'
scan "private key block" BLOCK '-----BEGIN [A-Z ]*PRIVATE KEY-----'
scan "hard-coded password" BLOCK "password[\"']?[[:space:]]*[:=][[:space:]]*[\"'][^\"'<>{}]{3,}[\"']" \
  'example|placeholder|your[-_ ]|<|\{\{'
# Phone numbers
scan "possible phone number" REVIEW '\(?[0-9]{3}\)?[ .-][0-9]{3}[ .-][0-9]{4}\b' \
  '[0-9]{4}-[0-9]{2}-[0-9]{2}|version|[0-9]{3}\.[0-9]{3}\.[0-9]{4}\.[0-9]'

# JSON Web Tokens: decode the payload. A service_role token is a BLOCK. anon/authenticated are publishable (INFO).
jwt_re='eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}'
while IFS= read -r f; do
  [ -z "$f" ] && continue; [ -f "$f" ] || continue; grep -Iq . "$f" 2>/dev/null || continue
  grep -noE "$jwt_re" "$f" 2>/dev/null | while IFS= read -r hit; do
    line="${hit%%:*}"; tok="${hit#*:}"
    role="$(python3 -I -c '
import sys, base64, json
t = sys.argv[1].split(".")[1]
t += "=" * (-len(t) % 4)
try:
    print(json.loads(base64.urlsafe_b64decode(t)).get("role", "none"))
except Exception:
    print("unreadable")' "$tok")"
    case "$role" in
      service_role) say BLOCK "$f:$line  service_role key (never in a repo)";;
      anon|authenticated) say INFO "$f:$line  $role key (publishable, fine in browser code)";;
      *) say REVIEW "$f:$line  token with role '$role': check what it is";;
    esac
  done
done <<< "$files"

echo
echo "summary: $blocks BLOCK, $reviews REVIEW"
[ "$blocks" -eq 0 ]
