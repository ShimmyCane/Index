extends MultiMeshInstance3D
## Mind Palace: the "splat" look.
## Takes the same meshes the solid look draws, scatters points over their surfaces, and turns every point
## into one Gaussian splat: a position, a facing, a size and a colour. The splats are drawn as one MultiMesh.
## The same list can be saved as a .ply file in the usual 3-D Gaussian splatting layout.

const SUN := Vector3(0.48, 0.78, 0.4)

var positions := PackedVector3Array()
var normals := PackedVector3Array()
var radii := PackedFloat32Array()
var colors := PackedColorArray()


## Scatter splats over every MeshInstance3D under `meshes`.
## density = splats per square unit before limits; per_mesh_max keeps one huge floor from eating the budget.
func build_from(meshes: Node3D, density := 55.0, per_mesh_max := 5000, budget := 260000) -> int:
	positions.clear(); normals.clear(); radii.clear(); colors.clear()
	var rng = RandomNumberGenerator.new()
	rng.seed = 20261117       # the same palace always gives the same splats
	var sun = SUN.normalized()
	for child in meshes.get_children():
		if not (child is MeshInstance3D) or child.mesh == null:
			continue
		var xf: Transform3D = child.transform
		var faces: PackedVector3Array = child.mesh.get_faces()
		var tri_count = faces.size() / 3
		if tri_count == 0:
			continue
		var world = PackedVector3Array()
		world.resize(faces.size())
		var centre = Vector3.ZERO
		for i in range(faces.size()):
			world[i] = xf * faces[i]
			centre += world[i] / faces.size()
		var cumulative = PackedFloat32Array()
		cumulative.resize(tri_count)
		var area = 0.0
		for t in range(tri_count):
			area += (world[t * 3 + 1] - world[t * 3]).cross(world[t * 3 + 2] - world[t * 3]).length() * 0.5
			cumulative[t] = area
		if area <= 0.000001:
			continue
		var n = clampi(int(area * density), 10, per_mesh_max)
		if positions.size() + n > budget:
			break
		var radius = 1.7 * sqrt(area / (n * PI))      # wide enough that neighbours overlap
		var base: Color = child.get_meta("color", Color.WHITE)
		var glow: bool = child.get_meta("glow", false)
		for k in range(n):
			var t = mini(cumulative.bsearch(rng.randf() * area), tri_count - 1)
			var a = world[t * 3]
			var b = world[t * 3 + 1]
			var c = world[t * 3 + 2]
			var u = rng.randf()
			var v = rng.randf()
			if u + v > 1.0:
				u = 1.0 - u
				v = 1.0 - v
			var p = a + (b - a) * u + (c - a) * v
			var nrm = (b - a).cross(c - a).normalized()
			if nrm.dot(p - centre) < 0.0:
				nrm = -nrm
			# Light is baked into the colour, with a little variation so surfaces read as painted dabs.
			var shade = 1.05 if glow else 0.58 + 0.42 * maxf(nrm.dot(sun), 0.0)
			var jitter = 0.94 + rng.randf() * 0.12
			positions.append(p)
			normals.append(nrm)
			radii.append(radius * (0.8 + rng.randf() * 0.4))
			colors.append(Color(clampf(base.r * shade * jitter, 0, 1), clampf(base.g * shade * jitter, 0, 1), clampf(base.b * shade * jitter, 0, 1)))
	_fill()
	return positions.size()


func _basis_for(nrm: Vector3, r: float) -> Basis:
	var tangent = nrm.cross(Vector3.UP)
	if tangent.length() < 0.01:
		tangent = nrm.cross(Vector3.RIGHT)
	tangent = tangent.normalized()
	var bitangent = nrm.cross(tangent).normalized()
	return Basis(tangent * r, bitangent * r, nrm * r)


func _fill() -> void:
	var quad = QuadMesh.new()
	quad.size = Vector2(2, 2)
	var mm = MultiMesh.new()
	mm.transform_format = MultiMesh.TRANSFORM_3D
	mm.use_colors = true
	mm.mesh = quad
	mm.instance_count = positions.size()
	for i in range(positions.size()):
		mm.set_instance_transform(i, Transform3D(_basis_for(normals[i], radii[i]), positions[i]))
		mm.set_instance_color(i, colors[i])
	multimesh = mm
	var mat = ShaderMaterial.new()
	mat.shader = load("res://shaders/splat.gdshader")
	material_override = mat
	# The cloud is far bigger than one quad; tell the engine so it is never culled by mistake.
	custom_aabb = AABB(Vector3(-2000, -500, -2000), Vector3(4000, 1000, 4000))


## Save the splats as a binary .ply in the layout 3-D Gaussian splatting tools read
## (position, normal, base colour as f_dc, opacity as a logit, log scales, rotation as w x y z).
func save_ply(path: String) -> bool:
	var f = FileAccess.open(path, FileAccess.WRITE)
	if f == null:
		return false
	var header = "ply\nformat binary_little_endian 1.0\nelement vertex %d\n" % positions.size()
	for prop in ["x", "y", "z", "nx", "ny", "nz", "f_dc_0", "f_dc_1", "f_dc_2", "opacity", "scale_0", "scale_1", "scale_2", "rot_0", "rot_1", "rot_2", "rot_3"]:
		header += "property float %s\n" % prop
	header += "end_header\n"
	f.store_buffer(header.to_ascii_buffer())
	var c0 = 0.28209479177387814
	for i in range(positions.size()):
		var p = positions[i]
		var n = normals[i]
		var col = colors[i]
		var r = radii[i] * 0.45          # the drawn disc reaches about two standard deviations
		var q = _basis_for(n, 1.0).get_rotation_quaternion()
		for v in [p.x, p.y, p.z, n.x, n.y, n.z, (col.r - 0.5) / c0, (col.g - 0.5) / c0, (col.b - 0.5) / c0, 4.6, log(r), log(r), log(r * 0.08), q.w, q.x, q.y, q.z]:
			f.store_float(v)
	f.close()
	return true
