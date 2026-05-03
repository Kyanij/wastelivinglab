import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, LogOut } from 'lucide-react';

export default function IdleWarningModal({ show, onStayLoggedIn, onLogoutNow }) {
  const { t } = useTranslation();
  const [countdown, setCountdown] = useState(120);

  useEffect(() => {
    if (!show) return;
    setCountdown(120);
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [show]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 text-center">
        <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-amber-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {t('idleWarning.title', 'Session Expiring')}
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          {t('idleWarning.message', 'You will be logged out due to inactivity.')}
        </p>
        <div className="text-4xl font-bold text-amber-600 mb-6">
          {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}
        </div>
        <div className="flex gap-3">
          <button
            onClick={onLogoutNow}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            {t('idleWarning.logout', 'Logout')}
          </button>
          <button
            onClick={onStayLoggedIn}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors"
          >
            {t('idleWarning.stayLoggedIn', 'Stay Logged In')}
          </button>
        </div>
      </div>
    </div>
  );
}