// Mind Palace: one Gaussian splat, drawn as a small disc that lies on the surface it was sampled from.
// Each disc fades out from its middle like a bell curve. Instead of blending (which needs sorting every frame),
// each pixel is kept or dropped by a fine dither, so splats can be drawn in any order and still hide each other correctly.
shader_type spatial;
render_mode unshaded, cull_disabled;

uniform float sharpness : hint_range(0.5, 8.0) = 2.6;   // higher = smaller, crisper dots
uniform float grain : hint_range(0.0, 1.0) = 1.0;       // 0 = hard discs, 1 = soft dithered edge

varying vec3 tint;

float noise(vec2 p) {
	return fract(52.9829189 * fract(dot(p, vec2(0.06711056, 0.00583715))));
}

void vertex() {
	// The colour of each splat arrives as the instance colour, written as a screen colour.
	tint = pow(COLOR.rgb, vec3(2.2));
}

void fragment() {
	vec2 d = UV * 2.0 - 1.0;
	float r2 = dot(d, d);
	if (r2 > 1.0) {
		discard;
	}
	float a = exp(-sharpness * r2);
	float cut = mix(0.35, noise(FRAGCOORD.xy) * 0.9 + 0.05, grain);
	if (a < cut) {
		discard;
	}
	ALBEDO = tint;
}
