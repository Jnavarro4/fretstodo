import { useCallback, useEffect, useRef, useState } from 'react';
import {
  POSITIONS,
  randomPentaDrill,
  type PentaDrill,
  type Position,
  type ScaleTypeMode,
} from '../engine/pentatonicEngine';
import { useI18n } from '../i18n/I18nContext';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useWakeLock } from '../hooks/useWakeLock';
import { Segmented } from '../components/Segmented';

interface PentatonicTrainerProps {
  onDrill: (position: Position) => void;
  onSessionEnd: (seconds: number) => void;
  onBack: () => void;
}

interface PentaSettings {
  positions: Position[];
  typeMode: ScaleTypeMode;
}

export function PentatonicTrainer({ onDrill, onSessionEnd, onBack }: PentatonicTrainerProps) {
  const { t } = useI18n();

  const [settings, setSettings] = useLocalStorage<PentaSettings>('fretstodo.penta', {
    positions: [...POSITIONS],
    typeMode: 'minor',
  });

  const [drill, setDrill] = useState<PentaDrill | null>(null);
  const [count, setCount] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef<number | null>(null);
  const inSession = drill !== null;

  useWakeLock(inSession);

  const togglePosition = (pos: Position) =>
    setSettings((prev) => ({
      ...prev,
      positions: prev.positions.includes(pos)
        ? prev.positions.filter((p) => p !== pos)
        : [...prev.positions, pos].sort((a, b) => a - b),
    }));

  const next = useCallback(() => {
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

      <div className="stage" role="button" aria-label={t.next} onClick={next}>
        <div className="strings">
          <i /><i /><i /><i /><i /><i />
        </div>
        <div style={{ textAlign: 'center' }}>
          <div className="field-label">{t.lbl_key}</div>
          <div className="root-note" key={`k${count}`}>
            {drill.key}
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div className="field-label">{t.lbl_scale}</div>
          <div className="interval-name" key={`s${count}`}>
            {scaleLabel(drill.type)}
          </div>
        </div>
        <div className="direction-tag">{t.position(drill.position)}</div>
      </div>

      <button className="next-btn" onClick={next}>
        {t.next}
      </button>
      <p className="tap-hint">{t.tap_hint}</p>
    </section>
  );
}
