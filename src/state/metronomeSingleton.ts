import { Metronome } from '../engine/metronome';

/**
 * Instancia única del metrónomo a nivel de app.
 * Antes vivía dentro de la pantalla y se destruía al cambiar de tab,
 * cortando el click a mitad de práctica. Ahora sigue sonando y la
 * pantalla solo se "engancha" a él cuando está visible.
 */
let instance: Metronome | null = null;

export function getMetronome(): Metronome {
  if (!instance) instance = new Metronome();
  return instance;
}
