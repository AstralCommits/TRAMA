import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';

/** Keeps one account's workspace data in this browser and avoids overwriting it before hydration. */
export function usePersistentState<T>(
  key: string,
  initialValue: T,
): [T, Dispatch<SetStateAction<T>>, boolean] {
  const [value, setValue] = useState<T>(initialValue);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(key);
      setValue(saved === null ? initialValue : JSON.parse(saved) as T);
    } catch {
      setValue(initialValue);
    } finally {
      setLoaded(true);
    }
  }, [key]);

  useEffect(() => {
    if (!loaded) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // The application remains usable for the current session if storage is unavailable/full.
    }
  }, [key, loaded, value]);

  return [value, setValue, loaded];
}
