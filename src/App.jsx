import { AppProvider, useApp } from './context/AppContext';
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
} from './components/Icons';

// Pages
import HomePage from './pages/Home/Home';
import MenuPage from './pages/Menu/Menu';
import CustomersPage from './pages/Customers/Customers';
import OrdersPage from './pages/Orders/Orders';
import ReportsPage from './pages/Reports/Reports';
import ProfilePage from './pages/Profile/Profile';

function AppContent() {
  const { activeTab, setActiveTab } = useApp();

  const getHeaderProps = () => {
    switch (activeTab) {
      case 'home':
        return { showGreeting: true };
      case 'menu':
        return {
          icon: <IconCookingPot size={20} color="var(--primary-dark)" />,
          title: 'Menu Katering',
          subtitle: 'Kapasitas & ketersediaan porsi',
        };
      case 'orders':
        return {
          icon: <IconClipboardList size={20} color="var(--primary-dark)" />,
          title: 'Pesanan',
          subtitle: 'Alur proses pesanan katering',
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
          title: 'Profil Usaha',
          subtitle: 'Informasi & pengaturan Dapur Nia',
          showBack: true,
          onBack: () => setActiveTab('home'),
        };
      default:
        return { title: 'Dapur Nia' };
    }
  };

  const renderCurrentPage = () => {
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
        {/* Mobile Header */}
        <AppHeader {...getHeaderProps()} />

        {/* Scrollable Main Content */}
        <main className="app-main-content">
          {renderCurrentPage()}
        </main>

        {/* Fixed Mobile Bottom Navigation (5 items) */}
        <BottomNav />

        {/* Floating Toast Feedback */}
        <Toast />

        {/* Mobile Bottom Sheet Notification Panel */}
        <NotificationSheet />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
