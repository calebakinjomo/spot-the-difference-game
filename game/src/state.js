// Lantern Row — Spot the Difference: the game state machine.
// One clear job: what the game is doing right now, and how it changes.
// Screens: title -> playing -> paused -> level-complete -> (next level)
// playing -> game-complete. Scoring, streaks, hints, the clock and the
// per-level found set all live here; drawing and input read it, never
// mutate it behind its back.

import {
  HINT_COST,
  HINTS_PER_LEVEL,
  POINTS_PER_FIND,
  STAR_THRESHOLDS,
  STREAK_BONUS,
  WRONG_CLICK_PENALTY_S,
} from './config.js';
import { sceneForLevel } from './scenes.js';

export const SCREENS = ['title', 'playing', 'paused', 'levelComplete', 'gameComplete'];

export function createState() {
  return {
    screen: 'title',
    levelIndex: 0,
    found: new Set(),
    // difference id -> performance.now() ms when its ring started
    marks: new Map(),
    // floating "+100" popups, in panel space: {x, y, text, startedAt, side}
    popups: [],
    score: 0,
    levelScore: 0,
    streak: 0,
    bestStreak: 0,
    hintsLeft: HINTS_PER_LEVEL,
    hintCooldownUntil: 0,
    hintedId: null,
    hintedUntil: 0,
    timeLeftS: 0,
    timeLimitS: 0,
    totalTimeS: 0,
    totalFound: 0,
    levelStars: 0,
    lastTickSecond: -1,
    // In shot modes the clock is frozen so a screenshot is reproducible.
    frozen: false,
    // True while the timer bar should pulse red (last 10 seconds).
    urgent: false,
  };
}

/** Start (or restart) a level: fresh clock, fresh found set, fresh hints. */
export function startLevel(state, levelIndex) {
  const scene = sceneForLevel(levelIndex);
  state.levelIndex = levelIndex;
  state.screen = 'playing';
  state.found = new Set();
  state.marks = new Map();
  state.popups = [];
  state.levelScore = 0;
  state.streak = 0;
  state.hintsLeft = HINTS_PER_LEVEL;
  state.hintCooldownUntil = 0;
  state.hintedId = null;
  state.hintedUntil = 0;
  state.timeLimitS = scene.timeLimitS;
  state.timeLeftS = scene.timeLimitS;
  state.lastTickSecond = -1;
  state.urgent = false;
}

/** A click landed on a difference: score it, mark it, maybe end the level. */
export function registerFind(state, diff, nowMs, side) {
  if (state.found.has(diff.id)) return false;
  state.found.add(diff.id);
  state.marks.set(diff.id, nowMs);
  state.streak += 1;
  state.bestStreak = Math.max(state.bestStreak, state.streak);
  const gained = POINTS_PER_FIND + STREAK_BONUS * (state.streak - 1);
  state.score += gained;
  state.levelScore += gained;
  state.totalFound += 1;
  state.popups.push({
    x: diff.x,
    y: diff.y - diff.r - 8,
    text: `+${gained}`,
    startedAt: nowMs,
    side,
  });
  const scene = sceneForLevel(state.levelIndex);
  if (state.found.size >= scene.differences.length) {
    completeLevel(state);
  }
  return true;
}

/** A click landed on nothing: lose time, break the streak. */
export function registerMiss(state) {
  state.timeLeftS = Math.max(0, state.timeLeftS - WRONG_CLICK_PENALTY_S);
  state.streak = 0;
}

/** Spend a hint: returns the difference it points at, or null. */
export function useHint(state, nowMs) {
  if (state.hintsLeft <= 0) return null;
  if (nowMs < state.hintCooldownUntil) return null;
  const scene = sceneForLevel(state.levelIndex);
  const remaining = scene.differences.filter((d) => !state.found.has(d.id));
  if (remaining.length === 0) return null;
  const diff = remaining[Math.floor(Math.random() * remaining.length)];
  state.hintsLeft -= 1;
  state.score = Math.max(0, state.score - HINT_COST);
  state.hintedId = diff.id;
  state.hintedUntil = nowMs + 3000;
  state.hintCooldownUntil = nowMs + 5000;
  return diff;
}

/** Advance the clock by dt seconds; returns 'timeout' when time runs out. */
export function tickClock(state, dtS, nowMs) {
  if (state.screen !== 'playing' || state.frozen) return null;
  state.timeLeftS = Math.max(0, state.timeLeftS - dtS);
  state.urgent = state.timeLeftS <= 10 && state.timeLeftS > 0;
  const whole = Math.ceil(state.timeLeftS);
  if (state.urgent && whole !== state.lastTickSecond) {
    state.lastTickSecond = whole;
    return 'tick';
  }
  if (state.timeLeftS <= 0) {
    state.screen = 'levelComplete';
    state.levelStars = 0;
    return 'timeout';
  }
  return null;
}

/** The level is won: time bonus, stars, and the next screen. */
export function completeLevel(state) {
  const timeBonus = Math.round(state.timeLeftS) * 5;
  state.score += timeBonus;
  state.levelScore += timeBonus;
  state.totalTimeS += state.timeLimitS - state.timeLeftS;
  const fractionLeft = state.timeLeftS / state.timeLimitS;
  state.levelStars = fractionLeft >= STAR_THRESHOLDS[0] ? 3 : fractionLeft >= STAR_THRESHOLDS[1] ? 2 : 1;
  state.screen = 'levelComplete';
}

/** Move on: next level, or the game-complete screen after the last one. */
export function advance(state) {
  if (state.levelIndex + 1 >= 3) {
    state.screen = 'gameComplete';
  } else {
    startLevel(state, state.levelIndex + 1);
  }
}

/** How many differences are still unfound in the current level. */
export function remainingCount(state) {
  const scene = sceneForLevel(state.levelIndex);
  return scene.differences.length - state.found.size;
}
