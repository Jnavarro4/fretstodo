/**
 * Motor del Pentatonic Trainer.
 * Genera drills aleatorios: tonalidad + tipo (menor/mayor) + posición (1–5).
 * Igual que el motor de intervalos: lógica pura, sin UI.
 */

import { NOTES, type Note } from './intervalEngine';

export type ScaleType = 'minor' | 'major';
export type ScaleTypeMode = ScaleType | 'rand';

export const POSITIONS = [1, 2, 3, 4, 5] as const;
export type Position = (typeof POSITIONS)[number];

export interface PentaDrill {
  key: Note;
  type: ScaleType;
  position: Position;
}

/**
 * Genera un drill aleatorio evitando repetir exactamente el anterior.
 * Devuelve null si no hay posiciones habilitadas.
 */
export function randomPentaDrill(
  enabledPositions: Position[],
  typeMode: ScaleTypeMode,
  previous: PentaDrill | null = null,
): PentaDrill | null {
  if (enabledPositions.length === 0) return null;

  let key: Note;
  let type: ScaleType;
  let position: Position;
  let guard = 0;

  do {
    key = NOTES[Math.floor(Math.random() * NOTES.length)];
    type = typeMode === 'rand' ? (Math.random() < 0.5 ? 'minor' : 'major') : typeMode;
    position = enabledPositions[Math.floor(Math.random() * enabledPositions.length)];
    guard++;
  } while (
    previous !== null &&
    guard < 10 &&
    previous.key === key &&
    previous.type === type &&
    previous.position === position
  );

  return { key, type, position };
}

/* =========================================================
   Cajas (boxes) de pentatónica en el diapasón
   ========================================================= */

export interface FretDot {
  /** Cuerda 6 (E grave) a 1 (e aguda). */
  string: number;
  fret: number;
  isRoot: boolean;
  /** Nota MIDI absoluta (para el modo Escúchame). */
  midi: number;
}

export interface PentaBox {
  dots: FretDot[];
  minFret: number;
  maxFret: number;
}

/** Clases de altura de las cuerdas al aire, de la 6ª a la 1ª: E A D G B E. */
const OPEN_PC = [4, 9, 2, 7, 11, 4];

/** Notas MIDI de las cuerdas al aire: E2 A2 D3 G3 B3 E4. */
const OPEN_MIDI = [40, 45, 50, 55, 59, 64];

/**
 * Offsets de cada posición relativa al traste de la tónica menor en la 6ª cuerda.
 * Índice 0 = cuerda 6 … índice 5 = cuerda 1 (dos notas por cuerda).
 */
const MINOR_BOXES: number[][][] = [
  [[0, 3], [0, 2], [0, 2], [0, 2], [0, 3], [0, 3]],
  [[3, 5], [2, 5], [2, 5], [2, 4], [3, 5], [3, 5]],
  [[5, 7], [5, 7], [5, 7], [4, 7], [5, 8], [5, 7]],
  [[7, 10], [7, 10], [7, 9], [7, 9], [8, 10], [7, 10]],
  [[10, 12], [10, 12], [9, 12], [9, 12], [10, 12], [10, 12]],
];

/**
 * Devuelve la caja de una pentatónica en el diapasón.
 * La pentatónica mayor usa las mismas formas que su relativa menor
 * (tres semitonos abajo), con las tónicas marcadas sobre la tonalidad real.
 */
export function pentaBox(key: Note, type: ScaleType, position: Position): PentaBox {
  const keyPc = NOTES.indexOf(key);
  const minorPc = type === 'minor' ? keyPc : (keyPc + 9) % 12;
  let rootFret = (minorPc - OPEN_PC[0] + 12) % 12;

  const offsets = MINOR_BOXES[position - 1];
  let frets = offsets.map((pair) => pair.map((o) => o + rootFret));

  // Si la caja queda muy arriba del mástil, bajarla una octava.
  const flat = frets.flat();
  if (Math.min(...flat) >= 13) {
    frets = frets.map((pair) => pair.map((f) => f - 12));
  }

  const dots: FretDot[] = [];
  frets.forEach((pair, idx) => {
    const stringNum = 6 - idx;
    pair.forEach((fret) => {
      const pitch = (OPEN_PC[idx] + fret) % 12;
      dots.push({
        string: stringNum,
        fret,
        isRoot: pitch === keyPc,
        midi: OPEN_MIDI[idx] + fret,
      });
    });
  });

  const all = frets.flat();
  return { dots, minFret: Math.min(...all), maxFret: Math.max(...all) };
}
