export default function LoadingState({ message = 'Menyiapkan data...' }) {
  return (
    <div className="loading-indicator-wrap">
      <div className="loading-spinner-circle"></div>
      <div style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text)', marginBottom: '16px' }}>
        {message}
      </div>

      {/* Modern skeleton cards */}
      <div style={{ width: '100%', maxWidth: '440px' }}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="loading-skeleton-box">
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div className="skeleton-line" style={{ width: '48px', height: '48px', borderRadius: '12px' }}></div>
              <div style={{ flex: 1 }}>
                <div className="skeleton-line" style={{ width: '60%', height: '14px', marginBottom: '8px' }}></div>
                <div className="skeleton-line" style={{ width: '35%', height: '12px' }}></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
