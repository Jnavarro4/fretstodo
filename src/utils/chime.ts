/** Campanita de fin de estudio (dos notas, Web Audio). */
export function playChime(): void {
  try {
    const ctx = new AudioContext();
    const now = ctx.currentTime;
    [880, 1320].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const t0 = now + i * 0.18;
      gain.gain.setValueAtTime(0.35, t0);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t0);
      osc.stop(t0 + 0.55);
    });
    setTimeout(() => void ctx.close(), 1500);
  } catch {
    /* sin audio disponible: el temporizador igual marca la tarea */
  }
}
