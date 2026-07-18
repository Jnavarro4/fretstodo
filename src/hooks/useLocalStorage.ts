import { useEffect, useState } from 'react';

/**
 * Estado React persistido en localStorage.
 * Fallos de lectura/escritura (Safari en privado, cuota) degradan a memoria.
 */
export function useLocalStorage<T>(key: string, initial: T | (() => T)) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw !== null) return JSON.parse(raw) as T;
    } catch {
      /* ignorar y usar el valor inicial */
    }
    return typeof initial === 'function' ? (initial as () => T)() : initial;
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* modo privado o cuota llena: seguir en memoria */
    }
  }, [key, value]);

  return [value, setValue] as const;
}
