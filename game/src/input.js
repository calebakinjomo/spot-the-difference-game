// Lantern Row — Spot the Difference: mouse, touch and keyboard input.
// One clear job: turn a pointer event on either panel into a panel-space
// point and a hit test against the current scene's differences, and turn
// key presses into game actions. It never draws and never scores — it
// reports what the player did and lets main.js decide what it means.

import { differenceAt, sceneForLevel } from './scenes.js';

/**
 * Wire a canvas to clicks/taps. `onPoint(x, y, side)` is called with the
 * click in panel pixels (560x460) and which panel it was on.
 */
export function attachPanelClicks(canvas, side, onPoint) {
  canvas.addEventListener('pointerdown', (event) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;
    onPoint(x, y, side);
  });
}

/**
 * Hit-test a panel point against the current level's unfound differences.
 * Returns the difference, or null when the click found nothing.
 */
export function hitTest(state, x, y) {
  const scene = sceneForLevel(state.levelIndex);
  const diff = differenceAt(scene, x, y);
  if (diff && !state.found.has(diff.id)) return diff;
  return null;
}

/**
 * The click landed on a difference the player already found: a gentle
 * no-op, never a penalty — the player did find it, after all.
 */
export function alreadyFoundAt(state, x, y) {
  const scene = sceneForLevel(state.levelIndex);
  const diff = differenceAt(scene, x, y);
  return diff && state.found.has(diff.id) ? diff : null;
}

/**
 * Wire the keyboard. Actions: H hint, M mute, R restart level,
 * N next level (level-complete screen), Esc pause/resume.
 */
export function attachKeyboard(handlers) {
  window.addEventListener('keydown', (event) => {
    if (event.repeat) return;
    const key = event.key.toLowerCase();
    if (key === 'h') handlers.onHint();
    else if (key === 'm') handlers.onMute();
    else if (key === 'r') handlers.onRestart();
    else if (key === 'n') handlers.onNext();
    else if (key === 'escape') handlers.onPause();
    else if (key === 'enter' || key === ' ') handlers.onConfirm();
  });
}
