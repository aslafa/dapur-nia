export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Hapus data ini?',
  message = 'Data yang dihapus tidak dapat dikembalikan.',
  confirmText = 'Hapus',
  cancelText = 'Batal',
  danger = true,
}) {
  if (!isOpen) return null;

  return (
    <div
      className="dialog-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="alertdialog"
      aria-modal="true"
    >
      <div className="dialog-card">
        <div className="dialog-icon-bubble" aria-hidden="true">
          🗑️
        </div>
        <h3 className="dialog-title">{title}</h3>
        <p className="dialog-desc">{message}</p>
        <div className="dialog-btn-row">
          <button
            type="button"
            className="btn btn-secondary btn-block"
            onClick={onClose}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className={`btn ${danger ? 'btn-danger' : 'btn-primary'} btn-block`}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
