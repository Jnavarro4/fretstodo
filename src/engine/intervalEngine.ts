export type Direction = 'asc' | 'desc' | 'random';

export interface IntervalDef {
  key: 'unison' | 'm2' | 'M2' | 'm3' | 'M3' | 'P4' | 'TT' | 'P5' | 'm6' | 'M6' | 'm7' | 'M7';
  semitones: number;
}

export const INTERVALS: IntervalDef[] = [
  { key: 'unison', semitones: 0 },
  { key: 'm2', semitones: 1 },
  { key: 'M2', semitones: 2 },
  { key: 'm3', semitones: 3 },
  { key: 'M3', semitones: 4 },
  { key: 'P4', semitones: 5 },
  { key: 'TT', semitones: 6 },
  { key: 'P5', semitones: 7 },
  { key: 'm6', semitones: 8 },
  { key: 'M6', semitones: 9 },
  { key: 'm7', semitones: 10 },
  { key: 'M7', semitones: 11 },
];

export interface IntervalQuestion {
  interval: IntervalDef;
  actualDirection: 'asc' | 'desc';
  rootMidi: number;
}

const ROOT_MIDI_MIN = 48; // C3
const ROOT_MIDI_MAX = 64; // E4

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function pickRandomInterval(): IntervalDef {
  return INTERVALS[randomInt(0, INTERVALS.length - 1)];
}

export function resolveDirection(direction: Direction): 'asc' | 'desc' {
  if (direction === 'random') return Math.random() < 0.5 ? 'asc' : 'desc';
  return direction;
}

export function generateQuestion(direction: Direction): IntervalQuestion {
  return {
    interval: pickRandomInterval(),
    actualDirection: resolveDirection(direction),
    rootMidi: randomInt(ROOT_MIDI_MIN, ROOT_MIDI_MAX),
  };
}

export function midiToFrequency(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

export function questionFrequencies(question: IntervalQuestion): [number, number] {
  const targetMidi =
    question.actualDirection === 'asc'
      ? question.rootMidi + question.interval.semitones
      : question.rootMidi - question.interval.semitones;
  return [midiToFrequency(question.rootMidi), midiToFrequency(targetMidi)];
}

export async function playInterval(
  audioContext: AudioContext,
  question: IntervalQuestion,
  noteDurationSec = 0.55,
  gapSec = 0.12,
): Promise<void> {
  const [freq1, freq2] = questionFrequencies(question);
  const now = audioContext.currentTime;
  playTone(audioContext, freq1, now + 0.05, noteDurationSec);
  playTone(audioContext, freq2, now + 0.05 + noteDurationSec + gapSec, noteDurationSec);
}

function playTone(audioContext: AudioContext, frequency: number, startTime: number, duration: number): void {
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  osc.type = 'sine';
  osc.frequency.value = frequency;

  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(0.25, startTime + 0.02);
  gain.gain.setValueAtTime(0.25, startTime + duration - 0.05);
  gain.gain.linearRampToValueAtTime(0, startTime + duration);

  osc.connect(gain);
  gain.connect(audioContext.destination);
  osc.start(startTime);
  osc.stop(startTime + duration + 0.02);
}
