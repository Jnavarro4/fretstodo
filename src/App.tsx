import { useCallback, useEffect, useState } from 'react';
import { useI18n } from './i18n/I18nContext';
import { translations } from './i18n/translations';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useWakeLock } from './hooks/useWakeLock';
import { playChime } from './utils/chime';
import { TodayScreen } from './screens/TodayScreen';
import { TrainScreen } from './screens/TrainScreen';
import { ToolsScreen } from './screens/ToolsScreen';
import { ProgressScreen } from './screens/ProgressScreen';
import {
  EMPTY_STATS,
  type DailyState,
  type RunningTimer,
  type SkillStats,
  type Tab,
  type Todo,
} from './types';
import type { IntervalId } from './engine/intervalEngine';
import type { Position } from './engine/pentatonicEngine';

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function freshDaily(lang: 'es' | 'en'): DailyState {
  const todos: Todo[] = translations[lang].default_todos.map((d, i) => ({
    id: `d${i}`,
    title: d.title,
    sub: d.sub,
    link: d.link ?? null,
    done: false,
    custom: false,
    defaultIndex: i,
    minutes: d.minutes,
  }));
  return { date: todayKey(), todos, totals: { exercises: 0, seconds: 0 } };
}

export default function App() {
  const { lang, t, setLang } = useI18n();
  const [tab, setTabState] = useState<Tab>('today');
  const [toolsInitial, setToolsInitial] = useState<'hub' | 'metro'>('hub');
  const [toolsKey, setToolsKey] = useState(0);
  const [trainAutostart, setTrainAutostart] = useState(false);
  const [trainKey, setTrainKey] = useState(0);

  const [daily, setDaily] = useLocalStorage<DailyState>('fretstodo.daily', () => freshDaily(lang));
  const [stats, setStats] = useLocalStorage<SkillStats>('fretstodo.stats', EMPTY_STATS);

  /* ---------- Temporizador de estudio global ----------
     Vive acá (no en la pantalla Hoy) para sobrevivir al cambio de tab:
     podés iniciar "Intervalos 10 min", irte a Entrenar y el tiempo sigue. */
  const [timer, setTimer] = useLocalStorage<RunningTimer | null>('fretstodo.timer', null);
  const [now, setNow] = useState(Date.now());

  useWakeLock(timer !== null);

  /** Nuevo día → rutina nueva (y cualquier temporizador viejo se descarta). */
  if (daily.date !== todayKey()) {
    setDaily(freshDaily(lang));
    if (timer) setTimer(null);
  }

  const setTodos = useCallback(
    (updater: (prev: Todo[]) => Todo[]) =>
      setDaily((prev) => ({ ...prev, todos: updater(prev.todos) })),
    [setDaily],
  );

  /** goTab desde la rutina ('metro') abre el metrónomo directo; el tab abre el hub. */
  const setTab = useCallback((next: Tab, direct = false) => {
    if (next === 'metro') {
      setToolsInitial(direct ? 'metro' : 'hub');
      setToolsKey((k) => k + 1);
    }
    if (next === 'train') {
      setTrainAutostart(direct);
      setTrainKey((k) => k + 1);
    }
    setTabState(next);
  }, []);

  const startTimer = useCallback(
    (todo: Todo) => {
      if (!todo.minutes) return;
      const totalSecs = todo.minutes * 60;
      setNow(Date.now());
      setTimer({ todoId: todo.id, endsAt: Date.now() + totalSecs * 1000, totalSecs });
      /* El play también te lleva a lo que hay que hacer. */
      if (todo.link) setTab(todo.link as Tab, true);
    },
    [setTimer, setTab],
  );

  const stopTimer = useCallback(() => setTimer(null), [setTimer]);

  /** Tick + finalización: funciona en cualquier tab y tras recargar la página. */
  useEffect(() => {
    if (!timer) return;
    const finish = () => {
      playChime();
      setDaily((prev) => ({
        ...prev,
        todos: prev.todos.map((td) => (td.id === timer.todoId ? { ...td, done: true } : td)),
      }));
      setTimer(null);
    };
    if (Date.now() >= timer.endsAt) {
      finish();
      return;
    }
    const id = setInterval(() => {
      setNow(Date.now());
      if (Date.now() >= timer.endsAt) finish();
    }, 500);
    return () => clearInterval(id);
  }, [timer, setDaily, setTimer]);

  const onExercise = useCallback(
    (intervalId: IntervalId) => {
      setDaily((prev) => ({
        ...prev,
        totals: { ...prev.totals, exercises: prev.totals.exercises + 1 },
      }));
      setStats((prev) => ({
        ...prev,
        exercises: prev.exercises + 1,
        intervals: { ...prev.intervals, [intervalId]: (prev.intervals[intervalId] ?? 0) + 1 },
      }));
    },
    [setDaily, setStats],
  );

  const onPentaDrill = useCallback(
    (position: Position) => {
      setDaily((prev) => ({
        ...prev,
        totals: { ...prev.totals, exercises: prev.totals.exercises + 1 },
      }));
      setStats((prev) => ({
        ...prev,
        exercises: prev.exercises + 1,
        penta: { ...prev.penta, [String(position)]: (prev.penta[String(position)] ?? 0) + 1 },
      }));
    },
    [setDaily, setStats],
  );

  const onSessionEnd = useCallback(
    (seconds: number) => {
      setDaily((prev) => ({
        ...prev,
        totals: { ...prev.totals, seconds: prev.totals.seconds + seconds },
      }));
      setStats((prev) => ({
        ...prev,
        sessions: prev.sessions + 1,
        seconds: prev.seconds + seconds,
      }));
    },
    [setDaily, setStats],
  );

  /* Pastilla flotante del temporizador cuando no estás en Hoy */
  const timerRemaining = timer ? Math.max(0, Math.ceil((timer.endsAt - now) / 1000)) : 0;
  const timerLabel = `${String(Math.floor(timerRemaining / 60)).padStart(2, '0')}:${String(timerRemaining % 60).padStart(2, '0')}`;
  const timerTodo = timer ? daily.todos.find((td) => td.id === timer.todoId) : undefined;
  const timerTitle = (() => {
    if (!timerTodo) return '';
    if (timerTodo.custom || timerTodo.defaultIndex === undefined) return timerTodo.title;
    return translations[lang].default_todos[timerTodo.defaultIndex]?.title ?? timerTodo.title;
  })();

  const showPill = timer !== null && tab !== 'today';

  return (
    <div className={`app${showPill ? ' has-pill' : ''}`}>
      <header className="app-header">
        <div className="brand">
          <div className="brand-mark" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <rect x="1.5" y="1.5" width="15" height="15" rx="4" stroke="#fff" strokeWidth="1.6" />
              <line x1="1.5" y1="7" x2="5" y2="7" stroke="#fff" strokeWidth="1.2" opacity=".55" />
              <line x1="1.5" y1="11" x2="4" y2="11" stroke="#fff" strokeWidth="1.2" opacity=".55" />
              <path
                d="M5.5 9.5 L8 12 L13 5.5"
                stroke="#fff"
                strokeWidth="1.9"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h1>
            Frets<span>ToDo</span>
          </h1>
        </div>
        <div className="lang-toggle" role="group" aria-label="Idioma / Language">
          <button className={lang === 'es' ? 'active' : ''} onClick={() => setLang('es')}>
            ES
          </button>
          <button className={lang === 'en' ? 'active' : ''} onClick={() => setLang('en')}>
            EN
          </button>
        </div>
      </header>

      <main className="app-main">
        {tab === 'today' && (
          <TodayScreen
            todos={daily.todos}
            setTodos={setTodos}
            totals={daily.totals}
            goTab={(tb) => setTab(tb, true)}
            timer={timer}
            now={now}
            onStartTimer={startTimer}
            onStopTimer={stopTimer}
          />
        )}
        {tab === 'train' && (
          <TrainScreen
            key={trainKey}
            autoStartIntervals={trainAutostart}
            onExercise={onExercise}
            onPentaDrill={onPentaDrill}
            onSessionEnd={onSessionEnd}
          />
        )}
        {tab === 'metro' && <ToolsScreen initial={toolsInitial} key={toolsKey} />}
        {tab === 'progress' && <ProgressScreen stats={stats} />}
      </main>

      {showPill && (
        <button className="timer-pill" onClick={() => setTab('today')}>
          <span className="timer-pill-dot" />
          <span className="timer-pill-title">{timerTitle}</span>
          <span className="timer-pill-time">{timerLabel}</span>
        </button>
      )}

      <nav className="tabbar">
        <div className="tabbar-inner">
          <button
            className={`tab${tab === 'today' ? ' active' : ''}`}
            onClick={() => setTab('today')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="4" width="16" height="16" rx="4" />
              <path d="M8.5 12.5 L11 15 L16 9" />
            </svg>
            <span>{t.tab_today}</span>
          </button>
          <button
            className={`tab${tab === 'train' ? ' active' : ''}`}
            onClick={() => setTab('train')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <line x1="4" y1="7" x2="20" y2="7" />
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="17" x2="20" y2="17" />
              <circle cx="9" cy="7" r="2.2" fill="currentColor" stroke="none" />
              <circle cx="15" cy="12" r="2.2" fill="currentColor" stroke="none" />
              <circle cx="7" cy="17" r="2.2" fill="currentColor" stroke="none" />
            </svg>
            <span>{t.tab_train}</span>
          </button>
          <button
            className={`tab${tab === 'metro' ? ' active' : ''}`}
            onClick={() => setTab('metro')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
            </svg>
            <span>{t.tab_tools}</span>
          </button>
          <button
            className={`tab${tab === 'progress' ? ' active' : ''}`}
            onClick={() => setTab('progress')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <line x1="5" y1="20" x2="5" y2="12" />
              <line x1="12" y1="20" x2="12" y2="6" />
              <line x1="19" y1="20" x2="19" y2="15" />
            </svg>
            <span>{t.tab_progress}</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
