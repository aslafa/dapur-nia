import { useApp } from '../../context/AppContext';
import {
  IconBell,
  IconClipboardList,
  IconCheck,
  IconRotateCcw,
  IconCookingPot,
  IconX,
} from '../Icons';

function formatNotificationTime(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  const now = new Date();
  const diffMinutes = Math.floor((now - date) / (1000 * 60));

  if (diffMinutes < 1) return 'Baru saja';
  if (diffMinutes < 60) return `${diffMinutes} menit lalu`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} jam lalu`;

  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function NotificationSheet() {
  const {
    notifications,
    unreadNotificationsCount,
    isNotificationOpen,
    setIsNotificationOpen,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    navigateToOrder,
  } = useApp();

  if (!isNotificationOpen) return null;

  const handleItemClick = (notif) => {
    if (!notif.isRead) {
      markNotificationAsRead(notif.id);
    }
    if (notif.orderId) {
      navigateToOrder(notif.orderId);
    } else {
      setIsNotificationOpen(false);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'order_new':
        return {
          icon: <IconClipboardList size={18} color="#D97706" />,
          bg: '#FEF3C7',
        };
      case 'payment':
        return {
          icon: <IconCheck size={18} color="#16A34A" />,
          bg: '#DCFCE7',
        };
      case 'status_change':
      default:
        return {
          icon: <IconCookingPot size={18} color="#2563EB" />,
          bg: '#DBEAFE',
        };
    }
  };

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) setIsNotificationOpen(false);
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="notif-sheet-title"
    >
      <div className="bottom-sheet-panel notification-sheet-panel">
        <div className="sheet-drag-handle" aria-hidden="true"></div>

        {/* Header */}
        <div className="sheet-header-row" style={{ alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ display: 'inline-flex', color: 'var(--primary-dark)' }}>
              <IconBell size={20} color="var(--primary-dark)" />
            </span>
            <h2 id="notif-sheet-title" className="sheet-title-text" style={{ margin: 0 }}>
              Notifikasi
            </h2>
            {unreadNotificationsCount > 0 && (
              <span className="notif-pill-count">
                {unreadNotificationsCount} baru
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {unreadNotificationsCount > 0 && (
              <button
                type="button"
                className="notif-btn-mark-all"
                onClick={markAllNotificationsAsRead}
                title="Tandai semua dibaca"
              >
                Tandai semua dibaca
              </button>
            )}
            <button
              type="button"
              className="sheet-close-btn"
              onClick={() => setIsNotificationOpen(false)}
              aria-label="Tutup notifikasi"
            >
              <IconX size={16} color="var(--muted)" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="sheet-body-content" style={{ padding: '8px 14px 20px' }}>
          {notifications.length === 0 ? (
            <div className="notif-empty-state">
              <div className="notif-empty-icon-wrap" aria-hidden="true">
                <IconBell size={38} color="var(--muted-light)" />
              </div>
              <h3 className="notif-empty-title">Belum ada notifikasi</h3>
              <p className="notif-empty-desc">
                Notifikasi pesanan dan pembayaran akan muncul di sini.
              </p>
            </div>
          ) : (
            <div className="notif-list-wrap">
              {notifications.map((notif) => {
                const { icon, bg } = getNotificationIcon(notif.type);
                const isUnread = !notif.isRead;

                return (
                  <div
                    key={notif.id}
                    className={`notif-card-item ${isUnread ? 'is-unread' : ''}`}
                    onClick={() => handleItemClick(notif)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') handleItemClick(notif);
                    }}
                  >
                    <div
                      className="notif-item-icon-bubble"
                      style={{ background: bg }}
                      aria-hidden="true"
                    >
                      {icon}
                    </div>

                    <div className="notif-item-details">
                      <div className="notif-item-top-row">
                        <span className="notif-item-title">{notif.title}</span>
                        <span className="notif-item-time">
                          {formatNotificationTime(notif.createdAt)}
                        </span>
                      </div>
                      <p className="notif-item-message">{notif.message}</p>
                      {notif.orderNumber && (
                        <span className="notif-item-link-hint">
                          Klik untuk lihat pesanan #{notif.orderNumber} →
                        </span>
                      )}
                    </div>

                    {isUnread && (
                      <span className="notif-unread-dot" title="Belum dibaca" />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
