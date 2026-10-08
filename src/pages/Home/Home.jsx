import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
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
  IconCheck,
  IconPlus,
} from '../../components/Icons';
import { formatCurrency, isDrinkMenu } from '../../data/dummyData';
import { ROLES } from '../../services/authService';

// ─── HOME PEMILIK ───
function HomePemilik({
  menus,
  orders,
  setActiveTab,
  searchTerm,
  setSearchTerm,
  setSelectedOrder,
}) {
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
    <>
      <SearchBar
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Cari menu, pelanggan, atau pesanan..."
      />

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
          <IconChevronRight size={14} color="var(--primary-dark)" />
        </button>
      </div>

      <div className="running-ticker-wrap">
        <div className="running-ticker-content">
          <div className="running-ticker-item">
            <span style={{ color: 'var(--primary-dark)' }}>●</span> Masakan fresh
            dibuat setiap pagi
          </div>
          <div className="running-ticker-item">
            <span style={{ color: 'var(--primary-dark)' }}>●</span> Pengantaran
            katering tepat waktu
          </div>
          <div className="running-ticker-item">
            <span style={{ color: 'var(--primary-dark)' }}>●</span> Menu variatif
            dengan bahan pilihan
          </div>
          <div className="running-ticker-item">
            <span style={{ color: 'var(--primary-dark)' }}>●</span> Porsi terkelola
            rapi bebas pesanan terlewat
          </div>
        </div>
      </div>

      <div className="quick-actions-grid">
        <button
          type="button"
          className="quick-action-btn"
          onClick={() => setActiveTab('menu')}
        >
          <div className="quick-action-icon-bg" style={{ background: '#FEF3C7' }}>
            <IconCookingPot size={22} color="#D97706" />
          </div>
          <span className="quick-action-title">Menu</span>
        </button>

        <button
          type="button"
          className="quick-action-btn"
          onClick={() => setActiveTab('customers')}
        >
          <div className="quick-action-icon-bg" style={{ background: '#DBEAFE' }}>
            <IconUsers size={22} color="#2563EB" />
          </div>
          <span className="quick-action-title">Pelanggan</span>
        </button>

        <button
          type="button"
          className="quick-action-btn"
          onClick={() => setActiveTab('orders')}
        >
          <div className="quick-action-icon-bg" style={{ background: '#DCFCE7' }}>
            <IconClipboardList size={22} color="#16A34A" />
          </div>
          <span className="quick-action-title">Pesanan</span>
        </button>

        <button
          type="button"
          className="quick-action-btn"
          onClick={() => setActiveTab('reports')}
        >
          <div className="quick-action-icon-bg" style={{ background: '#F3E8FF' }}>
            <IconChartColumn size={22} color="#9333EA" />
          </div>
          <span className="quick-action-title">Laporan</span>
        </button>
      </div>

      <div className="report-stat-grid" style={{ marginBottom: '14px' }}>
        <div
          className="stat-box"
          onClick={() => setActiveTab('orders')}
          style={{ cursor: 'pointer' }}
        >
          <div className="stat-box-title">Pesanan Aktif</div>
          <div className="stat-box-num">{activeOrdersCount}</div>
          <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>
            menunggu / diproses
          </div>
        </div>

        <div
          className="stat-box"
          onClick={() => setActiveTab('reports')}
          style={{ cursor: 'pointer' }}
        >
          <div className="stat-box-title">Total Pendapatan</div>
          <div
            className="stat-box-num"
            style={{ fontSize: '16px', color: 'var(--primary-dark)' }}
          >
            {formatCurrency(totalRevenue)}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>
            penjualan valid
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <div className="section-header-row">
          <h3 className="section-heading-title">Menu Hari Ini</h3>
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
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: 'var(--radius-xs)',
                    background: isDrinkMenu(item)
                      ? '#EFF6FF'
                      : 'var(--primary-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '8px',
                  }}
                >
                  {isDrinkMenu(item) ? (
                    <IconCup size={18} color="#2563EB" />
                  ) : (
                    <IconCookingPot size={18} color="var(--primary-dark)" />
                  )}
                </div>

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

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '4px',
                    minWidth: 0,
                  }}
                >
                  <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
                    {item.sisaPorsi} porsi
                  </span>
                  <StatusBadge
                    type="menu"
                    available={item.sisaPorsi > 0 && item.tersedia}
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

      <div>
        <div className="section-header-row">
          <h3 className="section-heading-title">Pesanan Terbaru</h3>
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
                onClick={() => setSelectedOrder(ord)}
              >
                <span className="order-number-badge">#{ord.nomorPesanan}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
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
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
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
                  <StatusBadge status={ord.status} type="order" />
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
    </>
  );
}

// ─── HOME STAF ───
function HomeStaf({ orders, setActiveTab, userName, setSelectedOrder }) {
  const todayOrders = orders.length;
  const pendingPayment = orders.filter((o) => o.status === 'menunggu').length;
  const toProcess = orders.filter(
    (o) => o.status === 'dibayar' || o.status === 'diproses'
  ).length;
  const completed = orders.filter((o) => o.status === 'selesai').length;

  const activeWorkOrders = orders
    .filter((o) => o.status !== 'selesai' && o.status !== 'dibatalkan')
    .slice(0, 4);

  return (
    <>
      <div style={{ marginBottom: '16px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text)' }}>
          Selamat datang, {userName}
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '2px' }}>
          Kelola pesanan dan konfirmasi pembayaran hari ini.
        </p>
      </div>

      {/* Overview Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          gap: '10px',
          marginBottom: '18px',
        }}
      >
        <div
          className="app-card"
          style={{ padding: '14px', marginBottom: 0, cursor: 'pointer' }}
          onClick={() => setActiveTab('orders')}
        >
          <div style={{ fontSize: '11.5px', color: 'var(--muted)', fontWeight: '600' }}>
            Pesanan Hari Ini
          </div>
          <div
            style={{
              fontSize: '22px',
              fontWeight: '800',
              color: 'var(--text)',
              marginTop: '4px',
            }}
          >
            {todayOrders}
          </div>
        </div>

        <div
          className="app-card"
          style={{
            padding: '14px',
            marginBottom: 0,
            cursor: 'pointer',
            borderLeft: '3px solid #F59E0B',
          }}
          onClick={() => setActiveTab('orders')}
        >
          <div style={{ fontSize: '11.5px', color: '#B45309', fontWeight: '600' }}>
            Menunggu Pembayaran
          </div>
          <div
            style={{
              fontSize: '22px',
              fontWeight: '800',
              color: '#D97706',
              marginTop: '4px',
            }}
          >
            {pendingPayment}
          </div>
        </div>

        <div
          className="app-card"
          style={{
            padding: '14px',
            marginBottom: 0,
            cursor: 'pointer',
            borderLeft: '3px solid #3B82F6',
          }}
          onClick={() => setActiveTab('orders')}
        >
          <div style={{ fontSize: '11.5px', color: '#1D4ED8', fontWeight: '600' }}>
            Perlu Diproses
          </div>
          <div
            style={{
              fontSize: '22px',
              fontWeight: '800',
              color: '#2563EB',
              marginTop: '4px',
            }}
          >
            {toProcess}
          </div>
        </div>

        <div
          className="app-card"
          style={{
            padding: '14px',
            marginBottom: 0,
            cursor: 'pointer',
            borderLeft: '3px solid #22C55E',
          }}
          onClick={() => setActiveTab('orders')}
        >
          <div style={{ fontSize: '11.5px', color: '#15803D', fontWeight: '600' }}>
            Pesanan Selesai
          </div>
          <div
            style={{
              fontSize: '22px',
              fontWeight: '800',
              color: '#16A34A',
              marginTop: '4px',
            }}
          >
            {completed}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: '20px' }}>
        <h3
          style={{
            fontSize: '14px',
            fontWeight: '700',
            color: 'var(--text)',
            marginBottom: '10px',
          }}
        >
          Tindakan Cepat
        </h3>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            className="btn btn-primary"
            style={{ flex: 1, padding: '12px', fontSize: '13.5px', gap: '8px' }}
            onClick={() => setActiveTab('orders')}
          >
            <IconClipboardList size={18} />
            <span>Kelola Pesanan</span>
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            style={{
              flex: 1,
              padding: '12px',
              fontSize: '13.5px',
              gap: '8px',
              borderColor: '#F59E0B',
              color: '#B45309',
            }}
            onClick={() => setActiveTab('orders')}
          >
            <IconCheck size={18} color="#D97706" />
            <span>Konfirmasi Pembayaran</span>
          </button>
        </div>
      </div>

      {/* Urgent Orders List */}
      <div>
        <div className="section-header-row">
          <h3 className="section-heading-title">Pesanan Perlu Perhatian</h3>
          <button
            type="button"
            className="section-view-all-link"
            onClick={() => setActiveTab('orders')}
          >
            Lihat semua
          </button>
        </div>

        {activeWorkOrders.length > 0 ? (
          <div>
            {activeWorkOrders.map((ord) => (
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
                onClick={() => setSelectedOrder(ord)}
              >
                <span className="order-number-badge">#{ord.nomorPesanan}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
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
                <StatusBadge status={ord.status} type="order" />
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
            Semua pesanan telah diproses dengan baik.
          </div>
        )}
      </div>
    </>
  );
}

// ─── HOME PELANGGAN ───
function HomePelanggan({
  menus,
  orders,
  setActiveTab,
  userName,
  currentUser,
  setSelectedOrder,
}) {
  const availableMenus = menus.filter((m) => m.tersedia && m.sisaPorsi > 0);

  // Filter orders created by or belonging to this customer
  const customerOrders = orders.filter((o) => {
    if (!currentUser) return true;
    const nameMatch =
      o.pelangganNama.toLowerCase() === (currentUser.name || '').toLowerCase();
    const phoneMatch =
      currentUser.phone &&
      o.pelangganWhatsapp &&
      o.pelangganWhatsapp.includes(currentUser.phone.slice(-6));
    return nameMatch || phoneMatch;
  });

  const pendingPay = customerOrders.filter((o) => o.status === 'menunggu').length;
  const paid = customerOrders.filter((o) => o.status === 'dibayar').length;
  const processing = customerOrders.filter((o) => o.status === 'diproses').length;
  const done = customerOrders.filter((o) => o.status === 'selesai').length;

  return (
    <>
      <div style={{ marginBottom: '16px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text)' }}>
          Selamat datang, {userName}
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '2px' }}>
          Pesan masakan katering rumahan fresh untuk hari ini.
        </p>
      </div>

      {/* Section 1: Menu Hari Ini */}
      <div style={{ marginBottom: '22px' }}>
        <div className="section-header-row">
          <h3 className="section-heading-title">Menu Hari Ini</h3>
          <button
            type="button"
            className="section-view-all-link"
            onClick={() => setActiveTab('menu')}
          >
            Lihat semua
          </button>
        </div>

        {availableMenus.length > 0 ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gap: '10px',
            }}
          >
            {availableMenus.slice(0, 4).map((item) => (
              <div
                key={item.id}
                className="app-card"
                style={{
                  padding: '12px',
                  marginBottom: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: 'var(--radius-xs)',
                      background: isDrinkMenu(item)
                        ? '#EFF6FF'
                        : 'var(--primary-light)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '8px',
                    }}
                  >
                    {isDrinkMenu(item) ? (
                      <IconCup size={18} color="#2563EB" />
                    ) : (
                      <IconCookingPot size={18} color="var(--primary-dark)" />
                    )}
                  </div>

                  <div
                    style={{
                      fontSize: '13.5px',
                      fontWeight: '700',
                      color: 'var(--text)',
                      marginBottom: '3px',
                      lineHeight: '1.25',
                    }}
                  >
                    {item.nama}
                  </div>

                  <div
                    style={{
                      fontSize: '13px',
                      fontWeight: '800',
                      color: 'var(--primary-dark)',
                      marginBottom: '4px',
                    }}
                  >
                    {formatCurrency(item.harga)}
                  </div>

                  <div
                    style={{
                      fontSize: '11px',
                      color: 'var(--muted)',
                      marginBottom: '10px',
                    }}
                  >
                    Tersedia {item.sisaPorsi} porsi
                  </div>
                </div>

                <button
                  type="button"
                  className="btn btn-primary"
                  style={{
                    padding: '8px 10px',
                    fontSize: '12px',
                    minHeight: '34px',
                    gap: '4px',
                    width: '100%',
                  }}
                  onClick={() => setActiveTab('menu')}
                >
                  <IconPlus size={14} />
                  <span>Pesan</span>
                </button>
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
            Belum ada menu tersedia saat ini.
          </div>
        )}
      </div>

      {/* Section 2: Pesanan Saya */}
      <div>
        <div className="section-header-row">
          <h3 className="section-heading-title">Pesanan Saya</h3>
          <button
            type="button"
            className="section-view-all-link"
            onClick={() => setActiveTab('orders')}
          >
            Lihat semua
          </button>
        </div>

        {/* Status tracker grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
            gap: '6px',
            marginBottom: '14px',
          }}
        >
          <div
            className="app-card"
            style={{
              padding: '8px 6px',
              marginBottom: 0,
              textAlign: 'center',
              cursor: 'pointer',
            }}
            onClick={() => setActiveTab('orders')}
          >
            <div style={{ fontSize: '16px', fontWeight: '800', color: '#D97706' }}>
              {pendingPay}
            </div>
            <div
              style={{
                fontSize: '10px',
                color: 'var(--muted)',
                lineHeight: '1.2',
                marginTop: '2px',
              }}
            >
              Menunggu Bayar
            </div>
          </div>

          <div
            className="app-card"
            style={{
              padding: '8px 6px',
              marginBottom: 0,
              textAlign: 'center',
              cursor: 'pointer',
            }}
            onClick={() => setActiveTab('orders')}
          >
            <div style={{ fontSize: '16px', fontWeight: '800', color: '#16A34A' }}>
              {paid}
            </div>
            <div
              style={{
                fontSize: '10px',
                color: 'var(--muted)',
                lineHeight: '1.2',
                marginTop: '2px',
              }}
            >
              Dibayar
            </div>
          </div>

          <div
            className="app-card"
            style={{
              padding: '8px 6px',
              marginBottom: 0,
              textAlign: 'center',
              cursor: 'pointer',
            }}
            onClick={() => setActiveTab('orders')}
          >
            <div style={{ fontSize: '16px', fontWeight: '800', color: '#2563EB' }}>
              {processing}
            </div>
            <div
              style={{
                fontSize: '10px',
                color: 'var(--muted)',
                lineHeight: '1.2',
                marginTop: '2px',
              }}
            >
              Diproses
            </div>
          </div>

          <div
            className="app-card"
            style={{
              padding: '8px 6px',
              marginBottom: 0,
              textAlign: 'center',
              cursor: 'pointer',
            }}
            onClick={() => setActiveTab('orders')}
          >
            <div style={{ fontSize: '16px', fontWeight: '800', color: '#475569' }}>
              {done}
            </div>
            <div
              style={{
                fontSize: '10px',
                color: 'var(--muted)',
                lineHeight: '1.2',
                marginTop: '2px',
              }}
            >
              Selesai
            </div>
          </div>
        </div>

        {/* Customer recent orders */}
        {customerOrders.length > 0 ? (
          <div>
            {customerOrders.slice(0, 3).map((ord) => (
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
                onClick={() => setSelectedOrder(ord)}
              >
                <span className="order-number-badge">#{ord.nomorPesanan}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
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
                    {ord.menuNama} × {ord.jumlahPorsi}
                  </div>
                  <div style={{ fontSize: '11.5px', color: 'var(--muted)' }}>
                    Total: {formatCurrency(ord.total)}
                  </div>
                </div>
                <StatusBadge status={ord.status} type="order" />
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
            Anda belum memiliki pesanan aktif.
          </div>
        )}
      </div>
    </>
  );
}

// ─── MAIN HOME COMPONENT ───
export default function Home() {
  const { menus, orders, setActiveTab } = useApp();
  const { currentUser, role } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const userName = currentUser?.name || 'Pengguna';

  return (
    <div className="page-container">
      {role === ROLES.STAF ? (
        <HomeStaf
          orders={orders}
          setActiveTab={setActiveTab}
          userName={userName}
          setSelectedOrder={setSelectedOrder}
        />
      ) : role === ROLES.PELANGGAN ? (
        <HomePelanggan
          menus={menus}
          orders={orders}
          setActiveTab={setActiveTab}
          userName={userName}
          currentUser={currentUser}
          setSelectedOrder={setSelectedOrder}
        />
      ) : (
        <HomePemilik
          menus={menus}
          orders={orders}
          setActiveTab={setActiveTab}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          setSelectedOrder={setSelectedOrder}
        />
      )}

      {/* QUICK ORDER DETAIL MODAL */}
      <Modal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={
          selectedOrder ? `Pesanan #${selectedOrder.nomorPesanan}` : ''
        }
      >
        {selectedOrder && (
          <div>
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
              <span className="order-number-badge" style={{ fontSize: '13px' }}>
                #{selectedOrder.nomorPesanan}
              </span>
              <StatusBadge status={selectedOrder.status} type="order" />
            </div>

            <div className="form-field-group">
              <label className="form-label-top">Pemesan</label>
              <div style={{ fontSize: '14px', fontWeight: '600' }}>
                {selectedOrder.pelangganNama}
              </div>
            </div>

            <div className="form-field-group">
              <label className="form-label-top">Menu Dipesan</label>
              <div style={{ fontSize: '14px', fontWeight: '600' }}>
                {selectedOrder.menuNama} × {selectedOrder.jumlahPorsi} porsi
              </div>
              <div
                style={{
                  fontSize: '12px',
                  color: 'var(--muted)',
                  marginTop: '2px',
                }}
              >
                Satuan: {formatCurrency(selectedOrder.hargaSatuan)}
              </div>
            </div>

            <div className="form-field-group">
              <label className="form-label-top">Ongkos Kirim</label>
              <div style={{ fontSize: '13.5px', fontWeight: '500' }}>
                {formatCurrency(selectedOrder.ongkir)}
              </div>
            </div>

            <div
              style={{
                borderTop: '1px solid var(--border)',
                paddingTop: '10px',
                marginTop: '10px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <span style={{ fontSize: '13px', fontWeight: '700' }}>
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
                {formatCurrency(selectedOrder.total)}
              </span>
            </div>

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