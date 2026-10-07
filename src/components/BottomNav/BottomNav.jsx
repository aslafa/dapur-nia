import { useApp } from '../../context/AppContext';
import {
  IconHome,
  IconCookingPot,
  IconClipboardList,
  IconUsers,
  IconUserRound,
} from '../Icons';

export default function BottomNav() {
  const { activeTab, setActiveTab } = useApp();

  const navItems = [
    { id: 'home', label: 'Beranda', icon: IconHome },
    { id: 'menu', label: 'Menu', icon: IconCookingPot },
    { id: 'orders', label: 'Pesanan', icon: IconClipboardList },
    { id: 'customers', label: 'Pelanggan', icon: IconUsers },
    { id: 'profile', label: 'Profil', icon: IconUserRound },
  ];

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
