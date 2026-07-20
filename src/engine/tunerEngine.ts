/**
 * Motor del afinador de FretsToDo.
 * Detección de pitch por autocorrelación (ACF2+) sobre el micrófono.
 * Primer paso técnico hacia el Coach IA (fase 1: detección de una sola nota).
 */

import { NOTES, type Note } from './intervalEngine';

export interface PitchReading {
  /** Frecuencia detectada en Hz. */
  frequency: number;
  /** Nota más cercana. */
  note: Note;
  /** Octava (A4 = 440 Hz). */
  octave: number;
  /** Desviación respecto a la nota en cents (−50 a +50). */
  cents: number;
}

/** Autocorrelación clásica ACF2+ — devuelve la frecuencia o −1 si no hay señal clara. */
export function autoCorrelate(buf: Float32Array, sampleRate: number): number {
  const SIZE = buf.length;

  // Nivel de señal: descartar silencio
  let rms = 0;
  for (let i = 0; i < SIZE; i++) rms += buf[i] * buf[i];
  rms = Math.sqrt(rms / SIZE);
  if (rms < 0.008) return -1;

  // Recortar bordes de baja energía
  let r1 = 0;
  let r2 = SIZE - 1;
  const threshold = 0.2;
  for (let i = 0; i < SIZE / 2; i++) {
    if (Math.abs(buf[i]) < threshold) r1 = i;
    else break;
  }
  for (let i = 1; i < SIZE / 2; i++) {
    if (Math.abs(buf[SIZE - i]) < threshold) r2 = SIZE - i;
    else break;
  }
  const sliced = buf.slice(r1, r2);
  const N = sliced.length;
  if (N < 32) return -1;

  // Autocorrelación
  const c = new Float32Array(N);
  for (let lag = 0; lag < N; lag++) {
    let sum = 0;
    for (let i = 0; i < N - lag; i++) sum += sliced[i] * sliced[i + lag];
    c[lag] = sum;
  }

  // Saltar el pico inicial
  let d = 0;
  while (d < N - 1 && c[d] > c[d + 1]) d++;

  // Máximo posterior
  let maxVal = -1;
  let maxPos = -1;
  for (let i = d; i < N; i++) {
    if (c[i] > maxVal) {
      maxVal = c[i];
      maxPos = i;
    }
  }
  if (maxPos <= 0) return -1;

  // Interpolación parabólica para afinar el pico
  let T0 = maxPos;
  const x1 = c[T0 - 1] ?? c[T0];
  const x2 = c[T0];
  const x3 = c[T0 + 1] ?? c[T0];
  const a = (x1 + x3 - 2 * x2) / 2;
  const b = (x3 - x1) / 2;
  if (a !== 0) T0 = T0 - b / (2 * a);

  const freq = sampleRate / T0;
  // Rango útil de guitarra (con margen): 60–1400 Hz
  if (freq < 60 || freq > 1400) return -1;
  return freq;
}

/** Convierte una frecuencia a lectura de nota + cents. */
export function readingFromFrequency(frequency: number): PitchReading {
  const midi = 69 + 12 * Math.log2(frequency / 440);
  const rounded = Math.round(midi);
  const cents = Math.max(-50, Math.min(50, Math.round((midi - rounded) * 100)));
  const note = NOTES[((rounded % 12) + 12) % 12];
  const octave = Math.floor(rounded / 12) - 1;
  return { frequency, note, octave, cents };
}
