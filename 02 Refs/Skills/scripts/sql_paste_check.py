#!/usr/bin/env python3
"""Check Supabase SQL files before they are pasted into the dashboard SQL editor.

Usage:  python3 -I "02 Refs/Skills/scripts/sql_paste_check.py" file1.sql [file2.sql ...]
Exit status 1 if any file has a BLOCK problem. WARN problems are printed but do not fail.

What it catches (the things that break a paste, or leak private data):
  BLOCK  psql meta-commands (\\connect, \\i ...), server-side file reads (COPY ... FROM 'file'),
         unbalanced $$ dollar quotes, unbalanced parentheses, a service_role key, a personal email,
         a sign-in email in a policy, a secret key (sb_secret_), empty file.
  WARN   CREATE TABLE without IF NOT EXISTS, CREATE POLICY without a DROP POLICY IF EXISTS just before it,
         CREATE EXTENSION (may need rights the dashboard does not give), a file larger than 150 KB
         (the editor can choke on very large pastes; split it), no rollback test, no RLS on a new table.
"""
import re
import sys
from pathlib import Path

MAX_BYTES = 150 * 1024
EMAIL = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}")
EMAIL_OK = re.compile(r"@example\.(com|org|net)|noreply")


def strip_comments(sql):
    """Return the SQL with -- comments removed (kept line count), for structural checks."""
    out = []
    for line in sql.split("\n"):
        out.append(re.sub(r"--.*$", "", line))
    return "\n".join(out)


def dollar_balanced(sql):
    tags = re.findall(r"\$([A-Za-z_]*)\$", strip_comments(sql))
    stack = []
    for t in tags:
        if stack and stack[-1] == t:
            stack.pop()
        else:
            stack.append(t)
    return not stack


def parens_balanced(sql):
    code = re.sub(r"'(?:[^']|'')*'", "''", strip_comments(sql))
    code = re.sub(r"\$([A-Za-z_]*)\$.*?\$\1\$", "", code, flags=re.S)
    return code.count("(") == code.count(")")


def check(path):
    p = Path(path)
    problems = []
    raw = p.read_bytes()
    if not raw.strip():
        return [("BLOCK", "file is empty")]
    if len(raw) > MAX_BYTES:
        problems.append(("WARN", f"{len(raw) // 1024} KB: split it into smaller files before pasting"))
    sql = raw.decode("utf-8", errors="replace")
    lines = sql.split("\n")
    for i, line in enumerate(lines, 1):
        if re.match(r"^\s*\\[a-zA-Z]", line):
            problems.append(("BLOCK", f"line {i}: psql meta-command (the dashboard editor cannot run it)"))
        if re.search(r"\bcopy\b.*\bfrom\s+'", line, re.I) or re.search(r"\bpg_read_file\b|\blo_import\b", line, re.I):
            problems.append(("BLOCK", f"line {i}: reads a server file; load data from the client instead"))
        if re.search(r"service_role", line, re.I) and not re.search(r"never|not|no |don't|must not|do not", line, re.I):
            problems.append(("BLOCK", f"line {i}: service_role appears (never in a repo)"))
        if "sb_secret_" in line:
            problems.append(("BLOCK", f"line {i}: secret key (sb_secret_)"))
        for m in EMAIL.finditer(line):
            if not EMAIL_OK.search(m.group(0)):
                problems.append(("BLOCK", f"line {i}: email address in the SQL (use platform_is_owner(); see 04 AI/Supabase/platform_owner.sql)"))
        if re.search(r"create\s+table\s+(?!if\s+not\s+exists)", line, re.I):
            problems.append(("WARN", f"line {i}: CREATE TABLE without IF NOT EXISTS (a re-run will fail)"))
        if re.search(r"create\s+extension", line, re.I) and "if not exists" not in line.lower():
            problems.append(("WARN", f"line {i}: CREATE EXTENSION may need rights the dashboard does not give"))
    if not dollar_balanced(sql):
        problems.append(("BLOCK", "unbalanced $$ dollar quotes (a function body or DO block is cut off)"))
    if not parens_balanced(sql):
        problems.append(("BLOCK", "unbalanced parentheses"))
    code = strip_comments(sql)
    for m in re.finditer(r"create\s+policy", code, re.I):
        before = code[:m.start()]
        window = before[-300:]
        if not re.search(r"drop\s+policy\s+if\s+exists", window, re.I):
            line_no = before.count("\n") + 1
            problems.append(("WARN", f"line {line_no}: CREATE POLICY without DROP POLICY IF EXISTS just before it (re-run fails)"))
    for m in re.finditer(r"create\s+table\s+(?:if\s+not\s+exists\s+)?(?:public\.)?(\w+)", code, re.I):
        name = m.group(1)
        if not re.search(rf"alter\s+table\s+(?:public\.)?{name}\s+enable\s+row\s+level\s+security", code, re.I):
            problems.append(("WARN", f"table {name}: no 'enable row level security' in this file"))
    if not re.search(r"\bdo\s+\$\$|raise\s+exception|rollback", sql, re.I) and "create table" in code.lower():
        problems.append(("WARN", "no rollback test in this file (keep it in a separate file or a commented block)"))
    return problems


def main(argv):
    if not argv:
        print(__doc__)
        return 2
    blocked = False
    for f in argv:
        probs = check(f)
        print(f"== {f}")
        if not probs:
            print("   OK: safe to paste")
        for level, msg in probs:
            print(f"   {level:5} {msg}")
            if level == "BLOCK":
                blocked = True
    print("RESULT:", "BLOCKED" if blocked else "ok")
    return 1 if blocked else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
