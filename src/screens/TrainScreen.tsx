import { useCallback, useEffect, useRef, useState } from 'react';
import {
  DIATONIC_IDS,
  INTERVALS,
  NOTES,
  randomExercise,
  type DirectionMode,
  type Exercise,
  type IntervalId,
} from '../engine/intervalEngine';
import { useI18n } from '../i18n/I18nContext';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useWakeLock } from '../hooks/useWakeLock';
import { playSequence } from '../utils/audio';
import { Segmented } from '../components/Segmented';
import { Stepper } from '../components/Stepper';
import { Switch } from '../components/Switch';
import { PentatonicTrainer } from './PentatonicTrainer';
import type { Position } from '../engine/pentatonicEngine';

interface TrainScreenProps {
  onExercise: (intervalId: IntervalId) => void;
  onPentaDrill: (position: Position) => void;
  onSessionEnd: (seconds: number) => void;
  /** Al llegar desde el play de la rutina: abre Intervalos con la sesión ya corriendo. */
  autoStartIntervals?: boolean;
}

type TrainerId = 'hub' | 'intervals' | 'penta';
type Phase = 'question' | 'answer';

interface TrainSettings {
  enabled: IntervalId[];
  dir: DirectionMode;
  showRoot: boolean;
  auto: boolean;
  autoSecs: number;
}

/** Valoraciones fácil/difícil por intervalo (estilo flashcards). */
type Ratings = Partial<Record<IntervalId, { easy: number; hard: number }>>;

const ALL_IDS = INTERVALS.map((i) => i.id);
const ANSWER_AUTO_MS = 3000;

export function TrainScreen({
  onExercise,
  onPentaDrill,
  onSessionEnd,
  autoStartIntervals,
}: TrainScreenProps) {
  const { t } = useI18n();
  const [trainer, setTrainer] = useState<TrainerId>('hub');

  const [settings, setSettings] = useLocalStorage<TrainSettings>('fretstodo.train', {
    enabled: ALL_IDS,
    dir: 'asc',
    showRoot: true,
    auto: false,
    autoSecs: 8,
  });
  const [ratings, setRatings] = useLocalStorage<Ratings>('fretstodo.ratings', {});

  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [phase, setPhase] = useState<Phase>('question');
  const [count, setCount] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [autoKey, setAutoKey] = useState(0);

  const startRef = useRef<number | null>(null);
  const autoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inSession = exercise !== null;

  /** La pantalla no se apaga mientras hay sesión activa. */
  useWakeLock(inSession);

  const patch = (partial: Partial<TrainSettings>) =>
    setSettings((prev) => ({ ...prev, ...partial }));

  const toggleInterval = (id: IntervalId) =>
    patch({
      enabled: settings.enabled.includes(id)
        ? settings.enabled.filter((e) => e !== id)
        : [...settings.enabled, id],
    });

  /** Peso por intervalo: los valorados como difíciles salen más seguido. */
  const weights = useCallback((): Partial<Record<IntervalId, number>> => {
    const w: Partial<Record<IntervalId, number>> = {};
    for (const iv of INTERVALS) {
      const r = ratings[iv.id];
      if (r) w[iv.id] = 1 + r.hard - 0.5 * r.easy;
    }
    return w;
  }, [ratings]);

  const genNext = useCallback(() => {
    setExercise((prev) => {
      const pool = settings.enabled.length > 0 ? settings.enabled : ALL_IDS;
      const ex = randomExercise(pool, settings.dir, prev, weights());
      if (!ex) return prev;
      setCount((c) => c + 1);
      setPhase('question');
      setAutoKey((k) => k + 1);
      onExercise(ex.interval.id);
      return ex;
    });
  }, [settings.enabled, settings.dir, weights, onExercise]);

  const reveal = useCallback(() => {
    setPhase('answer');
    setAutoKey((k) => k + 1);
  }, []);

  /** Valoración estilo Anki (o null si se salta) → siguiente ejercicio. */
  const advance = useCallback(
    (rating: 'easy' | 'hard' | null) => {
      if (rating && exercise) {
        const id = exercise.interval.id;
        setRatings((prev) => {
          const r = prev[id] ?? { easy: 0, hard: 0 };
          return { ...prev, [id]: { ...r, [rating]: r[rating] + 1 } };
        });
      }
      genNext();
    },
    [exercise, setRatings, genNext],
  );

  const primaryAction = useCallback(() => {
    if (phase === 'question') reveal();
    else advance(null);
  }, [phase, reveal, advance]);

  const start = () => {
    startRef.current = Date.now();
    setCount(0);
    setElapsed(0);
    genNext();
  };

  const end = useCallback(() => {
    if (startRef.current !== null) {
      onSessionEnd(Math.floor((Date.now() - startRef.current) / 1000));
    }
    startRef.current = null;
    setExercise(null);
    setPhase('question');
  }, [onSessionEnd]);

  /** Al desmontar (cambio de tab) la sesión se cierra y suma sus minutos. */
  useEffect(() => end, [end]);

  /** Play en la rutina → directo al ejercicio, sin pasar por menús. */
  useEffect(() => {
    if (autoStartIntervals) {
      setTrainer('intervals');
      start();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!inSession) return;
    const id = setInterval(() => {
      if (startRef.current !== null) {
        setElapsed(Math.floor((Date.now() - startRef.current) / 1000));
      }
    }, 1000);
    return () => clearInterval(id);
  }, [inSession]);

  /** Auto-avance: revela el resultado al cumplirse el tiempo y avanza después. */
  useEffect(() => {
    if (!inSession || !settings.auto) return;
    const ms = phase === 'question' ? settings.autoSecs * 1000 : ANSWER_AUTO_MS;
    autoTimerRef.current = setTimeout(() => {
      if (phase === 'question') reveal();
      else advance(null);
    }, ms);
    return () => {
      if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
    };
  }, [autoKey, inSession, settings.auto, settings.autoSecs, phase, reveal, advance]);

  useEffect(() => {
    if (!inSession) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        primaryAction();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [inSession, primaryAction]);

  const hearExample = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!exercise) return;
    const rootMidi = 48 + NOTES.indexOf(exercise.root);
    const delta = exercise.dir === 'asc' ? exercise.interval.semitones : -exercise.interval.semitones;
    playSequence([rootMidi, rootMidi + delta], 600, 550);
  };

  const timerLabel = `${String(Math.floor(elapsed / 60)).padStart(2, '0')}:${String(elapsed % 60).padStart(2, '0')}`;

  if (trainer === 'penta') {
    return (
      <PentatonicTrainer
        onDrill={onPentaDrill}
        onSessionEnd={onSessionEnd}
        onBack={() => setTrainer('hub')}
      />
    );
  }

  if (trainer === 'hub') {
    return (
      <section className="screen">
        <div className="eyebrow">{t.hub_pick}</div>
        <div className="hub-list">
          <button className="hub-card" onClick={() => setTrainer('intervals')}>
            <div className="hub-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <line x1="4" y1="7" x2="20" y2="7" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="17" x2="20" y2="17" />
                <circle cx="9" cy="7" r="2.2" fill="currentColor" stroke="none" />
                <circle cx="15" cy="17" r="2.2" fill="currentColor" stroke="none" />
              </svg>
            </div>
            <div className="hub-body">
              <div className="hub-title">{t.cfg_intervals}</div>
              <div className="hub-sub">{t.hub_intervals_sub}</div>
            </div>
            <span className="hub-arrow">→</span>
          </button>
          <button className="hub-card" onClick={() => setTrainer('penta')}>
            <div className="hub-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <circle cx="6" cy="6" r="2.2" fill="currentColor" stroke="none" />
                <circle cx="18" cy="6" r="2.2" fill="currentColor" stroke="none" />
                <circle cx="12" cy="12" r="2.2" fill="currentColor" stroke="none" />
                <circle cx="6" cy="18" r="2.2" fill="currentColor" stroke="none" />
                <circle cx="18" cy="18" r="2.2" fill="currentColor" stroke="none" />
              </svg>
            </div>
            <div className="hub-body">
              <div className="hub-title">{t.hub_penta}</div>
              <div className="hub-sub">{t.hub_penta_sub}</div>
            </div>
            <span className="hub-arrow">→</span>
          </button>
        </div>
      </section>
    );
  }

  if (!inSession) {
    return (
      <section className="screen">
        <div className="practice-top">
          <button className="icon-btn" onClick={() => setTrainer('hub')}>
            {t.back}
          </button>
        </div>
        <div className="eyebrow">{t.cfg_intervals}</div>
        <div className="chips">
          {INTERVALS.map((iv) => (
            <button
              key={iv.id}
              className={`chip${settings.enabled.includes(iv.id) ? ' on' : ''}`}
              aria-pressed={settings.enabled.includes(iv.id)}
              onClick={() => toggleInterval(iv.id)}
            >
              {t.intervals[iv.id]}
              <small>{t.semis(iv.semitones)}</small>
            </button>
          ))}
        </div>
        <div className="presets">
          <button className="preset" onClick={() => patch({ enabled: ALL_IDS })}>
            {t.preset_all}
          </button>
          <button className="preset" onClick={() => patch({ enabled: DIATONIC_IDS })}>
            {t.preset_diatonic}
          </button>
          <button className="preset" onClick={() => patch({ enabled: [] })}>
            {t.preset_none}
          </button>
        </div>

        <div className="eyebrow">{t.cfg_direction}</div>
        <Segmented<DirectionMode>
          value={settings.dir}
          onChange={(dir) => patch({ dir })}
          options={[
            { value: 'asc', label: t.dir_asc },
            { value: 'desc', label: t.dir_desc },
            { value: 'rand', label: t.dir_rand },
          ]}
        />

        <div className="eyebrow">{t.cfg_options}</div>
        <div className="opt-row">
          <div>
            <div className="lbl">{t.opt_root}</div>
            <div className="sub">{t.opt_root_sub}</div>
          </div>
          <Switch on={settings.showRoot} onToggle={() => patch({ showRoot: !settings.showRoot })} label={t.opt_root} />
        </div>
        <div className="opt-row">
          <div>
            <div className="lbl">{t.opt_auto}</div>
            <div className="sub">{t.opt_auto_sub}</div>
          </div>
          <Switch on={settings.auto} onToggle={() => patch({ auto: !settings.auto })} label={t.opt_auto} />
        </div>
        {settings.auto && (
          <div className="opt-row">
            <div className="lbl">{t.opt_secs}</div>
            <Stepper
              value={`${settings.autoSecs}s`}
              onStep={(d) => patch({ autoSecs: Math.min(30, Math.max(3, settings.autoSecs + d)) })}
            />
          </div>
        )}

        <button className="cta" disabled={settings.enabled.length === 0} onClick={start}>
          {t.start}
        </button>
        <p className="cta-hint">
          {settings.enabled.length ? t.sel_count(settings.enabled.length) : t.sel_none}
        </p>
      </section>
    );
  }

  return (
    <section className="screen">
      <div className="practice-top">
        <button className="icon-btn" onClick={end}>
          {t.back}
        </button>
        <div className="session-meta">
          <span>
            <b>{count}</b> {t.meta_ex}
          </span>
          <span>{timerLabel}</span>
        </div>
      </div>

      <div className="stage" role="button" aria-label={t.next} onClick={primaryAction}>
        <div className="strings">
          <i /><i /><i /><i /><i /><i />
        </div>
        {settings.showRoot && (
          <div style={{ textAlign: 'center' }}>
            <div className="field-label">{t.lbl_note}</div>
            <div className="root-note" key={`r${count}`}>
              {exercise.root}
            </div>
          </div>
        )}
        <div style={{ textAlign: 'center' }}>
          <div className="field-label">{t.lbl_interval}</div>
          <div className="interval-name" key={`i${count}`}>
            {t.intervals[exercise.interval.id]}
          </div>
        </div>
        <div className="direction-tag">{t[exercise.dir]}</div>

        {/* Fase resultado: respuesta grande + escuchar el intervalo */}
        <div className="answer">
          {phase === 'answer' && (
            <div className="answer-block" key={`a${count}`}>
              {settings.showRoot && (
                <span className="target">
                  {exercise.root} → {exercise.target}
                </span>
              )}
              <button className="hear-btn" onClick={hearExample}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 5 6 9 H3 v6 h3 l5 4 z" />
                  <path d="M15.5 8.5a5 5 0 0 1 0 7" />
                  <path d="M18.5 5.5a9.5 9.5 0 0 1 0 13" />
                </svg>
                {t.hear}
              </button>
            </div>
          )}
        </div>
      </div>

      {settings.auto && (
        <div className="autobar-wrap">
          <div
            key={autoKey}
            className="autobar"
            style={{
              animation: `autofill ${phase === 'question' ? settings.autoSecs : ANSWER_AUTO_MS / 1000}s linear forwards`,
            }}
          />
          <style>{`@keyframes autofill { from { width: 0 } to { width: 100% } }`}</style>
        </div>
      )}

      {phase === 'question' ? (
        <button className="next-btn" onClick={reveal}>
          {t.show_result}
        </button>
      ) : (
        <div className="rate-row">
          <button className="rate-btn rate-hard" onClick={() => advance('hard')}>
            {t.rate_hard}
          </button>
          <button className="rate-btn rate-easy" onClick={() => advance('easy')}>
            {t.rate_easy}
          </button>
        </div>
      )}
      <p className="tap-hint">{t.tap_hint}</p>
    </section>
  );
}
