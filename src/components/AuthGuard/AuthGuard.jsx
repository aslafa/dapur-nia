// src/components/AuthGuard/AuthGuard.jsx
// Protects the app: shows AuthPage for unauthenticated users, loading screen on session restore.

import { useAuth } from '../../context/AuthContext';
import AuthPage from '../../pages/Auth/AuthPage';
import { IconCookingPot } from '../Icons';
import '../../pages/Auth/Auth.css';

export default function AuthGuard({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="auth-viewport" style={{ flexDirection: 'column', gap: 12 }}>
        <div className="auth-brand-icon-wrap">
          <IconCookingPot size={30} color="#D97706" />
        </div>
        <div style={{ fontWeight: 800, fontSize: 18, color: '#292524', letterSpacing: '-0.3px' }}>
          Dapur Nia
        </div>
        <div style={{ fontSize: 12.5, color: '#78716C', fontWeight: 500 }}>
          Memeriksa sesi login...
        </div>
        <div
          className="auth-spinner"
          style={{ marginTop: 8, borderTopColor: '#F59E0B', width: 22, height: 22 }}
        />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return children;
}
