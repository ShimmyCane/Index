extends RefCounted
## Mind Palace: layout -> scene description.
## The scene description is a flat list of simple shapes ("specs"), each with a colour and a place in the world.
## The solid renderer draws them as meshes; the splat cloud samples the same meshes. Nothing here knows about either.
##
## A spec is a Dictionary:
##   t      "box" | "cyl" | "sph" | "torus" | "prism" | "label" | "emoji"
##   xf     Transform3D (may hold a scale)
##   color  Color            glow  bool            solid  bool (gets a collider)
##   pick   id of the memory, room or world this shape belongs to (for taps)
##   box: size   cyl: rt, rb, h, seg   sph: r   torus: R, r (flat, ring around the y axis)   prism: pts, depth   label/emoji: text, height

const FLOOR := 0.08
const WALL_H := [1.1, 1.3, 1.5, 1.7, 1.9]
const ROOM := {
	"meadow": {"floor": "#cdeedd", "wall": "#fff6e0", "trim": "#8fd3b0"},
	"peach": {"floor": "#ffe0cc", "wall": "#fff6e0", "trim": "#ff9f8a"},
	"sky": {"floor": "#d6ecfa", "wall": "#ffffff", "trim": "#7fb8e6"},
	"lilac": {"floor": "#e6defa", "wall": "#fff6e0", "trim": "#b9a6e8"},
	"sand": {"floor": "#f6e7c4", "wall": "#fffaf0", "trim": "#e0a57c"},
	"night": {"floor": "#6a6fa3", "wall": "#9a9fce", "trim": "#ffd76a"},
}
const WORLD := {
	"grass": {"top": "#c4ebb4", "side": "#c9a377", "under": "#a9825a", "bush": "#8fd3b0"},
	"beach": {"top": "#f7e3b0", "side": "#e6c690", "under": "#c9a377", "bush": "#ffb37a"},
	"snow": {"top": "#f4f8ff", "side": "#cbd9ec", "under": "#a9b8d0", "bush": "#c4e3f7"},
	"moon": {"top": "#cfc8ea", "side": "#b1abcf", "under": "#8e88b0", "bush": "#b9a6e8"},
	"candy": {"top": "#ffdfe6", "side": "#f7b6d2", "under": "#d99ab8", "bush": "#ffd76a"},
}
const LINK := {"related_to": "#b9a6e8", "leads_to": "#ff9f8a", "part_of": "#6cc39a", "opposite_of": "#7fb8e6", "reminds_me_of": "#f2c14e"}


static func col(c) -> Color:
	return Color.html(c) if c is String else c


static func add(out: Array, t: String, color, xf: Transform3D, extra: Dictionary) -> Dictionary:
	var s = {"t": t, "color": col(color), "xf": xf, "glow": false, "solid": false, "pick": ""}
	s.merge(extra, true)
	out.append(s)
	return s


static func box(out: Array, color, size: Vector3, pos: Vector3, solid := false, pick := "", basis := Basis.IDENTITY) -> Dictionary:
	return add(out, "box", color, Transform3D(basis, pos), {"size": size, "solid": solid, "pick": pick})


static func cyl(out: Array, color, rt: float, rb: float, h: float, pos: Vector3, seg := 20, solid := false, pick := "") -> Dictionary:
	return add(out, "cyl", color, Transform3D(Basis.IDENTITY, pos), {"rt": rt, "rb": rb, "h": h, "seg": seg, "solid": solid, "pick": pick})


static func sph(out: Array, color, r: float, pos: Vector3, scale := Vector3.ONE, glow := false) -> Dictionary:
	return add(out, "sph", color, Transform3D(Basis.from_scale(scale), pos), {"r": r, "glow": glow})


## A flat board from a to b (a path, a ramp or a bridge plank).
static func strip(out: Array, a: Vector3, b: Vector3, width: float, thick: float, color, lift: float, solid: bool):
	var d = b - a
	if d.length() < 0.01:
		return null
	var basis = Basis.looking_at(d.normalized(), Vector3.UP)
	return box(out, color, Vector3(width, thick, d.length() + 0.15), (a + b) * 0.5 + Vector3(0, lift, 0), solid, "", basis)


static func hash_of(s: String) -> int:
	var h = 7
	for i in range(s.length()):
		h = (h * 31 + s.unicode_at(i)) % 100003
	return h


static func world_specs(out: Array, w: Dictionary) -> void:
	var st = WORLD.get(w["style"], WORLD["grass"])
	var p: Vector3 = w["pos"]
	var r: float = w["radius"]
	cyl(out, st["top"], r, r * 0.93, 1.2, p + Vector3(0, -0.6, 0), 56, true, w["id"])
	cyl(out, st["side"], r * 0.93, r * 0.6, 2.6, p + Vector3(0, -2.5, 0), 40)
	cyl(out, st["under"], r * 0.6, 0.0, r * 0.7, p + Vector3(0, -3.8 - r * 0.35, 0), 28)
	cyl(out, "#fff6e0", 3.2, 3.2, 0.16, p, 36)
	# The landmark in the middle of the plaza.
	cyl(out, st["side"], 0.75, 0.9, 0.4, p + Vector3(0, 0.28, 0), 24)
	cyl(out, "#fff6e0", 0.22, 0.28, 2.6, p + Vector3(0, 1.7, 0), 16, true, w["id"])
	sph(out, st["bush"], 0.55, p + Vector3(0, 3.3, 0), Vector3.ONE, true)
	add(out, "label", "#ffe9a8", Transform3D(Basis.IDENTITY, p + Vector3(0, 6, 0)), {"text": w["name"], "height": 2.4})
	var sd = hash_of(w["id"])
	for i in range(9):
		var a = (i + (sd % 7) / 7.0) * TAU / 9.0
		var s = 0.8 + ((sd >> (i % 5)) % 5) * 0.18
		sph(out, st["bush"], s, p + Vector3(cos(a) * r * 0.9, s * 0.55, sin(a) * r * 0.9), Vector3(1, 0.8, 1))


static func room_specs(out: Array, r: Dictionary, w: Dictionary) -> void:
	var st = ROOM.get(r["style"], ROOM["meadow"])
	var p: Vector3 = r["pos"]
	var h: float = r["half"]
	var tier: int = r["tier"]
	var wh: float = WALL_H[tier]
	var th := 0.3
	var id: String = r["id"]
	box(out, st["trim"], Vector3(h * 2 + 0.7, 0.4, h * 2 + 0.7), p + Vector3(0, -0.16, 0), true, id)
	box(out, st["floor"], Vector3(h * 2, 0.16, h * 2), p, true, id)
	if r["level"] > 0:      # a raised room stands on four legs
		var drop: float = p.y - w["pos"].y
		for c in [Vector2(-1, -1), Vector2(1, -1), Vector2(-1, 1), Vector2(1, 1)]:
			cyl(out, st["wall"], 0.28, 0.36, drop, p + Vector3(c.x * (h - 0.3), -drop / 2 - 0.3, c.y * (h - 0.3)), 12)
	# Four walls. The side that faces the plaza has the door; the side opposite is taller.
	for s in [Vector3(1, 0, 0), Vector3(-1, 0, 0), Vector3(0, 0, 1), Vector3(0, 0, -1)]:
		var is_door: bool = s.is_equal_approx(r["side"])
		var is_back: bool = s.is_equal_approx(-r["side"])
		var height: float = wh * 1.8 if is_back else wh
		var along_z: bool = s.x != 0.0
		var spans = [[-h, -1.15], [1.15, h]] if is_door else [[-h, h]]
		for span in spans:
			var length: float = span[1] - span[0]
			var mid: float = (span[0] + span[1]) / 2.0
			var at = p + (Vector3(s.x * h, 0, mid) if along_z else Vector3(mid, 0, s.z * h))
			box(out, st["wall"], Vector3(th, height, length) if along_z else Vector3(length, height, th), at + Vector3(0, height / 2 + FLOOR, 0), true, id)
			box(out, st["trim"], Vector3(th + 0.14, 0.14, length) if along_z else Vector3(length, 0.14, th + 0.14), at + Vector3(0, height + FLOOR + 0.07, 0))
		if is_door:
			for o in [-1.15, 1.15]:
				var post = p + (Vector3(s.x * h, 0, o) if along_z else Vector3(o, 0, s.z * h))
				box(out, st["trim"], Vector3(0.36, 2.7, 0.36), post + Vector3(0, 1.35 + FLOOR, 0), true, id)
			box(out, st["trim"], Vector3(0.42, 0.36, 2.9) if along_z else Vector3(2.9, 0.36, 0.42), p + s * h + Vector3(0, 2.85 + FLOOR, 0))
			add(out, "label", "#fffdf7", Transform3D(Basis.IDENTITY, p + s * h + Vector3(0, 4.1, 0)), {"text": r["name"], "height": 1.15})
		elif is_back:
			for k in [-1.0, 1.0]:
				var wat = p + (Vector3(s.x * h, 0, k * h * 0.45) if along_z else Vector3(k * h * 0.45, 0, s.z * h))
				box(out, "#c4e3f7", Vector3(th + 0.06, wh * 0.55, 1) if along_z else Vector3(1, wh * 0.55, th + 0.06), wat + Vector3(0, wh * 1.15 + FLOOR, 0))
	# Corners grow with the room: posts, then columns, then turrets, then a flag.
	var corner_i = 0
	for c in [Vector2(-1, -1), Vector2(1, -1), Vector2(-1, 1), Vector2(1, 1)]:
		var ph: float = [wh + 0.3, wh + 0.5, wh * 1.8 + 0.6, wh * 1.8 + 1.2, wh * 1.8 + 2][tier]
		var pr: float = 0.55 if tier >= 3 else 0.3
		var cp = p + Vector3(c.x * h, 0, c.y * h)
		cyl(out, st["wall"], pr, pr * 1.1, ph, cp + Vector3(0, ph / 2 + FLOOR, 0), 16, true, id)
		if tier >= 3:
			cyl(out, st["trim"], 0.0, pr * 1.35, 1.1, cp + Vector3(0, ph + 0.55 + FLOOR, 0), 16)
		else:
			sph(out, st["trim"], pr * 1.15, cp + Vector3(0, ph + FLOOR + 0.1, 0))
		if tier >= 4 and corner_i == 0:
			cyl(out, "#4a4860", 0.04, 0.04, 1.6, cp + Vector3(0, ph + 1.9, 0), 8)
			box(out, "#ff9f8a", Vector3(0.8, 0.5, 0.04), cp + Vector3(0.42, ph + 2.4, 0))
		corner_i += 1


static func part_xf(part: Dictionary) -> Transform3D:
	var q = part["q"]
	var s = part["s"]
	var p = part["p"]
	return Transform3D(Basis(Quaternion(float(q[0]), float(q[1]), float(q[2]), float(q[3]))) * Basis.from_scale(Vector3(float(s[0]), float(s[1]), float(s[2]))),
		Vector3(float(p[0]), float(p[1]), float(p[2])))


static func object_specs(out: Array, o: Dictionary, room: Dictionary, library: Dictionary) -> void:
	var base: Vector3 = o["pos"] + Vector3(0, FLOOR, 0)
	cyl(out, "#fffdf7", 0.6, 0.68, 0.32, base + Vector3(0, 0.16, 0), 24, true, o["id"])
	if o["level"] >= 2:
		add(out, "torus", "#f2c14e" if o["level"] >= 4 else "#e0a57c", Transform3D(Basis.IDENTITY, base + Vector3(0, 0.3, 0)), {"R": 0.66, "r": 0.06})
	var asset: Dictionary = o["asset"]
	var facing = Basis(Vector3.UP, atan2(room["side"].x, room["side"].z))
	var stand = Transform3D(facing * Basis.from_scale(Vector3.ONE * 1.25), base + Vector3(0, 0.32, 0))
	if asset.get("representation", "") == "emoji" and str(asset.get("glyph", "")) != "":
		cyl(out, "#c49a6c", 0.05, 0.05, 0.44, base + Vector3(0, 0.54, 0), 8)
		add(out, "emoji", "#fffdf7", Transform3D(Basis.IDENTITY, base + Vector3(0, 1.32, 0)), {"text": str(asset["glyph"]), "height": 1.2, "pick": o["id"]})
	else:
		var kinds: Dictionary = library.get("kinds", {})
		var kind = asset.get("kind", "star")
		if not kinds.has(kind):
			kind = "star"       # a missing object falls back to a star
		var chosen = str(asset.get("color", ""))
		for part in kinds.get(kind, {}).get("parts", []):
			var color = chosen if (chosen != "" and part.get("main", false)) else part["c"]
			var xf = stand * part_xf(part)
			var extra = {"glow": part.get("glow", false), "pick": o["id"]}
			match part["t"]:
				"box":
					extra["size"] = vec3_of(part["size"])
				"cyl":
					extra["rt"] = float(part["rt"]); extra["rb"] = float(part["rb"]); extra["h"] = float(part["h"]); extra["seg"] = int(part.get("seg", 20))
				"sph":
					extra["r"] = float(part["r"])
				"torus":
					# three.js rings stand in the x-y plane; ours lie flat, so tip them up.
					xf = xf * Transform3D(Basis(Vector3.RIGHT, PI / 2), Vector3.ZERO)
					extra["R"] = float(part["R"]); extra["r"] = float(part["r"])
				"prism":
					extra["pts"] = part["pts"]; extra["depth"] = float(part["depth"])
			add(out, part["t"], color, xf, extra)
	add(out, "label", "#fffdf7", Transform3D(Basis.IDENTITY, base + Vector3(0, 2.35, 0)), {"text": o["title"], "height": 0.5, "name_tag": true})


static func vec3_of(a) -> Vector3:
	return Vector3(float(a[0]), float(a[1]), float(a[2]))


## Everything, as one flat list.
static func build(desc: Dictionary, library: Dictionary) -> Array:
	var out = []
	for w in desc["worlds"]:
		world_specs(out, w)
	for r in desc["rooms"]:
		room_specs(out, r, desc["by_id"][r["world_id"]])
	for o in desc["objects"]:
		object_specs(out, o, desc["by_id"][o["room_id"]], library)
	for p in desc["paths"]:
		var a: Vector3 = p["points"][0]
		var b: Vector3 = p["points"][1]
		strip(out, a, b, 1.7, 0.1, "#fff6e0", 0.03, absf(a.y - b.y) > 0.05)      # a sloped path is a ramp you can walk up
	for br in desc["bridges"]:
		var pts: Array = br["points"]
		strip(out, desc["by_id"][br["a"]]["pos"], pts[0], 2.0, 0.1, "#fff6e0", 0.02, false)
		strip(out, pts[pts.size() - 1], desc["by_id"][br["b"]]["pos"], 2.0, 0.1, "#fff6e0", 0.02, false)
		for i in range(1, pts.size()):
			var plank = strip(out, pts[i - 1], pts[i], 2.1, 0.18, "#d9b48a", 0.02, true)
			if plank != null:
				for side in [-0.98, 0.98]:
					var post: Transform3D = plank["xf"] * Transform3D(Basis.IDENTITY, Vector3(side, 0.5, 0))
					add(out, "cyl", "#c49a6c", post, {"rt": 0.08, "rb": 0.08, "h": 0.9, "seg": 8})
					add(out, "sph", "#ff9f8a", plank["xf"] * Transform3D(Basis.IDENTITY, Vector3(side, 1.0, 0)), {"r": 0.14})
	return out
