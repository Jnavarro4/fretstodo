/**
 * Metrónomo de FretsToDo sobre Web Audio API.
 * Usa un scheduler de lookahead (patrón "A Tale of Two Clocks") para
 * mantener precisión de tempo independiente del hilo de UI.
 */

export type ClickKind = 'accent' | 'beat' | 'sub';

export interface TimeSignature {
  beats: number;
  unit: number;
}

export interface MetronomeVisualEvent {
  beat: number;
  isBeatStart: boolean;
  audible: boolean;
}

export interface MetronomeOptions {
  onVisual?: (ev: MetronomeVisualEvent) => void;
}

const LOOKAHEAD_MS = 25;
const SCHEDULE_AHEAD_S = 0.1;

export class Metronome {
  bpm = 100;
  timeSignature: TimeSignature = { beats: 4, unit: 4 };
  /** Subdivisiones por tiempo: 1 negras, 2 corcheas, 3 tresillos, 4 semicorcheas. */
  subdivision = 1;
  /** Entrenador de pulso: alterna compases audibles y en silencio. */
  gapEnabled = false;
  gapBarsOn = 4;
  gapBarsOff = 4;

  playing = false;

  private ctx: AudioContext | null = null;
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private nextNoteTime = 0;
  private currentBeat = 0;
  private currentSub = 0;
  private currentBar = 0;
  private visualTimeouts: ReturnType<typeof setTimeout>[] = [];
  private onVisual?: (ev: MetronomeVisualEvent) => void;

  constructor(options: MetronomeOptions = {}) {
    this.onVisual = options.onVisual;
  }

  /** Compás compuesto: 6/8, 9/8, 12/8 → acento en cada grupo de 3 corcheas. */
  get isCompound(): boolean {
    return this.timeSignature.unit === 8 && this.timeSignature.beats % 3 === 0;
  }

  start(): void {
    if (this.playing) return;
    if (!this.ctx) {
      this.ctx = new AudioContext();
    }
    void this.ctx.resume();
    this.playing = true;
    this.currentBeat = 0;
    this.currentSub = 0;
    this.currentBar = 0;
    this.nextNoteTime = this.ctx.currentTime + 0.08;
    this.intervalId = setInterval(() => this.scheduler(), LOOKAHEAD_MS);
  }

  stop(): void {
    this.playing = false;
    if (this.intervalId !== null) clearInterval(this.intervalId);
    this.intervalId = null;
    this.visualTimeouts.forEach(clearTimeout);
    this.visualTimeouts = [];
  }

  toggle(): void {
    this.playing ? this.stop() : this.start();
  }

  setTimeSignature(ts: TimeSignature): void {
    this.timeSignature = ts;
    this.currentBeat = 0;
    this.currentSub = 0;
    this.currentBar = 0;
  }

  dispose(): void {
    this.stop();
    void this.ctx?.close();
    this.ctx = null;
  }

  private barIsAudible(barIdx: number): boolean {
    if (!this.gapEnabled) return true;
    return barIdx % (this.gapBarsOn + this.gapBarsOff) < this.gapBarsOn;
  }

  private scheduler(): void {
    if (!this.ctx) return;
    while (this.nextNoteTime < this.ctx.currentTime + SCHEDULE_AHEAD_S) {
      const beat = this.currentBeat;
      const isBeatStart = this.currentSub === 0;
      const audible = this.barIsAudible(this.currentBar);

      if (audible) {
        const kind: ClickKind = isBeatStart
          ? beat === 0 || (this.isCompound && beat % 3 === 0)
            ? 'accent'
            : 'beat'
          : 'sub';
        this.click(this.nextNoteTime, kind);
      }

      this.scheduleVisual(beat, isBeatStart, audible, this.nextNoteTime);
      this.advance();
    }
  }

  private click(time: number, kind: ClickKind): void {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const freq = kind === 'accent' ? 1500 : kind === 'beat' ? 1000 : 640;
    const vol = kind === 'accent' ? 0.5 : kind === 'beat' ? 0.35 : 0.18;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.05);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(time);
    osc.stop(time + 0.06);
  }

  private advance(): void {
    const secondsPerBeat = 60 / this.bpm;
    this.nextNoteTime += secondsPerBeat / this.subdivision;
    this.currentSub++;
    if (this.currentSub >= this.subdivision) {
      this.currentSub = 0;
      this.currentBeat++;
      if (this.currentBeat >= this.timeSignature.beats) {
        this.currentBeat = 0;
        this.currentBar++;
      }
    }
  }

  private scheduleVisual(beat: number, isBeatStart: boolean, audible: boolean, when: number): void {
    if (!this.ctx || !this.onVisual) return;
    const delay = Math.max(0, (when - this.ctx.currentTime) * 1000);
    const id = setTimeout(() => {
      if (this.playing) this.onVisual?.({ beat, isBeatStart, audible });
    }, delay);
    this.visualTimeouts.push(id);
    if (this.visualTimeouts.length > 64) {
      this.visualTimeouts = this.visualTimeouts.slice(-32);
    }
  }
}

/** Calcula BPM a partir de una lista de timestamps de taps (ms). */
export function bpmFromTaps(taps: number[]): number | null {
  if (taps.length < 2) return null;
  const gaps: number[] = [];
  for (let i = 1; i < taps.length; i++) gaps.push(taps[i] - taps[i - 1]);
  const avg = gaps.reduce((a, b) => a + b, 0) / gaps.length;
  return Math.min(260, Math.max(30, Math.round(60000 / avg)));
}
