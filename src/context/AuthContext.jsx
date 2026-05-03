import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../firebase/config';
import { useIdleTimeout } from '../hooks/useIdleTimeout';
import IdleWarningModal from '../components/layout/IdleWarningModal';

const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showIdleWarning, setShowIdleWarning] = useState(false);
  const warningShownRef = useRef(false);

  const logout = useCallback(() => {
    signOut(auth);
    setUser(null);
    setShowIdleWarning(false);
    warningShownRef.current = false;
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const { showWarning } = useIdleTimeout({
    onLogout: logout
  });

  useEffect(() => {
    if (showWarning.current && user && !warningShownRef.current) {
      warningShownRef.current = true;
      setShowIdleWarning(true);
    }
  }, [showWarning, user]);

  const handleStayLoggedIn = useCallback(() => {
    setShowIdleWarning(false);
    warningShownRef.current = false;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
      <IdleWarningModal
        show={showIdleWarning}
        onStayLoggedIn={handleStayLoggedIn}
        onLogoutNow={logout}
      />
    </AuthContext.Provider>
  );
}