// src/pages/Auth/LoginView.jsx
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  IconCookingPot,
  IconMail,
  IconLock,
  IconEye,
  IconEyeOff,
  IconGoogle,
  IconPhone,
  IconAlertCircle,
  IconCheck,
} from '../../components/Icons';

export default function LoginView({
  onSwitchToRegister,
  onSwitchToForgot,
  onSwitchToOtp,
  registerSuccessEmail,
}) {
  const { login, loginWithGoogle } = useAuth();

  const [email, setEmail] = useState(registerSuccessEmail || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const validate = () => {
    const errs = {};
    const emailTrim = email.trim();
    if (!emailTrim) {
      errs.email = 'Email wajib diisi.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrim)) {
      errs.email = 'Format email tidak valid.';
    }

    if (!password) {
      errs.password = 'Kata sandi wajib diisi.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setGeneralError('');
    if (isLoading || isGoogleLoading) return;
    if (!validate()) return;

    setIsLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setGeneralError(err.message || 'Email atau kata sandi salah. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGeneralError('');
    if (isLoading || isGoogleLoading) return;
    setIsGoogleLoading(true);
    try {
      await loginWithGoogle();
    } catch (err) {
      setGeneralError(err.message || 'Layanan Google Authentication belum terhubung.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const disabled = isLoading || isGoogleLoading;

  return (
    <>
      {/* Brand */}
      <div className="auth-brand-block">
        <div className="auth-brand-icon-wrap">
          <IconCookingPot size={28} color="#D97706" />
        </div>
        <h1 className="auth-brand-name">Dapur Nia</h1>
        <p className="auth-brand-tagline">Kelola katering lebih mudah.</p>
      </div>

      {/* Register success message */}
      {registerSuccessEmail && (
        <div className="auth-alert auth-alert-success" role="status">
          <IconCheck size={18} color="#16A34A" />
          <div>
            <strong>Akun berhasil dibuat.</strong>
            <br />
            Silakan masuk untuk melanjutkan.
          </div>
        </div>
      )}

      {/* Heading */}
      <div className="auth-section-heading">
        <h2 className="auth-heading">Selamat Datang</h2>
        <p className="auth-subheading">Masuk untuk melanjutkan ke Dapur Nia.</p>
      </div>

      {generalError && (
        <div className="auth-alert auth-alert-error" role="alert">
          <IconAlertCircle size={18} color="#DC2626" />
          <span>{generalError}</span>
        </div>
      )}

      <form onSubmit={handleLogin} noValidate>
        {/* Email */}
        <div className="auth-field-wrap">
          <label className="auth-field-label" htmlFor="login-email">
            Email
          </label>
          <div className="auth-input-wrap">
            <span className="auth-input-icon">
              <IconMail size={18} />
            </span>
            <input
              id="login-email"
              type="email"
              className={`auth-input${errors.email ? ' is-error' : ''}`}
              placeholder="Masukkan email Anda"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((p) => ({ ...p, email: '' }));
              }}
              disabled={disabled}
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

        {/* Password */}
        <div className="auth-field-wrap">
          <div className="auth-field-label-row">
            <label className="auth-field-label" htmlFor="login-password">
              Password
            </label>
            <button
              type="button"
              className="auth-forgot-link"
              onClick={onSwitchToForgot}
              disabled={disabled}
            >
              Lupa password?
            </button>
          </div>
          <div className="auth-input-wrap">
            <span className="auth-input-icon">
              <IconLock size={18} />
            </span>
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              className={`auth-input has-toggle${errors.password ? ' is-error' : ''}`}
              placeholder="Masukkan password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors((p) => ({ ...p, password: '' }));
              }}
              disabled={disabled}
              autoComplete="current-password"
            />
            <button
              type="button"
              className="auth-password-toggle"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
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
        </div>

        {/* Submit */}
        <button type="submit" className="auth-btn-primary" disabled={disabled}>
          {isLoading ? (
            <>
              <div className="auth-spinner" />
              <span>Memproses...</span>
            </>
          ) : (
            <span>Masuk</span>
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="auth-divider">
        <span>atau</span>
      </div>

      {/* Google */}
      <button
        type="button"
        className="auth-btn-google"
        onClick={handleGoogleLogin}
        disabled={disabled}
      >
        {isGoogleLoading ? (
          <>
            <div className="auth-spinner auth-spinner-dark" />
            <span>Memproses...</span>
          </>
        ) : (
          <>
            <IconGoogle size={18} />
            <span>Masuk dengan Google</span>
          </>
        )}
      </button>

      {/* HP & OTP */}
      <button
        type="button"
        className="auth-btn-alt"
        onClick={onSwitchToOtp}
        disabled={disabled}
      >
        <IconPhone size={17} />
        <span>Masuk dengan Nomor HP</span>
      </button>

      {/* Register link */}
      <div className="auth-footer">
        Belum punya akun?{' '}
        <button
          type="button"
          className="auth-link"
          onClick={onSwitchToRegister}
          disabled={disabled}
        >
          Daftar sekarang
        </button>
      </div>
    </>
  );
}
