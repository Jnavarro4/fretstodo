/**
 * Motor de intervalos de FretsToDo.
 * Completamente desacoplado de la interfaz (requisito del documento maestro)
 * para poder reutilizarlo en futuros entrenadores (pentatónicas, escalas, oído…).
 */

export const NOTES = [
  'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B',
] as const;

export type Note = (typeof NOTES)[number];

export type IntervalId =
  | 'm2' | 'M2' | 'm3' | 'M3' | 'P4' | 'TT'
  | 'P5' | 'm6' | 'M6' | 'm7' | 'M7' | 'P8';

export interface Interval {
  id: IntervalId;
  semitones: number;
}

export const INTERVALS: Interval[] = [
  { id: 'm2', semitones: 1 },
  { id: 'M2', semitones: 2 },
  { id: 'm3', semitones: 3 },
  { id: 'M3', semitones: 4 },
  { id: 'P4', semitones: 5 },
  { id: 'TT', semitones: 6 },
  { id: 'P5', semitones: 7 },
  { id: 'm6', semitones: 8 },
  { id: 'M6', semitones: 9 },
  { id: 'm7', semitones: 10 },
  { id: 'M7', semitones: 11 },
  { id: 'P8', semitones: 12 },
];

/** Subconjunto útil como preset: intervalos de la escala mayor. */
export const DIATONIC_IDS: IntervalId[] = ['M2', 'M3', 'P4', 'P5', 'M6', 'M7', 'P8'];

export type Direction = 'asc' | 'desc';
export type DirectionMode = Direction | 'rand';

export interface Exercise {
  root: Note;
  interval: Interval;
  dir: Direction;
  /** Nota resultante de aplicar el intervalo a la raíz en la dirección dada. */
  target: Note;
}

/**
 * Genera un ejercicio aleatorio evitando repetir exactamente el anterior.
 * Devuelve null si no hay intervalos habilitados.
 */
export function randomExercise(
  enabledIds: IntervalId[],
  dirMode: DirectionMode,
  previous: Exercise | null = null,
): Exercise | null {
  const pool = INTERVALS.filter((i) => enabledIds.includes(i.id));
  if (pool.length === 0) return null;

  let interval: Interval;
  let root: Note;
  let dir: Direction;
  let guard = 0;

  do {
    interval = pool[Math.floor(Math.random() * pool.length)];
    root = NOTES[Math.floor(Math.random() * NOTES.length)];
    dir = dirMode === 'rand' ? (Math.random() < 0.5 ? 'asc' : 'desc') : dirMode;
    guard++;
  } while (
    previous !== null &&
    guard < 10 &&
    previous.root === root &&
    previous.interval.id === interval.id &&
    previous.dir === dir
  );

  const rootIdx = NOTES.indexOf(root);
  const delta = dir === 'asc' ? interval.semitones : -interval.semitones;
  const target = NOTES[(((rootIdx + delta) % 12) + 12) % 12];

  return { root, interval, dir, target };
}
