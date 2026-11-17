extends Node3D
## Mind Palace (Godot): the main scene. Everything is built in code from data/palace.json.
##   database (palace.json) -> layout (palace_layout.gd) -> scene description (palace_builder.gd)
##   -> the solid look (palace_renderer.gd) or the splat look (splat_cloud.gd)

const Layout = preload("res://scripts/palace_layout.gd")
const Builder = preload("res://scripts/palace_builder.gd")
const Renderer = preload("res://scripts/palace_renderer.gd")
const SplatCloud = preload("res://scripts/splat_cloud.gd")

const USER_PALACE := "user://palace.json"
const BUNDLED_PALACE := "res://data/palace.json"
const OBJECTS := "res://data/objects.json"
const WALK_SPEED := 6.5
const GRAVITY := 22.0

var data := {}
var library := {}
var desc := {}
var nodes_by_id := {}

var meshes: Node3D
var bodies: Node3D
var signs: Node3D
var marks: Node3D
var splats = null            # a splat_cloud.gd node, made the first time the splat look is chosen

var avatar: CharacterBody3D
var camera: Camera3D
var cam_target := Vector3.ZERO
var cam_yaw := 0.6
var cam_pitch := 0.8
var cam_dist := 120.0
var goal_target := Vector3.ZERO
var goal_yaw := 0.6
var goal_pitch := 0.8
var goal_dist := 120.0
var follow := false
var walk_mode := false
var route: Array = []
var route_i := 0
var route_speed := 8.0
var look := 0                 # 0 solid, 1 splats
var selected := ""
var results: Array = []
var dragging := false
var drag_moved := 0.0

var search_box: LineEdit
var result_list: ItemList
var status: Label
var info: RichTextLabel
var look_pick: OptionButton
var walk_button: Button
var file_dialog: FileDialog


func _ready() -> void:
	_make_world()
	_make_ui()
	library = _read_json(OBJECTS)
	var loaded = _read_json(USER_PALACE) if FileAccess.file_exists(USER_PALACE) else {}
	if not loaded.has("worlds"):
		loaded = _read_json(BUNDLED_PALACE)
	_set_palace(loaded)


# ---------- data ----------

func _read_json(path: String) -> Dictionary:
	if not FileAccess.file_exists(path):
		return {}
	var parsed = JSON.parse_string(FileAccess.get_file_as_string(path))
	return parsed if parsed is Dictionary else {}


func _set_palace(d: Dictionary) -> void:
	if not d.has("worlds") or not (d["worlds"] is Array):
		_say("That file is not a palace.")
		return
	data = d
	nodes_by_id.clear()
	for n in data.get("nodes", []):
		nodes_by_id[n.get("id", "")] = n
	selected = ""
	route = []
	_rebuild()
	if desc["worlds"].size() > 0:
		avatar.global_position = desc["worlds"][0]["pos"] + Vector3(0, 1.0, 4.5)
	_frame_all()
	_say("%d worlds, %d rooms, %d memories." % [desc["worlds"].size(), desc["rooms"].size(), desc["objects"].size()])


func _rebuild() -> void:
	desc = Layout.build(data)
	for holder in [meshes, bodies, signs, marks]:
		for child in holder.get_children():
			holder.remove_child(child)      # out of the tree now, so the new build never sees the old shapes
			child.queue_free()
	if splats != null:
		splats.queue_free()
		splats = null
	Renderer.build(Builder.build(desc, library), meshes, bodies, signs)
	_apply_look()


# ---------- the scene ----------

func _make_world() -> void:
	var env = Environment.new()
	env.background_mode = Environment.BG_COLOR
	env.background_color = Color.html("#cfe8f7")
	env.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
	env.ambient_light_color = Color.html("#fff3e6")
	env.ambient_light_energy = 0.75
	var we = WorldEnvironment.new()
	we.environment = env
	add_child(we)
	var sun = DirectionalLight3D.new()
	sun.rotation_degrees = Vector3(-52, 40, 0)
	sun.light_energy = 0.85
	sun.shadow_enabled = true
	add_child(sun)

	meshes = Node3D.new(); add_child(meshes)
	bodies = Node3D.new(); add_child(bodies)
	signs = Node3D.new(); add_child(signs)
	marks = Node3D.new(); add_child(marks)

	camera = Camera3D.new()
	camera.fov = 48
	camera.far = 1600
	add_child(camera)
	camera.make_current()

	# Little-me: a body that walks, with a capsule to bump into walls.
	avatar = CharacterBody3D.new()
	var shape = CollisionShape3D.new()
	var capsule = CapsuleShape3D.new()
	capsule.radius = 0.28
	capsule.height = 1.36
	shape.shape = capsule
	shape.position = Vector3(0, 0.68, 0)
	avatar.add_child(shape)
	avatar.floor_max_angle = deg_to_rad(50)
	avatar.floor_snap_length = 0.3
	_avatar_part(_cyl_mesh(0.19, 0.24, 0.5), "#ff9f8a", Vector3(0, 0.66, 0))
	_avatar_part(_cyl_mesh(0.085, 0.085, 0.42), "#5d6aa8", Vector3(-0.11, 0.21, 0))
	_avatar_part(_cyl_mesh(0.085, 0.085, 0.42), "#5d6aa8", Vector3(0.11, 0.21, 0))
	var head = SphereMesh.new(); head.radius = 0.25; head.height = 0.5
	_avatar_part(head, "#ffe0c2", Vector3(0, 1.13, 0))
	var hair = SphereMesh.new(); hair.radius = 0.265; hair.height = 0.36
	_avatar_part(hair, "#6b4a3a", Vector3(0, 1.22, -0.03))
	var pack = BoxMesh.new(); pack.size = Vector3(0.3, 0.34, 0.14)
	_avatar_part(pack, "#8fd3b0", Vector3(0, 0.7, -0.24))
	add_child(avatar)


func _cyl_mesh(rt: float, rb: float, h: float) -> CylinderMesh:
	var m = CylinderMesh.new()
	m.top_radius = rt
	m.bottom_radius = rb
	m.height = h
	m.radial_segments = 12
	return m


func _avatar_part(mesh: Mesh, color: String, at: Vector3) -> void:
	var mi = MeshInstance3D.new()
	mi.mesh = mesh
	mi.material_override = Renderer.material_for(Color.html(color), false)
	mi.position = at
	avatar.add_child(mi)


func _apply_look() -> void:
	if look == 1 and splats == null:
		_say("Making splats…")
		splats = SplatCloud.new()
		add_child(splats)
		var count = splats.build_from(meshes)
		_say("%d splats." % count)
	meshes.visible = look == 0
	if splats != null:
		splats.visible = look == 1


# ---------- the controls on screen ----------

func _make_ui() -> void:
	var layer = CanvasLayer.new()
	add_child(layer)
	var top = HBoxContainer.new()
	top.set_anchors_preset(Control.PRESET_TOP_WIDE)
	top.offset_left = 12; top.offset_top = 10; top.offset_right = -12
	top.add_theme_constant_override("separation", 8)
	layer.add_child(top)
	var title = Label.new()
	title.text = "Mind Palace"
	title.add_theme_font_size_override("font_size", 26)
	title.add_theme_color_override("font_color", Color.html("#2b2a33"))
	top.add_child(title)
	search_box = LineEdit.new()
	search_box.placeholder_text = "Find a memory…"
	search_box.custom_minimum_size = Vector2(300, 48)
	search_box.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	search_box.text_changed.connect(_on_search_changed)
	search_box.text_submitted.connect(_on_search_submitted)
	top.add_child(search_box)
	top.add_child(_button("Go", func(): _on_search_submitted(search_box.text)))
	top.add_child(_button("All", _frame_all))
	walk_button = _button("Walk", _toggle_walk)
	walk_button.toggle_mode = true
	top.add_child(walk_button)
	look_pick = OptionButton.new()
	look_pick.add_item("Solid look")
	look_pick.add_item("Splat look")
	look_pick.custom_minimum_size = Vector2(130, 48)
	look_pick.item_selected.connect(_on_look_picked)
	top.add_child(look_pick)
	top.add_child(_button("Save splats", _save_splats))
	top.add_child(_button("Open palace", func(): file_dialog.popup_centered_ratio(0.7)))

	result_list = ItemList.new()
	result_list.position = Vector2(12, 70)
	result_list.custom_minimum_size = Vector2(340, 0)
	result_list.size = Vector2(340, 260)
	result_list.visible = false
	result_list.item_selected.connect(func(i): _go_to(results[i]["id"]))
	layer.add_child(result_list)

	info = RichTextLabel.new()
	info.bbcode_enabled = true
	info.fit_content = true
	info.set_anchors_preset(Control.PRESET_TOP_RIGHT)
	info.offset_left = -372; info.offset_right = -12; info.offset_top = 70
	info.custom_minimum_size = Vector2(360, 0)
	info.add_theme_color_override("default_color", Color.html("#2b2a33"))
	var card = StyleBoxFlat.new()
	card.bg_color = Color.html("#fffdf7")
	card.border_color = Color.html("#2b2a33")
	card.set_border_width_all(3)
	card.set_corner_radius_all(16)
	card.set_content_margin_all(12)
	info.add_theme_stylebox_override("normal", card)
	info.visible = false
	layer.add_child(info)

	status = Label.new()
	status.set_anchors_preset(Control.PRESET_BOTTOM_LEFT)
	status.offset_left = 14; status.offset_top = -40
	status.add_theme_color_override("font_color", Color.html("#2b2a33"))
	layer.add_child(status)

	file_dialog = FileDialog.new()
	file_dialog.file_mode = FileDialog.FILE_MODE_OPEN_FILE
	file_dialog.access = FileDialog.ACCESS_FILESYSTEM
	file_dialog.filters = PackedStringArray(["*.json ; A palace copy saved by the web page"])
	file_dialog.file_selected.connect(_on_file_picked)
	layer.add_child(file_dialog)


func _button(text: String, action: Callable) -> Button:
	var b = Button.new()
	b.text = text
	b.custom_minimum_size = Vector2(72, 48)
	b.pressed.connect(action)
	return b


func _say(text: String) -> void:
	if status != null:
		status.text = text


func _on_file_picked(path: String) -> void:
	var d = _read_json(path)
	if d.has("worlds"):
		# Keep a copy in the app's own folder, so it opens next time.
		var f = FileAccess.open(USER_PALACE, FileAccess.WRITE)
		if f != null:
			f.store_string(JSON.stringify(d))
			f.close()
	_set_palace(d)


func _on_look_picked(i: int) -> void:
	look = i
	_apply_look()


func _save_splats() -> void:
	if splats == null:
		look = 1
		look_pick.select(1)
		_apply_look()
	var path = "user://palace_splats.ply"
	if splats.save_ply(path):
		_say("Saved %d splats to %s" % [splats.positions.size(), ProjectSettings.globalize_path(path)])
	else:
		_say("Could not save the splats.")


func _toggle_walk() -> void:
	walk_mode = walk_button.button_pressed
	if walk_mode:
		follow = true
		goal_dist = minf(goal_dist, 9.0)
		goal_pitch = minf(goal_pitch, 0.6)
		_say("Walk: arrow keys or W A S D. Drag to look. Walls are solid.")


# ---------- search ----------

func _search(query: String) -> Array:
	var stop = ["a", "an", "the", "of", "in", "on", "to", "is", "i", "my", "it", "and", "or", "for", "about", "where", "what", "did", "do", "put", "keep", "idea", "find"]
	var tokens = []
	for raw in query.to_lower().split(" ", false):
		var t = raw.strip_edges().trim_suffix("?").trim_suffix(",").trim_suffix(".")
		if t.length() > 1 and not stop.has(t):
			tokens.append(t)
	var out = []
	if tokens.is_empty():
		return out
	for n in data.get("nodes", []):
		if not desc["by_id"].has(n.get("id", "")):
			continue
		var o = desc["by_id"][n["id"]]
		var room = desc["by_id"][o["room_id"]]
		var score = 0.0
		var hits = 0
		for t in tokens:
			var s = 0.0
			if str(n.get("title", "")).to_lower().contains(t): s += 5.0
			if " ".join(PackedStringArray(n.get("tags", []))).to_lower().contains(t): s += 4.0
			if (str(n.get("description", "")) + " " + str(n.get("question", "")) + " " + str(n.get("answer", ""))).to_lower().contains(t): s += 2.0
			if str(room["name"]).to_lower().contains(t): s += 2.0
			if s > 0.0:
				hits += 1
			score += s
		if score > 0.0:
			out.append({"id": n["id"], "title": n.get("title", ""), "sub": room["name"], "score": score * hits / tokens.size()})
	out.sort_custom(func(a, b): return a["score"] > b["score"])
	return out.slice(0, 10)


func _on_search_changed(text: String) -> void:
	results = _search(text)
	result_list.clear()
	for r in results:
		result_list.add_item("%s   (%s)" % [r["title"], r["sub"]])
	result_list.visible = results.size() > 0


func _on_search_submitted(text: String) -> void:
	_on_search_changed(text)
	search_box.release_focus()
	if results.is_empty():
		_say("Nothing found for “%s”." % text)
	else:
		_go_to(results[0]["id"])


# ---------- select and travel ----------

func _select(id: String) -> void:
	selected = id
	for child in marks.get_children():
		child.queue_free()
	if not nodes_by_id.has(id):
		info.visible = false
		return
	var n = nodes_by_id[id]
	var o = desc["by_id"][id]
	var room = desc["by_id"][o["room_id"]]
	var world = desc["by_id"][o["world_id"]]
	var text = "[font_size=24][b]%s[/b][/font_size]\n%s\n\n" % [n.get("title", ""), n.get("description", "")]
	text += "Lives in [b]%s[/b], %s\n" % [room["name"], world["name"]]
	var topic = "no topic yet"
	if n.get("parent_id") != null:
		if desc["by_id"].has(n["parent_id"]) and desc["by_id"][n["parent_id"]]["type"] == "world":
			topic = desc["by_id"][n["parent_id"]]["name"]
		elif nodes_by_id.has(n["parent_id"]):
			topic = nodes_by_id[n["parent_id"]].get("title", "")
	text += "Belongs to [b]%s[/b]\n" % topic
	for l in desc["links"]:
		if l["source"] == id or l["target"] == id:
			var other = nodes_by_id[l["target"] if l["source"] == id else l["source"]]
			text += "\n• %s: %s" % [str(l["type"]).replace("_", " "), other.get("title", "")]
			_link_mark(l)
	info.text = text
	info.visible = true
	# A ring on the floor and a beam of light over the chosen memory.
	var ring = MeshInstance3D.new()
	var torus = TorusMesh.new()
	torus.inner_radius = 0.86; torus.outer_radius = 1.04
	ring.mesh = torus
	ring.material_override = _flat_material(Color.html("#ff7b6b"), 1.0)
	ring.position = o["pos"] + Vector3(0, 0.16, 0)
	marks.add_child(ring)
	var beam = MeshInstance3D.new()
	var tube = CylinderMesh.new()
	tube.top_radius = 0.5; tube.bottom_radius = 0.5; tube.height = 26.0
	beam.mesh = tube
	beam.material_override = _flat_material(Color.html("#ffcf4a"), 0.35)
	beam.position = o["pos"] + Vector3(0, 14.5, 0)
	marks.add_child(beam)


func _flat_material(color: Color, alpha: float) -> StandardMaterial3D:
	var m = StandardMaterial3D.new()
	m.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	m.albedo_color = Color(color.r, color.g, color.b, alpha)
	if alpha < 1.0:
		m.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
		m.cull_mode = BaseMaterial3D.CULL_DISABLED
	return m


## A connection: a line of beads in an arc between two memories.
func _link_mark(l: Dictionary) -> void:
	var a: Vector3 = l["a"]
	var b: Vector3 = l["b"]
	var mid = (a + b) * 0.5 + Vector3(0, 2.0 + a.distance_to(b) * 0.22, 0)
	var bead = SphereMesh.new()
	bead.radius = 0.12; bead.height = 0.24
	var mat = _flat_material(Color.html(Builder.LINK.get(l["type"], "#b9a6e8")), 1.0)
	var count = clampi(int(a.distance_to(b) / 0.8), 8, 120)
	for i in range(count + 1):
		var t = float(i) / count
		var mi = MeshInstance3D.new()
		mi.mesh = bead
		mi.material_override = mat
		mi.position = a.lerp(mid, t).lerp(mid.lerp(b, t), t)
		marks.add_child(mi)


func _go_to(id: String) -> void:
	if not desc["by_id"].has(id):
		return
	_select(id)
	route = Layout.route(desc, avatar.global_position, id)
	route_i = 1
	var length = 0.0
	for i in range(1, route.size()):
		length += route[i - 1].distance_to(route[i])
	route_speed = maxf(8.0, length / 9.0)
	follow = true
	goal_dist = clampf(goal_dist, 8.0, 13.0)
	goal_pitch = clampf(goal_pitch, 0.4, 0.75)
	cam_dist = minf(cam_dist, 60.0)
	_say("Walking to “%s”…" % desc["by_id"][id].get("title", desc["by_id"][id].get("name", "")))


func _frame_all() -> void:
	if desc.is_empty() or desc["worlds"].is_empty():
		return
	var centre = Vector3.ZERO
	for w in desc["worlds"]:
		centre += w["pos"] / desc["worlds"].size()
	var reach = 0.0
	for w in desc["worlds"]:
		reach = maxf(reach, centre.distance_to(w["pos"]) + w["radius"])
	goal_target = centre
	goal_dist = reach * 2.05
	goal_pitch = 0.8
	follow = false


# ---------- every frame ----------

func _physics_process(delta: float) -> void:
	if route.size() > 1 and route_i < route.size():
		# A guided walk follows the route exactly and ignores walls, so it can never get stuck.
		var left = route_speed * delta
		while left > 0.0 and route_i < route.size():
			var to: Vector3 = route[route_i] + Vector3(0, 0.09, 0)
			var d = avatar.global_position.distance_to(to)
			var flat = Vector3(to.x - avatar.global_position.x, 0, to.z - avatar.global_position.z)
			if flat.length() > 0.01:
				avatar.rotation.y = atan2(flat.x, flat.z)
			if d <= left:
				avatar.global_position = to
				left -= d
				route_i += 1
			else:
				avatar.global_position = avatar.global_position.move_toward(to, left)
				left = 0.0
		avatar.velocity = Vector3.ZERO
		if route_i >= route.size():
			route = []
			if desc["by_id"].has(selected):
				var p: Vector3 = desc["by_id"][selected]["pos"]
				avatar.rotation.y = atan2(p.x - avatar.global_position.x, p.z - avatar.global_position.z)
				_say("Here it is.")
		return
	var move = Vector3.ZERO
	if walk_mode and not search_box.has_focus():
		var x = Input.get_axis("ui_left", "ui_right") + (1.0 if Input.is_physical_key_pressed(KEY_D) else 0.0) - (1.0 if Input.is_physical_key_pressed(KEY_A) else 0.0)
		var y = Input.get_axis("ui_up", "ui_down") + (1.0 if Input.is_physical_key_pressed(KEY_S) else 0.0) - (1.0 if Input.is_physical_key_pressed(KEY_W) else 0.0)
		var forward = Vector3(-sin(cam_yaw), 0, -cos(cam_yaw))
		var right = Vector3(-forward.z, 0, forward.x)
		move = forward * -y + right * x
		if move.length() > 1.0:
			move = move.normalized()
	if move.length() > 0.05:
		avatar.rotation.y = atan2(move.x, move.z)
	avatar.velocity.x = move.x * WALK_SPEED
	avatar.velocity.z = move.z * WALK_SPEED
	avatar.velocity.y = 0.0 if avatar.is_on_floor() else avatar.velocity.y - GRAVITY * delta
	avatar.move_and_slide()
	if avatar.global_position.y < -60.0 and not desc.is_empty() and not desc["worlds"].is_empty():
		# Fell off an island: back to the nearest plaza.
		avatar.global_position = Layout.nearest_world(desc, avatar.global_position)["pos"] + Vector3(0, 1.0, 4.5)
		avatar.velocity = Vector3.ZERO


func _process(delta: float) -> void:
	if follow:
		goal_target = avatar.global_position + Vector3(0, 1.15, 0)
	var first_person = follow and goal_dist < 1.5
	goal_dist = clampf(goal_dist, 0.05 if follow else 2.5, 700.0)
	goal_pitch = clampf(goal_pitch, -0.7 if first_person else 0.08, 1.5)
	var k = 1.0 - exp(-delta * 7.0)
	cam_target = cam_target.lerp(goal_target, 1.0 - exp(-delta * 12.0) if follow else k)
	cam_yaw = lerpf(cam_yaw, goal_yaw, k)
	cam_pitch = lerpf(cam_pitch, goal_pitch, k)
	cam_dist = lerpf(cam_dist, goal_dist, k)
	var cp = cos(cam_pitch)
	camera.global_position = cam_target + Vector3(cp * sin(cam_yaw), sin(cam_pitch), cp * cos(cam_yaw)) * cam_dist
	if camera.global_position.distance_to(cam_target) > 0.001:
		camera.look_at(cam_target, Vector3.UP)
	for child in avatar.get_children():
		if child is MeshInstance3D:
			child.visible = not (follow and cam_dist < 1.5)
	# Name tags fold away in the far view.
	var show_tags = cam_dist < 85.0
	for s in signs.get_children():
		if s.get_meta("name_tag", false):
			s.visible = show_tags


# ---------- mouse and touch ----------

func _unhandled_input(event: InputEvent) -> void:
	if event is InputEventMouseButton:
		if event.button_index == MOUSE_BUTTON_WHEEL_UP:
			goal_dist *= 0.88
		elif event.button_index == MOUSE_BUTTON_WHEEL_DOWN:
			goal_dist *= 1.14
		elif event.button_index == MOUSE_BUTTON_LEFT:
			if event.pressed:
				dragging = true
				drag_moved = 0.0
			else:
				dragging = false
				if drag_moved < 8.0:
					_tap(event.position)
	elif event is InputEventMouseMotion:
		if event.button_mask & MOUSE_BUTTON_MASK_RIGHT or (dragging and event.shift_pressed):
			_pan(event.relative)
		elif dragging:
			drag_moved += event.relative.length()
			goal_yaw -= event.relative.x * 0.0065
			goal_pitch += event.relative.y * 0.005
	elif event is InputEventMagnifyGesture:
		goal_dist /= maxf(event.factor, 0.01)
	elif event is InputEventPanGesture:
		_pan(-event.delta * 12.0)
	elif event is InputEventKey and event.pressed and event.keycode == KEY_ESCAPE:
		_select("")


func _pan(by: Vector2) -> void:
	var s = goal_dist * 0.0016
	var forward = Vector3(-sin(cam_yaw), 0, -cos(cam_yaw))
	var right = Vector3(-forward.z, 0, forward.x)
	goal_target += (right * -by.x + forward * by.y) * s
	if not walk_mode:
		follow = false


## A tap picks the memory under the pointer (its stand is the part that can be hit).
func _tap(at: Vector2) -> void:
	var from = camera.project_ray_origin(at)
	var query = PhysicsRayQueryParameters3D.create(from, from + camera.project_ray_normal(at) * 1500.0)
	query.exclude = [avatar.get_rid()]
	var hit = get_world_3d().direct_space_state.intersect_ray(query)
	if hit.is_empty():
		_select("")
		return
	var id = str(hit["collider"].get_meta("pick", ""))
	if nodes_by_id.has(id):
		_select(id)
	elif walk_mode:
		route = [avatar.global_position, hit["position"]]
		route_i = 1
		route_speed = 8.0
	else:
		_select("")
