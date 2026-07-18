export type Tab = 'today' | 'train' | 'metro';

export interface Todo {
  id: string;
  title: string;
  sub: string;
  link: 'train' | 'metro' | null;
  done: boolean;
  custom: boolean;
  /** Índice en default_todos para re-traducir al cambiar de idioma. */
  defaultIndex?: number;
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
