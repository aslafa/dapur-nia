// src/pages/Auth/ForgotPasswordView.jsx
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  IconCookingPot,
  IconMail,
  IconAlertCircle,
  IconCheckCircle,
  IconArrowLeft,
} from '../../components/Icons';

export default function ForgotPasswordView({ onSwitchToLogin }) {
  const { requestPasswordReset } = useAuth();

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [sentEmail, setSentEmail] = useState('');

  const handleReset = async (e) => {
    e.preventDefault();
    setError('');

    const emailTrim = email.trim();
    if (!emailTrim) { setError('Email wajib diisi'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrim)) { setError('Format email tidak valid'); return; }

    setIsLoading(true);
    try {
      await requestPasswordReset(emailTrim);
      setSentEmail(emailTrim);
      setIsSubmitted(true);
    } catch (err) {
      setError(err.message || 'Gagal mengirim instruksi reset kata sandi.');
    } finally {
      setIsLoading(false);
    }
  };

  // SUCCESS STATE
  if (isSubmitted) {
    return (
      <div className="auth-success-card">
        <div className="auth-success-icon">
          <IconCheckCircle size={36} color="#22C55E" />
        </div>
        <h2 className="auth-success-title">Link Reset Terkirim!</h2>
        <p className="auth-success-desc">
          Instruksi pemulihan kata sandi telah dikirim ke{' '}
          <strong>{sentEmail}</strong>.<br />
          Periksa kotak masuk atau folder spam Anda.
        </p>
        <button type="button" className="auth-btn-primary" onClick={onSwitchToLogin}>
          Kembali ke Login
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Back */}
      <button type="button" className="auth-forgot-link"
        style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 16, fontSize: 13 }}
        onClick={onSwitchToLogin} disabled={isLoading}>
        <IconArrowLeft size={15} /><span>Kembali ke Login</span>
      </button>

      {/* Brand */}
      <div className="auth-brand-block" style={{ marginBottom: 16 }}>
        <div className="auth-brand-icon-wrap">
          <IconCookingPot size={28} color="#D97706" />
        </div>
        <h1 className="auth-brand-name">Lupa Password?</h1>
        <p className="auth-brand-tagline">Kami bantu reset kata sandi Anda.</p>
      </div>

      <div className="auth-section-heading">
        <p className="auth-subheading">
          Masukkan email akun Anda untuk menerima instruksi reset password.
        </p>
      </div>

      {error && (
        <div className="auth-alert auth-alert-error" role="alert">
          <IconAlertCircle size={17} color="#B91C1C" /><span>{error}</span>
        </div>
      )}

      <form onSubmit={handleReset} noValidate>
        <div className="auth-field-wrap">
          <label className="auth-field-label" htmlFor="forgot-email">Email</label>
          <div className="auth-input-wrap">
            <span className="auth-input-icon"><IconMail size={17} /></span>
            <input
              id="forgot-email"
              type="email"
              className={`auth-input${error ? ' is-error' : ''}`}
              placeholder="nama@email.com"
              value={email}
              onChange={e => { setEmail(e.target.value); if (error) setError(''); }}
              disabled={isLoading}
              autoComplete="email"
            />
          </div>
        </div>

        <button type="submit" className="auth-btn-primary" disabled={isLoading}>
          {isLoading
            ? <><div className="auth-spinner" /><span>Mengirimkan...</span></>
            : <span>Kirim Link Reset</span>}
        </button>
      </form>
    </>
  );
}
