export default function EmptyState({
  icon = '📭',
  title = 'Belum ada data',
  subtitle = 'Belum ada data yang ditambahkan.',
  actionLabel,
  onAction,
}) {
  return (
    <div className="empty-state-card">
      <div className="empty-state-icon" aria-hidden="true">{icon}</div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-subtitle">{subtitle}</p>
      {actionLabel && onAction && (
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={onAction}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
