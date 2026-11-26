# Windows local environment — tool lessons

Collected from Allowances and Coins sessions run on Jimmy's Windows PC with other AI tools. These don't apply to Claude Code cloud sessions (Linux), but do apply when working locally on Windows.

- **Python:** earlier sessions found none on PATH (superseded: on 2026-11-25 `python` 3.13 and Node 24 both ran from Git Bash).
- **Headless screenshots without Playwright:** installed Chrome with `--headless=new --screenshot`; add `--force-prefers-reduced-motion` to compare pages.
- **PowerShell corrupts JS/text:**
  - Here-strings break JS template literals (`${}` and backticks).
  - Stdin pipes mangle non-ASCII characters (·, −, ≥), which silently breaks find/replace scripts.
  - `Get-Content` / `WriteAllText` can mojibake UTF-8. Use `[IO.File]::ReadAllText` with UTF8 encoding, or Node.
  - Fix: write edit scripts to a file with the editor/create tool, then run them with Node.
- **CRLF files:** use `` `r`n `` in PowerShell patterns.
- **Validate after edits:** `node --check app.js`.
- **Browser caching:** test with a cache-busting query (`index.html?v=<time>`).
- **Playwright:** `page.screenshot` in snippets did not write files; use the screenshot tool. Check for zero JS errors after each change.
