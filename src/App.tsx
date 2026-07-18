import { useCallback, useState } from 'react';
import { useI18n } from './i18n/I18nContext';
import { translations } from './i18n/translations';
import { useLocalStorage } from './hooks/useLocalStorage';
import { TodayScreen } from './screens/TodayScreen';
import { TrainScreen } from './screens/TrainScreen';
import { MetronomeScreen } from './screens/MetronomeScreen';
import type { DailyState, Tab, Todo } from './types';

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
  }));
  return { date: todayKey(), todos, totals: { exercises: 0, seconds: 0 } };
}

export default function App() {
  const { lang, t, setLang } = useI18n();
  const [tab, setTab] = useState<Tab>('today');

  const [daily, setDaily] = useLocalStorage<DailyState>('fretstodo.daily', () => freshDaily(lang));

  /** Nuevo día → rutina nueva. Se evalúa en cada render sin efecto adicional. */
  if (daily.date !== todayKey()) {
    setDaily(freshDaily(lang));
  }

  const setTodos = useCallback(
    (updater: (prev: Todo[]) => Todo[]) =>
      setDaily((prev) => ({ ...prev, todos: updater(prev.todos) })),
    [setDaily],
  );

  const onExercise = useCallback(
    () =>
      setDaily((prev) => ({
        ...prev,
        totals: { ...prev.totals, exercises: prev.totals.exercises + 1 },
      })),
    [setDaily],
  );

  const onSessionEnd = useCallback(
    (seconds: number) =>
      setDaily((prev) => ({
        ...prev,
        totals: { ...prev.totals, seconds: prev.totals.seconds + seconds },
      })),
    [setDaily],
  );

  return (
    <div className="app">
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
          <TodayScreen todos={daily.todos} setTodos={setTodos} totals={daily.totals} goTab={setTab} />
        )}
        {tab === 'train' && <TrainScreen onExercise={onExercise} onSessionEnd={onSessionEnd} />}
        {tab === 'metro' && <MetronomeScreen />}
      </main>

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
              <path d="M8 20 L10 5 H14 L16 20 Z" />
              <line x1="12" y1="16" x2="16.5" y2="7" />
            </svg>
            <span>{t.tab_metro}</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
