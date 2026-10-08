// src/pages/Auth/AuthPage.jsx
import { useState } from 'react';
import './Auth.css';
import LoginView from './LoginView';
import RegisterView from './RegisterView';
import ForgotPasswordView from './ForgotPasswordView';
import OtpLoginView from './OtpLoginView';

export default function AuthPage() {
  const [currentView, setCurrentView] = useState('login');
  const [registerSuccessEmail, setRegisterSuccessEmail] = useState('');

  const handleRegisterSuccess = (email) => {
    setRegisterSuccessEmail(email);
    setCurrentView('login');
  };

  return (
    <div className="auth-viewport">
      <div className="auth-card">
        <div className="auth-card-inner">
          {currentView === 'login' && (
            <LoginView
              onSwitchToRegister={() => {
                setRegisterSuccessEmail('');
                setCurrentView('register');
              }}
              onSwitchToForgot={() => setCurrentView('forgot')}
              onSwitchToOtp={() => setCurrentView('otp')}
              registerSuccessEmail={registerSuccessEmail}
            />
          )}

          {currentView === 'register' && (
            <RegisterView
              onSwitchToLogin={() => setCurrentView('login')}
              onRegisterSuccess={handleRegisterSuccess}
            />
          )}

          {currentView === 'forgot' && (
            <ForgotPasswordView onSwitchToLogin={() => setCurrentView('login')} />
          )}

          {currentView === 'otp' && (
            <OtpLoginView onSwitchToLogin={() => setCurrentView('login')} />
          )}
        </div>
      </div>
    </div>
  );
}
