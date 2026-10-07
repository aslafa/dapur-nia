import { useApp } from '../../context/AppContext';

export default function Toast() {
  const { toasts, removeToast } = useApp();

  if (!toasts.length) return null;

  return (
    <div className="toast-floating-container" aria-live="polite">
      {toasts.map((t) => {
        const getIcon = () => {
          if (t.type === 'danger') return '❌';
          if (t.type === 'warning') return '⚠️';
          if (t.type === 'info') return 'ℹ️';
          return '✅';
        };

        return (
          <div
            key={t.id}
            className={`toast-pill ${t.type}`}
            onClick={() => removeToast(t.id)}
            role="alert"
          >
            <span className="toast-pill-icon">{getIcon()}</span>
            <span>{t.message}</span>
          </div>
        );
      })}
    </div>
  );
}
