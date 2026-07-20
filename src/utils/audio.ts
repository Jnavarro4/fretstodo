/** Reproducción de notas de ejemplo (senoidal suave con envolvente). */

let ctx: AudioContext | null = null;

function ensureCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  void ctx.resume();
  return ctx;
}

export function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

export function playMidi(midi: number, startInMs = 0, durationMs = 600): void {
  try {
    const audio = ensureCtx();
    const t0 = audio.currentTime + startInMs / 1000;
    const dur = durationMs / 1000;
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.type = 'sine';
    osc.frequency.value = midiToFreq(midi);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(0.3, t0 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain);
    gain.connect(audio.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  } catch {
    /* sin audio: los ejemplos son opcionales */
  }
}

/** Reproduce una secuencia de notas separadas por gapMs. */
export function playSequence(midis: number[], gapMs = 550, durationMs = 500): void {
  midis.forEach((m, i) => playMidi(m, i * gapMs, durationMs));
}
