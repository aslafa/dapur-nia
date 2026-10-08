// src/pages/Auth/RegisterView.jsx
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { checkPasswordStrength } from '../../services/authService';
import {
  IconCookingPot,
  IconUserRound,
  IconMail,
  IconLock,
  IconEye,
  IconEyeOff,
  IconPhone,
  IconAlertCircle,
  IconArrowLeft,
  IconCheck,
} from '../../components/Icons';

function CheckMark({ passed }) {
  return (
    <span className="auth-check-dot">
      {passed && (
        <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
          <path
            d="M1 3L3 5L7 1"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </span>
  );
}

const RULES = [
  { key: 'minLength', label: 'Minimal 8 karakter' },
  { key: 'hasUppercase', label: 'Huruf besar' },
  { key: 'hasLowercase', label: 'Huruf kecil' },
  { key: 'hasNumber', label: 'Angka' },
];

const STRENGTH_META = {
  lemah: { label: 'Belum Memenuhi', fillClass: 'auth-strength-fill-lemah' },
  sedang: { label: 'Hampir Memenuhi', fillClass: 'auth-strength-fill-sedang' },
  kuat: { label: 'Memenuhi Syarat', fillClass: 'auth-strength-fill-kuat' },
};

export default function RegisterView({ onSwitchToLogin, onRegisterSuccess }) {
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pwTouched, setPwTouched] = useState(false);

  const pwStrength = checkPasswordStrength(password);

  const validate = () => {
    const errs = {};
    if (!name.trim() || name.trim().length < 2) {
      errs.name = 'Nama lengkap wajib diisi minimal 2 karakter.';
    }

    const emailTrim = email.trim();
    if (!emailTrim) {
      errs.email = 'Email wajib diisi.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrim)) {
      errs.email = 'Format email tidak valid.';
    }

    if (!whatsapp.trim()) {
      errs.whatsapp = 'Nomor WhatsApp wajib diisi.';
    } else if (!/^[\d\s\-+()]{9,15}$/.test(whatsapp.trim())) {
      errs.whatsapp = 'Nomor WhatsApp tidak valid.';
    }

    if (!password) {
      errs.password = 'Kata sandi wajib diisi.';
    } else if (!pwStrength.isValid) {
      errs.password = 'Password belum memenuhi persyaratan.';
    }

    if (!confirmPassword) {
      errs.confirmPassword = 'Konfirmasi password wajib diisi.';
    } else if (confirmPassword !== password) {
      errs.confirmPassword = 'Password belum sama.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setGeneralError('');
    setPwTouched(true);
    if (isLoading) return;
    if (!validate()) return;

    setIsLoading(true);
    try {
      const result = await register({
        name: name.trim(),
        email: email.trim(),
        password,
        whatsapp: whatsapp.trim(),
      });
      if (result?.success) {
        onRegisterSuccess(result.email);
      }
    } catch (err) {
      setGeneralError(err.message || 'Gagal mendaftar. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const strengthMeta = STRENGTH_META[pwStrength.strength];

  return (
    <>
      {/* Back button */}
      <button
        type="button"
        className="auth-forgot-link"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          marginBottom: 16,
          fontSize: 13,
        }}
        onClick={onSwitchToLogin}
        disabled={isLoading}
      >
        <IconArrowLeft size={16} />
        <span>Kembali ke Login</span>
      </button>

      {/* Brand */}
      <div className="auth-brand-block" style={{ marginBottom: 16 }}>
        <div className="auth-brand-icon-wrap">
          <IconCookingPot size={28} color="#D97706" />
        </div>
        <h1 className="auth-brand-name">Daftar Akun</h1>
        <p className="auth-brand-tagline">Bergabung dengan Dapur Nia.</p>
      </div>

      {generalError && (
        <div className="auth-alert auth-alert-error" role="alert">
          <IconAlertCircle size={18} color="#DC2626" />
          <span>{generalError}</span>
        </div>
      )}

      <form onSubmit={handleRegister} noValidate>
        {/* Nama Lengkap */}
        <div className="auth-field-wrap">
          <label className="auth-field-label" htmlFor="reg-name">
            Nama
          </label>
          <div className="auth-input-wrap">
            <span className="auth-input-icon">
              <IconUserRound size={18} />
            </span>
            <input
              id="reg-name"
              type="text"
              className={`auth-input${errors.name ? ' is-error' : ''}`}
              placeholder="Masukkan nama lengkap Anda"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((p) => ({ ...p, name: '' }));
              }}
              disabled={isLoading}
              autoComplete="name"
            />
          </div>
          {errors.name && (
            <div className="auth-error-text">
              <IconAlertCircle size={13} />
              <span>{errors.name}</span>
            </div>
          )}
        </div>

        {/* Email */}
        <div className="auth-field-wrap">
          <label className="auth-field-label" htmlFor="reg-email">
            Email
          </label>
          <div className="auth-input-wrap">
            <span className="auth-input-icon">
              <IconMail size={18} />
            </span>
            <input
              id="reg-email"
              type="email"
              className={`auth-input${errors.email ? ' is-error' : ''}`}
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((p) => ({ ...p, email: '' }));
              }}
              disabled={isLoading}
              autoComplete="email"
            />
          </div>
          {errors.email && (
            <div className="auth-error-text">
              <IconAlertCircle size={13} />
              <span>{errors.email}</span>
            </div>
          )}
        </div>

        {/* WhatsApp */}
        <div className="auth-field-wrap">
          <label className="auth-field-label" htmlFor="reg-wa">
            Nomor WhatsApp
          </label>
          <div className="auth-input-wrap">
            <span className="auth-input-icon">
              <IconPhone size={18} />
            </span>
            <input
              id="reg-wa"
              type="tel"
              className={`auth-input${errors.whatsapp ? ' is-error' : ''}`}
              placeholder="08xxxxxxxxxx"
              value={whatsapp}
              onChange={(e) => {
                setWhatsapp(e.target.value);
                if (errors.whatsapp) setErrors((p) => ({ ...p, whatsapp: '' }));
              }}
              disabled={isLoading}
              autoComplete="tel"
            />
          </div>
          {errors.whatsapp && (
            <div className="auth-error-text">
              <IconAlertCircle size={13} />
              <span>{errors.whatsapp}</span>
            </div>
          )}
        </div>

        {/* Password */}
        <div className="auth-field-wrap">
          <label className="auth-field-label" htmlFor="reg-password">
            Password
          </label>
          <div className="auth-input-wrap">
            <span className="auth-input-icon">
              <IconLock size={18} />
            </span>
            <input
              id="reg-password"
              type={showPassword ? 'text' : 'password'}
              className={`auth-input has-toggle${errors.password ? ' is-error' : ''}`}
              placeholder="Contoh: DapurNia8"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setPwTouched(true);
                if (errors.password) setErrors((p) => ({ ...p, password: '' }));
              }}
              disabled={isLoading}
              autoComplete="new-password"
            />
            <button
              type="button"
              className="auth-password-toggle"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? 'Sembunyikan' : 'Tampilkan'}
            >
              {showPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
            </button>
          </div>
          {errors.password && (
            <div className="auth-error-text">
              <IconAlertCircle size={13} />
              <span>{errors.password}</span>
            </div>
          )}

          {/* Realtime checklist for Poin 9 */}
          {pwTouched && (
            <div className="auth-strength-bar-wrap">
              <div className="auth-strength-bar-track">
                <div className={`auth-strength-bar-fill ${strengthMeta.fillClass}`} />
              </div>
              <div className={`auth-strength-label ${pwStrength.strength}`}>
                Kategori: {strengthMeta.label}
              </div>
              <div className="auth-checklist">
                {RULES.map((r) => (
                  <div
                    key={r.key}
                    className={`auth-check-item${pwStrength.checks[r.key] ? ' passed' : ''}`}
                  >
                    <CheckMark passed={pwStrength.checks[r.key]} />
                    <span>✓ {r.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Konfirmasi Password */}
        <div className="auth-field-wrap">
          <label className="auth-field-label" htmlFor="reg-confirm">
            Konfirmasi Password
          </label>
          <div className="auth-input-wrap">
            <span className="auth-input-icon">
              <IconLock size={18} />
            </span>
            <input
              id="reg-confirm"
              type={showConfirm ? 'text' : 'password'}
              className={`auth-input has-toggle${errors.confirmPassword ? ' is-error' : ''}`}
              placeholder="Ulangi password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (errors.confirmPassword)
                  setErrors((p) => ({ ...p, confirmPassword: '' }));
              }}
              disabled={isLoading}
              autoComplete="new-password"
            />
            <button
              type="button"
              className="auth-password-toggle"
              onClick={() => setShowConfirm((s) => !s)}
              aria-label={showConfirm ? 'Sembunyikan' : 'Tampilkan'}
            >
              {showConfirm ? <IconEyeOff size={18} /> : <IconEye size={18} />}
            </button>
          </div>
          {errors.confirmPassword && (
            <div className="auth-error-text">
              <IconAlertCircle size={13} />
              <span>{errors.confirmPassword}</span>
            </div>
          )}
          {!errors.confirmPassword &&
            confirmPassword &&
            confirmPassword === password && (
              <div className="auth-error-text" style={{ color: '#16A34A' }}>
                <IconCheck size={13} />
                <span>Password cocok</span>
              </div>
            )}
        </div>

        {/* Submit */}
        <button type="submit" className="auth-btn-primary" disabled={isLoading}>
          {isLoading ? (
            <>
              <div className="auth-spinner" />
              <span>Memproses...</span>
            </>
          ) : (
            <span>Daftar</span>
          )}
        </button>
      </form>

      {/* Login link */}
      <div className="auth-footer">
        Sudah punya akun?{' '}
        <button
          type="button"
          className="auth-link"
          onClick={onSwitchToLogin}
          disabled={isLoading}
        >
          Masuk
        </button>
      </div>
    </>
  );
}
