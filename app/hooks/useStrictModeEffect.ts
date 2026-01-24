import { useEffect, useRef } from 'react';

/**
 * Custom hook to prevent double execution in React Strict Mode
 * Only runs the effect once, even in development mode
 */
export function useStrictModeEffect(effect: () => void | (() => void), deps?: React.DependencyList) {
  const hasRun = useRef(false);
  const cleanup = useRef<(() => void) | void>();

  useEffect(() => {
    // In React Strict Mode, effects run twice in development
    // This hook ensures the effect only runs once
    if (hasRun.current) {
      return cleanup.current;
    }

    hasRun.current = true;
    cleanup.current = effect();

    return () => {
      if (cleanup.current) {
        cleanup.current();
      }
      // Reset for next mount
      hasRun.current = false;
    };
  }, deps);
}