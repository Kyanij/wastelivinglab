import { createContext, useContext, useState, useEffect, useCallback } from 'react';
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

  const logout = useCallback(() => {
    signOut(auth);
    setUser(null);
    setShowIdleWarning(false);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const { showWarning } = useIdleTimeout({
    onLogout: logout,
    enabled: !!user
  });

  useEffect(() => {
    if (showWarning && user) {
      setShowIdleWarning(true);
    }
  }, [showWarning, user]);

  const handleStayLoggedIn = useCallback(() => {
    setShowIdleWarning(false);
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