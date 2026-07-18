import type { IntervalId } from '../engine/intervalEngine';

export type Lang = 'es' | 'en';

export interface DefaultTodo {
  title: string;
  sub: string;
  link?: 'train' | 'metro';
}

export interface Dictionary {
  tab_today: string;
  tab_train: string;
  tab_metro: string;
  today_title_pre: string;
  today_title_em: string;
  progress_label: string;
  today_stats: string;
  st_ex: string;
  st_min: string;
  st_done: string;
  todo_placeholder: string;
  go: string;
  default_todos: DefaultTodo[];
  cfg_intervals: string;
  cfg_direction: string;
  cfg_options: string;
  preset_all: string;
  preset_diatonic: string;
  preset_none: string;
  dir_asc: string;
  dir_desc: string;
  dir_rand: string;
  opt_root: string;
  opt_root_sub: string;
  opt_auto: string;
  opt_auto_sub: string;
  opt_secs: string;
  start: string;
  back: string;
  next: string;
  lbl_note: string;
  lbl_interval: string;
  meta_ex: string;
  tap_hint: string;
  show_answer: string;
  asc: string;
  desc: string;
  sel_count: (n: number) => string;
  sel_none: string;
  intervals: Record<IntervalId, string>;
  semis: (n: number) => string;
  tap: string;
  play: string;
  stop: string;
  time_sig: string;
  subdivision: string;
  sub_1: string;
  sub_2: string;
  sub_3: string;
  sub_4: string;
  pulse_trainer: string;
  pulse_trainer_sub: string;
  silent_bar: string;
}

export const translations: Record<Lang, Dictionary> = {
  es: {
    tab_today: 'Hoy',
    tab_train: 'Entrenar',
    tab_metro: 'Metrónomo',
    today_title_pre: 'Tu práctica de ',
    today_title_em: 'hoy',
    progress_label: 'Rutina del día',
    today_stats: 'Resumen de hoy',
    st_ex: 'ejercicios',
    st_min: 'min de intervalos',
    st_done: 'tareas',
    todo_placeholder: 'Agregar tarea de práctica…',
    go: 'Ir',
    default_todos: [
      { title: 'Calentamiento y estiramiento', sub: '5 min · manos y muñecas' },
      { title: 'Intervalos en el diapasón', sub: '10 min · Interval Trainer', link: 'train' },
      { title: 'Pulso con metrónomo', sub: '10 min · negras y corcheas a 80 BPM', link: 'metro' },
      { title: 'Notas del diapasón', sub: '5 min · cuerdas 6 y 5' },
    ],
    cfg_intervals: 'Intervalos',
    cfg_direction: 'Dirección',
    cfg_options: 'Opciones',
    preset_all: 'Todos',
    preset_diatonic: 'Diatónicos',
    preset_none: 'Ninguno',
    dir_asc: 'Ascendente',
    dir_desc: 'Descendente',
    dir_rand: 'Aleatorio',
    opt_root: 'Mostrar nota raíz',
    opt_root_sub: 'Ocultala para un reto mayor',
    opt_auto: 'Auto-avance',
    opt_auto_sub: 'Nuevo ejercicio cada pocos segundos',
    opt_secs: 'Segundos por ejercicio',
    start: 'Comenzar',
    back: '← Salir',
    next: 'Siguiente',
    lbl_note: 'Nota',
    lbl_interval: 'Intervalo',
    meta_ex: 'ejercicios',
    tap_hint: 'Tocá la tarjeta o presioná espacio para avanzar',
    show_answer: 'Mostrar respuesta',
    asc: 'Ascendente ↑',
    desc: 'Descendente ↓',
    sel_count: (n) => (n === 1 ? '1 intervalo seleccionado' : `${n} intervalos seleccionados`),
    sel_none: 'Seleccioná al menos un intervalo',
    intervals: {
      m2: '2ª menor', M2: '2ª mayor', m3: '3ª menor', M3: '3ª mayor',
      P4: '4ª justa', TT: 'Tritono', P5: '5ª justa', m6: '6ª menor',
      M6: '6ª mayor', m7: '7ª menor', M7: '7ª mayor', P8: 'Octava',
    },
    semis: (n) => `${n} st`,
    tap: 'TAP',
    play: 'Iniciar',
    stop: 'Detener',
    time_sig: 'Compás',
    subdivision: 'Subdivisión',
    sub_1: 'Negras',
    sub_2: 'Corcheas',
    sub_3: 'Tresillos',
    sub_4: 'Semicorcheas',
    pulse_trainer: 'Entrenador de pulso',
    pulse_trainer_sub: '4 compases con click, 4 en silencio: mantené el tempo interno',
    silent_bar: 'compás en silencio — seguí el pulso',
  },
  en: {
    tab_today: 'Today',
    tab_train: 'Train',
    tab_metro: 'Metronome',
    today_title_pre: 'Your practice for ',
    today_title_em: 'today',
    progress_label: 'Daily routine',
    today_stats: 'Today’s summary',
    st_ex: 'exercises',
    st_min: 'interval min',
    st_done: 'tasks',
    todo_placeholder: 'Add a practice task…',
    go: 'Go',
    default_todos: [
      { title: 'Warm-up & stretching', sub: '5 min · hands and wrists' },
      { title: 'Fretboard intervals', sub: '10 min · Interval Trainer', link: 'train' },
      { title: 'Pulse with metronome', sub: '10 min · quarters & eighths at 80 BPM', link: 'metro' },
      { title: 'Fretboard notes', sub: '5 min · strings 6 and 5' },
    ],
    cfg_intervals: 'Intervals',
    cfg_direction: 'Direction',
    cfg_options: 'Options',
    preset_all: 'All',
    preset_diatonic: 'Diatonic',
    preset_none: 'None',
    dir_asc: 'Ascending',
    dir_desc: 'Descending',
    dir_rand: 'Random',
    opt_root: 'Show root note',
    opt_root_sub: 'Hide it for a bigger challenge',
    opt_auto: 'Auto-advance',
    opt_auto_sub: 'New exercise every few seconds',
    opt_secs: 'Seconds per exercise',
    start: 'Start',
    back: '← Exit',
    next: 'Next',
    lbl_note: 'Note',
    lbl_interval: 'Interval',
    meta_ex: 'exercises',
    tap_hint: 'Tap the card or press space to advance',
    show_answer: 'Show answer',
    asc: 'Ascending ↑',
    desc: 'Descending ↓',
    sel_count: (n) => (n === 1 ? '1 interval selected' : `${n} intervals selected`),
    sel_none: 'Select at least one interval',
    intervals: {
      m2: 'Minor 2nd', M2: 'Major 2nd', m3: 'Minor 3rd', M3: 'Major 3rd',
      P4: 'Perfect 4th', TT: 'Tritone', P5: 'Perfect 5th', m6: 'Minor 6th',
      M6: 'Major 6th', m7: 'Minor 7th', M7: 'Major 7th', P8: 'Octave',
    },
    semis: (n) => `${n} st`,
    tap: 'TAP',
    play: 'Start',
    stop: 'Stop',
    time_sig: 'Time signature',
    subdivision: 'Subdivision',
    sub_1: 'Quarters',
    sub_2: 'Eighths',
    sub_3: 'Triplets',
    sub_4: 'Sixteenths',
    pulse_trainer: 'Pulse trainer',
    pulse_trainer_sub: '4 bars with click, 4 silent: keep the internal tempo',
    silent_bar: 'silent bar — keep the pulse',
  },
};
