// Lantern Row — Spot the Difference: tuning constants and level roster.
// One clear job: every number the game balances on lives here, so a
// balance tweak never touches the drawing code or the state machine.

export const PANEL_WIDTH = 560;
export const PANEL_HEIGHT = 460;

// Scoring: a find is worth 100, each consecutive find without a miss
// adds another 10, a hint costs 50 and a wrong click costs 5 seconds.
export const POINTS_PER_FIND = 100;
export const STREAK_BONUS = 10;
export const HINT_COST = 50;
export const HINTS_PER_LEVEL = 3;
export const HINT_COOLDOWN_MS = 5000;
export const HINT_PULSE_MS = 3000;
export const WRONG_CLICK_PENALTY_S = 5;

// Level-complete stars: 3 stars need at least half the clock left,
// 2 stars need at least a quarter, anything else is 1 star.
export const STAR_THRESHOLDS = [0.5, 0.25];

// The three scenes, in play order, with their clocks and difference
// counts. The difference tables themselves live in scenes.js.
export const LEVELS = [
  { id: 'lantern', name: 'Lantern Row', timeLimitS: 120, diffCount: 5 },
  { id: 'reef', name: 'Coral Reef', timeLimitS: 150, diffCount: 7 },
  { id: 'camp', name: 'Starlight Camp', timeLimitS: 180, diffCount: 9 },
];

// Deterministic screenshot modes (?shot=...): which level to show, how
// many differences are already found, and the clock reading on the shot.
export const SHOT_MODES = {
  cover: { level: 0, found: 2, timeLeftS: 87 },
  reef: { level: 1, found: 3, timeLeftS: 112 },
  camp: { level: 2, found: 4, timeLeftS: 143 },
  title: { level: 0, found: 0, timeLeftS: 120 },
};
