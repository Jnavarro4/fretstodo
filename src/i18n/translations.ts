import type { IntervalId } from '../engine/intervalEngine';

export type Lang = 'es' | 'en';

export interface DefaultTodo {
  title: string;
  sub: string;
  link?: 'train' | 'metro';
  minutes?: number;
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
  sound: string;
  sound_click: string;
  sound_wood: string;
  sound_cowbell: string;
  sound_beep: string;
  tab_progress: string;
  hub_pick: string;
  hub_intervals_sub: string;
  hub_penta: string;
  hub_penta_sub: string;
  cfg_positions: string;
  cfg_scale_type: string;
  scale_minor: string;
  scale_major: string;
  scale_rand: string;
  position: (n: number) => string;
  penta_of: string;
  lbl_key: string;
  lbl_scale: string;
  prog_totals: string;
  prog_sessions: string;
  prog_minutes: string;
  prog_exercises: string;
  prog_intervals: string;
  prog_positions: string;
  prog_empty: string;
  times: (n: number) => string;
  tab_tools: string;
  tool_metro_sub: string;
  tool_tuner: string;
  tool_tuner_sub: string;
  tuner_intro: string;
  tuner_start: string;
  tuner_listening: string;
  tuner_denied: string;
  tuner_in_tune: string;
  tuner_low: string;
  tuner_high: string;
  min_chip: (n: number) => string;
  coach_listen: string;
  coach_listen_sub: string;
  coach_denied: string;
  coach_complete: string;
  show_result: string;
  rate_hard: string;
  rate_easy: string;
  hear: string;
  time_done: string;
  reset_label: string;
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
      { title: 'Calentamiento y estiramiento', sub: 'Manos y muñecas', minutes: 5 },
      { title: 'Intervalos en el diapasón', sub: 'Interval Trainer', link: 'train', minutes: 10 },
      { title: 'Pulso con metrónomo', sub: 'Negras y corcheas a 80 BPM', link: 'metro', minutes: 10 },
      { title: 'Notas del diapasón', sub: 'Cuerdas 6 y 5', minutes: 5 },
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
    sound: 'Sonido',
    sound_click: 'Click',
    sound_wood: 'Wood block',
    sound_cowbell: 'Cencerro',
    sound_beep: 'Beep',
    tab_progress: 'Progreso',
    hub_pick: '¿Qué querés entrenar?',
    hub_intervals_sub: 'Localizá intervalos en el diapasón',
    hub_penta: 'Pentatónicas',
    hub_penta_sub: 'Posiciones 1–5 en todas las tonalidades',
    cfg_positions: 'Posiciones',
    cfg_scale_type: 'Tipo de escala',
    scale_minor: 'Menor',
    scale_major: 'Mayor',
    scale_rand: 'Aleatorio',
    position: (n) => `Posición ${n}`,
    penta_of: 'Pentatónica',
    lbl_key: 'Tonalidad',
    lbl_scale: 'Escala',
    prog_totals: 'Totales históricos',
    prog_sessions: 'sesiones',
    prog_minutes: 'minutos',
    prog_exercises: 'ejercicios',
    prog_intervals: 'Intervalos practicados',
    prog_positions: 'Posiciones de pentatónica',
    prog_empty: 'Todavía no hay datos. Completá una sesión de entrenamiento y acá vas a ver en qué estás fuerte y qué te falta practicar.',
    times: (n) => (n === 1 ? '1 vez' : `${n} veces`),
    tab_tools: 'Herramientas',
    tool_metro_sub: 'Tempo, compases, subdivisiones y entrenador de pulso',
    tool_tuner: 'Afinador',
    tool_tuner_sub: 'Afiná con el micrófono, nota y cents en tiempo real',
    tuner_intro: 'Tocá una cuerda al aire y el afinador detecta la nota con el micrófono.',
    tuner_start: 'Activar micrófono',
    tuner_listening: 'Escuchando…',
    tuner_denied: 'No hay permiso de micrófono. Activalo en los ajustes del navegador para usar el afinador.',
    tuner_in_tune: 'Afinada',
    tuner_low: 'Baja',
    tuner_high: 'Alta',
    min_chip: (n) => `${n} min`,
    coach_listen: 'Escúchame',
    coach_listen_sub: 'La app escucha con el micrófono y marca en verde cada nota que tocás',
    coach_denied: 'Sin permiso de micrófono',
    coach_complete: '¡Posición completa!',
    show_result: 'Mostrar resultado',
    rate_hard: 'Difícil',
    rate_easy: 'Fácil',
    hear: 'Escuchar',
    time_done: 'Tiempo cumplido',
    reset_label: 'Reiniciar',
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
      { title: 'Warm-up & stretching', sub: 'Hands and wrists', minutes: 5 },
      { title: 'Fretboard intervals', sub: 'Interval Trainer', link: 'train', minutes: 10 },
      { title: 'Pulse with metronome', sub: 'Quarters & eighths at 80 BPM', link: 'metro', minutes: 10 },
      { title: 'Fretboard notes', sub: 'Strings 6 and 5', minutes: 5 },
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
    sound: 'Sound',
    sound_click: 'Click',
    sound_wood: 'Wood block',
    sound_cowbell: 'Cowbell',
    sound_beep: 'Beep',
    tab_progress: 'Progress',
    hub_pick: 'What do you want to train?',
    hub_intervals_sub: 'Find intervals on the fretboard',
    hub_penta: 'Pentatonics',
    hub_penta_sub: 'Positions 1–5 in every key',
    cfg_positions: 'Positions',
    cfg_scale_type: 'Scale type',
    scale_minor: 'Minor',
    scale_major: 'Major',
    scale_rand: 'Random',
    position: (n) => `Position ${n}`,
    penta_of: 'Pentatonic',
    lbl_key: 'Key',
    lbl_scale: 'Scale',
    prog_totals: 'All-time totals',
    prog_sessions: 'sessions',
    prog_minutes: 'minutes',
    prog_exercises: 'exercises',
    prog_intervals: 'Intervals practiced',
    prog_positions: 'Pentatonic positions',
    prog_empty: 'No data yet. Complete a training session and you will see here what you are strong at and what needs practice.',
    times: (n) => (n === 1 ? '1 time' : `${n} times`),
    tab_tools: 'Tools',
    tool_metro_sub: 'Tempo, time signatures, subdivisions and pulse trainer',
    tool_tuner: 'Tuner',
    tool_tuner_sub: 'Tune with the mic, note and cents in real time',
    tuner_intro: 'Play an open string and the tuner detects the note with the microphone.',
    tuner_start: 'Enable microphone',
    tuner_listening: 'Listening…',
    tuner_denied: 'Microphone permission missing. Enable it in your browser settings to use the tuner.',
    tuner_in_tune: 'In tune',
    tuner_low: 'Flat',
    tuner_high: 'Sharp',
    min_chip: (n) => `${n} min`,
    coach_listen: 'Listen to me',
    coach_listen_sub: 'The app listens with the mic and turns each note you play green',
    coach_denied: 'No microphone permission',
    coach_complete: 'Position complete!',
    show_result: 'Show result',
    rate_hard: 'Hard',
    rate_easy: 'Easy',
    hear: 'Hear it',
    time_done: 'Time complete',
    reset_label: 'Reset',
  },
};
