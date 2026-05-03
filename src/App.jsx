import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Router from './router';
import { Toaster } from 'react-hot-toast';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Router />
        <Toaster 
          position="top-right"
          toastOptions={{
            style: {
              background: 'rgba(15, 31, 20, 0.95)',
              color: '#fff',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              backdropFilter: 'blur(16px)',
              borderRadius: '12px',
              padding: '16px',
            },
            success: {
              iconTheme: {
                primary: '#22c55e',
                secondary: '#0f1f14',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#0f1f14',
              },
            },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}