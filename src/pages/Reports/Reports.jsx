import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import EmptyState from '../../components/EmptyState/EmptyState';
import LoadingState from '../../components/LoadingState/LoadingState';
import ErrorState from '../../components/ErrorState/ErrorState';
import StatusBadge from '../../components/StatusBadge/StatusBadge';
import { formatCurrency, toDateObject } from '../../data/dummyData';
import {
  IconChartColumn,
  IconClipboardList,
  IconCookingPot,
} from '../../components/Icons';

const PERIOD_OPTIONS = [
  { value: 'all', label: 'Semua Waktu' },
  { value: '7', label: '7 Hari Terakhir' },
  { value: '30', label: '30 Hari Terakhir' },
];

export default function ReportsPage() {
  const { orders, simulationState, setSimulationState, setActiveTab } = useApp();

  const [period, setPeriod] = useState('all');

  // Filter by period
  const now = new Date();
  const validOrders = orders.filter((o) => {
    if (o.status === 'dibatalkan') return false;
    if (period !== 'all') {
      const days = Number(period);
      const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
      const orderDate = toDateObject(o.tanggal);
      return orderDate ? orderDate >= cutoff : false;
    }
    return true;
  });

  // Calculate statistics
  const totalRevenue = validOrders.reduce((sum, o) => sum + o.total, 0);
  const totalOrders = validOrders.length;
  const totalPortions = validOrders.reduce((sum, o) => sum + o.jumlahPorsi, 0);

  // Group portions by menu for top menu visual
  const menuSalesMap = {};
  validOrders.forEach((o) => {
    if (!menuSalesMap[o.menuNama]) {
      menuSalesMap[o.menuNama] = {
        name: o.menuNama,
        portions: 0,
        revenue: 0,
      };
    }
    menuSalesMap[o.menuNama].portions += o.jumlahPorsi;
    menuSalesMap[o.menuNama].revenue += o.total;
  });

  const topMenus = Object.values(menuSalesMap).sort(
    (a, b) => b.portions - a.portions
  );

  const maxPortion = topMenus.length > 0 ? topMenus[0].portions : 1;

  // Recent transactions (up to 8)
  const recentTransactions = [...validOrders]
    .sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal))
    .slice(0, 8);

  if (simulationState === 'loading') {
    return (
      <div className="page-container">
        <LoadingState message="Menghitung laporan penjualan..." />
      </div>
    );
  }

  if (simulationState === 'error') {
    return (
      <div className="page-container">
        <ErrorState
          title="Oops, terjadi kesalahan"
          subtitle="Gagal memuat ringkasan laporan keuangan."
          onRetry={() => setSimulationState('normal')}
        />
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Title & Subtitle */}
      <div className="page-title-block">
        <h1 className="page-title">
          <IconChartColumn size={22} color="var(--primary-dark)" />
          <span>Laporan Penjualan</span>
        </h1>
        <p className="page-subtitle">Pendapatan & porsi terjual Dapur Nia</p>
      </div>

      {/* Period Filter Chips */}
      <div className="filter-chips-row" style={{ marginBottom: '14px' }}>
        {PERIOD_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            className={`filter-chip ${period === opt.value ? 'active' : ''}`}
            onClick={() => setPeriod(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* When no orders → Empty State */}
      {simulationState === 'empty' || validOrders.length === 0 ? (
        <EmptyState
          icon={<IconChartColumn size={44} color="var(--primary-dark)" />}
          title="Belum ada transaksi"
          subtitle={
            period !== 'all'
              ? `Belum ada pesanan valid pada periode ${PERIOD_OPTIONS.find(o => o.value === period)?.label}.`
              : 'Belum ada data transaksi yang dapat dihitung ke dalam laporan.'
          }
          actionLabel="Buat Pesanan Baru"
          onAction={() => setActiveTab('orders')}
        />
      ) : (
        <>
          {/* ── SUMMARY CARDS ── */}
          <div className="report-summary-cards">

            {/* Total Pendapatan - Full Width */}
            <div className="report-card report-card-primary">
              <div className="report-card-icon-wrap">
                <IconChartColumn size={20} color="var(--primary-dark)" />
              </div>
              <div style={{ flex: 1 }}>
                <div className="report-card-label">Total Pendapatan</div>
                <div className="report-card-value report-card-value-lg">
                  {formatCurrency(totalRevenue)}
                </div>
                <div className="report-card-note">
                  Pesanan dibatalkan tidak dihitung
                </div>
              </div>
            </div>

            {/* 2-column small cards */}
            <div className="report-card-row">
              <div className="report-card report-card-sm">
                <div className="report-card-icon-wrap report-card-icon-blue">
                  <IconClipboardList size={18} color="#2563EB" />
                </div>
                <div className="report-card-label" style={{ marginTop: '6px' }}>Total Pesanan</div>
                <div className="report-card-value">{totalOrders}</div>
                <div className="report-card-note">transaksi</div>
              </div>

              <div className="report-card report-card-sm">
                <div className="report-card-icon-wrap report-card-icon-green">
                  <IconCookingPot size={18} color="#16A34A" />
                </div>
                <div className="report-card-label" style={{ marginTop: '6px' }}>Total Porsi</div>
                <div className="report-card-value">{totalPortions}</div>
                <div className="report-card-note">porsi terjual</div>
              </div>
            </div>
          </div>

          {/* ── MENU TERLARIS ── */}
          {topMenus.length > 0 && (
            <div className="app-card" style={{ marginTop: '14px', marginBottom: '10px' }}>
              <div className="section-header-row" style={{ marginBottom: '12px' }}>
                <h3 className="section-heading-title">🏆 Menu Terlaris</h3>
                <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: '600' }}>
                  Berdasarkan Porsi
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {topMenus.map((item, idx) => {
                  const percentage = Math.round((item.portions / maxPortion) * 100);
                  const rankColors = ['#F59E0B', '#94A3B8', '#CD7C2F'];
                  const rankColor = rankColors[idx] || 'var(--muted-light)';

                  return (
                    <div key={item.name}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                          <span style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            background: rankColor,
                            color: idx < 3 ? '#FFF' : 'var(--muted)',
                            fontSize: '10px',
                            fontWeight: '700',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}>
                            {idx + 1}
                          </span>
                          <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)' }}>
                            {item.name}
                          </span>
                        </div>
                        <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--primary-dark)', flexShrink: 0 }}>
                          {item.portions} porsi
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div style={{
                        height: '7px',
                        background: 'var(--border-light)',
                        borderRadius: '999px',
                        overflow: 'hidden',
                      }}>
                        <div style={{
                          height: '100%',
                          width: `${percentage}%`,
                          background: idx === 0
                            ? 'linear-gradient(90deg, #F59E0B, #D97706)'
                            : 'var(--primary-light)',
                          borderRadius: '999px',
                          transition: 'width 0.5s ease',
                        }} />
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--muted)', marginTop: '3px' }}>
                        <span>{percentage}% dari tertinggi</span>
                        <span>{formatCurrency(item.revenue)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── TABEL TRANSAKSI TERBARU ── */}
          {recentTransactions.length > 0 && (
            <div className="app-card" style={{ marginTop: '4px', padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '12px 14px 10px', borderBottom: '1px solid var(--border-light)' }}>
                <h3 className="section-heading-title">📋 Transaksi Terbaru</h3>
              </div>

              <div>
                {recentTransactions.map((order, idx) => {
                  const dateObj = toDateObject(order.tanggal);
                  const dateStr = dateObj
                    ? dateObj.toLocaleDateString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                      })
                    : '-';

                  return (
                    <div
                      key={order.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '10px 14px',
                        borderBottom: idx < recentTransactions.length - 1
                          ? '1px solid var(--border-light)'
                          : 'none',
                      }}
                    >
                      {/* Date */}
                      <div style={{
                        flexShrink: 0,
                        width: '32px',
                        textAlign: 'center',
                        background: 'var(--primary-light)',
                        borderRadius: 'var(--radius-xs)',
                        padding: '3px 2px',
                      }}>
                        <div style={{ fontSize: '13px', fontWeight: '800', color: 'var(--primary-dark)', lineHeight: '1' }}>
                          {dateStr.split(' ')[0]}
                        </div>
                        <div style={{ fontSize: '9px', color: 'var(--primary-dark)', fontWeight: '600', textTransform: 'uppercase' }}>
                          {dateStr.split(' ')[1]}
                        </div>
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {order.pelangganNama}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {order.menuNama} × {order.jumlahPorsi}
                        </div>
                      </div>

                      {/* Amount + Status */}
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text)', marginBottom: '2px' }}>
                          {formatCurrency(order.total)}
                        </div>
                        <StatusBadge status={order.status} type="order" />
                      </div>
                    </div>
                  );
                })}
              </div>

              {validOrders.length > 8 && (
                <div
                  style={{ padding: '10px 14px', textAlign: 'center', borderTop: '1px solid var(--border-light)' }}
                >
                  <button
                    type="button"
                    className="section-view-all-link"
                    onClick={() => setActiveTab('orders')}
                  >
                    Lihat semua {validOrders.length} transaksi →
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
