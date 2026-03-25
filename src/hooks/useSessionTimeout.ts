'use client';

import { useEffect, useCallback } from 'react';

const INACTIVITY_LIMIT_MS = 60 * 60 * 1000; // 1 hour

const ACTIVITY_EVENTS = [
  'mousedown',
  'mousemove',
  'keydown',
  'scroll',
  'touchstart',
  'click',
] as const;

/**
 * Calls onTimeout after INACTIVITY_LIMIT_MS of user inactivity.
 * Resets the timer on any user interaction.
 *
 * Usage:
 *   useSessionTimeout(() => {
 *     signOut({ callbackUrl: '/auth/login?reason=timeout' });
 *   });
 */
export function useSessionTimeout(onTimeout: () => void): void {
  const stableCallback = useCallback(onTimeout, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    const reset = () => {
      clearTimeout(timer);
      timer = setTimeout(stableCallback, INACTIVITY_LIMIT_MS);
    };

    ACTIVITY_EVENTS.forEach((event) => window.addEventListener(event, reset, { passive: true }));
    reset(); // start timer immediately

    return () => {
      clearTimeout(timer);
      ACTIVITY_EVENTS.forEach((event) => window.removeEventListener(event, reset));
    };
  }, [stableCallback]);
}
