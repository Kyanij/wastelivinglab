import { useEffect, useRef, useCallback, useState } from 'react';
import { IDLE_TIMEOUT_MINUTES, WARNING_MINUTES_BEFORE } from '../constants/config';

export function useIdleTimeout({ onLogout, enabled = true }) {
  const totalTimeout = IDLE_TIMEOUT_MINUTES * 60 * 1000;
  const warningTimeout = WARNING_MINUTES_BEFORE * 60 * 1000;
  const idleTimerRef = useRef(null);
  const warningTimerRef = useRef(null);
  const [showWarning, setShowWarning] = useState(false);

  const resetTimers = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    setShowWarning(false);

    idleTimerRef.current = setTimeout(() => {
      setShowWarning(true);
      warningTimerRef.current = setTimeout(() => {
        onLogout?.();
      }, warningTimeout);
    }, totalTimeout - warningTimeout);
  }, [totalTimeout, warningTimeout, onLogout]);

  const cancelWarning = useCallback(() => {
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    setShowWarning(false);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const events = ['mousemove', 'mousedown', 'keypress', 'scroll', 'touchstart'];
    const handleActivity = () => {
      if (showWarning) {
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
  }, [enabled, showWarning, resetTimers, cancelWarning]);

  return { showWarning, resetTimers, cancelWarning };
}