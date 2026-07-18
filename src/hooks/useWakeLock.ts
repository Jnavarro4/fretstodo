import { useEffect } from 'react';

/**
 * Mantiene la pantalla encendida mientras `active` sea true.
 * Clave en móvil: que el teléfono no se bloquee en medio de una
 * sesión de práctica o con el metrónomo sonando.
 * Se re-adquiere al volver a la app (iOS lo libera al cambiar de app).
 */
export function useWakeLock(active: boolean): void {
  useEffect(() => {
    if (!active || !('wakeLock' in navigator)) return;

    let sentinel: WakeLockSentinel | null = null;
    let cancelled = false;

    const acquire = async () => {
      try {
        sentinel = await navigator.wakeLock.request('screen');
        if (cancelled) await sentinel.release();
      } catch {
        /* batería baja o no soportado: la app sigue funcionando igual */
      }
    };

    const onVisible = () => {
      if (document.visibilityState === 'visible') void acquire();
    };

    void acquire();
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisible);
      void sentinel?.release().catch(() => {});
    };
  }, [active]);
}
