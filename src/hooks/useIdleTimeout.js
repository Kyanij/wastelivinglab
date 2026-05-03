import { useEffect, useRef, useCallback } from 'react';
import { IDLE_TIMEOUT_MINUTES, WARNING_MINUTES_BEFORE } from '../constants/config';

export function useIdleTimeout({ onLogout }) {
  const totalTimeout = IDLE_TIMEOUT_MINUTES * 60 * 1000;
  const warningTimeout = WARNING_MINUTES_BEFORE * 60 * 1000;
  const idleTimerRef = useRef(null);
  const warningTimerRef = useRef(null);
  const showWarningRef = useRef(false);

  const resetTimers = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    showWarningRef.current = false;

    idleTimerRef.current = setTimeout(() => {
      showWarningRef.current = true;
      warningTimerRef.current = setTimeout(() => {
        onLogout?.();
      }, warningTimeout);
    }, totalTimeout - warningTimeout);
  }, [totalTimeout, warningTimeout, onLogout]);

  const cancelWarning = useCallback(() => {
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    showWarningRef.current = false;
  }, []);

  useEffect(() => {
    const events = ['mousemove', 'mousedown', 'keypress', 'scroll', 'touchstart'];
    const handleActivity = () => {
      if (showWarningRef.current) {
        cancelWarning();
      }
      resetTimers();
    };

    events.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    resetTimers();

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    };
  }, [resetTimers, cancelWarning]);

  return { showWarning: showWarningRef, resetTimers, cancelWarning };
}