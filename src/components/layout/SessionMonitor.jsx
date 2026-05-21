import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useIdleTimeout } from '../../hooks/useIdleTimeout';
import IdleWarningModal from './IdleWarningModal';

export default function SessionMonitor() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [showIdleWarning, setShowIdleWarning] = useState(false);

  const isStudentPortal = location.pathname === '/';

  const handleLogout = useCallback(() => {
    setShowIdleWarning(false);
    logout();
  }, [logout]);

  const { showWarning } = useIdleTimeout({
    onLogout: handleLogout,
    enabled: !!user && !isStudentPortal,
  });

  useEffect(() => {
    if (showWarning && user && !isStudentPortal) {
      setShowIdleWarning(true);
    }
  }, [showWarning, user, isStudentPortal]);

  const handleStayLoggedIn = useCallback(() => {
    setShowIdleWarning(false);
  }, []);

  return (
    <IdleWarningModal
      show={showIdleWarning}
      onStayLoggedIn={handleStayLoggedIn}
      onLogoutNow={handleLogout}
    />
  );
}