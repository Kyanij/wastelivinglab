import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/config';
import LanguageToggle from '../components/layout/LanguageToggle';
import { Leaf, User, Lock, Loader2, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ username: '', password: '', general: '' });

  const validateForm = () => {
    const newErrors = { username: '', password: '', general: '' };
    let isValid = true;

    const trimmedUsername = username.trim();
    const trimmedPassword = password;

    if (!trimmedUsername) {
      newErrors.username = t('auth.errors.usernameRequired');
      isValid = false;
    } else if (trimmedUsername.length < 3) {
      newErrors.username = t('auth.errors.usernameTooShort');
      isValid = false;
    } else if (!/^[a-zA-Z0-9_]+$/.test(trimmedUsername)) {
      newErrors.username = t('auth.errors.usernameInvalid');
      isValid = false;
    }

    if (!trimmedPassword) {
      newErrors.password = t('auth.errors.passwordRequired');
      isValid = false;
    } else if (trimmedPassword.length < 6) {
      newErrors.password = t('auth.errors.passwordTooShort');
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const getFirebaseErrorMessage = (errorCode) => {
    switch (errorCode) {
      case 'auth/user-not-found':
        return t('auth.errors.userNotFound');
      case 'auth/wrong-password':
        return t('auth.errors.wrongPassword');
      case 'auth/invalid-email':
        return t('auth.errors.invalidEmail');
      case 'auth/invalid-credential':
        return t('auth.errors.invalidCredentials');
      case 'auth/too-many-requests':
        return t('auth.errors.tooManyRequests');
      case 'auth/network-request-failed':
        return t('auth.errors.networkError');
      case 'auth/internal-error':
        return t('auth.errors.internalError');
      default:
        return t('auth.errors.loginFailed');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({ username: '', password: '', general: '' });

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const email = username.includes('@') ? username : `${username}@greenchamps.com`;
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (error) {
      const errorCode = error.code;
      const errorMessage = getFirebaseErrorMessage(errorCode);
      setErrors({ ...errors, general: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
    if (errors.username) {
      setErrors({ ...errors, username: '' });
    }
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (errors.password) {
      setErrors({ ...errors, password: '' });
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-green-950 via-green-900 to-emerald-950">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-green-400/10 rounded-full blur-3xl"></div>
      </div>

      {/* Floating leaf decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-20 opacity-20">
          <Leaf className="w-16 h-16 text-green-400 rotate-45" />
        </div>
        <div className="absolute bottom-32 right-24 opacity-15">
          <Leaf className="w-20 h-20 text-emerald-400 -rotate-12" />
        </div>
        <div className="absolute top-1/4 right-1/3 opacity-10">
          <Leaf className="w-12 h-12 text-green-300 rotate-90" />
        </div>
      </div>

      <div className="absolute top-4 right-4 z-10">
        <LanguageToggle />
      </div>

      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
{/* Logo and branding */}
          <div className="text-center mb-8">
            {/* 3 Logos in horizontal row with impressive design */}
            <div className="flex items-center justify-center gap-3 mb-5">
              <div className="relative">
                <img 
                  src="/assests/logo/1.jpeg" 
                  alt="Logo 1" 
                  className="w-16 h-16 rounded-full object-cover border-2 border-white/20 shadow-lg shadow-green-500/20 animate-fadeInUp"
                  style={{ animationDelay: '0ms' }}
                />
                <div className="absolute inset-0 rounded-full ring-2 ring-white/10"></div>
              </div>
              <div className="relative">
                <img 
                  src="/assests/logo/2.jpeg" 
                  alt="Logo 2" 
                  className="w-16 h-16 rounded-full object-cover border-2 border-white/30 shadow-lg shadow-green-500/30 animate-fadeInUp"
                  style={{ animationDelay: '150ms' }}
                />
                <div className="absolute inset-0 rounded-full ring-2 ring-white/20 bg-gradient-to-tr from-green-400/20 to-transparent"></div>
              </div>
              <div className="relative">
                <img 
                  src="/assests/logo/3.jpeg" 
                  alt="Logo 3" 
                  className="w-24 h-auto rounded-lg object-cover border-2 border-white/20 shadow-lg shadow-green-500/20 animate-fadeInUp"
                  style={{ animationDelay: '300ms' }}
                />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Tabungan Sampah Digital</h1>
            <p className="mt-1 text-white/80 text-base">Model School-Based Living Lab</p>
            <p className="text-green-300/70 mt-1 text-sm">{t('auth.adminPanel')}</p>
          </div>

          {/* Login card */}
          <div className="bg-white/5 backdrop-blur-2xl rounded-3xl p-8 border border-white/10 shadow-2xl shadow-black/20">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold text-white">{t('auth.login')}</h2>
              <p className="text-green-300/60 mt-1 text-sm">Enter your credentials to continue</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-green-100/80 mb-2 ml-1">
                  {t('auth.username')}
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-green-400/60">
                    <User className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={handleUsernameChange}
                    placeholder="admin"
                    className={`w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/5 border text-white placeholder-gray-400/50 focus:outline-none focus:ring-2 transition-all ${
                      errors.username
                        ? 'border-red-500/50 focus:ring-red-500/50 focus:border-red-500/50'
                        : 'border-white/10 focus:ring-green-500/50 focus:border-green-500/50'
                    }`}
                  />
                </div>
                {errors.username && (
                  <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.username}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-green-100/80 mb-2 ml-1">
                  {t('auth.password')}
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-green-400/60">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={handlePasswordChange}
                    placeholder="••••••••"
                    className={`w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/5 border text-white placeholder-gray-400/50 focus:outline-none focus:ring-2 transition-all ${
                      errors.password
                        ? 'border-red-500/50 focus:ring-red-500/50 focus:border-red-500/50'
                        : 'border-white/10 focus:ring-green-500/50 focus:border-green-500/50'
                    }`}
                  />
                </div>
                {errors.password && (
                  <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.password}
                  </p>
                )}
              </div>

              {errors.general && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30">
                  <p className="text-sm text-red-400 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {errors.general}
                  </p>
                </div>
              )}
              
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-500/25 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>{t('common.loading')}</span>
                  </>
                ) : (
                  t('auth.signIn')
                )}
              </button>
            </form>
          </div>

          {/* Footer */}
          <p className="text-center text-white tracking-tight  text-sm mt-6">
            Research by Apri Yulda, S.K.M., M.K.M.
          </p>
        </div>
      </div>
    </div>
  );
}