import { useEffect, useRef, useState } from 'react';
import { useI18n } from '../i18n/I18nContext';
import { Segmented } from '../components/Segmented';
import { Stepper } from '../components/Stepper';
import { Switch } from '../components/Switch';
import { MetronomeEngine, calculateTapTempo, type Subdivision } from '../engine/metronome';

export function MetronomeScreen() {
  const { t } = useI18n();
  const audioContextRef = useRef<AudioContext | null>(null);
  const engineRef = useRef<MetronomeEngine | null>(null);

  const [bpm, setBpm] = useState(100);
  const [beatsPerBar, setBeatsPerBar] = useState(4);
  const [subdivision, setSubdivision] = useState<Subdivision>('quarter');
  const [gapTrainerEnabled, setGapTrainerEnabled] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [activeBeat, setActiveBeat] = useState(0);
  const [tapTimestamps, setTapTimestamps] = useState<number[]>([]);

  const getEngine = (): MetronomeEngine => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    if (!engineRef.current) {
      engineRef.current = new MetronomeEngine(audioContextRef.current, {
        bpm,
        beatsPerBar,
        subdivision,
        gapTrainerEnabled,
        gapTrainerFrequency: 4,
      });
      engineRef.current.onBeat = (event) => {
        if (event.stepIndex === 0) {
          setActiveBeat(event.barIndex % beatsPerBar);
        }
      };
    }
    return engineRef.current;
  };

  useEffect(() => {
    engineRef.current?.setOptions({ bpm, beatsPerBar, subdivision, gapTrainerEnabled });
  }, [bpm, beatsPerBar, subdivision, gapTrainerEnabled]);

  useEffect(() => {
    return () => {
      engineRef.current?.stop();
      void audioContextRef.current?.close();
    };
  }, []);

  const toggleStart = () => {
    const engine = getEngine();
    if (isRunning) {
      engine.stop();
    } else {
      engine.start();
    }
    setIsRunning(!isRunning);
  };

  const handleTap = () => {
    const now = performance.now();
    const next = [...tapTimestamps, now].slice(-8);
    setTapTimestamps(next);
    const estimated = calculateTapTempo(next);
    if (estimated) setBpm(estimated);
  };

  return (
    <section className="screen metronome-screen">
      <header className="screen-header">
        <h1>{t.metronome.title}</h1>
      </header>

      <div className="metronome-bpm">
        <Stepper label={t.metronome.bpm} value={bpm} onChange={setBpm} min={30} max={260} step={1} />
      </div>

      <button type="button" className="secondary-button" onClick={handleTap}>
        {t.metronome.tap}
      </button>

      <div className="metronome-row">
        <Stepper label={t.metronome.beatsPerBar} value={beatsPerBar} onChange={setBeatsPerBar} min={1} max={8} />
      </div>

      <div className="metronome-row">
        <span className="field-label">{t.metronome.subdivision}</span>
        <Segmented
          value={subdivision}
          onChange={setSubdivision}
          options={[
            { value: 'quarter', label: t.metronome.quarter },
            { value: 'eighth', label: t.metronome.eighth },
            { value: 'triplet', label: t.metronome.triplet },
            { value: 'sixteenth', label: t.metronome.sixteenth },
          ]}
        />
      </div>

      <div className="metronome-beats">
        {Array.from({ length: beatsPerBar }).map((_, i) => (
          <span key={i} className="metronome-beat-dot" data-active={isRunning && i === activeBeat} />
        ))}
      </div>

      <button type="button" className="primary-button" onClick={toggleStart}>
        {isRunning ? t.metronome.stop : t.metronome.start}
      </button>

      <div className="metronome-row gap-trainer">
        <Switch checked={gapTrainerEnabled} onChange={setGapTrainerEnabled} label={t.metronome.gapTrainer} />
        <p className="screen-hint">{t.metronome.gapTrainerHint}</p>
      </div>
    </section>
  );
}
