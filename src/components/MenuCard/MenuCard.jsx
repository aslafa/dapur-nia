import StatusBadge from '../StatusBadge/StatusBadge';
import { IconCookingPot, IconCup, IconPencil, IconTrash, IconPlus } from '../Icons';
import { formatCurrency, isDrinkMenu } from '../../data/dummyData';

export default function MenuCard({ menu, onEdit, onDelete, onOrder, role = 'pemilik' }) {
  const isAvailable = menu.sisaPorsi > 0 && menu.tersedia;
  const isDrink = isDrinkMenu(menu);
  const isCustomer = role === 'pelanggan';

  return (
    <article className="app-card" aria-label={`Menu ${menu.nama}`}>
      <div className="menu-card-layout">
        <div
          className="menu-card-avatar"
          style={{
            background: isDrink ? '#EFF6FF' : 'var(--primary-subtle)',
            borderColor: isDrink ? '#BFDBFE' : 'var(--primary-light)',
          }}
          aria-hidden="true"
        >
          {isDrink ? (
            <IconCup size={22} color="#2563EB" />
          ) : (
            <IconCookingPot size={22} color="var(--primary-dark)" />
          )}
        </div>

        <div className="menu-card-details">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <h3 className="menu-card-title">{menu.nama}</h3>
            {isDrink && (
              <span
                style={{
                  fontSize: '9.5px',
                  fontWeight: '700',
                  color: '#1D4ED8',
                  background: '#DBEAFE',
                  padding: '1px 5px',
                  borderRadius: '4px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.2px',
                }}
              >
                Minuman
              </span>
            )}
          </div>
          <div className="menu-card-price">{formatCurrency(menu.harga)}</div>
          <div className="menu-card-meta">
            <span className="menu-card-portion">
              {menu.sisaPorsi > 0 ? `${menu.sisaPorsi} porsi tersisa` : '0 porsi tersisa'}
            </span>
            <StatusBadge
              type="menu"
              available={isAvailable}
              status={isAvailable ? 'tersedia' : 'habis'}
            />
          </div>
        </div>

        <div className="card-actions-col">
          {isCustomer ? (
            <button
              type="button"
              className={`btn btn-sm ${isAvailable ? 'btn-primary' : 'btn-secondary'}`}
              style={{
                padding: '6px 12px',
                fontSize: '12.5px',
                fontWeight: '700',
                gap: '4px',
                whiteSpace: 'nowrap',
              }}
              disabled={!isAvailable}
              onClick={() => onOrder && onOrder(menu)}
            >
              <IconPlus size={14} />
              <span>{isAvailable ? 'Pesan' : 'Habis'}</span>
            </button>
          ) : (
            <>
              <button
                type="button"
                className="btn-icon-square"
                onClick={() => onEdit && onEdit(menu)}
                title="Edit Menu"
                aria-label={`Edit ${menu.nama}`}
              >
                <IconPencil size={15} color="var(--muted)" />
              </button>
              <button
                type="button"
                className="btn-icon-square danger"
                onClick={() => onDelete && onDelete(menu)}
                title="Hapus Menu"
                aria-label={`Hapus ${menu.nama}`}
              >
                <IconTrash size={15} color="var(--danger)" />
              </button>
            </>
          )}
        </div>
      </div>
    </article>
  );
}
