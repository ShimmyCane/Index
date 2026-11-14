#!/usr/bin/env python3
"""Critique Detail: the framework around a review of one architectural detail.

This script calls no AI service and holds no key. The review itself is written by a
reviewer (Claude in a session, or a person) as one JSON file. The script does the rest.

  1. python3 run_review.py prepare inputs/detail_sample.png --describe "Low-slope roof parapet"
        routes the detail to a CSI rulebook, runs the local part of the gate, builds the
        adaptive QC list, and writes a packet for the reviewer (outputs/packets/).
  2. the reviewer reads the packet and the drawing and writes <name>.review.json  (see reviewer.md)
  3. python3 run_review.py apply inputs/detail_sample.png --review inputs/detail_sample.review.json
        checks the review file, applies the hard gate, computes the proof and the verdict,
        and writes the report (.json, .md) and the redlined image. Add --push to save to the cloud.

PDF input needs PyMuPDF (pip install pymupdf). PNG and JPEG need only Pillow.
"""
import argparse
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
VERSION = "0.2.0"
SEVERITIES = ["CRITICAL", "MAJOR", "ADVISORY"]
SEVERITY_MEANING = {"CRITICAL": "water entry or structural failure",
                    "MAJOR": "building code or project mandate non-compliance",
                    "ADVISORY": "lesson learned or best practice"}
RESULTS = ["pass", "fail", "not_shown", "na"]
LAYERS = ["water", "air", "thermal", "vapor"]
LAYER_STATES = ["continuous", "broken", "not_shown", "na"]
ENVELOPE_DIVISIONS = {"03", "04", "05", "06", "07", "08"}
SOURCE_KINDS = ["sample", "sketch", "own", "office", "quick_detail", "library"]
SUPABASE_URL = "https://xabgankckrcuhcgdolrg.supabase.co"      # Architecture project
SUPABASE_KEY = "sb_publishable_kncKodoYJZ6ByexwWM_TtQ_OpW68M5f"  # publishable key (safe in public code)
BUCKET = "dc-details"
DIVISIONS = {"03": "concrete", "04": "masonry", "05": "metals", "06": "wood_plastics_composites",
             "07": "thermal_moisture", "08": "openings", "09": "finishes", "10": "specialties",
             "12": "furnishings", "14": "conveying", "32": "exterior_improvements"}


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


def now():
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def rel(path):
    path = Path(path).resolve()
    return path.relative_to(ROOT).as_posix() if path.is_relative_to(ROOT) else path.name


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
        s["_path"] = f.relative_to(ROOT).as_posix()
        out[s["key"]] = s
    return out


def match_schema(text, schemas):
    """Score each rulebook by how many of its keywords appear in the description. Full rulebooks win ties."""
    text = text.lower()
    best, best_score = None, 0
    for key, s in schemas.items():
        score = sum(len(k.split()) for k in s.get("keywords", []) if k.lower() in text)
        score = score * 2 + (1 if s["checklist"] else 0) if score else 0
        if score > best_score:
            best, best_score = key, score
    return best


def route(description, detail_path, schemas, forced=None):
    """Fast path: an existing rulebook. Otherwise queue the detail type and start a stub for the reviewer to fill."""
    if forced:
        if forced not in schemas:
            sys.exit("No rulebook with key %s. See schemas/." % forced)
        return schemas[forced], False
    text = "%s %s" % (description, Path(detail_path).stem.replace("_", " "))
    key = match_schema(text, schemas)
    if key:
        return schemas[key], False
    words = text.lower()
    hints = [("08", "window door storefront curtain glaz louver skylight"), ("04", "brick masonry cmu stone veneer"),
             ("03", "concrete slab footing precast"), ("05", "steel stair railing metal deck guard"),
             ("06", "wood timber millwork casework"), ("09", "gypsum tile ceiling plaster flooring partition"),
             ("10", "toilet signage locker"), ("32", "paving curb sidewalk ramp")]
    div = next((d for d, keys in hints if any(k in words for k in keys.split())), "07")
    slug = slugify(description or Path(detail_path).stem)[:40]
    key = "div_%s_%s/%s0000_%s" % (div, DIVISIONS[div], div, slug)
    queue = read_json(ROOT / "schemas/_queue.json", {"queue": []})
    queue["queue"].append({"at": now(), "key": key, "description": description, "input": Path(detail_path).name})
    write_json(ROOT / "schemas/_queue.json", queue)
    new = read_json(ROOT / "schemas/_template.json")
    new.pop("_note", None)
    new.update(key=key, csi_division=div, csi_section="%s 00 00" % div, subcategory="Unsorted",
               title=description or slug.replace("_", " "), keywords=[(description or slug).lower()], source="auto")
    write_json(ROOT / "schemas" / (key + ".json"), new)
    new["_path"] = "schemas/%s.json" % key
    return new, True


# ---------------------------------------------------------------- the gate and the adaptive QC list

def local_gate(img):
    """What a script can judge alone. `hard` problems reject the detail; `warnings` do not."""
    hard, warnings = [], []
    w, h = img.size
    grey = img.convert("L")
    dark = sum(grey.histogram()[:128]) / float(w * h)
    if max(w, h) < 600:
        hard.append("Image is %d x %d px. That is too small to read a detail." % (w, h))
    elif max(w, h) < 1000:
        warnings.append("Low resolution (%d x %d px). Small text may not be readable." % (w, h))
    if ImageStat.Stat(grey).stddev[0] < 8 or dark < 0.002:
        hard.append("Almost no linework on the sheet (%.2f%% dark pixels). It looks blank." % (dark * 100))
    return hard, warnings


def load_context(path):
    context = {k: v for k, v in (read_json(path, {}) or {}).items() if not k.startswith("_")}
    mandates = []
    for i, m in enumerate(context.get("mandates", []), 1):      # a mandate may be a plain sentence
        mandates.append(m if isinstance(m, dict) else {"id": "PM-%d" % i, "text": m, "applies_to": "*", "severity": "MAJOR"})
    context["mandates"] = mandates
    return context


def build_qc_list(schema, context):
    """The adaptive QC list for this detail on this project:
    rulebook items (minus those whose `when` does not match the project) + project mandates + lessons learned."""
    qc, skipped = [], []
    for c in schema["checklist"]:
        when = c.get("when")
        if when and context.get(when["key"]) not in when["in"]:
            skipped.append({"id": c["id"], "reason": "%s is %r" % (when["key"], context.get(when["key"]))})
            continue
        qc.append({"id": c["id"], "item": c["item"], "why": c["why"], "severity": c["default_severity"],
                   "origin": "condition" if when else "rulebook", "tags": c.get("tags", []), "good": c.get("good", "")})
    for m in context["mandates"]:
        applies = m.get("applies_to", "*")
        if applies == "*" or schema["csi_division"] in applies:
            qc.append({"id": m["id"], "item": "Project mandate: " + m["text"], "why": "Set by the project requirements.",
                       "severity": m.get("severity", "MAJOR"), "origin": "mandate", "tags": [], "good": ""})
    lessons = [l for l in read_json(ROOT / "library/lessons_learned.json", {"lessons": []})["lessons"]
               if l.get("category") in (schema["key"], "*")]
    for l in lessons:
        qc.append({"id": l["id"], "item": "Lesson learned: " + l["text"], "why": "From past QA.",
                   "severity": "ADVISORY", "origin": "lesson", "tags": [], "good": ""})
    return qc, skipped, lessons


# ---------------------------------------------------------------- prepare: the packet for the reviewer

REVIEW_SHAPE = {
    "reviewer": "who reviewed it, e.g. 'Claude, in a Claude Code session'",
    "detail_type": "what the drawing is, in a few words",
    "gate": {"scale_shown": True, "materials_labelled": True, "geometry_clear": True,
             "missing": ["what is missing"], "slop": False, "reasons": ["only if slop is true: why this drawing is rejected"]},
    "summary": "two or three plain sentences",
    "results": [{"id": "<a QC id, each exactly once>", "status": "pass | fail | not_shown | na", "note": "short",
                 "evidence_box": "[ymin, xmin, ymax, xmax] 0-1000 where the drawing shows it, or null"}],
    "findings": [{"qc_id": "<a QC id, or OTHER>", "severity": "CRITICAL | MAJOR | ADVISORY", "title": "short",
                  "issue": "what is wrong", "recommendation": "how to fix the drawing",
                  "basis": "building_science | project_rule | lesson_learned",
                  "box_2d": "[ymin, xmin, ymax, xmax] 0-1000, or null", "confidence": "high | medium | low"}],
    "control_layers": [{"layer": "water | air | thermal | vapor", "status": "continuous | broken | not_shown | na",
                        "note": "where it runs, or where it stops", "break_box": "[ymin, xmin, ymax, xmax] or null"}],
    "new_checklist": "ONLY for a stub rulebook: exactly 6 of {item, why, default_severity, tags}; then use ids NEW-1..NEW-6 in results",
}


def cmd_prepare(args):
    img = load_image(args.detail)
    stem = slugify(Path(args.detail).stem)
    schema, new = route(args.describe, args.detail, load_schemas(), args.schema)
    log("route", ("new stub, queued: " if new else "rulebook: ") + schema["key"] + (" (stub: reviewer writes 6 items)" if not schema["checklist"] else ""))
    hard, warnings = local_gate(img)
    context = load_context(args.context)
    qc, skipped, _ = build_qc_list(schema, context)
    packet = {"tool": "detail-critique", "version": VERSION, "made_at": now(), "detail": rel(args.detail),
              "width": img.width, "height": img.height, "description": args.describe,
              "rulebook": {k: schema[k] for k in ("key", "csi_section", "subcategory", "title", "status")},
              "local_gate": {"hard": hard, "warnings": warnings}, "context": context,
              "qc_list": qc, "skipped_by_condition": skipped,
              "control_layers_expected": schema["csi_division"] in ENVELOPE_DIVISIONS,
              "review_shape": REVIEW_SHAPE, "write_review_to": rel(Path(args.detail).with_suffix(".review.json"))}
    out = Path(args.out) / "packets" / (stem + ".packet.json")
    write_json(out, packet)
    log("gate", "local: %d hard problem(s), %d warning(s)" % (len(hard), len(warnings)))
    log("qc", "%d items (%s)" % (len(qc), ", ".join("%d %s" % (sum(1 for q in qc if q["origin"] == o), o)
                                                    for o in ("rulebook", "condition", "mandate", "lesson"))))
    log("packet", "wrote %s. Next: the reviewer follows reviewer.md and writes %s" % (rel(out), packet["write_review_to"]))


# ---------------------------------------------------------------- apply: check the review, gate, proof, outputs

def as_box(value, where, problems):
    if value is None:
        return None
    if not (isinstance(value, list) and len(value) == 4 and all(isinstance(v, (int, float)) for v in value)):
        problems.append("%s: a box must be [ymin, xmin, ymax, xmax] with four numbers, or null" % where)
        return None
    y0, x0, y1, x1 = [max(0, min(1000, int(v))) for v in value]
    box = [min(y0, y1), min(x0, x1), max(y0, y1), max(x0, x1)]
    return box if box[2] - box[0] >= 4 and box[3] - box[1] >= 4 else None


def validate_review(review, qc, expect_layers):
    """Every problem is listed. Nothing is written unless the list is empty."""
    problems = []
    gate = review.get("gate")
    if not isinstance(gate, dict) or any(not isinstance(gate.get(k), bool) for k in ("scale_shown", "materials_labelled", "geometry_clear")):
        problems.append("gate: needs scale_shown, materials_labelled and geometry_clear as true or false")
        gate = {}
    for key in ("reviewer", "summary"):
        if not isinstance(review.get(key), str) or not review[key].strip():
            problems.append("%s: missing" % key)
    if gate.get("slop") and not gate.get("reasons"):
        problems.append("gate: slop is true but no reasons are given")
    if gate.get("slop"):
        return problems                                   # a rejected drawing needs no results
    ids = {q["id"] for q in qc}
    seen = set()
    for i, r in enumerate(review.get("results") or []):
        where = "results[%d]" % i
        if r.get("id") not in ids:
            problems.append("%s: unknown QC id %r" % (where, r.get("id")))
        elif r["id"] in seen:
            problems.append("%s: %s is listed twice" % (where, r["id"]))
        seen.add(r.get("id"))
        if r.get("status") not in RESULTS:
            problems.append("%s: status must be one of %s" % (where, ", ".join(RESULTS)))
        r["evidence_box"] = as_box(r.get("evidence_box"), where, problems)
    for missing in sorted(ids - seen):
        problems.append("results: no result for %s" % missing)
    for i, f in enumerate(review.get("findings") or []):
        where = "findings[%d]" % i
        if f.get("qc_id") not in ids and f.get("qc_id") != "OTHER":
            problems.append("%s: unknown qc_id %r (use a QC id or OTHER)" % (where, f.get("qc_id")))
        if f.get("severity") not in SEVERITIES:
            problems.append("%s: severity must be one of %s" % (where, ", ".join(SEVERITIES)))
        for key in ("title", "issue", "recommendation"):
            if not isinstance(f.get(key), str) or not f[key].strip():
                problems.append("%s: %s is missing" % (where, key))
        f["box_2d"] = as_box(f.get("box_2d"), where, problems)
    layers = review.get("control_layers") or []
    for i, l in enumerate(layers):
        if l.get("layer") not in LAYERS or l.get("status") not in LAYER_STATES:
            problems.append("control_layers[%d]: layer must be one of %s and status one of %s" % (i, ", ".join(LAYERS), ", ".join(LAYER_STATES)))
        l["break_box"] = as_box(l.get("break_box"), "control_layers[%d]" % i, problems)
    if expect_layers and {l.get("layer") for l in layers} != set(LAYERS):
        problems.append("control_layers: an envelope detail needs all four layers (water, air, thermal, vapor), each once")
    return problems


def decide_gate(review_gate, hard, warnings, mode):
    """The hard gate. A drawing that cannot be read is rejected and the reasons are stated."""
    reasons = list(hard)
    if review_gate.get("slop"):
        reasons += review_gate.get("reasons", [])
    else:
        if not review_gate.get("geometry_clear", True):
            reasons.append("The geometry is not clear enough to tell what is drawn.")
        if not review_gate.get("materials_labelled", True):
            reasons.append("The primary materials are not labelled.")
    warnings = list(warnings)
    if not review_gate.get("scale_shown", True):
        warnings.append("No scale is shown.")
    verdict = "reject" if reasons and mode == "hard" else "pass"
    if reasons and mode == "soft":
        warnings += ["Gate problem (soft mode, review continued): " + r for r in reasons]
        reasons = []
    return {"verdict": verdict, "mode": mode, "reasons": reasons, "warnings": warnings,
            "checks": {k: bool(review_gate.get(k)) for k in ("scale_shown", "materials_labelled", "geometry_clear")},
            "missing": review_gate.get("missing", [])}


def compute_proof(qc):
    """Lean proof: each QC item is a claim. It is proven only by a pass WITH a place on the drawing as evidence.
    The detail is proven when every critical and major claim is proven."""
    state = lambda q: ("na" if q["status"] == "na" else "disproven" if q["status"] == "fail" else
                       "proven" if q["status"] == "pass" and q["evidence_box"] else "claimed" if q["status"] == "pass" else "unproven")
    for q in qc:
        q["proof"] = state(q)
    live = [q for q in qc if q["proof"] != "na"]
    count = {k: sum(1 for q in live if q["proof"] == k) for k in ("proven", "claimed", "disproven", "unproven")}
    must = [q for q in live if q["severity"] in ("CRITICAL", "MAJOR")]
    open_must = [q["id"] for q in must if q["proof"] != "proven"]
    return dict(count, total=len(live), must=len(must), open=open_must,
                verdict="PROVEN" if live and not open_must else "NOT PROVEN")


def verdict_of(gate, counts, proof):
    if gate["verdict"] == "reject":
        return "REJECTED", "The drawing did not pass the gate. Redraw it and send it again."
    if counts["CRITICAL"]:
        return "REVISE", "%d critical finding(s). Not ready to issue." % counts["CRITICAL"]
    if counts["MAJOR"]:
        return "REVISE", "%d major finding(s). Not ready to issue." % counts["MAJOR"]
    if proof["verdict"] != "PROVEN":
        return "CHECK", "No critical or major findings, but %d claim(s) are not proven on the drawing." % len(proof["open"])
    return "READY", "Every critical and major item is shown on the drawing."


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
        for i in range(n):
            cx, cy, rr = ax + (bx - ax) * (i + 0.5) / n, ay + (by - ay) * (i + 0.5) / n, length / n / 2
            draw.arc([cx - rr, cy - rr, cx + rr, cy + rr], start, start + 180, fill=RED, width=width)
    side(x0, y0, x1, y0, 180); side(x1, y0, x1, y1, 270); side(x1, y1, x0, y1, 0); side(x0, y1, x0, y0, 90)


def draw_markup(img, findings, gate, out_path):
    marked = img.copy()
    draw = ImageDraw.Draw(marked)
    w, h = marked.size
    unit = max(w, h) / 1600.0
    r, lw, font = 13 * unit, max(2, int(3 * unit)), load_font(int(24 * unit))
    for f in findings:
        if not f["box_2d"]:
            continue
        y0, x0, y1, x1 = [v / 1000.0 for v in f["box_2d"]]
        box = (x0 * w, y0 * h, x1 * w, y1 * h)
        cloud(draw, box, r, lw)
        br = 20 * unit
        cx, cy = max(br + 2, box[0] - br * 0.6), max(br + 2, box[1] - br * 0.6)
        draw.ellipse([cx - br, cy - br, cx + br, cy + br], fill=(255, 255, 255), outline=RED, width=lw)
        tw = draw.textlength(str(f["n"]), font=font)
        draw.text((cx - tw / 2, cy - 15 * unit), str(f["n"]), fill=RED, font=font)
    if gate["verdict"] == "reject":
        big = load_font(int(120 * unit))
        tw = draw.textlength("REJECTED", font=big)
        draw.text(((w - tw) / 2, h / 2 - 70 * unit), "REJECTED", fill=RED, font=big)
        draw.rectangle([(w - tw) / 2 - 30 * unit, h / 2 - 90 * unit, (w + tw) / 2 + 30 * unit, h / 2 + 80 * unit], outline=RED, width=lw * 3)
    Path(out_path).parent.mkdir(parents=True, exist_ok=True)
    marked.save(out_path, optimize=True)
    return marked


def markdown(r):
    yn = lambda v: "yes" if v else "no"
    g = r["gate"]
    L = ["# Detail critique: %s" % r["detail"]["title"], "",
         "**%s.** %s" % (r["verdict"], r["verdict_note"]), "",
         "- Input: `%s` (%d x %d px)" % (r["detail"]["input"], r["detail"]["width"], r["detail"]["height"]),
         "- Rulebook: `%s` (%s %s)" % (r["schema"]["key"], r["schema"]["csi_section"], r["schema"]["subcategory"]),
         "- Reviewer: %s" % r["reviewer"], "- Run: %s" % r["run_at"],
         "- Project: %s; %s; %s" % (r["context"].get("project", "-"), r["context"].get("building_code", "-"), r["context"].get("climate_zone", "-")), "",
         "## Step 1. Gate: %s" % g["verdict"].upper(), "",
         "- Scale shown: %s" % yn(g["checks"]["scale_shown"]), "- Primary materials labelled: %s" % yn(g["checks"]["materials_labelled"]),
         "- Geometry clear: %s" % yn(g["checks"]["geometry_clear"])]
    L += ["- **Rejected because:** %s" % x for x in g["reasons"]] + ["- Missing: %s" % x for x in g["missing"]] + ["- Warning: %s" % x for x in g["warnings"]] + [""]
    if g["verdict"] == "reject":
        return "\n".join(L + ["No audit was done. Markup: `%s`" % r["markup"], ""])
    L += ["## Summary", "", r["summary"], "", "**%d critical, %d major, %d advisory**" % tuple(r["counts"][s] for s in SEVERITIES), "", "## Findings", ""]
    for s in SEVERITIES:
        rows = [f for f in r["findings"] if f["severity"] == s]
        if rows:
            L += ["### %s (%s)" % (s, SEVERITY_MEANING[s]), ""]
        for f in rows:
            L += ["**%d. %s** `%s`" % (f["n"], f["title"], f["qc_id"]), "", f["issue"], "", "*Fix:* " + f["recommendation"], ""]
    p = r["proof"]
    L += ["## Proof: %s" % p["verdict"], "",
          "%d of %d claims proven on the drawing; %d disproven; %d not shown; %d passed without evidence." % (p["proven"], p["total"], p["disproven"], p["unproven"], p["claimed"]), "",
          "| Item | From | Severity | Result | Note |", "|---|---|---|---|---|"]
    L += ["| %s | %s | %s | %s | %s |" % (q["id"], q["origin"], q["severity"], q["proof"], q["note"]) for q in r["qc_list"]]
    if r["control_layers"]:
        L += ["", "## Control layers", "", "| Layer | Status | Note |", "|---|---|---|"]
        L += ["| %s | %s | %s |" % (l["layer"], l["status"], l["note"]) for l in r["control_layers"]]
    return "\n".join(L + ["", "Markup: `%s`" % r["markup"], "",
                          "_A review is a second pair of eyes, not a sign-off. Box positions are approximate._", ""])


def cmd_apply(args):
    img = load_image(args.detail)
    stem = slugify(Path(args.detail).stem)
    review_path = Path(args.review or Path(args.detail).with_suffix(".review.json"))
    review = read_json(review_path)
    if review is None:
        sys.exit("No review file at %s. Run `prepare` first, then write the review (see reviewer.md)." % review_path)
    schemas = load_schemas()
    schema, _ = route(args.describe, args.detail, schemas, args.schema or review.get("rulebook"))
    learned = False
    if not schema["checklist"]:                                # deferred learning: the reviewer wrote the rulebook
        new = review.get("new_checklist") or []
        if len(new) != 6 or any(not c.get("item") or c.get("default_severity") not in SEVERITIES for c in new):
            sys.exit("Rulebook %s is a stub. The review must carry new_checklist with exactly 6 items (item, why, default_severity, tags)." % schema["key"])
        schema["checklist"] = [{"id": "NEW-%d" % (i + 1), "item": c["item"], "why": c.get("why", ""),
                                "default_severity": c["default_severity"], "tags": c.get("tags", [])} for i, c in enumerate(new)]
        schema.update(status="active", source="auto")
        learned = True
    context = load_context(args.context)
    qc, skipped, lessons = build_qc_list(schema, context)
    expect_layers = schema["csi_division"] in ENVELOPE_DIVISIONS
    problems = validate_review(review, qc, expect_layers)
    if problems:
        print("The review file has %d problem(s). Nothing was written.\n- %s" % (len(problems), "\n- ".join(problems)))
        sys.exit(1)
    if learned:
        write_json(ROOT / schema["_path"], {k: v for k, v in schema.items() if k != "_path"})
        log("learn", "rulebook %s now has 6 items and is active" % schema["key"])
    hard, warnings = local_gate(img)
    gate = decide_gate(review["gate"], hard, warnings, args.gate)
    log("step 1", "gate %s%s" % (gate["verdict"], "".join("\n         - " + x for x in gate["reasons"])))
    rejected = gate["verdict"] == "reject"
    results = {} if rejected else {r["id"]: r for r in review["results"]}
    for q in qc:
        r = results.get(q["id"], {})
        q.update(status=r.get("status", "not_shown"), note=r.get("note", ""), evidence_box=r.get("evidence_box"))
    findings = [] if rejected else sorted(review.get("findings") or [], key=lambda f: SEVERITIES.index(f["severity"]))
    good = {q["id"]: q["good"] for q in qc}
    for n, f in enumerate(findings, 1):
        f.update(n=n, good=good.get(f["qc_id"], ""), basis=f.get("basis", "building_science"), confidence=f.get("confidence", "medium"))
    counts = {s: sum(1 for f in findings if f["severity"] == s) for s in SEVERITIES}
    proof = compute_proof(qc)
    verdict, note = verdict_of(gate, counts, proof)
    log("step 2", "QC list: %d items for this project (%d skipped by condition)" % (len(qc), len(skipped)))
    log("step 4", "%d critical, %d major, %d advisory" % tuple(counts[s] for s in SEVERITIES))
    log("proof", "%s: %d of %d proven" % (proof["verdict"], proof["proven"], proof["total"]))
    out = Path(args.out)
    markup_path = out / "markups" / (stem + "_markup.png")
    marked = draw_markup(img, findings, gate, markup_path)
    report = {
        "tool": "detail-critique", "version": VERSION, "run_at": now(), "reviewer": review["reviewer"],
        "status": "rejected" if rejected else "reviewed", "verdict": verdict, "verdict_note": note,
        "detail": {"slug": stem, "title": review.get("detail_type") or schema["title"], "description": args.describe,
                   "input": rel(args.detail), "width": img.width, "height": img.height,
                   "source_kind": args.source_kind, "source_ref": args.source_ref},
        "schema": {k: schema[k] for k in ("key", "title", "csi_division", "csi_section", "subcategory", "status", "source")},
        "context": context, "gate": gate, "summary": "" if rejected else review["summary"],
        "qc_list": qc, "skipped_by_condition": skipped, "counts": counts, "findings": findings,
        "proof": proof, "control_layers": [] if rejected else (review.get("control_layers") or []),
        "markup": rel(markup_path),
    }
    write_json(out / "reports" / (stem + ".json"), report)
    (out / "reports" / (stem + ".md")).write_text(markdown(report), encoding="utf-8")
    log("step 5", "%s. Wrote %s, %s.md and %s" % (verdict, rel(out / "reports" / (stem + ".json")), stem, report["markup"]))
    if args.push:
        buf, raw = io.BytesIO(), io.BytesIO()
        marked.save(buf, "PNG")
        img.save(raw, "PNG")
        push(report, schema, raw.getvalue(), buf.getvalue())


# ---------------------------------------------------------------- cloud (optional, owner sign-in)

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


def push(report, schema, image_png, markup_png):
    """Save the detail, review, findings and rulebook to the Architecture database as the owner."""
    base = os.environ.get("DC_SUPABASE_URL", SUPABASE_URL)
    email, password = os.environ.get("DC_EMAIL"), os.environ.get("DC_PASSWORD")
    if not email or not password:
        sys.exit("--push needs DC_EMAIL and DC_PASSWORD in the environment (the owner sign-in). Nothing was sent.")
    token = http("POST", base + "/auth/v1/token?grant_type=password", None, {"email": email, "password": password})["access_token"]
    rest, d = base + "/rest/v1/", report["detail"]
    up = {"Prefer": "resolution=merge-duplicates,return=representation"}
    paths = {}
    for name, data in (("detail.png", image_png), ("markup.png", markup_png)):
        paths[name] = "%s/%s" % (d["slug"], name)
        http("POST", "%s/storage/v1/object/%s/%s" % (base, BUCKET, paths[name]), token, data,
             {"Content-Type": "image/png", "x-upsert": "true"}, raw=True)
    http("POST", rest + "dc_schemas?on_conflict=key", token, {
        "key": schema["key"], "csi_division": schema["csi_division"], "csi_section": schema["csi_section"],
        "subcategory": schema["subcategory"], "title": schema["title"], "checklist": schema["checklist"],
        "source": schema.get("source", "seed"), "status": schema.get("status", "active")}, up)
    detail = http("POST", rest + "dc_details?on_conflict=slug", token, {
        "slug": d["slug"], "title": d["title"], "description": d["description"], "csi_division": schema["csi_division"],
        "schema_key": schema["key"], "source_kind": d["source_kind"], "source_ref": d["source_ref"],
        "image_path": paths["detail.png"], "width": d["width"], "height": d["height"]}, up)[0]
    review = http("POST", rest + "dc_reviews", token, {
        "detail_id": detail["id"], "run_at": report["run_at"], "mode": report["reviewer"], "status": report["status"],
        "summary": report["summary"], "counts": report["counts"], "markup_path": paths["markup.png"], "report": report,
        "version": VERSION}, {"Prefer": "return=representation"})[0]
    if report["findings"]:
        http("POST", rest + "dc_findings", token, [{
            "review_id": review["id"], "n": f["n"], "severity": f["severity"], "checklist_id": f["qc_id"],
            "title": f["title"], "issue": f["issue"], "recommendation": f["recommendation"], "basis": f["basis"],
            "box_2d": f["box_2d"], "refs": []} for f in report["findings"]], {"Prefer": "return=minimal"})
    log("push", "saved detail %s, review %s, %d findings" % (d["slug"], review["id"], len(report["findings"])))


def main():
    p = argparse.ArgumentParser(description="Critique Detail: prepare a review packet, or apply a written review.")
    sub = p.add_subparsers(dest="command", required=True)
    for name, fn in (("prepare", cmd_prepare), ("apply", cmd_apply)):
        s = sub.add_parser(name)
        s.set_defaults(fn=fn)
        s.add_argument("detail", help="PDF, PNG or JPEG of one detail")
        s.add_argument("--describe", default="", help='one line, e.g. "Low-slope roof parapet"')
        s.add_argument("--schema", default="", help="rulebook key, to skip the keyword match")
        s.add_argument("--context", default=str(ROOT / "project_context.json"))
        s.add_argument("--out", default=str(ROOT / "outputs"))
    a = sub.choices["apply"]
    a.add_argument("--review", default="", help="the reviewer's JSON (default: <detail>.review.json)")
    a.add_argument("--gate", default="hard", choices=["hard", "soft"], help="hard rejects an unreadable drawing; soft only warns")
    a.add_argument("--push", action="store_true", help="also save to the cloud (owner sign-in)")
    a.add_argument("--source-kind", default="sample", choices=SOURCE_KINDS)
    a.add_argument("--source-ref", default="", help="where the detail came from in the cloud, e.g. sketch_details:<id>")
    args = p.parse_args()
    if not Path(args.detail).exists():
        sys.exit("No such file: %s" % args.detail)
    args.fn(args)


if __name__ == "__main__":
    main()
