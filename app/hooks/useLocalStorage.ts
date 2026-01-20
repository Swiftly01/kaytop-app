"use client";
import { useEffect, useState } from "react";

export function useLocalStorageState<T>(initialState: T, key: string) {
  const [value, setValue] = useState<T | null>(initialState);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Only run on client-side after hydration
    setIsHydrated(true);
    const storedValue = localStorage.getItem(key);
    if (storedValue) {
      setValue(JSON.parse(storedValue));
    }
  }, [key]);

  useEffect(
    function () {
      if (!isHydrated) return; // Don't update localStorage until hydrated
      if (value === null || value === undefined) {
        return localStorage.removeItem(key);
      }
      localStorage.setItem(key, JSON.stringify(value));
    },
    [value, key, isHydrated]
  );

  const remove = () => {
    setValue(null);
  }

  return [value, setValue, remove] as const;
}
