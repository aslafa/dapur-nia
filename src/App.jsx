import { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthGuard from './components/AuthGuard/AuthGuard';
import AppHeader from './components/AppHeader/AppHeader';
import BottomNav from './components/BottomNav/BottomNav';
import Toast from './components/Toast/Toast';
import NotificationSheet from './components/NotificationSheet/NotificationSheet';
import {
  IconCookingPot,
  IconClipboardList,
  IconUsers,
  IconChartColumn,
  IconUserRound,
  IconShieldCheck,
} from './components/Icons';
import './pages/Auth/Auth.css';
import { ROLES } from './services/authService';

// Pages
import HomePage from './pages/Home/Home';
import MenuPage from './pages/Menu/Menu';
import CustomersPage from './pages/Customers/Customers';
import OrdersPage from './pages/Orders/Orders';
import ReportsPage from './pages/Reports/Reports';
import ProfilePage from './pages/Profile/Profile';

// ─── ACCESS DENIED PAGE ───
function AccessDeniedPage({ onGoHome }) {
  return (
    <div className="access-denied-wrap">
      <div className="access-denied-icon">
        <IconShieldCheck size={34} color="#EF4444" />
      </div>
      <h2 className="access-denied-title">Akses Terbatas</h2>
      <p className="access-denied-desc">
        Anda tidak memiliki izin untuk membuka halaman ini. Hubungi admin jika Anda merasa ini keliru.
      </p>
      <button
        type="button"
        className="auth-btn-primary"
        style={{ maxWidth: 220 }}
        onClick={onGoHome}
      >
        Kembali ke Beranda
      </button>
    </div>
  );
}

function AppContent() {
  const { activeTab, setActiveTab } = useApp();
  const { currentUser, role, canAccess } = useAuth();

  const isCustomer = role === ROLES.PELANGGAN;
  const isStaff = role === ROLES.STAF;

  // Always reset to 'home' when user session changes to ensure role-appropriate landing page
  useEffect(() => {
    if (currentUser?.id) {
      setActiveTab('home');
    }
  }, [currentUser?.id, setActiveTab]);

  const getHeaderProps = () => {
    switch (activeTab) {
      case 'home':
        return { showGreeting: true };
      case 'menu':
        return {
          icon: <IconCookingPot size={20} color="var(--primary-dark)" />,
          title: isCustomer ? 'Katalog Menu' : 'Menu Katering',
          subtitle: isCustomer
            ? 'Pilihan masakan katering rumahan'
            : 'Kapasitas & ketersediaan porsi',
        };
      case 'orders':
        return {
          icon: <IconClipboardList size={20} color="var(--primary-dark)" />,
          title: isCustomer ? 'Pesanan Saya' : isStaff ? 'Kelola Pesanan' : 'Pesanan',
          subtitle: isCustomer
            ? 'Daftar dan status pesanan katering Anda'
            : 'Alur proses pesanan katering',
        };
      case 'customers':
        return {
          icon: <IconUsers size={20} color="var(--primary-dark)" />,
          title: 'Pelanggan',
          subtitle: 'Kontak WhatsApp & alamat kirim',
        };
      case 'reports':
        return {
          icon: <IconChartColumn size={20} color="var(--primary-dark)" />,
          title: 'Laporan Penjualan',
          subtitle: 'Pendapatan & porsi terjual',
          showBack: true,
          onBack: () => setActiveTab('home'),
        };
      case 'profile':
        return {
          icon: <IconUserRound size={20} color="var(--primary-dark)" />,
          title: isCustomer ? 'Profil Saya' : isStaff ? 'Profil Staf' : 'Profil Usaha',
          subtitle: isCustomer
            ? 'Informasi akun & preferensi'
            : isStaff
            ? 'Informasi akun staf operasional'
            : 'Informasi & pengaturan Dapur Nia',
          showBack: true,
          onBack: () => setActiveTab('home'),
        };
      default:
        return { title: 'Dapur Nia' };
    }
  };

  const renderCurrentPage = () => {
    // Role-based route protection
    if (!canAccess(activeTab)) {
      return <AccessDeniedPage onGoHome={() => setActiveTab('home')} />;
    }

    switch (activeTab) {
      case 'home':
        return <HomePage />;
      case 'menu':
        return <MenuPage />;
      case 'customers':
        return <CustomersPage />;
      case 'orders':
        return <OrdersPage />;
      case 'reports':
        return <ReportsPage />;
      case 'profile':
        return <ProfilePage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="mobile-app-wrapper">
      <div className="app-shell">
        <AppHeader {...getHeaderProps()} />
        <main className="app-main-content">{renderCurrentPage()}</main>
        <BottomNav />
        <Toast />
        <NotificationSheet />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AuthGuard>
        <AppProvider>
          <AppContent />
        </AppProvider>
      </AuthGuard>
    </AuthProvider>
  );
}
