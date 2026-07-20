import { useCallback, useEffect, useRef, useState } from 'react';
import {
  DIATONIC_IDS,
  INTERVALS,
  randomExercise,
  type DirectionMode,
  type Exercise,
  type IntervalId,
} from '../engine/intervalEngine';
import { useI18n } from '../i18n/I18nContext';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useWakeLock } from '../hooks/useWakeLock';
import { Segmented } from '../components/Segmented';
import { Stepper } from '../components/Stepper';
import { Switch } from '../components/Switch';
import { PentatonicTrainer } from './PentatonicTrainer';
import type { Position } from '../engine/pentatonicEngine';

interface TrainScreenProps {
  onExercise: (intervalId: IntervalId) => void;
  onPentaDrill: (position: Position) => void;
  onSessionEnd: (seconds: number) => void;
}

type TrainerId = 'hub' | 'intervals' | 'penta';

interface TrainSettings {
  enabled: IntervalId[];
  dir: DirectionMode;
  showRoot: boolean;
  auto: boolean;
  autoSecs: number;
}

const ALL_IDS = INTERVALS.map((i) => i.id);

export function TrainScreen({ onExercise, onPentaDrill, onSessionEnd }: TrainScreenProps) {
  const { t } = useI18n();
  const [trainer, setTrainer] = useState<TrainerId>('hub');

  const [settings, setSettings] = useLocalStorage<TrainSettings>('fretstodo.train', {
    enabled: ALL_IDS,
    dir: 'asc',
    showRoot: true,
    auto: false,
    autoSecs: 8,
  });

  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [count, setCount] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [revealed, setRevealed] = useState(false);
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

  const next = useCallback(() => {
    setExercise((prev) => {
      const ex = randomExercise(settings.enabled, settings.dir, prev);
      if (!ex) return prev;
      setCount((c) => c + 1);
      setRevealed(false);
      setAutoKey((k) => k + 1);
      onExercise(ex.interval.id);
      return ex;
    });
  }, [settings.enabled, settings.dir, onExercise]);

  const start = () => {
    startRef.current = Date.now();
    setCount(0);
    setElapsed(0);
    next();
  };

  const end = useCallback(() => {
    if (startRef.current !== null) {
      onSessionEnd(Math.floor((Date.now() - startRef.current) / 1000));
    }
    startRef.current = null;
    setExercise(null);
  }, [onSessionEnd]);

  /** Al desmontar (cambio de tab) la sesión se cierra y suma sus minutos. */
  useEffect(() => end, [end]);

  useEffect(() => {
    if (!inSession) return;
    const id = setInterval(() => {
      if (startRef.current !== null) {
        setElapsed(Math.floor((Date.now() - startRef.current) / 1000));
      }
    }, 1000);
    return () => clearInterval(id);
  }, [inSession]);

  useEffect(() => {
    if (!inSession || !settings.auto) return;
    autoTimerRef.current = setTimeout(next, settings.autoSecs * 1000);
    return () => {
      if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
    };
  }, [autoKey, inSession, settings.auto, settings.autoSecs, next]);

  useEffect(() => {
    if (!inSession) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        next();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [inSession, next]);

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

      <div className="stage" role="button" aria-label={t.next} onClick={next}>
        <div className="strings">
          <i /><i /><i /><i /><i /><i />
        </div>
        {settings.showRoot && (
          <div style={{ textAlign: 'center' }}>
            <div className="field-label">{t.lbl_note}</div>
            {/* key fuerza re-montaje → re-dispara la animación pop */}
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
        <div className="answer">
          {settings.showRoot &&
            (revealed ? (
              <span className="target">
                {exercise.root} → {exercise.target}
              </span>
            ) : (
              <button
                className="reveal"
                onClick={(e) => {
                  e.stopPropagation();
                  setRevealed(true);
                }}
              >
                {t.show_answer}
              </button>
            ))}
        </div>
      </div>

      {settings.auto && (
        <div className="autobar-wrap">
          <div
            key={autoKey}
            className="autobar"
            style={{
              animation: `autofill ${settings.autoSecs}s linear forwards`,
            }}
          />
          <style>{`@keyframes autofill { from { width: 0 } to { width: 100% } }`}</style>
        </div>
      )}

      <button className="next-btn" onClick={next}>
        {t.next}
      </button>
      <p className="tap-hint">{t.tap_hint}</p>
    </section>
  );
}
