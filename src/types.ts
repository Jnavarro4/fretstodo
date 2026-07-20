export type Tab = 'today' | 'train' | 'metro' | 'progress';

export interface Todo {
  id: string;
  title: string;
  sub: string;
  link: 'train' | 'metro' | null;
  done: boolean;
  custom: boolean;
  /** Índice en default_todos para re-traducir al cambiar de idioma. */
  defaultIndex?: number;
  /** Minutos objetivo para el temporizador de estudio. */
  minutes?: number;
}

export interface Totals {
  exercises: number;
  seconds: number;
}

export interface DailyState {
  /** Clave de fecha YYYY-MM-DD: si cambia, la rutina se reinicia. */
  date: string;
  todos: Todo[];
  totals: Totals;
}

/** Estadísticas acumuladas (histórico, no diario) — semilla del FretScore. */
export interface SkillStats {
  /** Conteo por intervalo practicado (id del intervalo → veces). */
  intervals: Record<string, number>;
  /** Conteo por posición de pentatónica (1–5 → veces). */
  penta: Record<string, number>;
  sessions: number;
  exercises: number;
  seconds: number;
}

export const EMPTY_STATS: SkillStats = {
  intervals: {},
  penta: {},
  sessions: 0,
  exercises: 0,
  seconds: 0,
};
