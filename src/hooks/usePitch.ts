import { useEffect, useRef, useState } from 'react';
import { autoCorrelate, midiFromFrequency } from '../engine/tunerEngine';

export type PitchState = 'idle' | 'listening' | 'denied';

export interface DetectedPitch {
  midi: number;
  cents: number;
  frequency: number;
}

/**
 * Escucha el micrófono y reporta la nota MIDI que está sonando.
 * Con confirmación de 2 frames seguidos para evitar falsos positivos,
 * y limpieza a null tras ~250 ms de silencio.
 */
export function usePitch(active: boolean): { state: PitchState; pitch: DetectedPitch | null } {
  const [state, setState] = useState<PitchState>('idle');
  const [pitch, setPitch] = useState<DetectedPitch | null>(null);

  const ctxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef(0);
  const candidateRef = useRef<{ midi: number; frames: number }>({ midi: -1, frames: 0 });
  const lastHeardRef = useRef(0);
  const reportedRef = useRef<number | null>(null);

  useEffect(() => {
    if (!active) {
      setState('idle');
      setPitch(null);
      return;
    }

    let cancelled = false;

    const start = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
        });
        if (cancelled) {
          stream.getTracks().forEach((tr) => tr.stop());
          return;
        }
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
          const now = performance.now();

          if (freq > 0) {
            const { midi, cents } = midiFromFrequency(freq);
            lastHeardRef.current = now;
            const cand = candidateRef.current;
            if (cand.midi === midi) {
              cand.frames++;
            } else {
              candidateRef.current = { midi, frames: 1 };
            }
            // 2 frames seguidos con la misma nota → confirmada
            if (candidateRef.current.frames >= 2 && reportedRef.current !== midi) {
              reportedRef.current = midi;
              setPitch({ midi, cents, frequency: freq });
            }
          } else if (now - lastHeardRef.current > 250 && reportedRef.current !== null) {
            reportedRef.current = null;
            candidateRef.current = { midi: -1, frames: 0 };
            setPitch(null);
          }
          rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
      } catch {
        if (!cancelled) setState('denied');
      }
    };

    void start();

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach((tr) => tr.stop());
      streamRef.current = null;
      void ctxRef.current?.close();
      ctxRef.current = null;
      reportedRef.current = null;
      candidateRef.current = { midi: -1, frames: 0 };
    };
  }, [active]);

  return { state, pitch };
}
