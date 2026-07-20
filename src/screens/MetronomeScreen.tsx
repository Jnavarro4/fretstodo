import { useEffect, useRef, useState } from 'react';
import { bpmFromTaps, type SoundPreset } from '../engine/metronome';
import { getMetronome } from '../state/metronomeSingleton';
import { useI18n } from '../i18n/I18nContext';
import { Switch } from '../components/Switch';
import { useWakeLock } from '../hooks/useWakeLock';

const TIME_SIGS = ['2/4', '3/4', '4/4', '5/4', '6/8', '7/8', '9/8', '12/8'];

interface MetronomeScreenProps {
  onBack?: () => void;
}

export function MetronomeScreen({ onBack }: MetronomeScreenProps) {
  const { t } = useI18n();

  /* Singleton: el metrónomo sigue sonando aunque cambies de tab.
     Al volver, la pantalla lee su estado real y se re-engancha al visual. */
  const metro = getMetronome();

  const [bpm, setBpm] = useState(metro.bpm);
  const [tsLabel, setTsLabel] = useState(
    `${metro.timeSignature.beats}/${metro.timeSignature.unit}`,
  );
  const [subdivision, setSubdivision] = useState(metro.subdivision);
  const [sound, setSound] = useState<SoundPreset>(metro.sound);
  const [gap, setGap] = useState(metro.gapEnabled);
  const [playing, setPlaying] = useState(metro.playing);
  const [activeBeat, setActiveBeat] = useState<number | null>(null);
  const [silentBar, setSilentBar] = useState(false);

  /** La pantalla no se apaga mientras el metrónomo suena. */
  useWakeLock(playing);

  const tapsRef = useRef<number[]>([]);

  useEffect(() => {
    const handler = (ev: { beat: number; isBeatStart: boolean; audible: boolean }) => {
      if (ev.isBeatStart) setActiveBeat(ev.beat);
      setSilentBar(!ev.audible);
    };
    metro.onVisual = handler;
    return () => {
      if (metro.onVisual === handler) metro.onVisual = undefined;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [beats, unit] = tsLabel.split('/').map(Number);
  const compound = unit === 8 && beats % 3 === 0;

  const changeBpm = (delta: number) => {
    const next = Math.min(260, Math.max(30, bpm + delta));
    setBpm(next);
    metro.bpm = next;
  };

  const tap = () => {
    const now = performance.now();
    tapsRef.current = [...tapsRef.current.filter((ts) => now - ts < 2500), now];
    const next = bpmFromTaps(tapsRef.current);
    if (next !== null) {
      setBpm(next);
      metro.bpm = next;
    }
  };

  const changeTs = (label: string) => {
    setTsLabel(label);
    const [b, u] = label.split('/').map(Number);
    metro.setTimeSignature({ beats: b, unit: u });
    setActiveBeat(null);
  };

  const changeSub = (value: number) => {
    setSubdivision(value);
    metro.subdivision = value;
  };

  const changeSound = (value: SoundPreset) => {
    setSound(value);
    metro.sound = value;
  };

  const toggleGap = () => {
    const next = !gap;
    setGap(next);
    metro.gapEnabled = next;
    if (!next) setSilentBar(false);
  };

  const togglePlay = () => {
    metro.toggle();
    setPlaying(metro.playing);
    if (!metro.playing) {
      setActiveBeat(null);
      setSilentBar(false);
    }
  };

  return (
    <section className="screen">
      {onBack && (
        <div className="practice-top">
          <button className="icon-btn" onClick={onBack}>
            {t.back}
          </button>
        </div>
      )}
      <div className="tempo-card">
        <div className="bpm">{bpm}</div>
        <div className="bpm-lbl">BPM</div>
        <div className="tempo-controls">
          <button onClick={() => changeBpm(-5)}>−5</button>
          <button onClick={() => changeBpm(-1)}>−1</button>
          <button className="tap" onClick={tap}>
            {t.tap}
          </button>
          <button onClick={() => changeBpm(1)}>+1</button>
          <button onClick={() => changeBpm(5)}>+5</button>
        </div>
        <div className="beats">
          {Array.from({ length: beats }, (_, i) => (
            <div
              key={i}
              className={[
                'beat-dot',
                i === 0 || (compound && i % 3 === 0) ? 'accent' : '',
                playing && activeBeat === i ? 'hit' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            />
          ))}
        </div>
        {gap && silentBar && playing && <div className="muted-tag">{t.silent_bar}</div>}
      </div>

      <div className="metro-grid">
        <div className="select-card">
          <label htmlFor="ts">{t.time_sig}</label>
          <select id="ts" value={tsLabel} onChange={(e) => changeTs(e.target.value)}>
            {TIME_SIGS.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="select-card">
          <label htmlFor="sub">{t.subdivision}</label>
          <select id="sub" value={subdivision} onChange={(e) => changeSub(Number(e.target.value))}>
            <option value={1}>{t.sub_1}</option>
            <option value={2}>{t.sub_2}</option>
            <option value={3}>{t.sub_3}</option>
            <option value={4}>{t.sub_4}</option>
          </select>
        </div>
        <div className="select-card full">
          <label htmlFor="snd">{t.sound}</label>
          <select id="snd" value={sound} onChange={(e) => changeSound(e.target.value as SoundPreset)}>
            <option value="click">{t.sound_click}</option>
            <option value="wood">{t.sound_wood}</option>
            <option value="cowbell">{t.sound_cowbell}</option>
            <option value="beep">{t.sound_beep}</option>
          </select>
        </div>
      </div>

      <div className="opt-row" style={{ marginTop: 8 }}>
        <div>
          <div className="lbl">{t.pulse_trainer}</div>
          <div className="sub">{t.pulse_trainer_sub}</div>
        </div>
        <Switch on={gap} onToggle={toggleGap} label={t.pulse_trainer} />
      </div>

      <button className={`play-btn${playing ? ' playing' : ''}`} onClick={togglePlay}>
        {playing ? t.stop : t.play}
      </button>
    </section>
  );
}
