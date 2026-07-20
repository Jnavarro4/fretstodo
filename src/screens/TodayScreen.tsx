import { useEffect, useRef, useState } from 'react';
import { useI18n } from '../i18n/I18nContext';
import { useWakeLock } from '../hooks/useWakeLock';
import { translations } from '../i18n/translations';
import { ProgressBar } from '../components/ProgressBar';
import type { Tab, Totals, Todo } from '../types';

interface TodayScreenProps {
  todos: Todo[];
  setTodos: (updater: (prev: Todo[]) => Todo[]) => void;
  totals: Totals;
  goTab: (tab: Tab) => void;
}

const MINUTE_STEPS = [5, 10, 15, 20, 25, 30, 45, 60];

interface RunningTimer {
  todoId: string;
  endsAt: number;
  totalSecs: number;
}

/** Campanita de fin de estudio (Web Audio, dos notas). */
function playChime() {
  try {
    const ctx = new AudioContext();
    const now = ctx.currentTime;
    [880, 1320].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const t0 = now + i * 0.18;
      gain.gain.setValueAtTime(0.35, t0);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t0);
      osc.stop(t0 + 0.55);
    });
    setTimeout(() => void ctx.close(), 1500);
  } catch {
    /* sin audio disponible: el temporizador igual marca la tarea */
  }
}

export function TodayScreen({ todos, setTodos, totals, goTab }: TodayScreenProps) {
  const { lang, t } = useI18n();
  const [draft, setDraft] = useState('');
  const [timer, setTimer] = useState<RunningTimer | null>(null);
  const [now, setNow] = useState(Date.now());
  const timerRef = useRef<RunningTimer | null>(null);
  timerRef.current = timer;

  /** La pantalla no se apaga mientras corre un temporizador de estudio. */
  useWakeLock(timer !== null);

  useEffect(() => {
    if (!timer) return;
    const id = setInterval(() => {
      const current = timerRef.current;
      if (!current) return;
      const nowMs = Date.now();
      setNow(nowMs);
      if (nowMs >= current.endsAt) {
        playChime();
        setTodos((prev) =>
          prev.map((td) => (td.id === current.todoId ? { ...td, done: true } : td)),
        );
        setTimer(null);
      }
    }, 250);
    return () => clearInterval(id);
  }, [timer, setTodos]);

  const startTimer = (todoId: string, minutes: number) => {
    const totalSecs = minutes * 60;
    setNow(Date.now());
    setTimer({ todoId, endsAt: Date.now() + totalSecs * 1000, totalSecs });
  };

  const stopTimer = () => setTimer(null);

  const cycleMinutes = (id: string) => {
    setTodos((prev) =>
      prev.map((td) => {
        if (td.id !== id) return td;
        const current = td.minutes ?? 0;
        const idx = MINUTE_STEPS.indexOf(current);
        const next = MINUTE_STEPS[(idx + 1) % MINUTE_STEPS.length];
        return { ...td, minutes: next };
      }),
    );
  };

  const done = todos.filter((td) => td.done).length;
  const percent = todos.length ? Math.round((done / todos.length) * 100) : 0;

  const dateLabel = new Date().toLocaleDateString(lang === 'es' ? 'es-CO' : 'en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  const toggle = (id: string) => {
    setTodos((prev) => prev.map((td) => (td.id === id ? { ...td, done: !td.done } : td)));
  };

  const add = () => {
    const title = draft.trim();
    if (!title) return;
    setTodos((prev) => [
      ...prev,
      { id: `c${Date.now()}`, title, sub: '', link: null, done: false, custom: true, minutes: 10 },
    ]);
    setDraft('');
  };

  /** Las tareas por defecto se muestran en el idioma activo aunque se hayan guardado en otro. */
  const localized = (td: Todo): { title: string; sub: string } => {
    if (td.custom || td.defaultIndex === undefined) return { title: td.title, sub: td.sub };
    const def = translations[lang].default_todos[td.defaultIndex];
    return def ? { title: def.title, sub: def.sub } : { title: td.title, sub: td.sub };
  };

  return (
    <section className="screen">
      <div className="today-head">
        <div className="date">{dateLabel}</div>
        <h2>
          {t.today_title_pre}
          <em>{t.today_title_em}</em>
        </h2>
      </div>

      <div className="day-progress">
        <div className="row">
          <span className="lbl">{t.progress_label}</span>
          <span className="pct">{percent}%</span>
        </div>
        <ProgressBar percent={percent} />
      </div>

      <div className="todo-list">
        {todos.map((td) => {
          const { title, sub } = localized(td);
          const isRunning = timer?.todoId === td.id;
          const remaining = isRunning ? Math.max(0, Math.ceil((timer.endsAt - now) / 1000)) : 0;
          const remainingLabel = `${String(Math.floor(remaining / 60)).padStart(2, '0')}:${String(remaining % 60).padStart(2, '0')}`;
          const elapsedPct = isRunning ? ((timer.totalSecs - remaining) / timer.totalSecs) * 100 : 0;
          return (
            <div key={td.id} className={`todo${td.done ? ' done' : ''}${isRunning ? ' running' : ''}`}>
              <div className="todo-main">
                <button className="checkbox" aria-label={title} onClick={() => toggle(td.id)}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path
                      d="M2.5 7.5 L5.5 10.5 L11.5 3.5"
                      stroke="#fff"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                <div className="todo-body">
                  <div className="todo-title">{title}</div>
                  {sub && <div className="todo-sub">{sub}</div>}
                </div>
                {!td.done && !isRunning && (
                  <button
                    className="todo-chip"
                    aria-label={t.min_chip(td.minutes ?? 0)}
                    onClick={() => cycleMinutes(td.id)}
                  >
                    {t.min_chip(td.minutes ?? 0)}
                  </button>
                )}
                {!td.done && td.minutes !== undefined && td.minutes > 0 && !isRunning && (
                  <button
                    className="todo-play"
                    aria-label="▶"
                    onClick={() => startTimer(td.id, td.minutes as number)}
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                      <path d="M3 1.5 L10.5 6 L3 10.5 Z" />
                    </svg>
                  </button>
                )}
                {isRunning && (
                  <button className="todo-timer" onClick={stopTimer}>
                    {remainingLabel}
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
                      <rect x="1" y="1" width="8" height="8" rx="1.5" />
                    </svg>
                  </button>
                )}
                {td.link && !isRunning && (
                  <button className="todo-go" onClick={() => goTab(td.link as Tab)}>
                    {t.go} →
                  </button>
                )}
              </div>
              {isRunning && (
                <div className="todo-progress">
                  <i style={{ width: `${elapsedPct}%` }} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="add-row">
        <input
          value={draft}
          maxLength={60}
          placeholder={t.todo_placeholder}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && add()}
        />
        <button onClick={add} aria-label="+">
          +
        </button>
      </div>

      <div className="eyebrow">{t.today_stats}</div>
      <div className="stat-row">
        <div className="stat">
          <b>{totals.exercises}</b>
          <span>{t.st_ex}</span>
        </div>
        <div className="stat">
          <b>{Math.floor(totals.seconds / 60)}</b>
          <span>{t.st_min}</span>
        </div>
        <div className="stat">
          <b>
            {done}/{todos.length}
          </b>
          <span>{t.st_done}</span>
        </div>
      </div>
    </section>
  );
}
