import { IconMessageCircle, IconMapPin, IconPencil, IconTrash } from '../Icons';

export default function CustomerCard({ customer, onEdit, onDelete }) {
  const getInitials = (name) => {
    if (!name) return '??';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  };

  const getWaLink = (phone) => {
    let clean = phone.replace(/[^0-9]/g, '');
    if (clean.startsWith('0')) {
      clean = '62' + clean.slice(1);
    }
    return `https://wa.me/${clean}`;
  };

  return (
    <article className="app-card" aria-label={`Pelanggan ${customer.nama}`}>
      <div className="customer-card-layout">
        <div className="customer-card-avatar" aria-hidden="true">
          {getInitials(customer.nama)}
        </div>

        <div className="menu-card-details">
          <h3 className="customer-card-name">{customer.nama}</h3>
          
          <div className="customer-card-info-row">
            <IconMessageCircle size={14} color="#15803D" />
            <a
              href={getWaLink(customer.whatsapp)}
              target="_blank"
              rel="noopener noreferrer"
              className="customer-wa-link"
              title="Kirim pesan WhatsApp"
            >
              {customer.whatsapp}
            </a>
          </div>

          <div className="customer-card-info-row" style={{ alignItems: 'flex-start' }}>
            <span style={{ marginTop: '2px', flexShrink: 0 }}>
              <IconMapPin size={14} color="var(--muted)" />
            </span>
            <span style={{ color: 'var(--text)', wordBreak: 'break-word' }}>
              {customer.alamat}
            </span>
          </div>
        </div>

        <div className="card-actions-col">
          <button
            type="button"
            className="btn-icon-square"
            onClick={() => onEdit(customer)}
            title="Edit Pelanggan"
            aria-label={`Edit ${customer.nama}`}
          >
            <IconPencil size={15} color="var(--muted)" />
          </button>
          <button
            type="button"
            className="btn-icon-square danger"
            onClick={() => onDelete(customer)}
            title="Hapus Pelanggan"
            aria-label={`Hapus ${customer.nama}`}
          >
            <IconTrash size={15} color="var(--danger)" />
          </button>
        </div>
      </div>
    </article>
  );
}
