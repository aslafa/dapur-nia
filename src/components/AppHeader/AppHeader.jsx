import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { IconBell, IconArrowLeft, IconUserRound } from '../Icons';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 11) return 'Selamat pagi';
  if (hour >= 11 && hour < 15) return 'Selamat siang';
  if (hour >= 15 && hour < 18) return 'Selamat sore';
  return 'Selamat malam';
}

export default function AppHeader({
  icon,
  title,
  subtitle,
  showGreeting = false,
  showBack = false,
  onBack,
}) {
  const { setActiveTab, businessInfo, unreadNotificationsCount, setIsNotificationOpen } = useApp();
  const { currentUser } = useAuth();

  const handleNotificationClick = () => {
    setIsNotificationOpen(true);
  };

  return (
    <header className="app-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
        {showBack && (
          <button
            type="button"
            className="header-icon-btn back-btn"
            onClick={onBack || (() => setActiveTab('home'))}
            aria-label="Kembali"
            title="Kembali"
          >
            <IconArrowLeft size={18} color="var(--text)" />
          </button>
        )}

        {showGreeting ? (
          <div className="header-greeting-wrap">
            <div
              className="header-avatar"
              onClick={() => setActiveTab('profile')}
              style={{ cursor: 'pointer' }}
              title="Buka Profil Usaha"
            >
              <IconUserRound size={18} color="var(--primary-dark)" />
            </div>
            <div>
              <div className="header-greeting-sub">{getGreeting()},</div>
              <div className="header-greeting-name">{currentUser?.name || businessInfo?.namaUsaha || 'Dapur Nia'}</div>
            </div>
          </div>
        ) : (
          <div style={{ minWidth: 0 }}>
            <div className="header-title-text" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {icon && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--primary-dark)',
                    flexShrink: 0,
                  }}
                >
                  {icon}
                </span>
              )}
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {title || 'Dapur Nia'}
              </span>
            </div>
            {subtitle && <div className="header-greeting-sub">{subtitle}</div>}
          </div>
        )}
      </div>

      <div className="header-actions">
        <button
          type="button"
          className="header-icon-btn"
          onClick={handleNotificationClick}
          aria-label={
            unreadNotificationsCount > 0
              ? `Notifikasi (${unreadNotificationsCount} belum dibaca)`
              : 'Notifikasi'
          }
          title="Buka Notifikasi"
        >
          <IconBell size={18} color="var(--text)" />
          {unreadNotificationsCount > 0 && (
            <span className="header-badge-count">
              {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
