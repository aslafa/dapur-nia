export default function ErrorState({
  title = 'Oops, terjadi kesalahan',
  subtitle = 'Data belum dapat dimuat.',
  onRetry,
}) {
  return (
    <div className="error-state-card" role="alert">
      <div className="error-state-icon" aria-hidden="true">⚠️</div>
      <h3 className="error-state-title">{title}</h3>
      <p className="error-state-subtitle">{subtitle}</p>
      {onRetry && (
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={onRetry}
        >
          🔄 Coba Lagi
        </button>
      )}
    </div>
  );
}
