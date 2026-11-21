// Lantern Row — Spot the Difference: boot, game loop, UI wiring.
// One clear job: tie everything together. It reads the `shot` query
// parameter for the deterministic screenshot modes, runs the
// requestAnimationFrame loop (clock, render, HUD), wires the buttons and
// overlays, and hands clicks to the state machine. The game itself lives
// in config.js, scenes.js, draw.js, audio.js, state.js and input.js.

import { PANEL_HEIGHT, PANEL_WIDTH, SHOT_MODES } from './config.js';
import { drawHintRing, drawMarkers, drawPopups, drawScene } from './draw.js';
import { SoundBank } from './audio.js';
import {
  advance,
  createState,
  registerFind,
  registerMiss,
  remainingCount,
  startLevel,
  tickClock,
  useHint,
} from './state.js';
import { alreadyFoundAt, attachKeyboard, attachPanelClicks, hitTest } from './input.js';
import { sceneForLevel } from './scenes.js';

const $ = (id) => document.getElementById(id);
const leftCanvas = $('panel-left');
const rightCanvas = $('panel-right');
const leftCtx = leftCanvas.getContext('2d');
const rightCtx = rightCanvas.getContext('2d');

const sounds = new SoundBank();
const state = createState();

// Exposed for automated play-testing only: the test harness reads the
// state and drives clicks through the same handlers a player uses.
window.__game = { state, startLevel, registerFind, registerMiss };

let muted = false;
let lastFrameMs = performance.now();

function fmtTime(seconds) {
  const s = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

function showOverlay(name) {
  for (const id of ['overlay-title', 'overlay-pause', 'overlay-level', 'overlay-game']) {
    $(id).classList.toggle('hidden', id !== name);
  }
}

function refreshHud() {
  const scene = sceneForLevel(state.levelIndex);
  $('level-name').textContent = `Level ${state.levelIndex + 1} · ${scene.name}`;
  $('counter').textContent =
    `${state.found.size} of ${scene.differences.length} found — ${remainingCount(state)} remain`;
  $('score').textContent = `Score ${state.score}`;
  $('streak').textContent = state.streak > 1 ? `Streak ×${state.streak}` : 'Streak —';
  $('timer-text').textContent = fmtTime(state.timeLeftS);
  const fill = $('timer-fill');
  fill.style.width = `${(state.timeLeftS / state.timeLimitS) * 100}%`;
  fill.classList.toggle('urgent', state.urgent);
  fill.classList.toggle('low', state.timeLeftS <= 30 && !state.urgent);
  $('hint-count').textContent = `Hints ${state.hintsLeft}`;
  $('hint-btn').disabled = state.hintsLeft <= 0 || state.screen !== 'playing';
}

function refreshOverlays() {
  if (state.screen === 'title') {
    showOverlay('overlay-title');
  } else if (state.screen === 'paused') {
    showOverlay('overlay-pause');
  } else if (state.screen === 'levelComplete') {
    const scene = sceneForLevel(state.levelIndex);
    $('level-title').textContent =
      state.levelStars > 0 ? `${scene.name} complete!` : `Time up — ${scene.name}`;
    $('level-stars').textContent =
      state.levelStars > 0 ? '★'.repeat(state.levelStars) + '☆'.repeat(3 - state.levelStars) : '—';
    $('level-summary').textContent =
      `Found ${state.found.size} of ${scene.differences.length} differences · ` +
      `Level score ${state.levelScore} · Total ${state.score}`;
    $('next-btn').textContent =
      state.levelIndex + 1 >= 3 ? 'See results' : 'Next level (N)';
    showOverlay('overlay-level');
  } else if (state.screen === 'gameComplete') {
    $('final-score').textContent = `${state.score}`;
    $('final-summary').textContent =
      `${state.totalFound} differences found · Best streak ×${state.bestStreak} · ` +
      `Total hunting time ${fmtTime(state.totalTimeS)}`;
    showOverlay('overlay-game');
  } else {
    showOverlay(null);
  }
}

function render(nowMs) {
  const scene = sceneForLevel(state.levelIndex);
  drawScene(leftCtx, scene.id, 'left');
  drawScene(rightCtx, scene.id, 'right');
  drawMarkers(leftCtx, scene, state.marks, nowMs);
  drawMarkers(rightCtx, scene, state.marks, nowMs);
  if (state.hintedId && nowMs < state.hintedUntil) {
    const diff = scene.differences.find((d) => d.id === state.hintedId);
    if (diff) {
      drawHintRing(leftCtx, diff, nowMs);
      drawHintRing(rightCtx, diff, nowMs);
    }
  }
  const leftPopups = state.popups.filter((p) => p.side === 'left');
  const rightPopups = state.popups.filter((p) => p.side === 'right');
  drawPopups(leftCtx, leftPopups, nowMs);
  drawPopups(rightCtx, rightPopups, nowMs);
}

function frame(nowMs) {
  const dtS = Math.min(0.1, (nowMs - lastFrameMs) / 1000);
  lastFrameMs = nowMs;
  const event = tickClock(state, dtS, nowMs);
  if (event === 'tick') sounds.tick();
  if (event === 'timeout') sounds.wrong();
  if (state.screen === 'playing' || state.screen === 'paused' || state.screen === 'title') {
    render(nowMs);
  }
  refreshHud();
  refreshOverlays();
  requestAnimationFrame(frame);
}

function onPanelClick(x, y, side) {
  sounds.ensure();
  if (state.screen !== 'playing') return;
  if (alreadyFoundAt(state, x, y)) return; // found it already: no penalty
  const diff = hitTest(state, x, y);
  if (diff) {
    registerFind(state, diff, performance.now(), side);
    sounds.find();
    if (state.screen === 'levelComplete') sounds.win();
  } else {
    registerMiss(state);
    sounds.wrong();
    const panels = $('panels');
    panels.classList.remove('shake');
    void panels.offsetWidth; // restart the shake animation
    panels.classList.add('shake');
  }
}

function onHint() {
  sounds.ensure();
  if (state.screen !== 'playing') return;
  const diff = useHint(state, performance.now());
  if (diff) sounds.hint();
}

function onMute() {
  muted = !muted;
  sounds.setMuted(muted);
  $('mute-btn').textContent = muted ? '🔇 Muted' : '🔊 Sound on';
}

function onRestart() {
  if (state.screen !== 'playing' && state.screen !== 'paused') return;
  startLevel(state, state.levelIndex);
}

function onNext() {
  if (state.screen === 'levelComplete') advance(state);
}

function onPause() {
  if (state.screen === 'playing') {
    state.screen = 'paused';
  } else if (state.screen === 'paused') {
    state.screen = 'playing';
  }
}

function onConfirm() {
  if (state.screen === 'title') startLevel(state, 0);
  else if (state.screen === 'levelComplete') advance(state);
  else if (state.screen === 'gameComplete') startLevel(state, 0);
}

// ------------------------------------------------------------- shot modes

function applyShotMode(shot) {
  const mode = SHOT_MODES[shot];
  if (!mode) return false;
  startLevel(state, mode.level);
  state.frozen = true;
  state.timeLeftS = mode.timeLeftS;
  const scene = sceneForLevel(mode.level);
  // Pre-find the first N differences, with rings already settled.
  for (let i = 0; i < mode.found; i++) {
    const diff = scene.differences[i];
    state.found.add(diff.id);
    state.marks.set(diff.id, -100000);
  }
  state.score = mode.found * 100;
  if (shot === 'title') {
    state.screen = 'title';
    state.found = new Set();
    state.marks = new Map();
    state.score = 0;
  }
  return true;
}

// ------------------------------------------------------------------- boot

function boot() {
  leftCanvas.width = PANEL_WIDTH;
  leftCanvas.height = PANEL_HEIGHT;
  rightCanvas.width = PANEL_WIDTH;
  rightCanvas.height = PANEL_HEIGHT;

  attachPanelClicks(leftCanvas, 'left', onPanelClick);
  attachPanelClicks(rightCanvas, 'right', onPanelClick);
  attachKeyboard({
    onHint,
    onMute,
    onRestart,
    onNext,
    onPause,
    onConfirm,
  });

  $('play-btn').addEventListener('click', () => {
    sounds.ensure();
    startLevel(state, 0);
  });
  $('hint-btn').addEventListener('click', onHint);
  $('mute-btn').addEventListener('click', onMute);
  $('restart-btn').addEventListener('click', onRestart);
  $('resume-btn').addEventListener('click', onPause);
  $('next-btn').addEventListener('click', onNext);
  $('again-btn').addEventListener('click', () => startLevel(state, 0));
  $('quit-title-btn').addEventListener('click', () => {
    state.screen = 'title';
  });

  const shot = new URLSearchParams(window.location.search).get('shot');
  if (shot && applyShotMode(shot)) {
    document.body.classList.add('shot-mode');
  } else {
    state.timeLimitS = 120;
    state.timeLeftS = 120;
  }

  refreshHud();
  refreshOverlays();
  requestAnimationFrame(frame);
}

boot();
