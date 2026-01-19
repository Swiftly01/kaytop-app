"use client";
import { useEffect, useState } from "react";

export function useLocalStorageState<T>(initialState: T, key: string) {
  const [value, setValue] = useState<T>(initialState);
  const [isClient, setIsClient] = useState(false);

  // Set isClient to true after component mounts
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load from localStorage only after client-side hydration
  useEffect(() => {
    if (isClient) {
      const storedValue = localStorage.getItem(key);
      if (storedValue) {
        try {
          setValue(JSON.parse(storedValue));
        } catch (error) {
          console.error(`Error parsing localStorage value for key "${key}":`, error);
        }
      }
    }
  }, [isClient, key]);

  useEffect(() => {
    if (isClient) {
      if (value === null || value === undefined) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, JSON.stringify(value));
      }
    }
  }, [value, key, isClient]);

  const remove = () => {
    setValue(initialState);
  };

  return [value, setValue, remove] as const;
}
