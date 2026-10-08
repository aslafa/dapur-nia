// src/services/authService.js
// Authentication Service for Dapur Nia
// Roles: PEMILIK | STAF | PELANGGAN

const SESSION_KEY = 'dn_auth_session';
const REGISTERED_USERS_KEY = 'dn_registered_users';

// ─── PASSWORD REQUIREMENTS ───
export const PASSWORD_RULES = {
  minLength: 8,
  hasUppercase: /[A-Z]/,
  hasLowercase: /[a-z]/,
  hasNumber: /[0-9]/,
};

export function checkPasswordStrength(password) {
  const checks = {
    minLength: password.length >= PASSWORD_RULES.minLength,
    hasUppercase: PASSWORD_RULES.hasUppercase.test(password),
    hasLowercase: PASSWORD_RULES.hasLowercase.test(password),
    hasNumber: PASSWORD_RULES.hasNumber.test(password),
  };
  const passedCount = Object.values(checks).filter(Boolean).length;
  const isValid = passedCount === 4;

  let strength = 'lemah';
  if (passedCount === 3) strength = 'sedang';
  if (passedCount === 4) strength = 'kuat';

  return { checks, passedCount, strength, isValid };
}

function hashPassword(password) {
  let hash = 0;
  const str = `dn_salt_2026_${password}`;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `hash_${Math.abs(hash).toString(36)}_${btoa(str).slice(0, 12)}`;
}

// ─── ROLES ───
export const ROLES = {
  PEMILIK: 'pemilik',
  STAF: 'staf',
  PELANGGAN: 'pelanggan',
};

export const ROLE_LABELS = {
  pemilik: 'Pemilik',
  staf: 'Staf',
  pelanggan: 'Pelanggan',
};

// ─── ROLE PERMISSIONS ───
export const ROLE_PERMISSIONS = {
  pemilik: ['home', 'menu', 'customers', 'orders', 'reports', 'profile'],
  staf: ['home', 'orders', 'profile'],
  pelanggan: ['home', 'menu', 'orders', 'profile'],
};

// ─── MANDATORY DEMO ACCOUNTS ───
// SOURCE OF TRUTH: email → role mapping. Never default to pemilik.
const MANDATORY_DEMO_USERS = [
  {
    id: 'user-pemilik-dina',
    name: 'Dina',
    email: 'dina@dapurnia.com',
    phone: '081234567890',
    whatsapp: '081234567890',
    role: ROLES.PEMILIK,
    passwordHash: hashPassword('DapurNia8'),
    avatar: 'DN',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'user-staf-rani',
    name: 'Rani',
    email: 'rani@dapurnia.com',
    phone: '082345678901',
    whatsapp: '082345678901',
    role: ROLES.STAF,
    passwordHash: hashPassword('StafNia8'),
    avatar: 'RN',
    createdAt: '2026-01-02T00:00:00.000Z',
  },
  {
    // Demo alias: rasya@dapurnia.com
    id: 'user-pelanggan-rasya',
    name: 'Rasya Andrean',
    email: 'rasya@dapurnia.com',
    phone: '083456789012',
    whatsapp: '083456789012',
    role: ROLES.PELANGGAN,
    passwordHash: hashPassword('Pelanggan8'),
    avatar: 'RA',
    createdAt: '2026-01-03T00:00:00.000Z',
  },
  {
    // Real account: testbps01@gmail.com — MUST be PELANGGAN
    id: 'user-pelanggan-testbps01',
    name: 'Rasya Andrean',
    email: 'testbps01@gmail.com',
    phone: '083456789012',
    whatsapp: '083456789012',
    role: ROLES.PELANGGAN,
    passwordHash: hashPassword('Pelanggan8'),
    avatar: 'RA',
    createdAt: '2026-01-03T00:00:00.000Z',
  },
];

function getUsersList() {
  const saved = localStorage.getItem(REGISTERED_USERS_KEY);
  let users = [...MANDATORY_DEMO_USERS];

  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        users = parsed;
      }
    } catch (e) {
      console.warn('Failed parsing registered users', e);
    }
  }

  // Ensure mandatory demo accounts always have correct email, name & role
  MANDATORY_DEMO_USERS.forEach((mand) => {
    const idx = users.findIndex(
      (u) => u.email.toLowerCase() === mand.email.toLowerCase()
    );
    if (idx >= 0) {
      users[idx] = {
        ...users[idx],
        name: mand.name,
        role: mand.role,
        passwordHash: mand.passwordHash,
      };
    } else {
      users.push(mand);
    }
  });

  localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users));
  return users;
}

function saveUsersList(users) {
  localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users));
}

function generateSessionToken(userId) {
  const rand = Math.random().toString(36).substring(2);
  const time = Date.now().toString(36);
  return `dn_tk_${userId}_${rand}${time}`;
}

export const authService = {
  // ─── SESSION ───
  getCurrentSession() {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      const session = JSON.parse(raw);
      if (session && session.user && session.token) {
        // Enforce exact role mapping if session user is one of the mandatory demo accounts
        const mandatoryMatch = MANDATORY_DEMO_USERS.find(
          (m) => m.email.toLowerCase() === (session.user.email || '').toLowerCase()
        );
        if (mandatoryMatch) {
          session.user.role = mandatoryMatch.role;
          session.user.name = mandatoryMatch.name;
        }
        return session.user;
      }
      return null;
    } catch (e) {
      console.error('Error reading auth session', e);
      return null;
    }
  },

  setSession(user, loginMethod = 'email') {
    const token = generateSessionToken(user.id);

    // Hard guarantee for mandatory account roles
    let userRole = user.role || ROLES.PELANGGAN;
    const mandatoryMatch = MANDATORY_DEMO_USERS.find(
      (m) => m.email.toLowerCase() === (user.email || '').toLowerCase()
    );
    if (mandatoryMatch) {
      userRole = mandatoryMatch.role;
    }

    const sessionUser = {
      id: user.id,
      name: user.name,
      email: user.email || '',
      phone: user.phone || '',
      whatsapp: user.whatsapp || '',
      role: userRole,
      avatar: user.name ? user.name.slice(0, 2).toUpperCase() : 'DN',
      loginMethod,
    };
    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify({
        token,
        loginMethod,
        loginTime: new Date().toISOString(),
        user: sessionUser,
      })
    );
    return sessionUser;
  },

  clearSession() {
    localStorage.removeItem(SESSION_KEY);
  },

  // ─── LOGIN EMAIL ───
  async loginWithEmail(email, password) {
    await new Promise((r) => setTimeout(r, 600));

    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();

    if (!cleanEmail) throw new Error('Email wajib diisi.');
    if (!cleanPass) throw new Error('Kata sandi wajib diisi.');

    const users = getUsersList();
    const targetHash = hashPassword(cleanPass);
    const user = users.find(
      (u) => u.email.toLowerCase() === cleanEmail && u.passwordHash === targetHash
    );

    if (!user) {
      throw new Error('Email atau kata sandi salah. Silakan coba lagi.');
    }

    return this.setSession(user, 'email');
  },

  // ─── REGISTER (always PELANGGAN, redirect to login — no auto-login) ───
  async register({ name, email, password, whatsapp }) {
    await new Promise((r) => setTimeout(r, 700));

    const cleanName = (name || '').trim();
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();
    const cleanWa = (whatsapp || '').trim();

    if (!cleanName || cleanName.length < 2)
      throw new Error('Nama lengkap wajib diisi minimal 2 karakter.');
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail))
      throw new Error('Format alamat email tidak valid.');

    const pwCheck = checkPasswordStrength(cleanPass);
    if (!pwCheck.isValid)
      throw new Error('Password belum memenuhi persyaratan.');

    const users = getUsersList();
    const existing = users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existing)
      throw new Error('Email sudah terdaftar. Silakan gunakan menu Masuk atau Lupa Password.');

    const newUser = {
      id: `user-${Date.now()}`,
      name: cleanName,
      email: cleanEmail,
      phone: cleanWa,
      whatsapp: cleanWa,
      role: ROLES.PELANGGAN, // ALWAYS PELANGGAN
      passwordHash: hashPassword(cleanPass),
      avatar: cleanName.slice(0, 2).toUpperCase(),
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    saveUsersList(users);

    return { success: true, email: cleanEmail, name: cleanName };
  },

  // ─── LUPA PASSWORD ───
  async requestPasswordReset(email) {
    await new Promise((r) => setTimeout(r, 600));

    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@'))
      throw new Error('Masukkan alamat email yang valid.');

    return {
      success: true,
      email: cleanEmail,
      message: `Link reset kata sandi telah dikirim ke ${cleanEmail}. Periksa kotak masuk atau folder spam Anda.`,
    };
  },

  // ─── GOOGLE LOGIN ───
  async loginWithGoogle() {
    await new Promise((r) => setTimeout(r, 500));
    throw new Error(
      'Layanan Google Authentication belum terhubung dengan backend provider.'
    );
  },

  // ─── OTP PHONE ───
  async requestPhoneOtp(phoneNumber) {
    await new Promise((r) => setTimeout(r, 600));

    const cleanPhone = (phoneNumber || '').replace(/[\s\-()]/g, '');
    if (!cleanPhone || cleanPhone.length < 9)
      throw new Error('Nomor HP tidak valid. Masukkan minimal 9 digit nomor aktif.');

    return {
      verificationId: `verify_${Date.now()}_${cleanPhone.slice(-4)}`,
      phoneNumber: cleanPhone,
      countdownSeconds: 60,
      isSimulated: true,
    };
  },

  async verifyPhoneOtp(phoneNumber, code, verificationId) {
    await new Promise((r) => setTimeout(r, 600));

    const cleanCode = (code || '').trim();
    if (cleanCode.length !== 6 || !/^\d{6}$/.test(cleanCode))
      throw new Error('Kode OTP harus 6 digit angka.');

    if (cleanCode !== '123456')
      throw new Error('Kode OTP salah atau kedaluwarsa. (Gunakan 123456 untuk simulasi)');

    const cleanPhone = (phoneNumber || '').replace(/[\s\-()]/g, '');
    const otpUser = {
      id: `phone-${cleanPhone.slice(-6)}`,
      name: `Pengguna HP ${cleanPhone.slice(-4)}`,
      email: '',
      phone: cleanPhone,
      whatsapp: cleanPhone,
      role: ROLES.PELANGGAN,
      avatar: 'HP',
    };

    return this.setSession(otpUser, 'phone-otp');
  },
};
