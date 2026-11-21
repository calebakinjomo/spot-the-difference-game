// Lantern Row — Spot the Difference: the three scene specifications.
// One clear job: the data behind every scene. Each scene names its
// level, its clock, and its difference table: one entry per difference
// with the spot's position (in panel pixels, 560x460), the click radius
// and a plain-language label of what changes. draw.js renders the scene
// and applies each entry to the right panel only; nothing here draws.
//
// A difference is fair when a careful player can see it once they look
// at the right place: a missing object, a changed colour, an extra
// creature, a flipped sign. Never a one-pixel trick, never hidden
// behind another object.

export const SCENES = [
  {
    id: 'lantern',
    name: 'Lantern Row',
    subtitle: 'A night-market street, lit by paper lanterns',
    timeLimitS: 120,
    differences: [
      { id: 'lantern-missing', x: 250, y: 150, r: 30, label: 'a paper lantern is missing' },
      { id: 'lantern-colour', x: 70, y: 150, r: 30, label: 'a lantern changed colour' },
      { id: 'bicycle-bell', x: 468, y: 318, r: 16, label: 'the bicycle bell is missing' },
      { id: 'moon-phase', x: 495, y: 48, r: 30, label: 'the moon changed phase' },
      { id: 'bulb-missing', x: 280, y: 78, r: 14, label: 'a string-light bulb is missing' },
    ],
  },
  {
    id: 'reef',
    name: 'Coral Reef',
    subtitle: 'Underwater, among the corals and the turtle',
    timeLimitS: 150,
    differences: [
      { id: 'extra-fish', x: 400, y: 200, r: 26, label: 'an extra fish swam in' },
      { id: 'turtle-spot', x: 350, y: 275, r: 18, label: 'a spot is missing from the turtle shell' },
      { id: 'chest-lid', x: 480, y: 395, r: 34, label: 'the treasure chest is open' },
      { id: 'coral-colour', x: 280, y: 350, r: 34, label: 'a coral changed colour' },
      { id: 'bubble-missing', x: 300, y: 180, r: 14, label: 'a bubble is missing' },
      { id: 'starfish-missing', x: 200, y: 420, r: 22, label: 'the starfish is missing' },
      { id: 'seaweed-missing', x: 140, y: 360, r: 26, label: 'a strand of seaweed is missing' },
    ],
  },
  {
    id: 'camp',
    name: 'Starlight Camp',
    subtitle: 'A campsite under the stars, fire crackling',
    timeLimitS: 180,
    differences: [
      { id: 'star-missing', x: 200, y: 60, r: 12, label: 'a star is missing' },
      { id: 'moon-crater', x: 80, y: 50, r: 26, label: 'a crater is missing from the moon' },
      { id: 'tent-door', x: 280, y: 345, r: 32, label: 'the tent door is open' },
      { id: 'flame-size', x: 200, y: 385, r: 26, label: 'the campfire flame is smaller' },
      { id: 'marshmallow-missing', x: 150, y: 390, r: 14, label: 'a marshmallow is missing' },
      { id: 'backpack-strap', x: 420, y: 400, r: 26, label: 'the backpack strap is missing' },
      { id: 'pine-tier', x: 490, y: 280, r: 40, label: 'a pine tree lost a tier' },
      { id: 'lantern-lit', x: 330, y: 390, r: 18, label: 'the camp lantern is unlit' },
      { id: 'log-missing', x: 240, y: 418, r: 20, label: 'a log is missing from the fire' },
    ],
  },
];

/** The scene for a level index (0-based). */
export function sceneForLevel(levelIndex) {
  return SCENES[levelIndex];
}

/** Find the difference table entry whose circle contains a panel point. */
export function differenceAt(scene, x, y) {
  for (const diff of scene.differences) {
    const dx = x - diff.x;
    const dy = y - diff.y;
    if (dx * dx + dy * dy <= diff.r * diff.r) return diff;
  }
  return null;
}
