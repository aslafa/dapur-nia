import { useState } from 'react';
import { useApp } from '../../context/AppContext';

import SearchBar from '../../components/SearchBar/SearchBar';
import StatusBadge from '../../components/StatusBadge/StatusBadge';
import Modal from '../../components/Modal/Modal';

import {
  IconCookingPot,
  IconCup,
  IconUsers,
  IconClipboardList,
  IconChartColumn,
  IconChevronRight,
} from '../../components/Icons';

import { formatCurrency, isDrinkMenu } from '../../data/dummyData';

export default function Home() {
  const {
    menus,
    orders,
    setActiveTab,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const normalizedSearch = searchTerm.trim().toLowerCase();

  const filteredMenus = menus.filter((menu) =>
    menu.nama.toLowerCase().includes(normalizedSearch)
  );

  const filteredOrders = orders.filter(
    (order) =>
      order.pelangganNama.toLowerCase().includes(normalizedSearch) ||
      order.nomorPesanan.toLowerCase().includes(normalizedSearch) ||
      order.menuNama.toLowerCase().includes(normalizedSearch)
  );

  const todayMenus = filteredMenus.slice(0, 4);
  const recentOrders = filteredOrders.slice(0, 3);

  const totalRevenue = orders
    .filter((order) => order.status !== 'dibatalkan')
    .reduce((acc, curr) => acc + curr.total, 0);

  const activeOrdersCount = orders.filter(
    (order) =>
      order.status === 'menunggu' ||
      order.status === 'dibayar' ||
      order.status === 'diproses'
  ).length;

  return (
    <div className="page-container">

      {/* =========================
          SEARCH
      ========================= */}

      <SearchBar
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Cari menu, pelanggan, atau pesanan..."
      />

      {/* =========================
          HERO
      ========================= */}

      <div className="hero-card">
        <h2 className="hero-title">
          Masakan rumahan,
          <br />
          fresh setiap hari
        </h2>

        <p className="hero-subtitle">
          Kelola katering Dapur Nia lebih mudah dan rapi dalam satu aplikasi.
        </p>

        <button
          type="button"
          className="hero-action-btn"
          onClick={() => setActiveTab('menu')}
        >
          <span>Lihat Menu</span>
          <IconChevronRight
            size={14}
            color="var(--primary-dark)"
          />
        </button>
      </div>

      {/* =========================
          RUNNING TICKER
      ========================= */}

      <div className="running-ticker-wrap">
        <div className="running-ticker-content">

          <div className="running-ticker-item">
            <span style={{ color: 'var(--primary-dark)' }}>●</span>
            Masakan fresh dibuat setiap pagi
          </div>

          <div className="running-ticker-item">
            <span style={{ color: 'var(--primary-dark)' }}>●</span>
            Pengantaran katering tepat waktu
          </div>

          <div className="running-ticker-item">
            <span style={{ color: 'var(--primary-dark)' }}>●</span>
            Menu variatif dengan bahan pilihan
          </div>

          <div className="running-ticker-item">
            <span style={{ color: 'var(--primary-dark)' }}>●</span>
            Porsi terkelola rapi bebas pesanan terlewat
          </div>

          <div className="running-ticker-item">
            <span style={{ color: 'var(--primary-dark)' }}>●</span>
            Masakan fresh dibuat setiap pagi
          </div>

        </div>
      </div>

      {/* =========================
          QUICK ACTIONS
      ========================= */}

      <div className="quick-actions-grid">

        {/* MENU */}
        <button
          type="button"
          className="quick-action-btn"
          onClick={() => setActiveTab('menu')}
        >
          <div
            className="quick-action-icon-bg"
            style={{ background: '#FEF3C7' }}
          >
            <IconCookingPot
              size={22}
              color="#D97706"
            />
          </div>

          <span className="quick-action-title">
            Menu
          </span>
        </button>

        {/* PELANGGAN */}
        <button
          type="button"
          className="quick-action-btn"
          onClick={() => setActiveTab('customers')}
        >
          <div
            className="quick-action-icon-bg"
            style={{ background: '#DBEAFE' }}
          >
            <IconUsers
              size={22}
              color="#2563EB"
            />
          </div>

          <span className="quick-action-title">
            Pelanggan
          </span>
        </button>

        {/* PESANAN */}
        <button
          type="button"
          className="quick-action-btn"
          onClick={() => setActiveTab('orders')}
        >
          <div
            className="quick-action-icon-bg"
            style={{ background: '#DCFCE7' }}
          >
            <IconClipboardList
              size={22}
              color="#16A34A"
            />
          </div>

          <span className="quick-action-title">
            Pesanan
          </span>
        </button>

        {/* LAPORAN */}
        <button
          type="button"
          className="quick-action-btn"
          onClick={() => setActiveTab('reports')}
        >
          <div
            className="quick-action-icon-bg"
            style={{ background: '#F3E8FF' }}
          >
            <IconChartColumn
              size={22}
              color="#9333EA"
            />
          </div>

          <span className="quick-action-title">
            Laporan
          </span>
        </button>

      </div>

      {/* =========================
          STATISTICS
      ========================= */}

      <div
        className="report-stat-grid"
        style={{ marginBottom: '14px' }}
      >

        {/* PESANAN AKTIF */}
        <div
          className="stat-box"
          onClick={() => setActiveTab('orders')}
          style={{ cursor: 'pointer' }}
        >
          <div className="stat-box-title">
            Pesanan Aktif
          </div>

          <div className="stat-box-num">
            {activeOrdersCount}
          </div>

          <div
            style={{
              fontSize: '11px',
              color: 'var(--muted)',
              marginTop: '2px',
            }}
          >
            menunggu / diproses
          </div>
        </div>

        {/* TOTAL PENDAPATAN */}
        <div
          className="stat-box"
          onClick={() => setActiveTab('reports')}
          style={{ cursor: 'pointer' }}
        >
          <div className="stat-box-title">
            Total Pendapatan
          </div>

          <div
            className="stat-box-num"
            style={{
              fontSize: '16px',
              color: 'var(--primary-dark)',
            }}
          >
            {formatCurrency(totalRevenue)}
          </div>

          <div
            style={{
              fontSize: '11px',
              color: 'var(--muted)',
              marginTop: '2px',
            }}
          >
            penjualan valid
          </div>
        </div>

      </div>

      {/* =========================
          MENU HARI INI
      ========================= */}

      <div style={{ marginBottom: '16px' }}>

        <div className="section-header-row">

          <h3 className="section-heading-title">
            Menu Hari Ini
          </h3>

          <button
            type="button"
            className="section-view-all-link"
            onClick={() => setActiveTab('menu')}
          >
            Lihat semua
          </button>

        </div>

        {todayMenus.length > 0 ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gap: '8px',
            }}
          >

            {todayMenus.map((item) => (
              <div
                key={item.id}
                className="app-card"
                style={{
                  padding: '12px',
                  marginBottom: 0,
                  cursor: 'pointer',
                  minWidth: 0,
                }}
                onClick={() => setActiveTab('menu')}
              >

                {/* ICON */}
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: 'var(--radius-xs)',
                    background: isDrinkMenu(item) ? '#EFF6FF' : 'var(--primary-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '8px',
                  }}
                >
                  {isDrinkMenu(item) ? (
                    <IconCup
                      size={18}
                      color="#2563EB"
                    />
                  ) : (
                    <IconCookingPot
                      size={18}
                      color="var(--primary-dark)"
                    />
                  )}
                </div>

                {/* NAMA */}
                <div
                  style={{
                    fontSize: '13.5px',
                    fontWeight: '700',
                    color: 'var(--text)',
                    marginBottom: '2px',
                    lineHeight: '1.25',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                  }}
                >
                  {item.nama}
                </div>

                {/* HARGA */}
                <div
                  style={{
                    fontSize: '13px',
                    fontWeight: '700',
                    color: 'var(--primary-dark)',
                    marginBottom: '6px',
                  }}
                >
                  {formatCurrency(item.harga)}
                </div>

                {/* STOCK + STATUS */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '4px',
                    minWidth: 0,
                  }}
                >

                  <span
                    style={{
                      fontSize: '11px',
                      color: 'var(--muted)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {item.sisaPorsi} porsi
                  </span>

                  <StatusBadge
                    type="menu"
                    available={
                      item.sisaPorsi > 0 &&
                      item.tersedia
                    }
                  />

                </div>

              </div>
            ))}

          </div>
        ) : (
          <div
            className="app-card"
            style={{
              textAlign: 'center',
              padding: '24px 16px',
              color: 'var(--muted)',
            }}
          >
            Tidak ada menu yang sesuai pencarian.
          </div>
        )}

      </div>

      {/* =========================
          PESANAN TERBARU
      ========================= */}

      <div>

        <div className="section-header-row">

          <h3 className="section-heading-title">
            Pesanan Terbaru
          </h3>

          <button
            type="button"
            className="section-view-all-link"
            onClick={() => setActiveTab('orders')}
          >
            Lihat semua
          </button>

        </div>

        {recentOrders.length > 0 ? (
          <div>

            {recentOrders.map((ord) => (
              <div
                key={ord.id}
                className="app-card"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px 14px',
                  cursor: 'pointer',
                  minWidth: 0,
                }}
                onClick={() => {
                  setSelectedOrder(ord);
                }}
              >

                {/* ORDER NUMBER */}
                <span className="order-number-badge">
                  #{ord.nomorPesanan}
                </span>

                {/* CUSTOMER + MENU */}
                <div
                  style={{
                    flex: 1,
                    minWidth: 0,
                  }}
                >

                  <div
                    style={{
                      fontSize: '13.5px',
                      fontWeight: '700',
                      color: 'var(--text)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {ord.pelangganNama}
                  </div>

                  <div
                    style={{
                      fontSize: '11.5px',
                      color: 'var(--muted)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {ord.menuNama} × {ord.jumlahPorsi}
                  </div>

                </div>

                {/* TOTAL + STATUS */}
                <div
                  style={{
                    textAlign: 'right',
                    flexShrink: 0,
                  }}
                >

                  <div
                    style={{
                      fontSize: '13px',
                      fontWeight: '700',
                      color: 'var(--text)',
                      marginBottom: '2px',
                    }}
                  >
                    {formatCurrency(ord.total)}
                  </div>

                  <StatusBadge
                    status={ord.status}
                    type="order"
                  />

                </div>

              </div>
            ))}

          </div>
        ) : (
          <div
            className="app-card"
            style={{
              textAlign: 'center',
              padding: '24px 16px',
              color: 'var(--muted)',
            }}
          >
            Belum ada pesanan yang sesuai.
          </div>
        )}

      </div>

      {/* =========================
          QUICK ORDER DETAIL MODAL
      ========================= */}

      <Modal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={
          selectedOrder
            ? `Pesanan #${selectedOrder.nomorPesanan}`
            : ''
        }
      >

        {selectedOrder && (
          <div>

            {/* STATUS HEADER */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '14px',
                flexWrap: 'wrap',
              }}
            >

              <span
                className="order-number-badge"
                style={{ fontSize: '13px' }}
              >
                #{selectedOrder.nomorPesanan}
              </span>

              <StatusBadge
                status={selectedOrder.status}
                type="order"
              />

            </div>

            {/* PEMESAN */}
            <div className="form-field-group">

              <label className="form-label-top">
                Pemesan
              </label>

              <div
                style={{
                  fontSize: '14px',
                  fontWeight: '600',
                }}
              >
                {selectedOrder.pelangganNama}
              </div>

            </div>

            {/* MENU */}
            <div className="form-field-group">

              <label className="form-label-top">
                Menu Dipesan
              </label>

              <div
                style={{
                  fontSize: '14px',
                  fontWeight: '600',
                }}
              >
                {selectedOrder.menuNama} ×{' '}
                {selectedOrder.jumlahPorsi} porsi
              </div>

              <div
                style={{
                  fontSize: '12px',
                  color: 'var(--muted)',
                  marginTop: '2px',
                }}
              >
                Satuan:{' '}
                {formatCurrency(
                  selectedOrder.hargaSatuan
                )}
              </div>

            </div>

            {/* ONGKIR */}
            <div className="form-field-group">

              <label className="form-label-top">
                Ongkos Kirim
              </label>

              <div
                style={{
                  fontSize: '13.5px',
                  fontWeight: '500',
                }}
              >
                {formatCurrency(
                  selectedOrder.ongkir
                )}
              </div>

            </div>

            {/* TOTAL */}
            <div
              style={{
                borderTop:
                  '1px solid var(--border)',
                paddingTop: '10px',
                marginTop: '10px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '12px',
              }}
            >

              <span
                style={{
                  fontSize: '13px',
                  fontWeight: '700',
                }}
              >
                Total Tagihan
              </span>

              <span
                style={{
                  fontSize: '17px',
                  fontWeight: '800',
                  color: 'var(--primary-dark)',
                  whiteSpace: 'nowrap',
                }}
              >
                {formatCurrency(
                  selectedOrder.total
                )}
              </span>

            </div>

            {/* ACTIONS */}
            <div className="sheet-actions-row">

              <button
                type="button"
                className="btn btn-secondary btn-block"
                onClick={() => setSelectedOrder(null)}
              >
                Tutup
              </button>

              <button
                type="button"
                className="btn btn-primary btn-block"
                onClick={() => {
                  setSelectedOrder(null);
                  setActiveTab('orders');
                }}
              >
                Kelola Pesanan
              </button>

            </div>

          </div>
        )}

      </Modal>

    </div>
  );
}