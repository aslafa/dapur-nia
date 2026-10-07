import { useEffect } from 'react';

export default function Modal({ isOpen, onClose, title, children }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className="bottom-sheet-panel">
        <div className="sheet-drag-handle" aria-hidden="true"></div>
        <div className="sheet-header-row">
          <h2 className="sheet-title-text">{title}</h2>
          <button
            type="button"
            className="sheet-close-btn"
            onClick={onClose}
            aria-label="Tutup"
          >
            ✕
          </button>
        </div>
        <div className="sheet-body-content">{children}</div>
      </div>
    </div>
  );
}
