import StatusBadge from '../StatusBadge/StatusBadge';
import { IconUserRound, IconCookingPot } from '../Icons';
import { formatCurrency } from '../../data/dummyData';

export default function OrderCard({ order, onDetail }) {
  return (
    <article className="app-card" aria-label={`Pesanan #${order.nomorPesanan}`}>
      <div className="order-card-header">
        <span className="order-number-badge">#{order.nomorPesanan}</span>
        <StatusBadge status={order.status} type="order" />
      </div>

      <div className="order-customer-name" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <IconUserRound size={15} color="var(--muted)" />
        <span>{order.pelangganNama}</span>
      </div>

      <div className="order-menu-summary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <IconCookingPot size={15} color="var(--primary-dark)" />
        <span>{order.menuNama} × {order.jumlahPorsi} porsi</span>
      </div>

      <div className="order-card-bottom">
        <div>
          <div style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: '600', textTransform: 'uppercase' }}>
            Total Pembayaran
          </div>
          <div className="order-total-amount">{formatCurrency(order.total)}</div>
        </div>

        <div>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => onDetail(order)}
          >
            Lihat Detail
          </button>
        </div>
      </div>
    </article>
  );
}
