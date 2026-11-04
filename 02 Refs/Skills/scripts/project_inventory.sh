#!/usr/bin/env bash
# project_inventory.sh: one line per project in 03 Projects/, against the shared standard.
# ✔ = in place, ✘ = missing, - = not applicable (no page / no database).
# Usage: 02 Refs/Skills/scripts/project_inventory.sh
set -u
top="$(git rev-parse --show-toplevel)" && cd "$top" || exit 2
mark() { if [ "$1" = yes ]; then printf '✔'; elif [ "$1" = no ]; then printf '✘'; else printf -- '-'; fi; }
printf '%-26s %-6s %-6s %-6s %-6s %-6s %-6s %-6s %-6s %s\n' project claude schem convo brief lessn track ⚙️ver sup notes
for dir in "03 Projects"/*/; do
  n="$(basename "$dir")"
  [ -f "$dir/CLAUDE.md" ] && c=yes || c=no
  [ -f "$dir/schematic.md" ] && sc=yes || sc=no
  [ -n "$(ls "$dir/convo" 2>/dev/null)" ] && cv=yes || cv=no
  [ -f "04 AI/$n/brief.md" ] && b=yes || b=no
  [ -f "04 AI/$n/lessons.md" ] && l=yes || l=no
  grep -qiE '^\W*(\*\*)?track' "$dir/CLAUDE.md" "$dir/schematic.md" 2>/dev/null && t=yes || t=no
  # a page: any html file at the project's top level or inside research/, prototypes or sheets
  if find "$dir" -maxdepth 2 -name '*.html' -not -path '*/vendor/*' | grep -q .; then page=yes; else page=no; fi
  if grep -rqE 'class="gear|id="gear|gearBtn' "$dir" --include='*.html' --include='*.js' 2>/dev/null; then g=yes; else g=no; fi
  if [ -f "$dir/js/version.js" ] || grep -rqE 'APP_CHANGELOG|APP_VERSION' "$dir" --include='*.js' 2>/dev/null; then v=yes; else v=no; fi
  [ "$page" = yes ] || { g=na; v=na; }
  if find "$dir" -maxdepth 1 -type d -regex '.*/V[0-9]+' | grep -q .; then vdir=" ⚠ V# folder"; else vdir=""; fi
  if [ -d "$dir/supabase" ]; then s=yes; else s=na; fi
  if grep -rqiE 'notes|feedback' "$dir" --include='*.html' --include='*.js' 2>/dev/null && [ "$page" = yes ]; then nt=yes; elif [ "$page" = yes ]; then nt=no; else nt=na; fi
  printf '%-26s %-6s %-6s %-6s %-6s %-6s %-6s %-6s %-6s %-6s%s\n' "$n" "$(mark $c)" "$(mark $sc)" "$(mark $cv)" "$(mark $b)" "$(mark $l)" "$(mark $t)" "$(mark $v)" "$(mark $s)" "$(mark $nt)" "$vdir"
done
echo
echo "Columns: claude = CLAUDE.md pointer · schem = schematic.md · convo = convo/ has a file · brief/lessn = 04 AI notes ·"
echo "track = track line in CLAUDE.md or schematic · ⚙️ver = version log in the app · sup = supabase/ folder (check it with sql_paste_check.py) ·"
echo "notes = feedback box in the app (only for pages people use)."
