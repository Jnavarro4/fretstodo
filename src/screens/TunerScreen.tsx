import { useEffect, useRef, useState } from 'react';
import { autoCorrelate, readingFromFrequency, type PitchReading } from '../engine/tunerEngine';
import { useI18n } from '../i18n/I18nContext';
import { useWakeLock } from '../hooks/useWakeLock';

interface TunerScreenProps {
  onBack: () => void;
}

type TunerState = 'idle' | 'listening' | 'denied';

const IN_TUNE_CENTS = 5;

export function TunerScreen({ onBack }: TunerScreenProps) {
  const { t } = useI18n();
  const [state, setState] = useState<TunerState>('idle');
  const [reading, setReading] = useState<PitchReading | null>(null);

  useWakeLock(state === 'listening');

  const ctxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);
  /** Suavizado: solo aceptar lecturas estables para que la aguja no tiemble. */
  const lastFreqRef = useRef<number>(0);

  const stop = () => {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((tr) => tr.stop());
    streamRef.current = null;
    void ctxRef.current?.close();
    ctxRef.current = null;
    setState('idle');
    setReading(null);
  };

  useEffect(() => stop, []);

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      });
      streamRef.current = stream;
      const ctx = new AudioContext();
      ctxRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);
      const buf = new Float32Array(analyser.fftSize);
      setState('listening');

      const tick = () => {
        analyser.getFloatTimeDomainData(buf);
        const freq = autoCorrelate(buf, ctx.sampleRate);
        if (freq > 0) {
          // Media móvil ligera para estabilizar la aguja
          const smoothed =
            lastFreqRef.current > 0 && Math.abs(freq - lastFreqRef.current) < lastFreqRef.current * 0.1
              ? lastFreqRef.current * 0.6 + freq * 0.4
              : freq;
          lastFreqRef.current = smoothed;
          setReading(readingFromFrequency(smoothed));
        }
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    } catch {
      setState('denied');
    }
  };

  const cents = reading?.cents ?? 0;
  const inTune = reading !== null && Math.abs(cents) <= IN_TUNE_CENTS;
  /** Posición de la aguja: −50 cents = 0 %, +50 cents = 100 %. */
  const needlePct = ((cents + 50) / 100) * 100;

  return (
    <section className="screen">
      <div className="practice-top">
        <button className="icon-btn" onClick={onBack}>
          {t.back}
        </button>
      </div>

      <div className={`tuner-card${inTune ? ' in-tune' : ''}`}>
        {state !== 'listening' && (
          <div className="tuner-idle">
            <p className="tuner-hint">{state === 'denied' ? t.tuner_denied : t.tuner_intro}</p>
          </div>
        )}

        {state === 'listening' && (
          <>
            <div className="tuner-note">
              {reading ? (
                <>
                  <span className="tuner-note-name">{reading.note}</span>
                  <span className="tuner-octave">{reading.octave}</span>
                </>
              ) : (
                <span className="tuner-waiting">{t.tuner_listening}</span>
              )}
            </div>

            <div className="tuner-scale">
              <div className="tuner-track">
                <i className="tuner-center" />
                <i className="tuner-needle" style={{ left: `${needlePct}%` }} />
              </div>
              <div className="tuner-scale-labels">
                <span>−50</span>
                <span>0</span>
                <span>+50</span>
              </div>
            </div>

            <div className="tuner-status">
              {reading &&
                (inTune ? (
                  <span className="ok">✓ {t.tuner_in_tune}</span>
                ) : (
                  <span>
                    {cents > 0 ? t.tuner_high : t.tuner_low} · {Math.abs(cents)} cents
                  </span>
                ))}
            </div>

            {reading && <div className="tuner-freq">{reading.frequency.toFixed(1)} Hz</div>}
          </>
        )}
      </div>

      {state === 'listening' ? (
        <button className="play-btn playing" onClick={stop}>
          {t.stop}
        </button>
      ) : (
        <button className="play-btn" onClick={() => void start()}>
          {t.tuner_start}
        </button>
      )}
    </section>
  );
}
