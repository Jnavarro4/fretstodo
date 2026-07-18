export type Subdivision = 'quarter' | 'eighth' | 'triplet' | 'sixteenth';

const SUBDIVISION_STEPS: Record<Subdivision, number> = {
  quarter: 1,
  eighth: 2,
  triplet: 3,
  sixteenth: 4,
};

export interface MetronomeOptions {
  bpm: number;
  beatsPerBar: number;
  subdivision: Subdivision;
  gapTrainerEnabled: boolean;
  /** Roughly one in N bars gets muted when the gap trainer is enabled. */
  gapTrainerFrequency: number;
}

export interface BeatEvent {
  time: number;
  beatIndex: number;
  stepIndex: number;
  barIndex: number;
  isDownbeat: boolean;
  isAccent: boolean;
  muted: boolean;
}

const SCHEDULE_AHEAD_SEC = 0.1;
const LOOKAHEAD_MS = 25;

/**
 * Web Audio lookahead scheduler ("A Tale of Two Clocks" pattern): setInterval
 * drives a JS-timed poll loop, but actual note times are scheduled precisely
 * against the AudioContext clock so playback doesn't drift with tab throttling.
 */
export class MetronomeEngine {
  private audioContext: AudioContext;
  private options: MetronomeOptions;
  private timerId: ReturnType<typeof setInterval> | null = null;
  private nextStepTime = 0;
  private stepIndex = 0;
  private barIndex = 0;
  private barMuted = false;
  public onBeat: ((event: BeatEvent) => void) | null = null;

  constructor(audioContext: AudioContext, options: MetronomeOptions) {
    this.audioContext = audioContext;
    this.options = options;
  }

  setOptions(options: Partial<MetronomeOptions>): void {
    this.options = { ...this.options, ...options };
  }

  get isRunning(): boolean {
    return this.timerId !== null;
  }

  start(): void {
    if (this.isRunning) return;
    this.stepIndex = 0;
    this.barIndex = 0;
    this.barMuted = false;
    this.nextStepTime = this.audioContext.currentTime + 0.05;
    this.timerId = setInterval(() => this.scheduler(), LOOKAHEAD_MS);
  }

  stop(): void {
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  private scheduler(): void {
    while (this.nextStepTime < this.audioContext.currentTime + SCHEDULE_AHEAD_SEC) {
      this.scheduleStep(this.nextStepTime);
      this.advanceStep();
    }
  }

  private scheduleStep(time: number): void {
    const stepsPerBeat = SUBDIVISION_STEPS[this.options.subdivision];
    const beatIndex = Math.floor(this.stepIndex / stepsPerBeat);
    const isDownbeat = this.stepIndex === 0;
    const isAccent = this.stepIndex % stepsPerBeat === 0 && beatIndex === 0;
    const muted = this.options.gapTrainerEnabled && this.barMuted;

    if (!muted) {
      const isBeatTick = this.stepIndex % stepsPerBeat === 0;
      this.playClick(time, isDownbeat, isBeatTick);
    }

    this.onBeat?.({
      time,
      beatIndex,
      stepIndex: this.stepIndex,
      barIndex: this.barIndex,
      isDownbeat,
      isAccent,
      muted,
    });
  }

  private advanceStep(): void {
    const stepsPerBeat = SUBDIVISION_STEPS[this.options.subdivision];
    const totalSteps = stepsPerBeat * this.options.beatsPerBar;
    const secondsPerStep = 60 / this.options.bpm / stepsPerBeat;

    this.nextStepTime += secondsPerStep;
    this.stepIndex += 1;

    if (this.stepIndex >= totalSteps) {
      this.stepIndex = 0;
      this.barIndex += 1;
      if (this.options.gapTrainerEnabled) {
        const n = Math.max(2, this.options.gapTrainerFrequency);
        this.barMuted = Math.random() < 1 / n;
      } else {
        this.barMuted = false;
      }
    }
  }

  private playClick(time: number, isDownbeat: boolean, isBeatTick: boolean): void {
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    osc.type = 'square';
    osc.frequency.value = isDownbeat ? 1500 : isBeatTick ? 1000 : 700;

    const peak = isBeatTick ? 0.35 : 0.15;
    gain.gain.setValueAtTime(peak, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);

    osc.connect(gain);
    gain.connect(this.audioContext.destination);
    osc.start(time);
    osc.stop(time + 0.06);
  }
}

/** Feed successive tap timestamps (ms) in; returns the estimated BPM once enough taps landed. */
export function calculateTapTempo(tapTimestampsMs: number[]): number | null {
  const recent = tapTimestampsMs.slice(-8);
  if (recent.length < 2) return null;
  const intervals: number[] = [];
  for (let i = 1; i < recent.length; i += 1) {
    intervals.push(recent[i] - recent[i - 1]);
  }
  const avgMs = intervals.reduce((sum, v) => sum + v, 0) / intervals.length;
  if (avgMs <= 0) return null;
  const bpm = 60000 / avgMs;
  return Math.min(260, Math.max(30, Math.round(bpm)));
}
