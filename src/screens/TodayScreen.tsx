import { useState } from 'react';
import { useI18n } from '../i18n/I18nContext';
import { translations } from '../i18n/translations';
import { ProgressBar } from '../components/ProgressBar';
import type { RunningTimer, Tab, Totals, Todo } from '../types';

const MINUTE_STEPS = [5, 10, 15, 20, 25, 30, 45, 60];

interface TodayScreenProps {
  todos: Todo[];
  setTodos: (updater: (prev: Todo[]) => Todo[]) => void;
  totals: Totals;
  goTab: (tab: Tab) => void;
  /** Temporizador global (vive en App: sobrevive al cambio de tab). */
  timer: RunningTimer | null;
  now: number;
  onStartTimer: (todo: Todo) => void;
  onPauseTimer: () => void;
  onClearTimer: (todoId: string) => void;
}

export function TodayScreen({
  todos,
  setTodos,
  totals,
  goTab,
  timer,
  now,
  onStartTimer,
  onPauseTimer,
  onClearTimer,
}: TodayScreenProps) {
  const { lang, t } = useI18n();
  const [draft, setDraft] = useState('');

  const done = todos.filter((td) => td.done).length;
  const percent = todos.length ? Math.round((done / todos.length) * 100) : 0;

  const rawDate = new Date().toLocaleDateString(lang === 'es' ? 'es-CO' : 'en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  /** Solo la primera letra en mayúscula: "Domingo, 19 de julio". */
  const dateLabel = rawDate.charAt(0).toUpperCase() + rawDate.slice(1);

  const toggle = (id: string) => {
    /* Marcar como hecha descarta su temporizador (corriendo o en pausa). */
    const target = todos.find((td) => td.id === id);
    if (target && !target.done && timer?.todoId === id) onClearTimer(id);
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

  const cycleMinutes = (id: string) => {
    setTodos((prev) =>
      prev.map((td) => {
        if (td.id !== id) return td;
        const idx = MINUTE_STEPS.indexOf(td.minutes ?? 0);
        return { ...td, minutes: MINUTE_STEPS[(idx + 1) % MINUTE_STEPS.length] };
      }),
    );
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
          const isRunning = timer?.todoId === td.id && timer.endsAt !== null;
          const isPaused = timer?.todoId === td.id && timer.remainingSecs !== null;
          const remaining = isRunning
            ? Math.max(0, Math.ceil(((timer.endsAt as number) - now) / 1000))
            : isPaused
              ? (timer.remainingSecs as number)
              : 0;
          const remainingLabel = `${String(Math.floor(remaining / 60)).padStart(2, '0')}:${String(remaining % 60).padStart(2, '0')}`;
          const elapsedPct =
            (isRunning || isPaused) && timer
              ? ((timer.totalSecs - remaining) / timer.totalSecs) * 100
              : 0;
          return (
            <div
              key={td.id}
              className={`todo${td.done ? ' done' : ''}${isRunning ? ' running' : ''}`}
            >
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
                {!td.done && !isRunning && !isPaused && (
                  <button
                    className="todo-chip"
                    aria-label={t.min_chip(td.minutes ?? 0)}
                    onClick={() => cycleMinutes(td.id)}
                  >
                    {t.min_chip(td.minutes ?? 0)}
                  </button>
                )}
                {!td.done && isPaused && <span className="todo-chip paused">{remainingLabel}</span>}
                {!td.done && !isRunning && td.minutes !== undefined && td.minutes > 0 && (
                  <button className="todo-play" aria-label="play" onClick={() => onStartTimer(td)}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                      <path d="M3 1.5 L10.5 6 L3 10.5 Z" />
                    </svg>
                  </button>
                )}
                {isRunning && (
                  <button className="todo-timer" onClick={onPauseTimer} aria-label="pause">
                    {remainingLabel}
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
                      <rect x="1.5" y="1" width="2.6" height="8" rx="1" />
                      <rect x="5.9" y="1" width="2.6" height="8" rx="1" />
                    </svg>
                  </button>
                )}
                {td.link && !isRunning && (
                  <button className="todo-go" onClick={() => goTab(td.link as Tab)}>
                    {t.go} →
                  </button>
                )}
              </div>
              {(isRunning || isPaused) && (
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
