import { useState } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = window.localStorage.getItem(key);
      return stored !== null ? (JSON.parse(stored) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const update = (next: T | ((prev: T) => T)) => {
    setValue((prev) => {
      const resolved = next instanceof Function ? next(prev) : next;
      window.localStorage.setItem(key, JSON.stringify(resolved));
      return resolved;
    });
  };

  return [value, update] as const;
}
