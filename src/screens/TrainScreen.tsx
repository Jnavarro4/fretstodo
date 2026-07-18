import { useRef, useState } from 'react';
import { useI18n } from '../i18n/I18nContext';
import { Segmented } from '../components/Segmented';
import {
  generateQuestion,
  playInterval,
  type Direction,
  type IntervalQuestion,
} from '../engine/intervalEngine';

export function TrainScreen() {
  const { t } = useI18n();
  const audioContextRef = useRef<AudioContext | null>(null);

  const [direction, setDirection] = useState<Direction>('asc');
  const [question, setQuestion] = useState<IntervalQuestion>(() => generateQuestion('asc'));
  const [guess, setGuess] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [attempts, setAttempts] = useState(0);

  const getAudioContext = (): AudioContext => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    return audioContextRef.current;
  };

  const handlePlay = () => {
    void playInterval(getAudioContext(), question);
  };

  const handleGuess = (key: string) => {
    if (guess) return;
    setGuess(key);
    setAttempts((n) => n + 1);
    if (key === question.interval.key) {
      setScore((s) => s + 1);
      setStreak((s) => s + 1);
    } else {
      setStreak(0);
    }
  };

  const handleNext = () => {
    const nextQuestion = generateQuestion(direction);
    setQuestion(nextQuestion);
    setGuess(null);
  };

  const handleDirectionChange = (next: Direction) => {
    setDirection(next);
    setQuestion(generateQuestion(next));
    setGuess(null);
  };

  const intervalOrder: Array<keyof typeof t.train.intervals> = [
    'unison',
    'm2',
    'M2',
    'm3',
    'M3',
    'P4',
    'TT',
    'P5',
    'm6',
    'M6',
    'm7',
    'M7',
  ];

  return (
    <section className="screen train-screen">
      <header className="screen-header">
        <h1>{t.train.title}</h1>
      </header>

      <div className="train-direction">
        <span className="field-label">{t.train.direction}</span>
        <Segmented
          value={direction}
          onChange={handleDirectionChange}
          options={[
            { value: 'asc', label: t.train.asc },
            { value: 'desc', label: t.train.desc },
            { value: 'random', label: t.train.random },
          ]}
        />
      </div>

      <div className="train-stats">
        <span>
          {t.train.score}: {score}/{attempts}
        </span>
        <span>
          {t.train.streak}: {streak}
        </span>
      </div>

      <button type="button" className="primary-button train-play" onClick={handlePlay}>
        {t.train.play}
      </button>

      <div className="train-options">
        {intervalOrder.map((key) => {
          const isCorrectAnswer = key === question.interval.key;
          const isSelected = guess === key;
          const revealState = guess ? (isCorrectAnswer ? 'correct' : isSelected ? 'incorrect' : 'neutral') : 'neutral';
          return (
            <button
              key={key}
              type="button"
              className="train-option"
              data-state={revealState}
              disabled={Boolean(guess)}
              onClick={() => handleGuess(key)}
            >
              {t.train.intervals[key]}
            </button>
          );
        })}
      </div>

      {guess ? (
        <div className="train-feedback">
          <p>{guess === question.interval.key ? t.train.correct : `${t.train.incorrect} ${t.train.intervals[question.interval.key]}`}</p>
          <button type="button" className="primary-button" onClick={handleNext}>
            {t.train.next}
          </button>
        </div>
      ) : null}
    </section>
  );
}
