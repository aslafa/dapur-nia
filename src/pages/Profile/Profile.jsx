import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { ROLE_LABELS, ROLES } from '../../services/authService';
import Modal from '../../components/Modal/Modal';
import ConfirmDialog from '../../components/Modal/ConfirmDialog';
import {
  IconUserRound,
  IconPencil,
  IconSettings,
  IconCircleHelp,
  IconChevronRight,
  IconRotateCcw,
  IconStore,
  IconLogOut,
  IconShieldCheck,
  IconPhone,
  IconMail,
  IconMapPin,
  IconBell,
} from '../../components/Icons';
import { formatCurrency } from '../../data/dummyData';

export default function ProfilePage() {
  const {
    businessInfo,
    businessPreferences,
    updateBusinessInfo,
    updateBusinessPreferences,
    resetData,
    seedData,
    simulationState,
    setSimulationState,
  } = useApp();

  const { currentUser, role, logout } = useAuth();
  // STRICT role checks — never default to isOwner for unknown/empty role.
  // Security: if role is missing or unrecognized, treat as pelanggan.
  const cleanRole = (role || ROLES.PELANGGAN).toLowerCase();
  const isOwner = cleanRole === ROLES.PEMILIK;
  const isStaff = cleanRole === ROLES.STAF;
  const isCustomer = !isOwner && !isStaff; // pelanggan or any unknown role

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Modals state
  const [isEditInfoOpen, setIsEditInfoOpen] = useState(false);
  const [isEditPrefsOpen, setIsEditPrefsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isStateTestingOpen, setIsStateTestingOpen] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Edit Forms state
  const [infoForm, setInfoForm] = useState({
    namaUsaha: businessInfo.namaUsaha,
    bidang: businessInfo.bidang,
    alamatDapur: businessInfo.alamatDapur,
    jamOperasional: businessInfo.jamOperasional,
  });

  const [prefsForm, setPrefsForm] = useState({
    ongkirDefault: businessPreferences.ongkirDefault,
    formatMataUang: businessPreferences.formatMataUang,
    notifikasiPesanan: businessPreferences.notifikasiPesanan,
  });

  const [errorsInfo, setErrorsInfo] = useState({});
  const [errorsPrefs, setErrorsPrefs] = useState({});

  // Customer preference toggle local state
  const [customerNotif, setCustomerNotif] = useState(true);

  // Handlers for Info
  const handleOpenEditInfo = () => {
    setInfoForm({
      namaUsaha: businessInfo.namaUsaha,
      bidang: businessInfo.bidang,
      alamatDapur: businessInfo.alamatDapur,
      jamOperasional: businessInfo.jamOperasional,
    });
    setErrorsInfo({});
    setIsEditInfoOpen(true);
  };

  const handleSaveInfo = (e) => {
    e.preventDefault();
    const errs = {};
    if (!infoForm.namaUsaha.trim()) errs.namaUsaha = 'Nama usaha wajib diisi';
    if (!infoForm.bidang.trim()) errs.bidang = 'Bidang usaha wajib diisi';
    if (!infoForm.alamatDapur.trim()) errs.alamatDapur = 'Alamat dapur wajib diisi';
    if (!infoForm.jamOperasional.trim()) errs.jamOperasional = 'Jam operasional wajib diisi';

    if (Object.keys(errs).length > 0) {
      setErrorsInfo(errs);
      return;
    }

    updateBusinessInfo(infoForm);
    setIsEditInfoOpen(false);
  };

  // Handlers for Preferences
  const handleOpenEditPrefs = () => {
    setPrefsForm({
      ongkirDefault: businessPreferences.ongkirDefault,
      formatMataUang: businessPreferences.formatMataUang,
      notifikasiPesanan: businessPreferences.notifikasiPesanan,
    });
    setErrorsPrefs({});
    setIsEditPrefsOpen(true);
  };

  const handleSavePrefs = (e) => {
    e.preventDefault();
    const errs = {};
    if (prefsForm.ongkirDefault === '' || Number(prefsForm.ongkirDefault) < 0) {
      errs.ongkirDefault = 'Ongkos kirim tidak boleh bernilai negatif';
    }

    if (Object.keys(errs).length > 0) {
      setErrorsPrefs(errs);
      return;
    }

    updateBusinessPreferences({
      ...prefsForm,
      ongkirDefault: Number(prefsForm.ongkirDefault),
    });
    setIsEditPrefsOpen(false);
  };

  // ─── PELANGGAN PROFIL ───
  if (isCustomer) {
    return (
      <div className="page-container">
        {/* Profile Header Card */}
        <div className="profile-hero-card">
          <div className="profile-avatar-bubble">
            <IconUserRound size={26} color="#FFFFFF" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <h2 className="profile-hero-name">{currentUser?.name || 'Pelanggan'}</h2>
              <span className="profile-badge-owner">Pelanggan</span>
            </div>
            <div className="profile-hero-field">
              {currentUser?.email || currentUser?.phone || 'Akun Pelanggan'}
            </div>
          </div>
        </div>

        {/* Informasi Akun Pelanggan */}
        <div className="app-card profile-section-card">
          <div className="profile-section-header">
            <div className="profile-section-title-wrap">
              <IconUserRound size={18} color="var(--primary-dark)" />
              <h3 className="profile-section-title">Profil Saya</h3>
            </div>
          </div>

          <div className="profile-info-grid">
            <div className="profile-info-row">
              <span className="profile-info-label">Nama Lengkap</span>
              <span className="profile-info-val" style={{ fontWeight: '600' }}>
                {currentUser?.name || '-'}
              </span>
            </div>
            <div className="profile-info-row">
              <span className="profile-info-label">Email</span>
              <span className="profile-info-val">{currentUser?.email || '-'}</span>
            </div>
            <div className="profile-info-row">
              <span className="profile-info-label">Nomor WhatsApp</span>
              <span className="profile-info-val">
                {currentUser?.whatsapp || currentUser?.phone || '-'}
              </span>
            </div>
            <div className="profile-info-row">
              <span className="profile-info-label">Alamat Kirim</span>
              <span className="profile-info-val">
                {businessInfo.alamatDapur || 'Bandung, Jawa Barat'}
              </span>
            </div>
          </div>
        </div>

        {/* Preferensi Pelanggan */}
        <div className="app-card profile-section-card">
          <div className="profile-section-header">
            <div className="profile-section-title-wrap">
              <IconBell size={18} color="var(--primary-dark)" />
              <h3 className="profile-section-title">Preferensi</h3>
            </div>
          </div>

          <div
            className="toggle-field-row"
            onClick={() => setCustomerNotif(!customerNotif)}
            style={{ padding: '8px 0' }}
          >
            <div>
              <div style={{ fontSize: '13.5px', fontWeight: '600' }}>
                Notifikasi Pesanan
              </div>
              <div style={{ fontSize: '11.5px', color: 'var(--muted)' }}>
                Terima pemberitahuan saat status pesanan diperbarui
              </div>
            </div>
            <div className={`switch-control ${customerNotif ? 'is-on' : ''}`}>
              <div className="switch-thumb"></div>
            </div>
          </div>
        </div>

        {/* Bantuan & Panduan */}
        <div
          className="app-card profile-menu-clickable"
          onClick={() => setIsHelpOpen(true)}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <IconCircleHelp size={20} color="var(--primary-dark)" />
            <div>
              <div style={{ fontSize: '13.5px', fontWeight: '700', color: 'var(--text)' }}>
                Bantuan & Panduan
              </div>
              <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
                Cara pemesanan dan pengantaran katering Dapur Nia
              </div>
            </div>
          </div>
          <IconChevronRight size={16} color="var(--muted)" />
        </div>

        {/* Logout */}
        <div className="app-card profile-section-card" style={{ marginTop: '16px' }}>
          <button
            type="button"
            className="btn btn-secondary btn-block"
            style={{
              borderColor: 'var(--danger-light)',
              color: 'var(--danger)',
              fontWeight: '700',
              gap: '8px',
            }}
            onClick={() => setShowLogoutConfirm(true)}
          >
            <IconLogOut size={16} color="var(--danger)" />
            <span>Keluar dari Akun</span>
          </button>
        </div>

        {/* Modal Bantuan Pelanggan */}
        <Modal
          isOpen={isHelpOpen}
          onClose={() => setIsHelpOpen(false)}
          title="Bantuan & Panduan Pelanggan"
        >
          <div style={{ fontSize: '13px', lineHeight: '1.6', color: 'var(--text)' }}>
            <div style={{ marginBottom: '14px' }}>
              <div style={{ fontWeight: '700', color: 'var(--primary-dark)', marginBottom: '3px' }}>
                1. Cara Pemesanan
              </div>
              <p style={{ color: 'var(--muted)', fontSize: '12px' }}>
                Pilih menu pada Katalog Menu atau Beranda, lalu tekan tombol "Pesan". Masukkan jumlah porsi yang diinginkan dan konfirmasi pesanan Anda.
              </p>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <div style={{ fontWeight: '700', color: 'var(--primary-dark)', marginBottom: '3px' }}>
                2. Upload Bukti Pembayaran
              </div>
              <p style={{ color: 'var(--muted)', fontSize: '12px' }}>
                Buka menu "Pesanan Saya", pilih pesanan yang berstatus Menunggu Bayar, lalu unggah foto bukti transfer pembayaran Anda.
              </p>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontWeight: '700', color: 'var(--primary-dark)', marginBottom: '3px' }}>
                3. Pelacakan Pesanan
              </div>
              <p style={{ color: 'var(--muted)', fontSize: '12px' }}>
                Status pesanan Anda akan diperbarui oleh tim Dapur Nia dari Menunggu Bayar → Dibayar → Diproses → Selesai.
              </p>
            </div>

            <button
              type="button"
              className="btn btn-primary btn-block"
              onClick={() => setIsHelpOpen(false)}
            >
              Tutup Panduan
            </button>
          </div>
        </Modal>

        {/* Confirm Logout Dialog */}
        <ConfirmDialog
          isOpen={showLogoutConfirm}
          onClose={() => setShowLogoutConfirm(false)}
          onConfirm={() => {
            setShowLogoutConfirm(false);
            logout();
          }}
          title="Yakin ingin keluar?"
          message="Anda akan keluar dari akun Dapur Nia."
          confirmText="Keluar"
          cancelText="Batal"
          danger={true}
        />
      </div>
    );
  }

  // ─── STAF PROFIL ───
  if (isStaff) {
    return (
      <div className="page-container">
        {/* Profile Hero Card */}
        <div className="profile-hero-card">
          <div className="profile-avatar-bubble">
            <IconUserRound size={26} color="#FFFFFF" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <h2 className="profile-hero-name">{currentUser?.name || 'Staf'}</h2>
              <span className="profile-badge-owner" style={{ background: '#DBEAFE', color: '#1D4ED8' }}>
                Staf Dapur
              </span>
            </div>
            <div className="profile-hero-field">{currentUser?.email || 'Staf Dapur Nia'}</div>
          </div>
        </div>

        {/* Informasi Akun Staf */}
        <div className="app-card profile-section-card">
          <div className="profile-section-header">
            <div className="profile-section-title-wrap">
              <IconShieldCheck size={18} color="var(--primary-dark)" />
              <h3 className="profile-section-title">Akun & Peran</h3>
            </div>
            <span className="status-badge status-badge-success" style={{ fontSize: '11px' }}>
              ● Terhubung
            </span>
          </div>

          <div className="profile-info-grid">
            <div className="profile-info-row">
              <span className="profile-info-label">Nama</span>
              <span className="profile-info-val" style={{ fontWeight: '600' }}>
                {currentUser?.name || '-'}
              </span>
            </div>
            <div className="profile-info-row">
              <span className="profile-info-label">Email</span>
              <span className="profile-info-val">{currentUser?.email || '-'}</span>
            </div>
            <div className="profile-info-row">
              <span className="profile-info-label">Role</span>
              <span className="profile-info-val" style={{ fontWeight: '700', color: '#2563EB' }}>
                Staf Operasional
              </span>
            </div>
          </div>
        </div>

        {/* Bantuan & Panduan Staf */}
        <div
          className="app-card profile-menu-clickable"
          onClick={() => setIsHelpOpen(true)}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <IconCircleHelp size={20} color="var(--primary-dark)" />
            <div>
              <div style={{ fontSize: '13.5px', fontWeight: '700', color: 'var(--text)' }}>
                Bantuan & Panduan Staf
              </div>
              <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
                Petunjuk operasional pemrosesan pesanan & konfirmasi pembayaran
              </div>
            </div>
          </div>
          <IconChevronRight size={16} color="var(--muted)" />
        </div>

        {/* Pengaturan / Pengujian Tampilan */}
        <div
          className="app-card profile-menu-clickable"
          onClick={() => setIsStateTestingOpen(true)}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <IconSettings size={20} color="var(--primary-dark)" />
            <div>
              <div style={{ fontSize: '13.5px', fontWeight: '700', color: 'var(--text)' }}>
                Pengaturan / Pengujian Tampilan
              </div>
              <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
                Status aktif saat ini: <strong>{simulationState.toUpperCase()}</strong>
              </div>
            </div>
          </div>
          <IconChevronRight size={16} color="var(--muted)" />
        </div>

        {/* Logout */}
        <div className="app-card profile-section-card" style={{ marginTop: '16px' }}>
          <button
            type="button"
            className="btn btn-secondary btn-block"
            style={{
              borderColor: 'var(--danger-light)',
              color: 'var(--danger)',
              fontWeight: '700',
              gap: '8px',
            }}
            onClick={() => setShowLogoutConfirm(true)}
          >
            <IconLogOut size={16} color="var(--danger)" />
            <span>Keluar dari Akun</span>
          </button>
        </div>

        {/* Modal Bantuan Staf */}
        <Modal
          isOpen={isHelpOpen}
          onClose={() => setIsHelpOpen(false)}
          title="Panduan Operasional Staf"
        >
          <div style={{ fontSize: '13px', lineHeight: '1.6', color: 'var(--text)' }}>
            <div style={{ marginBottom: '14px' }}>
              <div style={{ fontWeight: '700', color: 'var(--primary-dark)', marginBottom: '3px' }}>
                1. Verifikasi Pembayaran
              </div>
              <p style={{ color: 'var(--muted)', fontSize: '12px' }}>
                Buka tab Pesanan, periksa foto bukti pembayaran pada pesanan berstatus Menunggu Bayar, lalu tekan tombol "Konfirmasi Pembayaran".
              </p>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontWeight: '700', color: 'var(--primary-dark)', marginBottom: '3px' }}>
                2. Pemrosesan Pesanan
              </div>
              <p style={{ color: 'var(--muted)', fontSize: '12px' }}>
                Ubah status pesanan secara bertahap dari Dibayar → Diproses → Selesai saat katering siap diantar.
              </p>
            </div>

            <button
              type="button"
              className="btn btn-primary btn-block"
              onClick={() => setIsHelpOpen(false)}
            >
              Tutup Panduan
            </button>
          </div>
        </Modal>

        {/* Modal State Testing */}
        <Modal
          isOpen={isStateTestingOpen}
          onClose={() => setIsStateTestingOpen(false)}
          title="Pengaturan / Pengujian Tampilan"
        >
          <div>
            <div style={{ fontSize: '12.5px', color: 'var(--muted)', marginBottom: '14px', lineHeight: '1.5' }}>
              Pilih kondisi state untuk mensimulasikan tampilan halaman:
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '18px' }}>
              <button
                type="button"
                className={`btn ${simulationState === 'normal' ? 'btn-primary' : 'btn-secondary'} btn-block`}
                onClick={() => {
                  setSimulationState('normal');
                  setIsStateTestingOpen(false);
                }}
              >
                ● Mode Normal (Default Aplikasi)
              </button>
              <button
                type="button"
                className={`btn ${simulationState === 'loading' ? 'btn-primary' : 'btn-secondary'} btn-block`}
                onClick={() => {
                  setSimulationState('loading');
                  setIsStateTestingOpen(false);
                }}
              >
                ⏳ Simulasi Loading State
              </button>
              <button
                type="button"
                className={`btn ${simulationState === 'empty' ? 'btn-primary' : 'btn-secondary'} btn-block`}
                onClick={() => {
                  setSimulationState('empty');
                  setIsStateTestingOpen(false);
                }}
              >
                📭 Simulasi Empty State
              </button>
              <button
                type="button"
                className={`btn ${simulationState === 'error' ? 'btn-primary' : 'btn-secondary'} btn-block`}
                onClick={() => {
                  setSimulationState('error');
                  setIsStateTestingOpen(false);
                }}
              >
                ⚠️ Simulasi Error State
              </button>
            </div>
            <button
              type="button"
              className="btn btn-secondary btn-block"
              onClick={() => setIsStateTestingOpen(false)}
            >
              Tutup
            </button>
          </div>
        </Modal>

        {/* Confirm Logout Dialog */}
        <ConfirmDialog
          isOpen={showLogoutConfirm}
          onClose={() => setShowLogoutConfirm(false)}
          onConfirm={() => {
            setShowLogoutConfirm(false);
            logout();
          }}
          title="Yakin ingin keluar?"
          message="Anda akan keluar dari sesi aplikasi Dapur Nia."
          confirmText="Keluar"
          cancelText="Batal"
          danger={true}
        />
      </div>
    );
  }

  // ─── PEMILIK / OWNER PROFIL (FULL EXISTING) ───
  return (
    <div className="page-container">
      {/* 1. Profil Dapur Nia Card */}
      <div className="profile-hero-card">
        <div className="profile-avatar-bubble">
          <IconUserRound size={26} color="#FFFFFF" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <h2 className="profile-hero-name">{currentUser?.name || 'Pengguna'}</h2>
            <span className="profile-badge-owner">Pemilik</span>
          </div>
          <div className="profile-hero-business">{businessInfo.namaUsaha}</div>
          <div className="profile-hero-field">
            {currentUser?.email || currentUser?.phone || businessInfo.bidang}
          </div>
        </div>
      </div>

      {/* 2. Informasi Usaha (Summary + Edit Button) */}
      <div className="app-card profile-section-card">
        <div className="profile-section-header">
          <div className="profile-section-title-wrap">
            <IconStore size={18} color="var(--primary-dark)" />
            <h3 className="profile-section-title">Informasi Usaha</h3>
          </div>
          <button
            type="button"
            className="btn-edit-badge"
            onClick={handleOpenEditInfo}
            aria-label="Edit Informasi Usaha"
          >
            <IconPencil size={12} color="var(--primary-dark)" />
            <span>Edit</span>
          </button>
        </div>

        <div className="profile-info-grid">
          <div className="profile-info-row">
            <span className="profile-info-label">Nama Usaha</span>
            <span className="profile-info-val">{businessInfo.namaUsaha}</span>
          </div>
          <div className="profile-info-row">
            <span className="profile-info-label">Bidang</span>
            <span className="profile-info-val">{businessInfo.bidang}</span>
          </div>
          <div className="profile-info-row">
            <span className="profile-info-label">Alamat Dapur</span>
            <span className="profile-info-val">{businessInfo.alamatDapur}</span>
          </div>
          <div className="profile-info-row">
            <span className="profile-info-label">Jam Operasional</span>
            <span className="profile-info-val">{businessInfo.jamOperasional}</span>
          </div>
        </div>
      </div>

      {/* 3. Preferensi Usaha (Summary + Edit Button) */}
      <div className="app-card profile-section-card">
        <div className="profile-section-header">
          <div className="profile-section-title-wrap">
            <IconSettings size={18} color="var(--primary-dark)" />
            <h3 className="profile-section-title">Preferensi Usaha</h3>
          </div>
          <button
            type="button"
            className="btn-edit-badge"
            onClick={handleOpenEditPrefs}
            aria-label="Edit Preferensi Usaha"
          >
            <IconPencil size={12} color="var(--primary-dark)" />
            <span>Edit</span>
          </button>
        </div>

        <div className="profile-info-grid">
          <div className="profile-info-row">
            <span className="profile-info-label">Ongkos Kirim Default</span>
            <span
              className="profile-info-val"
              style={{ color: 'var(--primary-dark)', fontWeight: '700' }}
            >
              {formatCurrency(businessPreferences.ongkirDefault)}
            </span>
          </div>
          <div className="profile-info-row">
            <span className="profile-info-label">Format Mata Uang</span>
            <span className="profile-info-val">{businessPreferences.formatMataUang}</span>
          </div>
          <div className="profile-info-row">
            <span className="profile-info-label">Notifikasi Pesanan</span>
            <span className="profile-info-val">
              {businessPreferences.notifikasiPesanan ? (
                <span className="status-badge status-badge-success" style={{ fontSize: '11px' }}>
                  ● Aktif
                </span>
              ) : (
                <span className="status-badge status-badge-muted" style={{ fontSize: '11px' }}>
                  ● Nonaktif
                </span>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* 4. Bantuan & Panduan */}
      <div
        className="app-card profile-menu-clickable"
        onClick={() => setIsHelpOpen(true)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <IconCircleHelp size={20} color="var(--primary-dark)" />
          <div>
            <div style={{ fontSize: '13.5px', fontWeight: '700', color: 'var(--text)' }}>
              Bantuan & Panduan
            </div>
            <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
              Petunjuk operasional dan panduan pesanan katering
            </div>
          </div>
        </div>
        <IconChevronRight size={16} color="var(--muted)" />
      </div>

      {/* 5. Pengaturan / Pengujian Tampilan */}
      <div
        className="app-card profile-menu-clickable"
        onClick={() => setIsStateTestingOpen(true)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <IconSettings size={20} color="var(--primary-dark)" />
          <div>
            <div style={{ fontSize: '13.5px', fontWeight: '700', color: 'var(--text)' }}>
              Pengaturan / Pengujian Tampilan
            </div>
            <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
              Status aktif saat ini: <strong>{simulationState.toUpperCase()}</strong>
            </div>
          </div>
        </div>
        <IconChevronRight size={16} color="var(--muted)" />
      </div>

      {/* 6. Akun & Keamanan (Logout) */}
      <div className="app-card profile-section-card" style={{ marginTop: '12px' }}>
        <div className="profile-section-header">
          <div className="profile-section-title-wrap">
            <IconShieldCheck size={18} color="var(--primary-dark)" />
            <h3 className="profile-section-title">Akun &amp; Sesi Aktif</h3>
          </div>
          <span className="status-badge status-badge-success" style={{ fontSize: '11px' }}>
            ● Terhubung
          </span>
        </div>

        <div className="profile-info-grid" style={{ marginBottom: '14px' }}>
          <div className="profile-info-row">
            <span className="profile-info-label">Nama</span>
            <span className="profile-info-val" style={{ fontWeight: '600' }}>
              {currentUser?.name || 'Pemilik'}
            </span>
          </div>
          <div className="profile-info-row">
            <span className="profile-info-label">Email</span>
            <span className="profile-info-val">{currentUser?.email || '-'}</span>
          </div>
          <div className="profile-info-row">
            <span className="profile-info-label">Role</span>
            <span
              className="profile-info-val"
              style={{ fontWeight: '600', color: 'var(--primary-dark)' }}
            >
              Pemilik
            </span>
          </div>
        </div>

        <button
          type="button"
          className="btn btn-secondary btn-block"
          style={{
            borderColor: 'var(--danger-light)',
            color: 'var(--danger)',
            fontWeight: '700',
            gap: '8px',
          }}
          onClick={() => setShowLogoutConfirm(true)}
        >
          <IconLogOut size={16} color="var(--danger)" />
          <span>Keluar dari Akun</span>
        </button>
      </div>

      {/* Reset Data */}
      <div style={{ marginTop: '16px', textAlign: 'center', paddingBottom: '16px' }}>
        <button
          type="button"
          className="btn-reset-secondary"
          onClick={() => setShowResetConfirm(true)}
        >
          <IconRotateCcw size={14} color="var(--danger)" />
          <span>Kembalikan Data Bawaan (Reset)</span>
        </button>
        <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '4px' }}>
          Mereset menu, pelanggan, dan pesanan ke data awal
        </div>
      </div>

      {/* Modal Edit Info */}
      <Modal
        isOpen={isEditInfoOpen}
        onClose={() => setIsEditInfoOpen(false)}
        title="Edit Informasi Usaha"
      >
        <form onSubmit={handleSaveInfo}>
          <div className="form-field-group">
            <label className="form-label-top" htmlFor="edit-nama-usaha">
              Nama Usaha <span className="form-label-required">*</span>
            </label>
            <input
              id="edit-nama-usaha"
              type="text"
              className={`form-control-input ${errorsInfo.namaUsaha ? 'has-error' : ''}`}
              value={infoForm.namaUsaha}
              onChange={(e) => setInfoForm({ ...infoForm, namaUsaha: e.target.value })}
            />
            {errorsInfo.namaUsaha && (
              <div className="form-field-error-msg">⚠️ {errorsInfo.namaUsaha}</div>
            )}
          </div>

          <div className="form-field-group">
            <label className="form-label-top" htmlFor="edit-bidang">
              Bidang Usaha <span className="form-label-required">*</span>
            </label>
            <input
              id="edit-bidang"
              type="text"
              className={`form-control-input ${errorsInfo.bidang ? 'has-error' : ''}`}
              value={infoForm.bidang}
              onChange={(e) => setInfoForm({ ...infoForm, bidang: e.target.value })}
            />
            {errorsInfo.bidang && (
              <div className="form-field-error-msg">⚠️ {errorsInfo.bidang}</div>
            )}
          </div>

          <div className="form-field-group">
            <label className="form-label-top" htmlFor="edit-alamat-dapur">
              Alamat Dapur <span className="form-label-required">*</span>
            </label>
            <textarea
              id="edit-alamat-dapur"
              rows="3"
              className={`form-control-textarea ${errorsInfo.alamatDapur ? 'has-error' : ''}`}
              value={infoForm.alamatDapur}
              onChange={(e) => setInfoForm({ ...infoForm, alamatDapur: e.target.value })}
            />
            {errorsInfo.alamatDapur && (
              <div className="form-field-error-msg">⚠️ {errorsInfo.alamatDapur}</div>
            )}
          </div>

          <div className="form-field-group">
            <label className="form-label-top" htmlFor="edit-jam-operasional">
              Jam Operasional <span className="form-label-required">*</span>
            </label>
            <input
              id="edit-jam-operasional"
              type="text"
              className={`form-control-input ${errorsInfo.jamOperasional ? 'has-error' : ''}`}
              value={infoForm.jamOperasional}
              onChange={(e) => setInfoForm({ ...infoForm, jamOperasional: e.target.value })}
            />
            {errorsInfo.jamOperasional && (
              <div className="form-field-error-msg">⚠️ {errorsInfo.jamOperasional}</div>
            )}
          </div>

          <div className="sheet-actions-row">
            <button
              type="button"
              className="btn btn-secondary btn-block"
              onClick={() => setIsEditInfoOpen(false)}
            >
              Batal
            </button>
            <button type="submit" className="btn btn-primary btn-block">
              Simpan Perubahan
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Edit Prefs */}
      <Modal
        isOpen={isEditPrefsOpen}
        onClose={() => setIsEditPrefsOpen(false)}
        title="Edit Preferensi Usaha"
      >
        <form onSubmit={handleSavePrefs}>
          <div className="form-field-group">
            <label className="form-label-top" htmlFor="edit-ongkir-default">
              Ongkos Kirim Default (Rp) <span className="form-label-required">*</span>
            </label>
            <input
              id="edit-ongkir-default"
              type="number"
              min="0"
              className={`form-control-input ${errorsPrefs.ongkirDefault ? 'has-error' : ''}`}
              value={prefsForm.ongkirDefault}
              onChange={(e) => setPrefsForm({ ...prefsForm, ongkirDefault: e.target.value })}
            />
            {errorsPrefs.ongkirDefault && (
              <div className="form-field-error-msg">⚠️ {errorsPrefs.ongkirDefault}</div>
            )}
          </div>

          <div className="form-field-group">
            <label className="form-label-top" htmlFor="edit-format-matauang">
              Format Mata Uang
            </label>
            <select
              id="edit-format-matauang"
              className="form-control-select"
              value={prefsForm.formatMataUang}
              onChange={(e) => setPrefsForm({ ...prefsForm, formatMataUang: e.target.value })}
            >
              <option value="IDR (Rupiah Indonesia)">IDR (Rupiah Indonesia)</option>
              <option value="IDR (Standar Rp)">IDR (Standar Rp)</option>
            </select>
          </div>

          <div className="form-field-group">
            <label className="form-label-top">Notifikasi Pesanan Baru</label>
            <div
              className="toggle-field-row"
              onClick={() =>
                setPrefsForm({
                  ...prefsForm,
                  notifikasiPesanan: !prefsForm.notifikasiPesanan,
                })
              }
            >
              <div>
                <div style={{ fontSize: '13px', fontWeight: '600' }}>
                  {prefsForm.notifikasiPesanan
                    ? 'Notifikasi Aktif'
                    : 'Notifikasi Dinonaktifkan'}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
                  Pemberitahuan saat pesanan katering masuk
                </div>
              </div>
              <div
                className={`switch-control ${
                  prefsForm.notifikasiPesanan ? 'is-on' : ''
                }`}
              >
                <div className="switch-thumb"></div>
              </div>
            </div>
          </div>

          <div className="sheet-actions-row">
            <button
              type="button"
              className="btn btn-secondary btn-block"
              onClick={() => setIsEditPrefsOpen(false)}
            >
              Batal
            </button>
            <button type="submit" className="btn btn-primary btn-block">
              Simpan Perubahan
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Bantuan Pemilik */}
      <Modal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        title="Bantuan & Panduan"
      >
        <div style={{ fontSize: '13px', lineHeight: '1.6', color: 'var(--text)' }}>
          <div style={{ marginBottom: '14px' }}>
            <div style={{ fontWeight: '700', color: 'var(--primary-dark)', marginBottom: '3px' }}>
              1. Kelola Menu & Sisa Porsi
            </div>
            <p style={{ color: 'var(--muted)', fontSize: '12px' }}>
              Tambahkan menu katering harian, tentukan harga, dan sisa porsi. Jika sisa porsi 0, menu tetap tampil dengan label Habis agar pelanggan mengetahui menu tersebut pernah tersedia.
            </p>
          </div>

          <div style={{ marginBottom: '14px' }}>
            <div style={{ fontWeight: '700', color: 'var(--primary-dark)', marginBottom: '3px' }}>
              2. Alur Status Pesanan
            </div>
            <p style={{ color: 'var(--muted)', fontSize: '12px' }}>
              Status pesanan berpindah secara berurutan: Menunggu Bayar → Dibayar → Diproses → Selesai.
            </p>
          </div>

          <button
            type="button"
            className="btn btn-primary btn-block"
            onClick={() => setIsHelpOpen(false)}
          >
            Tutup Panduan
          </button>
        </div>
      </Modal>

      {/* Modal State Testing */}
      <Modal
        isOpen={isStateTestingOpen}
        onClose={() => setIsStateTestingOpen(false)}
        title="Pengaturan / Pengujian Tampilan"
      >
        <div>
          <div style={{ fontSize: '12.5px', color: 'var(--muted)', marginBottom: '14px', lineHeight: '1.5' }}>
            Pilih kondisi state untuk mensimulasikan tampilan halaman:
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '18px' }}>
            <button
              type="button"
              className={`btn ${simulationState === 'normal' ? 'btn-primary' : 'btn-secondary'} btn-block`}
              onClick={() => {
                setSimulationState('normal');
                setIsStateTestingOpen(false);
              }}
            >
              ● Mode Normal (Default Aplikasi)
            </button>
            <button
              type="button"
              className={`btn ${simulationState === 'loading' ? 'btn-primary' : 'btn-secondary'} btn-block`}
              onClick={() => {
                setSimulationState('loading');
                setIsStateTestingOpen(false);
              }}
            >
              ⏳ Simulasi Loading State
            </button>
            <button
              type="button"
              className={`btn ${simulationState === 'empty' ? 'btn-primary' : 'btn-secondary'} btn-block`}
              onClick={() => {
                setSimulationState('empty');
                setIsStateTestingOpen(false);
              }}
            >
              📭 Simulasi Empty State
            </button>
            <button
              type="button"
              className={`btn ${simulationState === 'error' ? 'btn-primary' : 'btn-secondary'} btn-block`}
              onClick={() => {
                setSimulationState('error');
                setIsStateTestingOpen(false);
              }}
            >
              ⚠️ Simulasi Error State
            </button>
            <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid var(--border)' }}>
              <button
                type="button"
                className="btn btn-secondary btn-block"
                style={{ fontSize: '12px', color: 'var(--primary-dark)', borderColor: 'var(--primary-light)' }}
                onClick={async () => {
                  try {
                    await seedData();
                    setIsStateTestingOpen(false);
                  } catch (e) {
                    // toast handled
                  }
                }}
              >
                🌱 Masukkan Data Dummy ke Firestore (Seed Manual)
              </button>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-secondary btn-block"
            onClick={() => setIsStateTestingOpen(false)}
          >
            Tutup
          </button>
        </div>
      </Modal>

      {/* Confirm Reset Dialog */}
      <ConfirmDialog
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={() => {
          resetData();
          setShowResetConfirm(false);
        }}
        title="Kembalikan data bawaan?"
        message="Semua perubahan data lokal akan dikembalikan ke data default bawaan Dapur Nia."
        confirmText="Ya, Reset Data"
        cancelText="Batal"
      />

      {/* Confirm Logout Dialog */}
      <ConfirmDialog
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={() => {
          setShowLogoutConfirm(false);
          logout();
        }}
        title="Yakin ingin keluar?"
        message="Anda akan keluar dari sesi aplikasi Dapur Nia."
        confirmText="Keluar"
        cancelText="Batal"
        danger={true}
      />
    </div>
  );
}
