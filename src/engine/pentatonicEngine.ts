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
