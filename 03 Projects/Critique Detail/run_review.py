#!/usr/bin/env python3
"""Detail Critique MVP: review one architectural detail against a CSI rulebook.

    python3 run_review.py inputs/detail_sample.png --describe "Exterior low-slope roof parapet detail" --mock
    python3 run_review.py inputs/private/my_detail.pdf --describe "Window head"          # live, needs a Claude key
    python3 run_review.py inputs/detail_sample.png --mock --push                           # also save to the database

Live runs use the Claude API through the `anthropic` package (pip install anthropic) and
the usual credentials (ANTHROPIC_API_KEY, or an `ant auth login` profile).
--mock sends nothing anywhere: it uses a hand-written fixture next to the input if one
exists (<name>.mock.json), otherwise it lists the checklist as "not reviewed".
PDF input needs PyMuPDF (pip install pymupdf). PNG and JPEG need only Pillow.
"""
import argparse
import base64
import io
import json
import math
import os
import re
import sys
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageStat

ROOT = Path(__file__).resolve().parent
VERSION = "0.1.0"
MODEL = "claude-opus-5-5"
SEVERITIES = ["CRITICAL", "MAJOR", "ADVISORY"]
SEVERITY_MEANING = {
    "CRITICAL": "water entry or structural failure",
    "MAJOR": "building code or project mandate non-compliance",
    "ADVISORY": "lesson learned or best practice",
}
SUPABASE_URL = "https://xabgankckrcuhcgdolrg.supabase.co"      # Architecture project
SUPABASE_KEY = "sb_publishable_kncKodoYJZ6ByexwWM_TtQ_OpW68M5f"  # publishable key (safe in public code)
BUCKET = "dc-details"


def log(step, text):
    print("[%s] %s" % (step, text))


def read_json(path, default=None):
    try:
        return json.loads(Path(path).read_text(encoding="utf-8"))
    except FileNotFoundError:
        return default


def write_json(path, data):
    Path(path).parent.mkdir(parents=True, exist_ok=True)
    Path(path).write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def slugify(text):
    return re.sub(r"[^a-z0-9]+", "_", text.lower()).strip("_") or "detail"


# ---------------------------------------------------------------- Phase 1: intake and routing

def load_image(path):
    """Return the detail as an RGB image. A PDF is rasterised (first page, 200 dpi)."""
    path = Path(path)
    if path.suffix.lower() == ".pdf":
        try:
            import pymupdf
        except ImportError:
            sys.exit("PDF input needs PyMuPDF. Run: pip install pymupdf   (or export the detail as PNG)")
        doc = pymupdf.open(path)
        if doc.page_count > 1:
            log("intake", "PDF has %d pages; reviewing page 1 only" % doc.page_count)
        pix = doc[0].get_pixmap(dpi=200, alpha=False)
        return Image.frombytes("RGB", (pix.width, pix.height), pix.samples)
    return Image.open(path).convert("RGB")


def load_schemas():
    out = {}
    for f in sorted((ROOT / "schemas").glob("div_*/*.json")):
        s = read_json(f)
        s["_path"] = str(f.relative_to(ROOT))
        out[s["key"]] = s
    return out


def match_schema(text, schemas):
    """Fast path: score each rulebook by how many of its keywords appear in the description."""
    text = text.lower()
    best, best_score = None, 0
    for key, s in schemas.items():
        score = sum(len(k.split()) for k in s.get("keywords", []) if k.lower() in text)
        if score > best_score:
            best, best_score = key, score
    return best


def png_bytes(img, long_edge=2000):
    if max(img.size) > long_edge:
        img = img.copy()
        img.thumbnail((long_edge, long_edge))
    buf = io.BytesIO()
    img.save(buf, "PNG")
    return buf.getvalue()


def ask_claude(model, system, img, prompt, schema):
    """One structured call: image + text in, JSON matching `schema` out."""
    try:
        import anthropic
    except ImportError:
        sys.exit("Live runs need the anthropic package. Run: pip install anthropic   (or add --mock)")
    client = anthropic.Anthropic()
    content = [
        {"type": "image", "source": {"type": "base64", "media_type": "image/png",
                                     "data": base64.standard_b64encode(png_bytes(img)).decode("ascii")}},
        {"type": "text", "text": prompt},
    ]
    try:
        # fallbacks="default": if a safety classifier declines, the API re-runs the request on a fallback model.
        resp = client.beta.messages.create(
            model=model, max_tokens=16000, system=system,
            betas=["server-side-fallback-2026-07-01"], fallbacks="default",
            output_config={"effort": "high", "format": {"type": "json_schema", "schema": schema}},
            messages=[{"role": "user", "content": content}],
        )
    except anthropic.AuthenticationError:
        sys.exit("Claude rejected the credentials. Set ANTHROPIC_API_KEY or run `ant auth login`, or add --mock.")
    except anthropic.RateLimitError:
        sys.exit("Claude rate limit reached. Wait a minute and run again.")
    except anthropic.APIStatusError as e:
        sys.exit("Claude API error %s: %s" % (e.status_code, e.message))
    except anthropic.APIConnectionError as e:
        sys.exit("Could not reach the Claude API: %s" % e)
    if resp.stop_reason == "refusal":
        sys.exit("The model declined this request (%s)." % getattr(resp.stop_details, "category", "no category"))
    if resp.stop_reason == "max_tokens":
        sys.exit("The reply was cut off at max_tokens; nothing was saved.")
    text = next(b.text for b in resp.content if b.type == "text")
    return json.loads(text), resp.model


def obj(props):
    return {"type": "object", "properties": props, "required": list(props), "additionalProperties": False}


STR = {"type": "string"}
CLASSIFY_SCHEMA = obj({"match": {"anyOf": [STR, {"type": "null"}]}, "csi_division": STR, "slug": STR, "title": STR})
NEW_SCHEMA = obj({
    "title": STR, "keywords": {"type": "array", "items": STR},
    "checklist": {"type": "array", "items": obj({
        "item": STR, "why": STR, "default_severity": {"type": "string", "enum": SEVERITIES},
        "tags": {"type": "array", "items": STR}})}})
BOX = obj({k: {"type": "integer"} for k in ("ymin", "xmin", "ymax", "xmax")})
AUDIT_SCHEMA = obj({
    "detail_type": STR,
    "completeness": obj({"scale_shown": {"type": "boolean"}, "materials_labelled": {"type": "boolean"},
                         "geometry_clear": {"type": "boolean"}, "missing": {"type": "array", "items": STR}}),
    "summary": STR,
    "checklist_results": {"type": "array", "items": obj({
        "id": STR, "status": {"type": "string", "enum": ["pass", "fail", "not_shown"]}, "note": STR})},
    "findings": {"type": "array", "items": obj({
        "checklist_id": STR, "severity": {"type": "string", "enum": SEVERITIES}, "title": STR, "issue": STR,
        "recommendation": STR,
        "basis": {"type": "string", "enum": ["building_science", "project_rule", "lesson_learned"]},
        "box": BOX, "confidence": {"type": "string", "enum": ["high", "medium", "low"]}})},
})

DIVISIONS = {"03": "concrete", "04": "masonry", "05": "metals", "06": "wood_plastics_composites",
             "07": "thermal_moisture", "08": "openings", "09": "finishes"}


def route(description, img, schemas, args):
    """Find the rulebook for this detail, or learn a new one (deferred learning path)."""
    text = "%s %s" % (description, Path(args.detail).stem.replace("_", " "))
    key = match_schema(text, schemas)
    info = None
    if not key and not args.mock:
        listing = "\n".join("- %s: %s" % (k, s["title"]) for k, s in schemas.items())
        info, _ = ask_claude(
            args.model, "You sort architectural construction details by CSI MasterFormat division.", img,
            "Description from the user: %s\n\nExisting rulebooks:\n%s\n\nIf one of these rulebooks fits the drawing, "
            "return its key in `match`. If none fits, return null in `match` and give the two-digit division "
            "(03 to 09), a short snake_case `slug` for the detail type and a plain `title`."
            % (description or "(none)", listing), CLASSIFY_SCHEMA)
        if info["match"] in schemas:
            key = info["match"]
    if key:
        log("route", "fast path: %s" % key)
        return schemas[key], False

    # Deferred learning path
    div = (info or {}).get("csi_division", "")
    if div not in DIVISIONS:   # no model answer (mock run): guess from the words, else 07
        words = (description + " " + Path(args.detail).stem).lower()
        hints = [("08", "window door storefront curtain glaz louver"), ("04", "brick masonry cmu stone veneer"),
                 ("03", "concrete slab footing precast"), ("05", "steel stair railing metal deck"),
                 ("06", "wood timber millwork casework"), ("09", "gypsum tile ceiling plaster flooring")]
        div = next((d for d, keys in hints if any(k in words for k in keys.split())), "07")
    slug = slugify((info or {}).get("slug") or description or Path(args.detail).stem)[:40]
    title = (info or {}).get("title") or description or slug.replace("_", " ")
    key = "div_%s_%s/%s" % (div, DIVISIONS[div], slug)
    queue = read_json(ROOT / "schemas/_queue.json", {"queue": []})
    queue["queue"].append({"at": now(), "key": key, "description": description, "input": Path(args.detail).name,
                           "mode": "mock" if args.mock else "live"})
    write_json(ROOT / "schemas/_queue.json", queue)
    template = read_json(ROOT / "schemas/_template.json")
    template.pop("_note", None)
    new = dict(template, key=key, csi_division=div, title=title, keywords=[title.lower()])
    if args.mock:
        new["status"] = "draft"
        generic = [
            ("Primary water control layer is continuous and its laps shed water outward.", "CRITICAL"),
            ("Flashings have slope, end dams and a drip edge clear of the face below.", "CRITICAL"),
            ("Structural support and attachment of each element are shown.", "CRITICAL"),
            ("Air barrier and thermal insulation are continuous across the joint.", "MAJOR"),
            ("Materials and dimensions meet the project's code edition and mandates.", "MAJOR"),
            ("Every material is tagged and the detail has a scale and key dimensions.", "ADVISORY")]
        new["checklist"] = [{"id": "GEN-%d" % (i + 1), "item": t, "why": "Generic item written in mock mode. Replace it.",
                             "default_severity": s, "tags": []} for i, (t, s) in enumerate(generic)]
    else:
        made, _ = ask_claude(
            args.model,
            "You are a senior building-envelope reviewer writing an office QA checklist. Be specific and "
            "measurable. Severity: CRITICAL = water entry or structural failure, MAJOR = code or mandate "
            "non-compliance, ADVISORY = best practice.", img,
            "This drawing is a '%s' (CSI division %s). No rulebook exists for this detail type yet. Write one: "
            "exactly 6 checklist items that a reviewer should check on any detail of this type, most serious "
            "first. Each `item` states what a correct detail shows; `why` says what goes wrong without it."
            % (title, div), NEW_SCHEMA)
        new.update(title=made["title"] or title, keywords=made["keywords"] or new["keywords"], status="active")
        prefix = "".join(w[0] for w in slug.split("_")[:3]).upper() or "NEW"
        new["checklist"] = [dict(c, id="%s-%d" % (prefix, i + 1)) for i, c in enumerate(made["checklist"][:6])]
    path = ROOT / "schemas" / (key + ".json")
    write_json(path, new)
    new["_path"] = str(path.relative_to(ROOT))
    log("route", "deferred learning: wrote %s (%d items, status %s)" % (new["_path"], len(new["checklist"]), new["status"]))
    return new, True


# ---------------------------------------------------------------- Phase 2: the five steps

def step1_triage(img):
    """Soft checks a script can do alone. Warnings only; the run always continues."""
    warnings = []
    w, h = img.size
    if max(w, h) < 1000:
        warnings.append("Low resolution (%d x %d px). Small text may not be readable." % (w, h))
    grey = img.convert("L")
    if ImageStat.Stat(grey).stddev[0] < 12:
        warnings.append("Very low contrast. The sheet may be blank or a faint scan.")
    dark = sum(grey.histogram()[:128]) / float(w * h)
    if dark < 0.004:
        warnings.append("Almost no linework found (%.2f%% dark pixels)." % (dark * 100))
    return warnings


def step2_constraints(schema, context_path):
    context = read_json(context_path, {})
    context = {k: v for k, v in context.items() if not k.startswith("_")}
    lessons = [l for l in read_json(ROOT / "library/lessons_learned.json", {"lessons": []})["lessons"]
               if l.get("category") in (schema["key"], "*")]
    return context, lessons


SYSTEM = """You are a senior architect and building-envelope reviewer doing a QA redline of one construction detail.
Judge only what the drawing shows. If something is not drawn or not legible, say it is not shown; do not assume it.
Severity is strict:
- CRITICAL: a path for water into the assembly, or a structural or attachment failure.
- MAJOR: does not meet the stated building code, energy code or a project mandate.
- ADVISORY: a lesson learned or best practice; the detail would still work.
For each finding give a box around the place on the drawing it refers to, as integers from 0 to 1000 measured
from the top-left corner of the image: ymin, xmin, ymax, xmax. Keep boxes tight. If a finding is about something
missing, box the place where it should be. Write for the person who will fix the drawing: plain, short, specific."""


def step3_audit(img, schema, context, lessons, description, args):
    fixture = Path(args.detail).with_suffix(".mock.json")
    if args.mock:
        if fixture.exists():
            data = read_json(fixture)
            data.pop("_note", None)
            return data, "mock (hand-written fixture %s)" % fixture.name
        return {
            "detail_type": schema["title"], "summary": "Mock run: no model looked at this drawing. Each checklist item is listed for a manual check.",
            "completeness": {"scale_shown": False, "materials_labelled": False, "geometry_clear": False,
                             "missing": ["not checked (mock run)"]},
            "checklist_results": [{"id": c["id"], "status": "not_shown", "note": "not reviewed (mock run)"} for c in schema["checklist"]],
            "findings": [{"checklist_id": c["id"], "severity": c["default_severity"], "title": "Not reviewed: " + c["id"],
                          "issue": c["item"], "recommendation": "Check by hand. " + c["why"], "basis": "building_science",
                          "box_2d": None, "confidence": "low"} for c in schema["checklist"]],
        }, "mock (no fixture; checklist only)"
    checklist = "\n".join("- %s [%s by default] %s (Why: %s)" % (c["id"], c["default_severity"], c["item"], c["why"])
                          for c in schema["checklist"])
    prompt = (
        "Detail description: %s\nRulebook: %s (CSI division %s)\n\nChecklist:\n%s\n\nProject constraints:\n%s\n\n"
        "Lessons learned for this category:\n%s\n\n"
        "Do all of this in one pass:\n1. Completeness: is a scale shown, are the primary materials labelled, is the "
        "geometry clear? List what is missing.\n2. Give every checklist item a result: pass, fail or not_shown.\n"
        "3. Report findings for each failed or not-shown item that matters, and for anything else on the drawing that "
        "breaks building science (moisture control, thermal bridging, flashing slope) or a project constraint. Use the "
        "checklist id in `checklist_id`, or 'OTHER' when the finding is outside the checklist."
        % (description or "(none given)", schema["title"], schema["csi_division"], checklist,
           json.dumps(context, indent=1), "\n".join("- %s: %s" % (l["id"], l["text"]) for l in lessons) or "(none)"))
    data, served = ask_claude(args.model, SYSTEM, img, prompt, AUDIT_SCHEMA)
    for f in data["findings"]:
        b = f.pop("box")
        f["box_2d"] = [b["ymin"], b["xmin"], b["ymax"], b["xmax"]]
    return data, "live (%s)" % served


def step4_prioritise(findings):
    """Strict severity order, then numbered. Boxes are clamped to the sheet."""
    clean = []
    for f in findings:
        if f.get("severity") not in SEVERITIES:
            f["severity"] = "ADVISORY"
        b = f.get("box_2d")
        if b and len(b) == 4:
            y0, x0, y1, x1 = [max(0, min(1000, int(v))) for v in b]
            f["box_2d"] = [min(y0, y1), min(x0, x1), max(y0, y1), max(x0, x1)]
            if f["box_2d"][2] - f["box_2d"][0] < 4 or f["box_2d"][3] - f["box_2d"][1] < 4:
                f["box_2d"] = None
        else:
            f["box_2d"] = None
        clean.append(f)
    clean.sort(key=lambda f: SEVERITIES.index(f["severity"]))
    for n, f in enumerate(clean, 1):
        f["n"] = n
    return clean, {s: sum(1 for f in clean if f["severity"] == s) for s in SEVERITIES}


def add_references(findings, schema):
    """Link each finding to office standard and manufacturer details for the same rulebook."""
    tags_by_id = {c["id"]: set(c.get("tags", [])) for c in schema["checklist"]}
    library = []
    for folder in ("office_typical_details", "manufacturer_standards"):
        for d in read_json(ROOT / "library" / folder / "index.json", {"details": []})["details"]:
            library.append(dict(d, library=folder))
    for f in findings:
        tags = tags_by_id.get(f.get("checklist_id"), set())
        refs = [d for d in library if d["schema_key"] == schema["key"] and (not tags or tags & set(d.get("tags", [])))]
        f["references"] = [{"id": d["id"], "title": d["title"], "library": d["library"], "file": d["file"]} for d in refs]


RED = (200, 30, 40)


def load_font(size):
    for name in ("DejaVuSans-Bold.ttf", "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", "Arial Bold.ttf", "arialbd.ttf"):
        try:
            return ImageFont.truetype(name, size)
        except OSError:
            continue
    return ImageFont.load_default()


def cloud(draw, box, r, width):
    """A revision cloud: a row of outward arcs along each side of the box."""
    x0, y0, x1, y1 = box
    def side(ax, ay, bx, by, start):
        length = math.hypot(bx - ax, by - ay)
        n = max(1, int(round(length / (2 * r))))
        step = length / n
        for i in range(n):
            cx = ax + (bx - ax) * (i + 0.5) / n
            cy = ay + (by - ay) * (i + 0.5) / n
            rr = step / 2
            draw.arc([cx - rr, cy - rr, cx + rr, cy + rr], start, start + 180, fill=RED, width=width)
    side(x0, y0, x1, y0, 180)   # top, bulging up
    side(x1, y0, x1, y1, 270)   # right
    side(x1, y1, x0, y1, 0)     # bottom
    side(x0, y1, x0, y0, 90)    # left


def step5_markup(img, findings, out_path, mode):
    marked = img.copy()
    draw = ImageDraw.Draw(marked)
    w, h = marked.size
    unit = max(w, h) / 1600.0
    r, lw = 13 * unit, max(2, int(3 * unit))
    font = load_font(int(24 * unit))
    for f in findings:
        if not f["box_2d"]:
            continue
        y0, x0, y1, x1 = [v / 1000.0 for v in f["box_2d"]]
        box = (x0 * w, y0 * h, x1 * w, y1 * h)
        cloud(draw, box, r, lw)
        br = 20 * unit                                    # numbered bubble at the top-left corner
        cx, cy = max(br + 2, box[0] - br * 0.6), max(br + 2, box[1] - br * 0.6)
        draw.ellipse([cx - br, cy - br, cx + br, cy + br], fill=(255, 255, 255), outline=RED, width=lw)
        label = str(f["n"])
        tw = draw.textlength(label, font=font)
        draw.text((cx - tw / 2, cy - 15 * unit), label, fill=RED, font=font)
    if mode.startswith("mock"):
        draw.text((12 * unit, 10 * unit), "MOCK REVIEW - not produced by a model", fill=RED, font=load_font(int(18 * unit)))
    Path(out_path).parent.mkdir(parents=True, exist_ok=True)
    marked.save(out_path, optimize=True)
    return marked


def markdown(report):
    L = ["# Detail critique: %s" % report["detail"]["title"], "",
         "- Input: `%s` (%d x %d px)" % (report["detail"]["input"], report["detail"]["width"], report["detail"]["height"]),
         "- Rulebook: `%s`%s" % (report["schema"]["key"], " (new, generated this run)" if report["schema"]["generated"] else ""),
         "- Mode: %s" % report["mode"], "- Run: %s" % report["run_at"],
         "- Project: %s, %s, climate zone %s" % (report["context"].get("project", "-"), report["context"].get("building_code", "-"),
                                                 report["context"].get("ashrae_climate_zone", "-")), ""]
    if report["mode"].startswith("mock"):
        L += ["> **Mock run.** No model looked at this drawing.", ""]
    L += ["## Summary", "", report["summary"], "",
          "**%d critical, %d major, %d advisory**" % tuple(report["counts"][s] for s in SEVERITIES), "",
          "## Step 1. Completeness", ""]
    c = report["completeness"]
    L += ["- Scale shown: %s" % yn(c["scale_shown"]), "- Primary materials labelled: %s" % yn(c["materials_labelled"]),
          "- Geometry clear: %s" % yn(c["geometry_clear"])]
    L += ["- Missing: %s" % m for m in c["missing"]] + ["- Warning: %s" % x for x in report["warnings"]] + [""]
    L += ["## Findings", ""]
    for s in SEVERITIES:
        rows = [f for f in report["findings"] if f["severity"] == s]
        if not rows:
            continue
        L += ["### %s (%s)" % (s, SEVERITY_MEANING[s]), ""]
        for f in rows:
            L += ["**%d. %s** `%s`" % (f["n"], f["title"], f["checklist_id"]), "", f["issue"], "",
                  "*Fix:* " + f["recommendation"], ""]
            if f["references"]:
                L += ["*See:* " + "; ".join("%s %s" % (r["id"], r["title"]) for r in f["references"]), ""]
    L += ["## Checklist", "", "| Item | Result | Note |", "|---|---|---|"]
    L += ["| %s | %s | %s |" % (r["id"], r["status"], r["note"]) for r in report["checklist_results"]]
    L += ["", "Markup: `%s`" % report["markup"], "",
          "_A model review is a second pair of eyes, not a sign-off. Box positions are approximate._", ""]
    return "\n".join(L)


def yn(v):
    return "yes" if v else "no"


def now():
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


# ---------------------------------------------------------------- Database (optional, owner sign-in)

def http(method, url, token, body=None, headers=None, raw=False):
    h = {"apikey": SUPABASE_KEY, "Authorization": "Bearer " + (token or SUPABASE_KEY)}
    if body is not None and not raw:
        body = json.dumps(body).encode("utf-8")
        h["Content-Type"] = "application/json"
    h.update(headers or {})
    req = urllib.request.Request(url, data=body, headers=h, method=method)
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            text = resp.read().decode("utf-8")
            return json.loads(text) if text else None
    except urllib.error.HTTPError as e:
        raise SystemExit("Database refused %s %s: %s %s" % (method, url.split("?")[0], e.code, e.read().decode("utf-8")[:300]))
    except urllib.error.URLError as e:
        raise SystemExit("Could not reach the database: %s" % e.reason)


def push(report, schema, image_png, markup_png, base=None):
    """Save the detail, review, findings and rulebook to the Architecture database as the owner."""
    base = base or os.environ.get("DC_SUPABASE_URL", SUPABASE_URL)
    email, password = os.environ.get("DC_EMAIL"), os.environ.get("DC_PASSWORD")
    if not email or not password:
        sys.exit("--push needs DC_EMAIL and DC_PASSWORD in the environment (the owner sign-in). Nothing was sent.")
    token = http("POST", base + "/auth/v1/token?grant_type=password", None, {"email": email, "password": password})["access_token"]
    rest, slug = base + "/rest/v1/", report["detail"]["slug"]
    up = {"Prefer": "resolution=merge-duplicates,return=representation"}
    paths = {}
    for name, data in (("detail.png", image_png), ("markup.png", markup_png)):
        paths[name] = "%s/%s" % (slug, name)
        http("POST", "%s/storage/v1/object/%s/%s" % (base, BUCKET, paths[name]), token, data,
             {"Content-Type": "image/png", "x-upsert": "true"}, raw=True)
    http("POST", rest + "dc_schemas?on_conflict=key", token, {
        "key": schema["key"], "csi_division": schema["csi_division"], "title": schema["title"],
        "checklist": schema["checklist"], "source": schema.get("source", "seed"), "status": schema.get("status", "active")}, up)
    d = report["detail"]
    detail = http("POST", rest + "dc_details?on_conflict=slug", token, {
        "slug": slug, "title": d["title"], "description": d["description"], "csi_division": schema["csi_division"],
        "schema_key": schema["key"], "source_kind": d["source_kind"], "image_path": paths["detail.png"],
        "width": d["width"], "height": d["height"]}, up)[0]
    review = http("POST", rest + "dc_reviews", token, {
        "detail_id": detail["id"], "run_at": report["run_at"], "mode": report["mode"], "summary": report["summary"],
        "counts": report["counts"], "markup_path": paths["markup.png"], "report": report,
        "version": VERSION}, {"Prefer": "return=representation"})[0]
    http("POST", rest + "dc_findings", token, [{
        "review_id": review["id"], "n": f["n"], "severity": f["severity"], "checklist_id": f["checklist_id"],
        "title": f["title"], "issue": f["issue"], "recommendation": f["recommendation"], "basis": f["basis"],
        "box_2d": f["box_2d"], "refs": f["references"]} for f in report["findings"]], {"Prefer": "return=minimal"})
    log("push", "saved detail %s, review %s, %d findings" % (slug, review["id"], len(report["findings"])))


# ---------------------------------------------------------------- main

def main():
    p = argparse.ArgumentParser(description="Review one architectural detail against a CSI rulebook.")
    p.add_argument("detail", help="PDF, PNG or JPEG of one detail")
    p.add_argument("--describe", default="", help='one line, e.g. "Exterior low-slope roof parapet detail"')
    p.add_argument("--context", default=str(ROOT / "project_context.json"))
    p.add_argument("--out", default=str(ROOT / "outputs"))
    p.add_argument("--model", default=MODEL)
    p.add_argument("--mock", action="store_true", help="no model call; use the fixture or list the checklist")
    p.add_argument("--push", action="store_true", help="also save to the Architecture database (owner sign-in)")
    p.add_argument("--source-kind", default="sample", choices=["sample", "sketch", "own"],
                   help="what the detail is; office project details are not accepted")
    args = p.parse_args()
    if not Path(args.detail).exists():
        sys.exit("No such file: %s" % args.detail)

    img = load_image(args.detail)
    stem = slugify(Path(args.detail).stem)
    log("intake", "%s, %d x %d px" % (Path(args.detail).name, img.width, img.height))
    schema, generated = route(args.describe, img, load_schemas(), args)

    warnings = step1_triage(img)
    for w in warnings:
        log("step 1", "warning: " + w)
    context, lessons = step2_constraints(schema, args.context)
    log("step 2", "%d constraints, %d lessons" % (len(context), len(lessons)))
    data, mode = step3_audit(img, schema, context, lessons, args.describe, args)
    log("step 3", "audit done, mode %s" % mode)
    for m in data["completeness"]["missing"]:
        log("step 1", "missing: " + m)
    findings, counts = step4_prioritise(data["findings"])
    add_references(findings, schema)
    log("step 4", "%d critical, %d major, %d advisory" % tuple(counts[s] for s in SEVERITIES))

    out = Path(args.out)
    markup_path = out / "markups" / (stem + "_markup.png")
    marked = step5_markup(img, findings, markup_path, mode)
    def rel(path):
        path = Path(path).resolve()
        return path.relative_to(ROOT).as_posix() if path.is_relative_to(ROOT) else path.name
    report = {
        "tool": "detail-critique", "version": VERSION, "run_at": now(), "mode": mode,
        "detail": {"slug": stem, "title": data.get("detail_type") or schema["title"], "description": args.describe,
                   "input": rel(args.detail), "width": img.width, "height": img.height, "source_kind": args.source_kind},
        "schema": {"key": schema["key"], "title": schema["title"], "csi_division": schema["csi_division"],
                   "generated": generated, "status": schema.get("status", "active"), "checklist": schema["checklist"]},
        "context": context, "lessons": lessons, "warnings": warnings,
        "completeness": data["completeness"], "summary": data["summary"],
        "checklist_results": data["checklist_results"], "counts": counts, "findings": findings,
        "markup": rel(markup_path),
    }
    write_json(out / "reports" / (stem + ".json"), report)
    (out / "reports" / (stem + ".md")).write_text(markdown(report), encoding="utf-8")
    log("step 5", "wrote %s, %s and %s" % (rel(out / "reports" / (stem + ".json")), stem + ".md", report["markup"]))
    if args.push:
        buf = io.BytesIO()
        marked.save(buf, "PNG")
        push(report, schema, png_bytes(img, 4000), buf.getvalue())


if __name__ == "__main__":
    main()
