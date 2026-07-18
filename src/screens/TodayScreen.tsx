import { useState } from 'react';
import { useI18n } from '../i18n/I18nContext';
import { translations } from '../i18n/translations';
import { ProgressBar } from '../components/ProgressBar';
import type { Tab, Totals, Todo } from '../types';

interface TodayScreenProps {
  todos: Todo[];
  setTodos: (updater: (prev: Todo[]) => Todo[]) => void;
  totals: Totals;
  goTab: (tab: Tab) => void;
}

export function TodayScreen({ todos, setTodos, totals, goTab }: TodayScreenProps) {
  const { lang, t } = useI18n();
  const [draft, setDraft] = useState('');

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
      { id: `c${Date.now()}`, title, sub: '', link: null, done: false, custom: true },
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
          return (
            <div key={td.id} className={`todo${td.done ? ' done' : ''}`}>
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
              {td.link && (
                <button className="todo-go" onClick={() => goTab(td.link as Tab)}>
                  {t.go} →
                </button>
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
