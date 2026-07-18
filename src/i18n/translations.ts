export type Lang = 'es' | 'en';

export interface Dictionary {
  nav: {
    today: string;
    train: string;
    metronome: string;
  };
  today: {
    title: string;
    subtitle: string;
    progress: string;
    reset: string;
    items: {
      warmup: string;
      scales: string;
      intervals: string;
      metronome: string;
      repertoire: string;
    };
    done: string;
  };
  train: {
    title: string;
    direction: string;
    asc: string;
    desc: string;
    random: string;
    play: string;
    score: string;
    streak: string;
    correct: string;
    incorrect: string;
    next: string;
    intervals: {
      unison: string;
      m2: string;
      M2: string;
      m3: string;
      M3: string;
      P4: string;
      TT: string;
      P5: string;
      m6: string;
      M6: string;
      m7: string;
      M7: string;
    };
  };
  metronome: {
    title: string;
    bpm: string;
    tap: string;
    start: string;
    stop: string;
    beatsPerBar: string;
    subdivision: string;
    gapTrainer: string;
    gapTrainerHint: string;
    quarter: string;
    eighth: string;
    triplet: string;
    sixteenth: string;
  };
}

export const dictionaries: Record<Lang, Dictionary> = {
  es: {
    nav: {
      today: 'Hoy',
      train: 'Entrenar',
      metronome: 'Metrónomo',
    },
    today: {
      title: 'Tu práctica de hoy',
      subtitle: 'Practice with Purpose.',
      progress: 'Progreso',
      reset: 'La rutina se reinicia cada día.',
      items: {
        warmup: 'Calentamiento (5 min)',
        scales: 'Escalas y digitación',
        intervals: 'Entrenador de intervalos',
        metronome: 'Sesión con metrónomo',
        repertoire: 'Repertorio / canciones',
      },
      done: '¡Rutina completada! Volvé mañana.',
    },
    train: {
      title: 'Interval Trainer',
      direction: 'Dirección',
      asc: 'Ascendente',
      desc: 'Descendente',
      random: 'Aleatoria',
      play: 'Reproducir',
      score: 'Aciertos',
      streak: 'Racha',
      correct: '¡Correcto!',
      incorrect: 'Incorrecto. Era:',
      next: 'Siguiente',
      intervals: {
        unison: 'Unísono',
        m2: '2ª menor',
        M2: '2ª mayor',
        m3: '3ª menor',
        M3: '3ª mayor',
        P4: '4ª justa',
        TT: 'Tritono',
        P5: '5ª justa',
        m6: '6ª menor',
        M6: '6ª mayor',
        m7: '7ª menor',
        M7: '7ª mayor',
      },
    },
    metronome: {
      title: 'Metrónomo',
      bpm: 'BPM',
      tap: 'Tap Tempo',
      start: 'Iniciar',
      stop: 'Detener',
      beatsPerBar: 'Compás',
      subdivision: 'Subdivisión',
      gapTrainer: 'Entrenador de pulso',
      gapTrainerHint: 'Silencia compases al azar para entrenar el tiempo interno.',
      quarter: 'Negras',
      eighth: 'Corcheas',
      triplet: 'Tresillos',
      sixteenth: 'Semicorcheas',
    },
  },
  en: {
    nav: {
      today: 'Today',
      train: 'Train',
      metronome: 'Metronome',
    },
    today: {
      title: "Today's practice",
      subtitle: 'Practice with Purpose.',
      progress: 'Progress',
      reset: 'The routine resets every day.',
      items: {
        warmup: 'Warm-up (5 min)',
        scales: 'Scales & fingering',
        intervals: 'Interval trainer',
        metronome: 'Metronome session',
        repertoire: 'Repertoire / songs',
      },
      done: 'Routine complete! Come back tomorrow.',
    },
    train: {
      title: 'Interval Trainer',
      direction: 'Direction',
      asc: 'Ascending',
      desc: 'Descending',
      random: 'Random',
      play: 'Play',
      score: 'Score',
      streak: 'Streak',
      correct: 'Correct!',
      incorrect: 'Incorrect. It was:',
      next: 'Next',
      intervals: {
        unison: 'Unison',
        m2: 'Minor 2nd',
        M2: 'Major 2nd',
        m3: 'Minor 3rd',
        M3: 'Major 3rd',
        P4: 'Perfect 4th',
        TT: 'Tritone',
        P5: 'Perfect 5th',
        m6: 'Minor 6th',
        M6: 'Major 6th',
        m7: 'Minor 7th',
        M7: 'Major 7th',
      },
    },
    metronome: {
      title: 'Metronome',
      bpm: 'BPM',
      tap: 'Tap Tempo',
      start: 'Start',
      stop: 'Stop',
      beatsPerBar: 'Time signature',
      subdivision: 'Subdivision',
      gapTrainer: 'Pulse trainer',
      gapTrainerHint: 'Mutes random bars to train your internal sense of time.',
      quarter: 'Quarters',
      eighth: 'Eighths',
      triplet: 'Triplets',
      sixteenth: 'Sixteenths',
    },
  },
};
