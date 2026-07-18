import { useI18n } from '../i18n/I18nContext';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { ProgressBar } from '../components/ProgressBar';

const ROUTINE_KEYS = ['warmup', 'scales', 'intervals', 'metronome', 'repertoire'] as const;

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

interface RoutineState {
  date: string;
  done: Record<(typeof ROUTINE_KEYS)[number], boolean>;
}

function emptyState(): RoutineState {
  return {
    date: todayKey(),
    done: {
      warmup: false,
      scales: false,
      intervals: false,
      metronome: false,
      repertoire: false,
    },
  };
}

export function TodayScreen() {
  const { t } = useI18n();
  const [state, setState] = useLocalStorage<RoutineState>('frets-today-routine', emptyState());

  const effectiveState = state.date === todayKey() ? state : emptyState();

  const toggleItem = (key: (typeof ROUTINE_KEYS)[number]) => {
    const base = state.date === todayKey() ? state : emptyState();
    setState({
      date: todayKey(),
      done: { ...base.done, [key]: !base.done[key] },
    });
  };

  const completedCount = ROUTINE_KEYS.filter((key) => effectiveState.done[key]).length;
  const allDone = completedCount === ROUTINE_KEYS.length;

  return (
    <section className="screen today-screen">
      <header className="screen-header">
        <h1>{t.today.title}</h1>
        <p className="screen-subtitle">{t.today.subtitle}</p>
      </header>

      <ProgressBar value={completedCount} max={ROUTINE_KEYS.length} label={t.today.progress} />

      <ul className="routine-list">
        {ROUTINE_KEYS.map((key) => (
          <li key={key} className="routine-item">
            <label className="routine-checkbox">
              <input
                type="checkbox"
                checked={effectiveState.done[key]}
                onChange={() => toggleItem(key)}
              />
              <span data-done={effectiveState.done[key]}>{t.today.items[key]}</span>
            </label>
          </li>
        ))}
      </ul>

      <p className="screen-hint">{allDone ? t.today.done : t.today.reset}</p>
    </section>
  );
}
