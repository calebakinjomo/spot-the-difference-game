// Lantern Row — Spot the Difference: synthesised sounds.
// One clear job: every sound the game makes, built with WebAudio
// oscillators — no audio files, no network. Created lazily on the first
// user gesture (browsers block audio before one), and silenced by mute.

export class SoundBank {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  /** Create the AudioContext on first use (after a user gesture). */
  ensure() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return false;
      this.ctx = new AudioContext();
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume();
    return true;
  }

  setMuted(muted) {
    this.muted = muted;
  }

  tone(freq, startAt, duration, type, volume) {
    if (this.muted || !this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime + startAt);
    gain.gain.setValueAtTime(0, this.ctx.currentTime + startAt);
    gain.gain.linearRampToValueAtTime(volume, this.ctx.currentTime + startAt + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + startAt + duration);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(this.ctx.currentTime + startAt);
    osc.stop(this.ctx.currentTime + startAt + duration + 0.05);
  }

  /** Two-note chime when a difference is found. */
  find() {
    if (!this.ensure()) return;
    this.tone(660, 0, 0.18, 'sine', 0.22);
    this.tone(990, 0.09, 0.28, 'sine', 0.22);
  }

  /** Low buzz for a wrong click. */
  wrong() {
    if (!this.ensure()) return;
    this.tone(140, 0, 0.22, 'sawtooth', 0.12);
    this.tone(110, 0.05, 0.22, 'sawtooth', 0.1);
  }

  /** Soft shimmer when a hint is used. */
  hint() {
    if (!this.ensure()) return;
    this.tone(880, 0, 0.15, 'triangle', 0.16);
    this.tone(1174, 0.08, 0.2, 'triangle', 0.16);
  }

  /** Rising fanfare when a level is complete. */
  win() {
    if (!this.ensure()) return;
    const notes = [523, 659, 784, 1046];
    notes.forEach((freq, i) => this.tone(freq, i * 0.11, 0.3, 'triangle', 0.2));
  }

  /** Short tick in the last ten seconds. */
  tick() {
    if (!this.ensure()) return;
    this.tone(1200, 0, 0.05, 'square', 0.06);
  }
}
