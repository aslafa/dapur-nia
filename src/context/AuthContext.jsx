// src/context/AuthContext.jsx
// Centralized auth state: user, isAuthenticated, role, loading

import { createContext, useContext, useState, useEffect } from 'react';
import { authService, ROLE_PERMISSIONS, ROLES } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on mount (persists through refresh)
  useEffect(() => {
    try {
      const activeUser = authService.getCurrentSession();
      if (activeUser) setCurrentUser(activeUser);
    } catch (e) {
      console.error('Failed to restore session:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const user = await authService.loginWithEmail(email, password);
    setCurrentUser(user);
    return user;
  };

  const loginWithGoogle = async () => {
    const user = await authService.loginWithGoogle();
    setCurrentUser(user);
    return user;
  };

  const requestPhoneOtp = async (phoneNumber) => {
    return await authService.requestPhoneOtp(phoneNumber);
  };

  const loginWithPhoneOtp = async (phoneNumber, code, verificationId) => {
    const user = await authService.verifyPhoneOtp(phoneNumber, code, verificationId);
    setCurrentUser(user);
    return user;
  };

  const register = async ({ name, email, password, whatsapp }) => {
    return await authService.register({ name, email, password, whatsapp });
  };

  const requestPasswordReset = async (email) => {
    return await authService.requestPasswordReset(email);
  };

  const logout = () => {
    authService.clearSession();
    setCurrentUser(null);
  };

  // Normalized Role & Access Check
  const role = (currentUser?.role || '').toLowerCase();

  const canAccess = (tab) => {
    if (!currentUser) return false;
    // Home and Profile are universally accessible to all logged-in users regardless of role
    if (tab === 'home' || tab === 'profile') return true;

    const allowed = ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS[ROLES.PELANGGAN];
    return allowed.includes(tab);
  };

  const value = {
    currentUser,
    isAuthenticated: !!currentUser,
    isLoading,
    role,
    canAccess,
    login,
    loginWithGoogle,
    requestPhoneOtp,
    loginWithPhoneOtp,
    register,
    requestPasswordReset,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
