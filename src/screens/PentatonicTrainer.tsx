import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  pentaBox,
  POSITIONS,
  randomPentaDrill,
  type PentaDrill,
  type Position,
  type ScaleTypeMode,
} from '../engine/pentatonicEngine';
import { useI18n } from '../i18n/I18nContext';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useWakeLock } from '../hooks/useWakeLock';
import { usePitch } from '../hooks/usePitch';
import { playChime } from '../utils/chime';
import { Segmented } from '../components/Segmented';
import { FretboardDiagram } from '../components/FretboardDiagram';

interface PentatonicTrainerProps {
  onDrill: (position: Position) => void;
  onSessionEnd: (seconds: number) => void;
  onBack: () => void;
}

interface PentaSettings {
  positions: Position[];
  typeMode: ScaleTypeMode;
  /** Modo Escúchame recordado entre sesiones. */
  coach: boolean;
}

const COMPLETE_NEXT_DELAY_MS = 1400;

export function PentatonicTrainer({ onDrill, onSessionEnd, onBack }: PentatonicTrainerProps) {
  const { t } = useI18n();

  const [settings, setSettings] = useLocalStorage<PentaSettings>('fretstodo.penta', {
    positions: [...POSITIONS],
    typeMode: 'minor',
    coach: false,
  });

  const [drill, setDrill] = useState<PentaDrill | null>(null);
  const [count, setCount] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [played, setPlayed] = useState<Set<number>>(new Set());
  const [complete, setComplete] = useState(false);
  const startRef = useRef<number | null>(null);
  const completeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inSession = drill !== null;

  useWakeLock(inSession);

  /* ---------- Coach: escucha con micrófono ---------- */
  const coachOn = (settings.coach ?? false) && inSession;
  const { state: micState, pitch } = usePitch(coachOn);

  const box = useMemo(
    () => (drill ? pentaBox(drill.key, drill.type, drill.position) : null),
    [drill],
  );
  const boxMidis = useMemo(() => new Set(box?.dots.map((d) => d.midi) ?? []), [box]);

  /** Nota sonando que pertenece a la caja actual. */
  const activeMidi = pitch && boxMidis.has(pitch.midi) ? pitch.midi : null;

  /* Nota detectada dentro de la caja → marcarla como tocada */
  useEffect(() => {
    if (activeMidi === null || complete) return;
    setPlayed((prev) => {
      if (prev.has(activeMidi)) return prev;
      const next = new Set(prev);
      next.add(activeMidi);
      return next;
    });
  }, [activeMidi, complete]);

  /* Caja completa → celebrar y avanzar solo */
  useEffect(() => {
    if (!inSession || !box || complete) return;
    if (boxMidis.size > 0 && played.size >= boxMidis.size) {
      setComplete(true);
      playChime();
      completeTimerRef.current = setTimeout(() => next(), COMPLETE_NEXT_DELAY_MS);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [played, boxMidis, inSession, complete]);

  useEffect(() => {
    return () => {
      if (completeTimerRef.current) clearTimeout(completeTimerRef.current);
    };
  }, []);

  const togglePosition = (pos: Position) =>
    setSettings((prev) => ({
      ...prev,
      positions: prev.positions.includes(pos)
        ? prev.positions.filter((p) => p !== pos)
        : [...prev.positions, pos].sort((a, b) => a - b),
    }));

  const toggleCoach = () => setSettings((prev) => ({ ...prev, coach: !(prev.coach ?? false) }));

  const next = useCallback(() => {
    if (completeTimerRef.current) clearTimeout(completeTimerRef.current);
    setPlayed(new Set());
    setComplete(false);
    setDrill((prev) => {
      const d = randomPentaDrill(settings.positions, settings.typeMode, prev);
      if (!d) return prev;
      setCount((c) => c + 1);
      onDrill(d.position);
      return d;
    });
  }, [settings.positions, settings.typeMode, onDrill]);

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
    setDrill(null);
    setPlayed(new Set());
    setComplete(false);
  }, [onSessionEnd]);

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
  const scaleLabel = (type: 'minor' | 'major') =>
    `${t.penta_of} ${type === 'minor' ? t.scale_minor.toLowerCase() : t.scale_major.toLowerCase()}`;

  if (!inSession) {
    return (
      <section className="screen">
        <div className="practice-top">
          <button className="icon-btn" onClick={onBack}>
            {t.back}
          </button>
        </div>

        <div className="eyebrow">{t.cfg_positions}</div>
        <div className="chips chips-5">
          {POSITIONS.map((pos) => (
            <button
              key={pos}
              className={`chip${settings.positions.includes(pos) ? ' on' : ''}`}
              aria-pressed={settings.positions.includes(pos)}
              onClick={() => togglePosition(pos)}
            >
              {pos}
            </button>
          ))}
        </div>

        <div className="eyebrow">{t.cfg_scale_type}</div>
        <Segmented<ScaleTypeMode>
          value={settings.typeMode}
          onChange={(typeMode) => setSettings((prev) => ({ ...prev, typeMode }))}
          options={[
            { value: 'minor', label: t.scale_minor },
            { value: 'major', label: t.scale_major },
            { value: 'rand', label: t.scale_rand },
          ]}
        />

        <div className="eyebrow">{t.cfg_options}</div>
        <div className="opt-row">
          <div>
            <div className="lbl">{t.coach_listen}</div>
            <div className="sub">{t.coach_listen_sub}</div>
          </div>
          <button
            className={`switch${settings.coach ? ' on' : ''}`}
            role="switch"
            aria-checked={settings.coach ?? false}
            aria-label={t.coach_listen}
            onClick={toggleCoach}
          />
        </div>

        <button className="cta" disabled={settings.positions.length === 0} onClick={start}>
          {t.start}
        </button>
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

      <div
        className={`stage stage-penta${complete ? ' stage-complete' : ''}`}
        role="button"
        aria-label={t.next}
        onClick={next}
      >
        <div className="penta-head">
          <div style={{ textAlign: 'center' }}>
            <div className="field-label">{t.lbl_key}</div>
            <div className="root-note root-note-sm" key={`k${count}`}>
              {drill.key}
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div className="interval-name interval-name-sm" key={`s${count}`}>
              {scaleLabel(drill.type)}
            </div>
            <div className="direction-tag">{t.position(drill.position)}</div>
          </div>
        </div>

        {box && (
          <FretboardDiagram
            key={`f${count}`}
            box={box}
            playedMidis={settings.coach ? played : undefined}
            activeMidi={settings.coach ? activeMidi : null}
          />
        )}

        {/* Barra del Coach: estado del micrófono + progreso de la caja */}
        <div className="coach-bar" onClick={(e) => e.stopPropagation()}>
          <button
            className={`coach-mic${settings.coach ? ' on' : ''}`}
            aria-pressed={settings.coach ?? false}
            onClick={toggleCoach}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="3" width="6" height="11" rx="3" />
              <path d="M5 11a7 7 0 0 0 14 0" />
              <line x1="12" y1="18" x2="12" y2="21" />
            </svg>
            {t.coach_listen}
          </button>
          {settings.coach && micState === 'listening' && !complete && (
            <span className="coach-progress">
              {played.size}/{boxMidis.size}
            </span>
          )}
          {settings.coach && micState === 'denied' && (
            <span className="coach-denied">{t.coach_denied}</span>
          )}
          {complete && <span className="coach-complete">✓ {t.coach_complete}</span>}
        </div>
      </div>

      <button className="next-btn" onClick={next}>
        {t.next}
      </button>
      <p className="tap-hint">{t.tap_hint}</p>
    </section>
  );
}
