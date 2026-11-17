extends RefCounted
## Mind Palace: scene description -> Godot nodes (the "solid" look).
## Meshes go under one node, colliders under another, signs under a third,
## so a look can be hidden without losing the floors you walk on.

static var _materials := {}


static func material_for(color: Color, glow: bool) -> StandardMaterial3D:
	var key = color.to_html() + ("g" if glow else "")
	if not _materials.has(key):
		var m = StandardMaterial3D.new()
		m.albedo_color = color
		m.roughness = 0.9
		if glow:
			m.emission_enabled = true
			m.emission = color
			m.emission_energy_multiplier = 0.55
		_materials[key] = m
	return _materials[key]


## A flat outline pushed out along z (the star and the heart).
static func prism_mesh(pts: Array, depth: float) -> ArrayMesh:
	var poly = PackedVector2Array()
	for p in pts:
		poly.append(Vector2(float(p[0]), float(p[1])))
	var idx = Geometry2D.triangulate_polygon(poly)
	var st = SurfaceTool.new()
	st.begin(Mesh.PRIMITIVE_TRIANGLES)
	var hz = depth / 2.0
	for i in range(0, idx.size(), 3):
		var a = poly[idx[i]]
		var b = poly[idx[i + 1]]
		var c = poly[idx[i + 2]]
		_tri(st, Vector3(a.x, a.y, hz), Vector3(b.x, b.y, hz), Vector3(c.x, c.y, hz), Vector3(0, 0, 1))
		_tri(st, Vector3(a.x, a.y, -hz), Vector3(b.x, b.y, -hz), Vector3(c.x, c.y, -hz), Vector3(0, 0, -1))
	var centre = Vector2.ZERO
	for p in poly:
		centre += p / poly.size()
	for i in range(poly.size()):
		var a = poly[i]
		var b = poly[(i + 1) % poly.size()]
		var e = b - a
		var n2 = Vector2(e.y, -e.x).normalized()
		if n2.dot((a + b) * 0.5 - centre) < 0:
			n2 = -n2
		var n = Vector3(n2.x, n2.y, 0)
		_tri(st, Vector3(a.x, a.y, hz), Vector3(b.x, b.y, hz), Vector3(b.x, b.y, -hz), n)
		_tri(st, Vector3(a.x, a.y, hz), Vector3(b.x, b.y, -hz), Vector3(a.x, a.y, -hz), n)
	return st.commit()


## One triangle whose front faces along n. Godot's front face is the clockwise one.
static func _tri(st: SurfaceTool, a: Vector3, b: Vector3, c: Vector3, n: Vector3) -> void:
	if (b - a).cross(c - a).dot(n) > 0:
		var t = b
		b = c
		c = t
	for v in [a, b, c]:
		st.set_normal(n)
		st.add_vertex(v)


static func mesh_for(s: Dictionary) -> Mesh:
	match s["t"]:
		"box":
			var m = BoxMesh.new()
			m.size = s["size"]
			return m
		"cyl":
			var m = CylinderMesh.new()
			m.top_radius = s["rt"]
			m.bottom_radius = s["rb"]
			m.height = s["h"]
			m.radial_segments = maxi(3, int(s.get("seg", 20)))
			m.rings = 1
			return m
		"sph":
			var m = SphereMesh.new()
			m.radius = s["r"]
			m.height = s["r"] * 2.0
			m.radial_segments = 20
			m.rings = 10
			return m
		"torus":
			var m = TorusMesh.new()
			m.inner_radius = s["R"] - s["r"]
			m.outer_radius = s["R"] + s["r"]
			m.rings = 28
			m.ring_segments = 10
			return m
		"prism":
			return prism_mesh(s["pts"], s["depth"])
	return null


static func sign_for(s: Dictionary) -> Label3D:
	var l = Label3D.new()
	l.text = s["text"]
	l.billboard = BaseMaterial3D.BILLBOARD_ENABLED
	l.font_size = 64
	l.outline_size = 16
	l.pixel_size = float(s["height"]) / 90.0
	l.modulate = Color.html("#2b2a33")
	l.outline_modulate = s["color"]
	l.transform = s["xf"]
	if s["t"] == "emoji":
		l.font_size = 96
		l.modulate = Color.WHITE
		l.pixel_size = float(s["height"]) / 120.0
	else:
		l.no_depth_test = not s.get("name_tag", false)
	return l


## Build the nodes. `meshes`, `bodies` and `signs` are empty Node3Ds already in the tree.
static func build(specs: Array, meshes: Node3D, bodies: Node3D, signs: Node3D) -> void:
	for s in specs:
		if s["t"] == "label" or s["t"] == "emoji":
			var l = sign_for(s)
			l.set_meta("name_tag", s.get("name_tag", false))
			signs.add_child(l)
			continue
		var mesh = mesh_for(s)
		if mesh == null:
			continue
		var mi = MeshInstance3D.new()
		mi.mesh = mesh
		mi.material_override = material_for(s["color"], s["glow"])
		mi.transform = s["xf"]
		mi.set_meta("color", s["color"])
		mi.set_meta("glow", s["glow"])
		meshes.add_child(mi)
		if s["solid"]:
			var body = StaticBody3D.new()
			var shape = CollisionShape3D.new()
			if s["t"] == "box":
				var b = BoxShape3D.new()
				b.size = s["size"]
				shape.shape = b
			else:
				var c = CylinderShape3D.new()
				c.radius = maxf(float(s.get("rt", 0.5)), float(s.get("rb", 0.5)))
				c.height = float(s.get("h", 1.0))
				shape.shape = c
			body.transform = s["xf"]
			body.set_meta("pick", s["pick"])
			body.add_child(shape)
			bodies.add_child(body)
