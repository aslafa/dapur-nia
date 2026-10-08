import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import {
  IconHome,
  IconCookingPot,
  IconClipboardList,
  IconChartColumn,
  IconUserRound,
} from '../Icons';
import { ROLES } from '../../services/authService';

const NAV_CONFIG = {
  [ROLES.PEMILIK]: [
    { id: 'home', label: 'Beranda', icon: IconHome },
    { id: 'menu', label: 'Menu', icon: IconCookingPot },
    { id: 'orders', label: 'Pesanan', icon: IconClipboardList },
    { id: 'reports', label: 'Laporan', icon: IconChartColumn },
    { id: 'profile', label: 'Profil', icon: IconUserRound },
  ],
  [ROLES.STAF]: [
    { id: 'home', label: 'Beranda', icon: IconHome },
    { id: 'orders', label: 'Pesanan', icon: IconClipboardList },
    { id: 'profile', label: 'Profil', icon: IconUserRound },
  ],
  [ROLES.PELANGGAN]: [
    { id: 'home', label: 'Beranda', icon: IconHome },
    { id: 'menu', label: 'Menu', icon: IconCookingPot },
    { id: 'orders', label: 'Pesanan', icon: IconClipboardList },
    { id: 'profile', label: 'Profil', icon: IconUserRound },
  ],
};

export default function BottomNav() {
  const { activeTab, setActiveTab } = useApp();
  const { role } = useAuth();

  const cleanRole = (role || '').toLowerCase();
  const navItems = NAV_CONFIG[cleanRole] || NAV_CONFIG[ROLES.PELANGGAN];

  return (
    <nav className="bottom-nav" aria-label="Navigasi Utama">
      {navItems.map((item) => {
        const isActive = activeTab === item.id;
        const IconComponent = item.icon;
        const iconColor = isActive ? 'var(--primary-dark)' : 'var(--muted)';

        return (
          <button
            key={item.id}
            type="button"
            className={`nav-item ${isActive ? 'active' : ''}`}
            onClick={() => setActiveTab(item.id)}
            aria-current={isActive ? 'page' : undefined}
          >
            <span className="nav-icon-wrap">
              <IconComponent size={21} color={iconColor} />
            </span>
            <span className="nav-label">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
