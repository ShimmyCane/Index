# Make 3D x Construct — Convo v0.5

**Project:** Make 3D x Construct
**Round:** 5. Your correction to round 4, then what changed, then questions. Round 4 stays as it was.

## Your correction

- The filler objects from round 4 (the grass, the scrub, the extra stones, the creek and the cottonwoods, the bones, the goods) were added for the sake of adding objects. They are rolled back.
- Increasing density means more detail in the objects that already exist, not more objects. Adding objects to the foreground or background is a later pass, and only when you ask.
- Right now the diorama must read correctly. The lodges (the tipi), the horses (which read as bison), and the people (the natives) did not read as what they are. That is the work.
- You don't want the scene generated from a prompt. I build it.

## What was wrong (my finding)

- **The scale was wrong.** At 1 in = 2 ft, a 5 ft horse is 2.5 in at the shoulder. The horses were about 11 ft tall, and the people about 12 ft. That is why the horses read as bison and the people as giants.
- **The objects were single blocks.** A lodge was one cone; a horse was a box with sticks; a person was a cylinder with a sphere on top.

## What changed

- **Rolled back to the round 3 layout** (the same ground, ridge, backdrop, two lodges, struck cover, two travois, two horses, three people, fire ring, tufts and label). The layout did not change.
- **Each existing object is now built from its real parts:**
  - Lodge: a hide cover, four poles that meet at the top (each tilted to lean in), and a dark door on the south side.
  - Horse: a barrel body, a raised neck with a mane, a tapered head and muzzle, two ears, a tail, four legs. Real proportions: 2.5 in at the shoulder, 3.6 in long.
  - Person: legs or a skirt, a torso, two arms, a neck, a head, hair (a cap, and long hair for the women). Real proportions: about 2.8 in tall. A child is 0.7 of that. No face, no clothing pattern, no regalia.
  - Travois: two poles, a cross bar and a load, at 15 ft poles.
  - Fire ring: eight stones around the cold ash, not one ring.
  - Tufts: three blades each, not one cone.
- **Engine and viewer:** parts can be rotated (`rotation_x`, `rotation_y`, `rotation_z`, in degrees). The engine checks the rotation range and the lowest point of a rotated part. The viewer applies it.
- **Close up:** the Close up button in *Selected part* frames the selected part, or a group and every part inside it.
- Story v0.3: six steps, each referring only to objects in the scene. The bone-trade claim stays as a claim, with a note that no bones are drawn yet.
- Tests: the 300–500 count test is replaced by checks that each object has its real parts.
- The sample is 109 parts and 8 flags (5 open for consultation).

## What is still blocky (for the next pass)

- The bluff is a plain box, and the struck cover and the travois loads are blocks. These are the next density step: the same objects built from more parts.
- The people are placeholder forms by design (the consultation rule). They are now the right size and shape, but a form only.
- The lighting is a stylised diorama.

## Questions

1. **Density order.** Next, do you want the bluff, the struck lodge cover, and the travois loads built from more parts, before anything new is added?
2. **The bones.** You said no filler. Should the bison bones come back in the next pass, as a single detail on the terrace, or wait until you ask?
3. **Figures.** Do you want the people more detailed (clothing shape, hair, pose) while staying placeholder forms with no faces, or is the current level right for now?
4. **Public repo.** Still open from rounds 3 and 4: keep the draft public until the tribes review it, or move the story and sample to `private/`?
