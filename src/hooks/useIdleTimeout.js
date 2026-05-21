import { useEffect, useRef, useCallback, useState } from 'react';
import { IDLE_TIMEOUT_MINUTES, WARNING_MINUTES_BEFORE } from '../constants/config';

export function useIdleTimeout({ onLogout, enabled = true }) {
  const totalTimeout = IDLE_TIMEOUT_MINUTES * 60 * 1000;
  const warningTimeout = WARNING_MINUTES_BEFORE * 60 * 1000;
  const idleTimerRef = useRef(null);
  const warningTimerRef = useRef(null);
  const [showWarning, setShowWarning] = useState(false);
  const isWarningActive = useRef(false);

  const clearAllTimers = useCallback(() => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
      warningTimerRef.current = null;
    }
  }, []);

  const startIdleTimer = useCallback(() => {
    clearAllTimers();
    setShowWarning(false);
    isWarningActive.current = false;
    idleTimerRef.current = setTimeout(() => {
      setShowWarning(true);
      isWarningActive.current = true;
      warningTimerRef.current = setTimeout(() => {
        onLogout?.();
      }, warningTimeout);
    }, totalTimeout - warningTimeout);
  }, [totalTimeout, warningTimeout, onLogout, clearAllTimers]);

  const cancelWarning = useCallback(() => {
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
      warningTimerRef.current = null;
    }
    setShowWarning(false);
    isWarningActive.current = false;
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const handleActivity = () => {
      if (isWarningActive.current) {
        cancelWarning();
      }
      startIdleTimer();
    };

    const events = ['mousemove', 'mousedown', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    startIdleTimer();

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
      clearAllTimers();
    };
  }, [enabled, startIdleTimer, cancelWarning, clearAllTimers]);

  return { showWarning, resetTimers: startIdleTimer, cancelWarning };
}