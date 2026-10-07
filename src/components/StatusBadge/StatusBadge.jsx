import { ORDER_STATUS } from '../../data/dummyData';

export default function StatusBadge({ status, type = 'order', available = true }) {
  if (type === 'menu') {
    if (!available) {
      return <span className="status-badge status-badge-danger">● Habis</span>;
    }
    return <span className="status-badge status-badge-success">● Tersedia</span>;
  }

  // Order status
  const config = ORDER_STATUS[status] || {
    label: status,
    color: 'muted',
  };

  const getStyleClass = () => {
    switch (config.color) {
      case 'success':
        return 'status-badge-success';
      case 'danger':
        return 'status-badge-danger';
      case 'warning':
        return 'status-badge-warning';
      case 'info':
        return 'status-badge-info';
      case 'primary':
        return 'status-badge-primary';
      default:
        return 'status-badge-muted';
    }
  };

  return (
    <span className={`status-badge ${getStyleClass()}`}>
      ● {config.label}
    </span>
  );
}
