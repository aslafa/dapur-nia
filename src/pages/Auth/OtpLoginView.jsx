// src/pages/Auth/OtpLoginView.jsx
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  IconCookingPot,
  IconPhone,
  IconShieldCheck,
  IconAlertCircle,
  IconArrowLeft,
} from '../../components/Icons';

export default function OtpLoginView({ onSwitchToLogin }) {
  const { requestPhoneOtp, loginWithPhoneOtp } = useAuth();

  const [step, setStep] = useState('phone'); // 'phone' | 'otp'
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [verificationId, setVerificationId] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const digitInputRefs = useRef([]);

  // Countdown timer
  useEffect(() => {
    let timer = null;
    if (step === 'otp' && countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) { setCanResend(true); return 0; }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (timer) clearInterval(timer); };
  }, [step, countdown]);

  const handleRequestOtp = async (e) => {
    if (e) e.preventDefault();
    setError('');

    const raw = phoneNumber.replace(/[\s\-()+]/g, '');
    if (!raw) { setError('Nomor HP wajib diisi'); return; }
    if (raw.length < 9 || !/^[0-9]+$/.test(raw)) {
      setError('Nomor HP tidak valid (contoh: 081234567890)');
      return;
    }

    setIsLoading(true);
    try {
      const res = await requestPhoneOtp(raw);
      setVerificationId(res.verificationId);
      setStep('otp');
      setCountdown(60);
      setCanResend(false);
      setOtpDigits(['', '', '', '', '', '']);
      setTimeout(() => { if (digitInputRefs.current[0]) digitInputRefs.current[0].focus(); }, 100);
    } catch (err) {
      setError(err.message || 'Gagal meminta kode OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDigitChange = (index, value) => {
    const cleaned = value.replace(/\D/g, '');
    if (!cleaned && value !== '') return;

    const newDigits = [...otpDigits];
    if (cleaned.length > 1) {
      // Paste support
      cleaned.slice(0, 6).split('').forEach((ch, i) => { if (i < 6) newDigits[i] = ch; });
      setOtpDigits(newDigits);
      const nextFocus = Math.min(cleaned.length, 5);
      if (digitInputRefs.current[nextFocus]) digitInputRefs.current[nextFocus].focus();
      return;
    }

    newDigits[index] = cleaned;
    setOtpDigits(newDigits);
    setError('');

    if (cleaned && index < 5 && digitInputRefs.current[index + 1]) {
      digitInputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      if (digitInputRefs.current[index - 1]) digitInputRefs.current[index - 1].focus();
    }
  };

  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    setError('');

    const fullCode = otpDigits.join('');
    if (fullCode.length !== 6) { setError('Masukkan 6 digit kode OTP'); return; }

    setIsLoading(true);
    try {
      await loginWithPhoneOtp(phoneNumber, fullCode, verificationId);
    } catch (err) {
      setError(err.message || 'Verifikasi OTP gagal.');
    } finally {
      setIsLoading(false);
    }
  };

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
        <h1 className="auth-brand-name">
          {step === 'phone' ? 'Masuk dengan Nomor HP' : 'Verifikasi OTP'}
        </h1>
        <p className="auth-brand-tagline">
          {step === 'phone'
            ? 'Masukkan nomor HP aktif Anda.'
            : `Kode OTP dikirim ke ${phoneNumber}`}
        </p>
      </div>

      {error && (
        <div className="auth-alert auth-alert-error" role="alert">
          <IconAlertCircle size={17} color="#B91C1C" /><span>{error}</span>
        </div>
      )}

      {/* STEP 1: PHONE */}
      {step === 'phone' && (
        <form onSubmit={handleRequestOtp} noValidate>
          <div className="auth-field-wrap">
            <label className="auth-field-label" htmlFor="otp-phone">Nomor HP (WhatsApp)</label>
            <div className="auth-input-wrap">
              <span className="auth-input-icon"><IconPhone size={17} /></span>
              <input
                id="otp-phone"
                type="tel"
                className={`auth-input${error ? ' is-error' : ''}`}
                placeholder="08xxxxxxxxxx"
                value={phoneNumber}
                onChange={e => { setPhoneNumber(e.target.value); if (error) setError(''); }}
                disabled={isLoading}
                autoComplete="tel"
              />
            </div>
          </div>

          <div className="auth-alert auth-alert-info" style={{ marginBottom: 16 }}>
            <IconShieldCheck size={17} color="#92400E" style={{ flexShrink: 0 }} />
            <span>
              <strong>Auth-Ready:</strong> Antarmuka ini siap terhubung dengan SMS/WhatsApp OTP Provider.
            </span>
          </div>

          <button type="submit" className="auth-btn-primary" disabled={isLoading}>
            {isLoading
              ? <><div className="auth-spinner" /><span>Menghubungkan...</span></>
              : <span>Kirim Kode OTP</span>}
          </button>
        </form>
      )}

      {/* STEP 2: OTP DIGITS */}
      {step === 'otp' && (
        <form onSubmit={handleVerifyOtp} noValidate>
          <div className="otp-inputs-row">
            {otpDigits.map((digit, idx) => (
              <input
                key={idx}
                ref={el => (digitInputRefs.current[idx] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                className={`otp-digit-box${digit ? ' filled' : ''}`}
                value={digit}
                onChange={e => handleDigitChange(idx, e.target.value)}
                onKeyDown={e => handleKeyDown(idx, e)}
                disabled={isLoading}
                aria-label={`Digit OTP ke-${idx + 1}`}
              />
            ))}
          </div>

          {/* Countdown & Resend */}
          <div className="otp-timer">
            {countdown > 0 ? (
              <span>Kirim ulang dalam <strong>{countdown} detik</strong></span>
            ) : (
              <span>
                Tidak menerima kode?{' '}
                <button type="button" className="otp-resend-btn"
                  onClick={handleRequestOtp} disabled={isLoading || !canResend}>
                  Kirim Ulang
                </button>
              </span>
            )}
          </div>

          {/* Test helper */}
          <div className="auth-demo-hint" style={{ marginBottom: 14 }}>
            <span><strong>UI Test:</strong> Masukkan kode <code>123456</code></span>
            <button type="button" className="auth-demo-fill-btn"
              onClick={() => { setOtpDigits(['1','2','3','4','5','6']); setError(''); }}>
              Isi 123456
            </button>
          </div>

          <button type="submit" className="auth-btn-primary"
            disabled={isLoading || otpDigits.join('').length !== 6}>
            {isLoading
              ? <><div className="auth-spinner" /><span>Memverifikasi...</span></>
              : <span>Verifikasi & Masuk</span>}
          </button>

          <button type="button" className="auth-btn-alt" style={{ marginTop: 12 }}
            onClick={() => { setStep('phone'); setError(''); }} disabled={isLoading}>
            Ganti Nomor HP
          </button>
        </form>
      )}
    </>
  );
}
