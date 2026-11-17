extends RefCounted
## Mind Palace: knowledge database -> layout (where every world, room, object, path and bridge is).
## A port of js/layout.js. No nodes and no meshes here, only numbers and names.

const PLAZA := 3.2
const TIERS := [
	{"min": 0, "name": "Nook", "half": 3.2},
	{"min": 3, "name": "Room", "half": 4.2},
	{"min": 6, "name": "Hall", "half": 5.4},
	{"min": 10, "name": "Library", "half": 6.8},
	{"min": 16, "name": "Tower", "half": 8.0},
]


static func v3(a) -> Vector3:
	if a is Array and a.size() >= 3:
		return Vector3(float(a[0]), float(a[1]), float(a[2]))
	return Vector3.ZERO


static func tier_for(count: int) -> int:
	var t = 0
	for i in range(TIERS.size()):
		if count >= int(TIERS[i]["min"]):
			t = i
	return t


static func flat_dist(a: Vector3, b: Vector3) -> float:
	return Vector2(a.x - b.x, a.z - b.z).length()


## How well a memory is known ("what" practice), box 0 to 5. Same rule as the web page.
static func what_box(data: Dictionary, node_id: String) -> int:
	var box = 0
	for r in data.get("recall", []):
		if r.get("node_id", "") == node_id and r.get("kind", "") == "what":
			if r.get("result", "") == "knew":
				box = mini(5, box + 1)
			elif r.get("result", "") == "forgot":
				box = 0
	return box


static func build(data: Dictionary) -> Dictionary:
	var desc = {"worlds": [], "rooms": [], "objects": [], "paths": [], "bridges": [], "links": [], "by_id": {}}
	var counts = {}
	for n in data.get("nodes", []):
		counts[n.get("place_id", "")] = int(counts.get(n.get("place_id", ""), 0)) + 1
	var assets = {}
	for a in data.get("assets", []):
		assets[a.get("id", "")] = a

	for w in data.get("worlds", []):
		var pos = v3(w.get("transform", {}).get("position"))
		var radius = 12.0
		for p in data.get("places", []):
			if p.get("parent_id", "") != w["id"]:
				continue
			var half = float(TIERS[tier_for(int(counts.get(p["id"], 0)))]["half"])
			radius = maxf(radius, flat_dist(pos, v3(p.get("transform", {}).get("position"))) + half * 1.45 + 1.5)
		var world = {"type": "world", "id": w["id"], "name": w.get("name", "World"), "style": w.get("style", "grass"), "pos": pos, "radius": radius}
		desc["worlds"].append(world)
		desc["by_id"][w["id"]] = world

	for p in data.get("places", []):
		if not desc["by_id"].has(p.get("parent_id", "")):
			continue
		var w = desc["by_id"][p["parent_id"]]
		var count = int(counts.get(p["id"], 0))
		var tier = tier_for(count)
		var half = float(TIERS[tier]["half"])
		var pos = v3(p.get("transform", {}).get("position"))
		# The door faces the plaza of the room's world.
		var dx = w["pos"].x - pos.x
		var dz = w["pos"].z - pos.z
		var side = Vector3(1.0 if dx >= 0.0 else -1.0, 0, 0) if absf(dx) >= absf(dz) else Vector3(0, 0, 1.0 if dz >= 0.0 else -1.0)
		var door = pos + side * half
		var room = {"type": "room", "id": p["id"], "name": p.get("name", "Room"), "world_id": w["id"], "style": p.get("style", "meadow"),
			"pos": pos, "half": half, "tier": tier, "tier_name": TIERS[tier]["name"], "count": count,
			"level": int(round((pos.y - w["pos"].y) / 3.0)), "side": side, "door": door}
		desc["rooms"].append(room)
		desc["by_id"][p["id"]] = room
		var to_door = Vector3(door.x - w["pos"].x, 0, door.z - w["pos"].z)
		var start = w["pos"] + (to_door.normalized() * PLAZA if to_door.length() > 0.01 else Vector3.ZERO)
		desc["paths"].append({"room_id": p["id"], "world_id": w["id"], "points": [start, door]})

	for n in data.get("nodes", []):
		if not desc["by_id"].has(n.get("place_id", "")):
			continue
		var room = desc["by_id"][n["place_id"]]
		var l = v3(n.get("transform", {}).get("position"))
		var lim = float(room["half"]) - 0.8
		var local = Vector3(clampf(l.x, -lim, lim), 0, clampf(l.z, -lim, lim))
		var obj = {"type": "object", "id": n["id"], "room_id": room["id"], "world_id": room["world_id"], "title": n.get("title", "Memory"),
			"local": local, "pos": room["pos"] + local, "asset": assets.get(n.get("asset_id", ""), {"representation": "procedural", "kind": "star"}),
			"level": what_box(data, n["id"])}
		desc["objects"].append(obj)
		desc["by_id"][n["id"]] = obj

	# Bridges: the shortest set that joins every world, so there is always one way through.
	var done = []
	var todo = []
	for i in range(desc["worlds"].size()):
		if i == 0:
			done.append(desc["worlds"][i])
		else:
			todo.append(desc["worlds"][i])
	while todo.size() > 0:
		var best_a = null
		var best_b = null
		var best_d = INF
		for a in done:
			for b in todo:
				var d = flat_dist(a["pos"], b["pos"])
				if d < best_d:
					best_d = d
					best_a = a
					best_b = b
		var u = Vector3(best_b["pos"].x - best_a["pos"].x, 0, best_b["pos"].z - best_a["pos"].z) / maxf(best_d, 0.001)
		var ra = minf(best_a["radius"], best_d * 0.45)
		var rb = minf(best_b["radius"], best_d * 0.45)
		var ea = best_a["pos"] + u * ra
		var eb = best_b["pos"] - u * rb
		var pts = []
		for i in range(11):
			var t = i / 10.0
			var q = ea.lerp(eb, t)
			q.y += sin(PI * t) * minf(3.0, flat_dist(ea, eb) * 0.15)
			pts.append(q)
		desc["bridges"].append({"a": best_a["id"], "b": best_b["id"], "points": pts})
		done.append(best_b)
		todo.erase(best_b)

	for r in data.get("relationships", []):
		if desc["by_id"].has(r.get("source", "")) and desc["by_id"].has(r.get("target", "")):
			var a = desc["by_id"][r["source"]]
			var b = desc["by_id"][r["target"]]
			desc["links"].append({"id": r.get("id", ""), "source": r["source"], "target": r["target"], "type": r.get("type", "related_to"),
				"strength": float(r.get("strength", 0.5)), "a": a["pos"] + Vector3(0, 1.6, 0), "b": b["pos"] + Vector3(0, 1.6, 0)})
	return desc


static func room_at(desc: Dictionary, p: Vector3):
	var best = null
	for r in desc["rooms"]:
		if absf(p.x - r["pos"].x) <= r["half"] and absf(p.z - r["pos"].z) <= r["half"]:
			if best == null or absf(r["pos"].y - p.y) < absf(best["pos"].y - p.y):
				best = r
	return best


static func nearest_world(desc: Dictionary, p: Vector3):
	var best = null
	var bd = INF
	for w in desc["worlds"]:
		var d = flat_dist(w["pos"], p)
		if d < bd:
			bd = d
			best = w
	return best


## Worlds to pass through, from one world to another, along the bridges.
static func world_chain(desc: Dictionary, from_id: String, to_id: String) -> Array:
	var prev = {from_id: null}
	var queue = [from_id]
	while queue.size() > 0:
		var cur = queue.pop_front()
		if cur == to_id:
			break
		for b in desc["bridges"]:
			var next = ""
			if b["a"] == cur:
				next = b["b"]
			elif b["b"] == cur:
				next = b["a"]
			if next != "" and not prev.has(next):
				prev[next] = {"from": cur, "bridge": b}
				queue.append(next)
	var steps = []
	var at = to_id
	while prev.has(at) and prev[at] != null:
		steps.push_front({"to": at, "from": prev[at]["from"], "bridge": prev[at]["bridge"]})
		at = prev[at]["from"]
	return steps


## A walking route from a point to a memory, a room or a world: a list of points.
static func route(desc: Dictionary, from: Vector3, target_id: String) -> Array:
	if not desc["by_id"].has(target_id):
		return []
	var t = desc["by_id"][target_id]
	var room = null
	if t["type"] == "object":
		room = desc["by_id"][t["room_id"]]
	elif t["type"] == "room":
		room = t
	var world = desc["by_id"][room["world_id"]] if room != null else t
	var pts = [from]
	var here = room_at(desc, from)
	var end_point = null
	if t["type"] == "object":
		# Stand a step away from the object, on the side nearest the middle of the room.
		var d = Vector3(room["pos"].x - t["pos"].x, 0, room["pos"].z - t["pos"].z)
		if d.length() < 0.3:
			d = room["side"]
		end_point = t["pos"] + d.normalized() * 1.5
	if room != null and here != null and here["id"] == room["id"]:
		pts.append(end_point if end_point != null else room["pos"])
		return pts
	var start_world = desc["by_id"][here["world_id"]] if here != null else nearest_world(desc, from)
	if here != null:
		pts.append(here["door"])
	if start_world != null:
		pts.append(start_world["pos"])
		if start_world["id"] != world["id"]:
			for s in world_chain(desc, start_world["id"], world["id"]):
				var bp = s["bridge"]["points"].duplicate()
				if s["bridge"]["a"] != s["from"]:
					bp.reverse()
				pts.append_array(bp)
				pts.append(desc["by_id"][s["to"]]["pos"])
	if room != null:
		pts.append(room["door"])
		pts.append(end_point if end_point != null else room["pos"])
	var out = []
	for p in pts:
		if out.size() == 0 or out[out.size() - 1].distance_to(p) > 0.05:
			out.append(p)
	return out
