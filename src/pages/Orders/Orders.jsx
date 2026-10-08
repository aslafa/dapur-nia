import { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import OrderCard from '../../components/OrderCard/OrderCard';
import SearchBar from '../../components/SearchBar/SearchBar';
import StatusBadge from '../../components/StatusBadge/StatusBadge';
import Modal from '../../components/Modal/Modal';
import ConfirmDialog from '../../components/Modal/ConfirmDialog';
import LoadingState from '../../components/LoadingState/LoadingState';
import EmptyState from '../../components/EmptyState/EmptyState';
import ErrorState from '../../components/ErrorState/ErrorState';
import {
  IconUpload,
  IconCheck,
  IconImage,
  IconPlus,
  IconClipboardList,
} from '../../components/Icons';
import { formatCurrency } from '../../data/dummyData';
import { ROLES } from '../../services/authService';

export default function OrdersPage() {
  const {
    orders,
    menus,
    customers,
    addOrder,
    updateOrderStatus,
    updateOrderBuktiBayar,
    deleteOrder,
    showToast,
    simulationState,
    setSimulationState,
    targetOrderId,
    setTargetOrderId,
  } = useApp();

  const { currentUser, role } = useAuth();
  // STRICT role checks — never default to isOwner when role is empty.
  const cleanRole = (role || ROLES.PELANGGAN).toLowerCase();
  const isOwner = cleanRole === ROLES.PEMILIK;
  const isStaff = cleanRole === ROLES.STAF;
  const isCustomer = !isOwner && !isStaff;

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('semua');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Auto-open order detail if navigated from notification
  useEffect(() => {
    if (targetOrderId) {
      const found = orders.find((o) => o.id === targetOrderId);
      if (found) {
        setSelectedOrder(found);
      }
      setTargetOrderId(null);
    }
  }, [targetOrderId, orders, setTargetOrderId]);

  // File input ref for proof of payment upload
  const fileInputRef = useRef(null);

  // Form State
  const [formData, setFormData] = useState({
    pelangganId: '',
    menuId: '',
    jumlahPorsi: 1,
    ongkir: 5000,
  });

  const [errors, setErrors] = useState({});

  // FILTER ORDERS ACCORDING TO ROLE:
  // Pelanggan MUST ONLY see their own orders!
  const userOrders = orders.filter((o) => {
    if (isCustomer && currentUser) {
      const userCleanName = (currentUser.name || '').trim().toLowerCase();
      const orderCleanName = (o.pelangganNama || '').trim().toLowerCase();

      const userPhone = (currentUser.phone || currentUser.whatsapp || '').replace(
        /\D/g,
        ''
      );
      const orderPhone = (o.pelangganWhatsapp || '').replace(/\D/g, '');

      const isMyOrder =
        (userCleanName && orderCleanName === userCleanName) ||
        (userPhone && orderPhone && userPhone.endsWith(orderPhone.slice(-6)));

      return isMyOrder;
    }
    return true;
  });

  const filteredOrders = userOrders.filter((o) => {
    const matchesSearch =
      o.nomorPesanan.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.pelangganNama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.menuNama.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;
    if (filterStatus === 'semua') return true;
    return o.status === filterStatus;
  });

  const handleOpenAdd = () => {
    const firstCust = customers[0]?.id || '';
    const firstMenu =
      menus.find((m) => m.sisaPorsi > 0)?.id || menus[0]?.id || '';

    setFormData({
      pelangganId: firstCust,
      menuId: firstMenu,
      jumlahPorsi: 1,
      ongkir: 5000,
    });
    setErrors({});
    setIsAddOpen(true);
  };

  const activeMenu = menus.find((m) => m.id === formData.menuId);
  const calculatedTotal =
    (activeMenu ? activeMenu.harga * Number(formData.jumlahPorsi || 0) : 0) +
    Number(formData.ongkir || 0);

  const validate = () => {
    const errs = {};
    if (!formData.pelangganId) {
      errs.pelangganId = 'Pilih pelanggan pemesan';
    }
    if (!formData.menuId) {
      errs.menuId = 'Pilih menu yang dipesan';
    }

    const porsi = Number(formData.jumlahPorsi);
    if (!porsi || porsi < 1) {
      errs.jumlahPorsi = 'Jumlah porsi minimal 1';
    } else if (activeMenu && porsi > activeMenu.sisaPorsi) {
      errs.jumlahPorsi = `Jumlah porsi melebihi sisa porsi yang tersedia (${activeMenu.sisaPorsi} porsi)`;
    }

    if (formData.ongkir === '' || Number(formData.ongkir) < 0) {
      errs.ongkir = 'Ongkos kirim minimal Rp0';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const cust = customers.find((c) => c.id === formData.pelangganId);

    const res = addOrder({
      ...formData,
      pelangganNama: cust ? cust.nama : 'Pelanggan',
    });

    if (res) {
      setIsAddOpen(false);
    }
  };

  const handleAdvanceStatus = (targetStatus) => {
    if (!selectedOrder) return;
    const ok = updateOrderStatus(selectedOrder.id, targetStatus);
    if (ok) {
      setSelectedOrder((prev) => ({
        ...prev,
        status: targetStatus,
      }));
    }
  };

  // Upload proof of payment handler
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file || !selectedOrder) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      showToast('Hanya format JPG, JPEG, atau PNG yang diperbolehkan', 'danger');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('Ukuran foto maksimal 5 MB', 'danger');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result;
      const proofObject = {
        dataUrl,
        fileName: file.name,
        fileSize: (file.size / 1024).toFixed(1) + ' KB',
        uploadedAt: new Date().toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      };

      updateOrderBuktiBayar(selectedOrder.id, proofObject);
      setSelectedOrder((prev) => ({
        ...prev,
        buktiBayar: proofObject,
      }));
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleRemoveProof = () => {
    if (!selectedOrder) return;
    updateOrderBuktiBayar(selectedOrder.id, null);
    setSelectedOrder((prev) => ({
      ...prev,
      buktiBayar: null,
    }));
  };

  if (simulationState === 'loading') {
    return (
      <div className="page-container">
        <LoadingState message="Menyiapkan data pesanan..." />
      </div>
    );
  }

  if (simulationState === 'error') {
    return (
      <div className="page-container">
        <ErrorState
          title="Oops, terjadi kesalahan"
          subtitle="Data pesanan gagal dimuat."
          onRetry={() => setSimulationState('normal')}
        />
      </div>
    );
  }

  // Stepper steps
  const stepperSteps = [
    { key: 'menunggu', label: 'Menunggu Bayar', sub: 'Menunggu pembayaran' },
    { key: 'dibayar', label: 'Dibayar', sub: 'Pembayaran telah dikonfirmasi' },
    { key: 'diproses', label: 'Diproses', sub: 'Katering sedang dimasak di dapur' },
    { key: 'selesai', label: 'Selesai', sub: 'Pesanan telah selesai' },
  ];

  return (
    <div className="page-container">
      <div className="page-title-block">
        <h1 className="page-title">
          <IconClipboardList size={22} color="var(--primary-dark)" />
          <span>{isCustomer ? 'Pesanan Saya' : 'Pesanan'}</span>
        </h1>
        <p className="page-subtitle">
          {isCustomer
            ? 'Daftar dan status pesanan katering Anda'
            : 'Kelola pesanan katering Dapur Nia'}
        </p>
      </div>

      <SearchBar
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder={
          isCustomer
            ? 'Cari no pesanan atau menu...'
            : 'Cari no pesanan, pelanggan, menu...'
        }
      />

      {/* Filter Status Chips */}
      <div className="filter-chips-row" role="tablist">
        <button
          type="button"
          className={`filter-chip ${filterStatus === 'semua' ? 'active' : ''}`}
          onClick={() => setFilterStatus('semua')}
        >
          Semua ({userOrders.length})
        </button>
        <button
          type="button"
          className={`filter-chip ${filterStatus === 'menunggu' ? 'active' : ''}`}
          onClick={() => setFilterStatus('menunggu')}
        >
          Menunggu ({userOrders.filter((o) => o.status === 'menunggu').length})
        </button>
        <button
          type="button"
          className={`filter-chip ${filterStatus === 'dibayar' ? 'active' : ''}`}
          onClick={() => setFilterStatus('dibayar')}
        >
          Dibayar ({userOrders.filter((o) => o.status === 'dibayar').length})
        </button>
        <button
          type="button"
          className={`filter-chip ${filterStatus === 'diproses' ? 'active' : ''}`}
          onClick={() => setFilterStatus('diproses')}
        >
          Diproses ({userOrders.filter((o) => o.status === 'diproses').length})
        </button>
        <button
          type="button"
          className={`filter-chip ${filterStatus === 'selesai' ? 'active' : ''}`}
          onClick={() => setFilterStatus('selesai')}
        >
          Selesai ({userOrders.filter((o) => o.status === 'selesai').length})
        </button>
      </div>

      {/* Orders List / Empty State */}
      {simulationState === 'empty' || filteredOrders.length === 0 ? (
        <EmptyState
          icon={<IconClipboardList size={44} color="var(--primary-dark)" />}
          title={isCustomer ? 'Belum Ada Pesanan Saya' : 'Belum ada pesanan'}
          subtitle={
            isCustomer
              ? 'Anda belum memiliki riwayat pesanan katering.'
              : searchTerm || filterStatus !== 'semua'
              ? 'Tidak ada pesanan yang sesuai dengan filter.'
              : 'Belum ada pesanan katering yang dibuat.'
          }
          actionLabel={isOwner ? '+ Tambah Pesanan' : undefined}
          onAction={isOwner ? handleOpenAdd : undefined}
        />
      ) : (
        <div>
          {filteredOrders.map((ord) => (
            <OrderCard key={ord.id} order={ord} onDetail={setSelectedOrder} />
          ))}
        </div>
      )}

      {/* FAB: Tambah Pesanan (Hanya Pemilik) */}
      {isOwner && (
        <button
          type="button"
          className="fab-btn"
          onClick={handleOpenAdd}
          title="Buat Pesanan Baru"
          aria-label="Buat Pesanan Baru"
        >
          <IconPlus size={24} color="#FFFFFF" />
        </button>
      )}

      {/* MODAL FORM TAMBAH PESANAN (Pemilik Only) */}
      {isOwner && (
        <Modal
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          title="Tambah Pesanan Baru"
        >
          <form onSubmit={handleSubmit}>
            <div className="form-field-group">
              <label className="form-label-top" htmlFor="select-pelanggan">
                Pilih Pelanggan <span className="form-label-required">*</span>
              </label>
              <select
                id="select-pelanggan"
                className={`form-control-select ${
                  errors.pelangganId ? 'has-error' : ''
                }`}
                value={formData.pelangganId}
                onChange={(e) =>
                  setFormData({ ...formData, pelangganId: e.target.value })
                }
              >
                <option value="">-- Pilih Pelanggan --</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nama} ({c.whatsapp})
                  </option>
                ))}
              </select>
              {errors.pelangganId && (
                <div className="form-field-error-msg">⚠️ {errors.pelangganId}</div>
              )}
            </div>

            <div className="form-field-group">
              <label className="form-label-top" htmlFor="select-menu">
                Pilihan Menu <span className="form-label-required">*</span>
              </label>
              <select
                id="select-menu"
                className={`form-control-select ${
                  errors.menuId ? 'has-error' : ''
                }`}
                value={formData.menuId}
                onChange={(e) =>
                  setFormData({ ...formData, menuId: e.target.value })
                }
              >
                <option value="">-- Pilih Menu --</option>
                {menus.map((m) => (
                  <option key={m.id} value={m.id} disabled={m.sisaPorsi <= 0}>
                    {m.nama} — {formatCurrency(m.harga)} (Sisa: {m.sisaPorsi}{' '}
                    porsi)
                    {m.sisaPorsi <= 0 ? ' [HABIS]' : ''}
                  </option>
                ))}
              </select>
              {errors.menuId && (
                <div className="form-field-error-msg">⚠️ {errors.menuId}</div>
              )}
            </div>

            <div className="form-field-group">
              <label className="form-label-top" htmlFor="input-jumlah-porsi">
                Jumlah Porsi <span className="form-label-required">*</span>
              </label>
              <input
                id="input-jumlah-porsi"
                type="number"
                min="1"
                max={activeMenu?.sisaPorsi || 100}
                className={`form-control-input ${
                  errors.jumlahPorsi ? 'has-error' : ''
                }`}
                value={formData.jumlahPorsi}
                onChange={(e) =>
                  setFormData({ ...formData, jumlahPorsi: e.target.value })
                }
              />
              {activeMenu && (
                <div
                  style={{
                    fontSize: '11.5px',
                    color: 'var(--muted)',
                    marginTop: '3px',
                  }}
                >
                  Kapasitas tersedia: <strong>{activeMenu.sisaPorsi} porsi</strong>
                </div>
              )}
              {errors.jumlahPorsi && (
                <div className="form-field-error-msg">⚠️ {errors.jumlahPorsi}</div>
              )}
            </div>

            <div className="form-field-group">
              <label className="form-label-top" htmlFor="input-ongkir">
                Ongkos Kirim (Rp)
              </label>
              <input
                id="input-ongkir"
                type="number"
                min="0"
                className={`form-control-input ${
                  errors.ongkir ? 'has-error' : ''
                }`}
                value={formData.ongkir}
                onChange={(e) =>
                  setFormData({ ...formData, ongkir: e.target.value })
                }
              />
              {errors.ongkir && (
                <div className="form-field-error-msg">⚠️ {errors.ongkir}</div>
              )}
            </div>

            <div
              style={{
                background: 'var(--primary-subtle)',
                border: '1px solid var(--primary-light)',
                borderRadius: 'var(--radius-sm)',
                padding: '12px 14px',
                marginBottom: '14px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '12.5px',
                  marginBottom: '4px',
                }}
              >
                <span>Harga Satuan:</span>
                <span>
                  {activeMenu ? formatCurrency(activeMenu.harga) : 'Rp0'}
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '12.5px',
                  marginBottom: '4px',
                }}
              >
                <span>Subtotal ({formData.jumlahPorsi || 0} porsi):</span>
                <span>
                  {activeMenu
                    ? formatCurrency(
                        activeMenu.harga * Number(formData.jumlahPorsi || 0)
                      )
                    : 'Rp0'}
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '12.5px',
                  marginBottom: '6px',
                }}
              >
                <span>Ongkos Kirim:</span>
                <span>{formatCurrency(Number(formData.ongkir || 0))}</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '14.5px',
                  fontWeight: '700',
                  borderTop: '1px solid var(--primary-light)',
                  paddingTop: '6px',
                }}
              >
                <span>Total Tagihan:</span>
                <span style={{ color: 'var(--primary-dark)' }}>
                  {formatCurrency(calculatedTotal)}
                </span>
              </div>
            </div>

            <div className="sheet-actions-row">
              <button
                type="button"
                className="btn btn-secondary btn-block"
                onClick={() => setIsAddOpen(false)}
              >
                Batal
              </button>
              <button type="submit" className="btn btn-primary btn-block">
                Simpan Pesanan
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ─── MODAL: DETAIL PESANAN ─── */}
      <Modal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={selectedOrder ? `Detail Pesanan #${selectedOrder.nomorPesanan}` : ''}
      >
        {selectedOrder && (
          <div className="order-detail-sheet-wrap">
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px',
              }}
            >
              <span className="order-number-badge" style={{ fontSize: '13.5px' }}>
                #{selectedOrder.nomorPesanan}
              </span>
              <StatusBadge status={selectedOrder.status} type="order" />
            </div>

            {/* Status Stepper */}
            <div className="order-stepper-box">
              <div className="stepper-title">Status Pesanan</div>

              {selectedOrder.status === 'dibatalkan' ? (
                <div className="stepper-cancelled-banner">
                  <span style={{ fontSize: '16px' }}>✕</span>
                  <div>
                    <div style={{ fontWeight: '700' }}>Pesanan Dibatalkan</div>
                    <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
                      Pesanan ini tidak diproses lebih lanjut.
                    </div>
                  </div>
                </div>
              ) : (
                <div className="vertical-stepper">
                  {stepperSteps.map((step, idx) => {
                    const currentIdx = stepperSteps.findIndex(
                      (s) => s.key === selectedOrder.status
                    );
                    const isDone = idx < currentIdx;
                    const isActive = idx === currentIdx;

                    return (
                      <div key={step.key} className="stepper-node-row">
                        <div className="stepper-indicator-col">
                          <div
                            className={`stepper-circle ${
                              isDone ? 'done' : isActive ? 'active' : 'pending'
                            }`}
                          >
                            {isDone ? (
                              <IconCheck size={12} color="#FFFFFF" />
                            ) : (
                              <span>{idx + 1}</span>
                            )}
                          </div>
                          {idx < stepperSteps.length - 1 && (
                            <div
                              className={`stepper-v-line ${isDone ? 'done' : ''}`}
                            />
                          )}
                        </div>

                        <div className="stepper-content-col">
                          <div
                            className={`stepper-node-label ${
                              isActive ? 'active' : isDone ? 'done' : ''
                            }`}
                          >
                            {step.label}
                          </div>
                          <div className="stepper-node-sub">{step.sub}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Info Pemesan */}
            <div className="detail-section-card">
              <div className="detail-section-label">Pemesan</div>
              <div
                style={{
                  fontSize: '14px',
                  fontWeight: '700',
                  color: 'var(--text)',
                }}
              >
                {selectedOrder.pelangganNama}
              </div>
            </div>

            {/* Menu & Porsi */}
            <div className="detail-section-card">
              <div className="detail-section-label">Menu & Porsi</div>
              <div
                style={{
                  fontSize: '14px',
                  fontWeight: '700',
                  color: 'var(--text)',
                }}
              >
                {selectedOrder.menuNama}
              </div>
              <div
                style={{
                  fontSize: '12.5px',
                  color: 'var(--muted)',
                  marginTop: '2px',
                }}
              >
                {selectedOrder.jumlahPorsi} porsi ×{' '}
                {formatCurrency(selectedOrder.hargaSatuan)}
              </div>
            </div>

            {/* Rincian Harga */}
            <div className="detail-section-card">
              <div className="detail-section-label">Rincian Harga</div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '12.5px',
                  marginBottom: '4px',
                }}
              >
                <span>Subtotal Porsi:</span>
                <span>
                  {formatCurrency(
                    selectedOrder.hargaSatuan * selectedOrder.jumlahPorsi
                  )}
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '12.5px',
                  marginBottom: '6px',
                }}
              >
                <span>Ongkos Kirim:</span>
                <span>{formatCurrency(selectedOrder.ongkir)}</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '15px',
                  fontWeight: '800',
                  color: 'var(--primary-dark)',
                  borderTop: '1px solid var(--border-light)',
                  paddingTop: '6px',
                }}
              >
                <span>Total Tagihan:</span>
                <span>{formatCurrency(selectedOrder.total)}</span>
              </div>
            </div>

            {/* Bukti Pembayaran */}
            <div className="detail-section-card">
              <div className="detail-section-label">Bukti Pembayaran</div>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/jpeg,image/jpg,image/png"
                style={{ display: 'none' }}
                onChange={handleFileUpload}
              />

              {selectedOrder.buktiBayar ? (
                <div>
                  <div className="proof-preview-wrap">
                    {typeof selectedOrder.buktiBayar === 'object' &&
                    selectedOrder.buktiBayar.dataUrl ? (
                      <img
                        src={selectedOrder.buktiBayar.dataUrl}
                        alt="Bukti Bayar"
                        className="proof-image-preview"
                      />
                    ) : (
                      <div className="proof-placeholder-preview">
                        <IconImage size={32} color="var(--primary)" />
                        <div
                          style={{
                            fontSize: '12px',
                            color: 'var(--muted)',
                            marginTop: '4px',
                          }}
                        >
                          {typeof selectedOrder.buktiBayar === 'string'
                            ? selectedOrder.buktiBayar
                            : 'Bukti Pembayaran Terunggah'}
                        </div>
                      </div>
                    )}
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginTop: '8px',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '11.5px',
                        color: 'var(--muted)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: '60%',
                      }}
                    >
                      📄{' '}
                      {typeof selectedOrder.buktiBayar === 'object'
                        ? selectedOrder.buktiBayar.fileName
                        : selectedOrder.buktiBayar}
                    </div>

                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        type="button"
                        className="btn-proof-action"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Ganti Foto
                      </button>
                      <button
                        type="button"
                        className="btn-proof-action danger"
                        onClick={handleRemoveProof}
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  className="proof-upload-dropzone"
                  onClick={() => fileInputRef.current?.click()}
                  role="button"
                  tabIndex={0}
                >
                  <div className="proof-upload-icon-circle">
                    <IconUpload size={22} color="var(--primary-dark)" />
                  </div>
                  <div
                    style={{
                      fontSize: '13px',
                      fontWeight: '700',
                      color: 'var(--text)',
                      marginTop: '6px',
                    }}
                  >
                    Upload Bukti Bayar
                  </div>
                  <div
                    style={{
                      fontSize: '11px',
                      color: 'var(--muted)',
                      marginTop: '2px',
                    }}
                  >
                    Pilih foto dari perangkat (JPG, JPEG, PNG • maks 5 MB)
                  </div>
                </div>
              )}
            </div>

            {/* Tindakan Status: HANYA untuk Pemilik dan Staf! (Pelanggan HANYA MELIHAT) */}
            {!isCustomer && (
              <div
                className="detail-section-card"
                style={{ background: '#FFFDF9' }}
              >
                <div className="detail-section-label">Tindakan Status</div>

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    marginTop: '6px',
                  }}
                >
                  {selectedOrder.status === 'menunggu' && (
                    <>
                      <button
                        type="button"
                        className="btn btn-primary btn-block"
                        onClick={() => handleAdvanceStatus('dibayar')}
                      >
                        Konfirmasi Pembayaran (Dibayar)
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary btn-block"
                        style={{
                          color: 'var(--danger)',
                          borderColor: 'var(--danger-light)',
                        }}
                        onClick={() => handleAdvanceStatus('dibatalkan')}
                      >
                        Batalkan Pesanan
                      </button>
                    </>
                  )}

                  {selectedOrder.status === 'dibayar' && (
                    <button
                      type="button"
                      className="btn btn-primary btn-block"
                      onClick={() => handleAdvanceStatus('diproses')}
                    >
                      Mulai Memasak (Diproses)
                    </button>
                  )}

                  {selectedOrder.status === 'diproses' && (
                    <button
                      type="button"
                      className="btn btn-primary btn-block"
                      style={{ background: '#16A34A' }}
                      onClick={() => handleAdvanceStatus('selesai')}
                    >
                      Selesaikan Pesanan (Selesai)
                    </button>
                  )}

                  {['selesai', 'dibatalkan'].includes(selectedOrder.status) && (
                    <div
                      style={{
                        fontSize: '12px',
                        color: 'var(--muted)',
                        textAlign: 'center',
                        padding: '6px',
                      }}
                    >
                      Status telah mencapai tahap akhir.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Footer Buttons */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              <button
                type="button"
                className="btn btn-secondary btn-block"
                onClick={() => setSelectedOrder(null)}
              >
                Tutup
              </button>
              {isOwner && (
                <button
                  type="button"
                  className="btn btn-secondary btn-block"
                  style={{
                    color: 'var(--danger)',
                    borderColor: 'var(--danger-light)',
                  }}
                  onClick={() => {
                    setDeleteTarget(selectedOrder);
                    setSelectedOrder(null);
                  }}
                >
                  Hapus Pesanan
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation (Pemilik Only) */}
      {isOwner && (
        <ConfirmDialog
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={() => {
            if (deleteTarget) {
              deleteOrder(deleteTarget.id);
              setDeleteTarget(null);
            }
          }}
          title="Hapus pesanan ini?"
          message={
            deleteTarget
              ? `Pesanan #${deleteTarget.nomorPesanan} atas nama ${deleteTarget.pelangganNama} akan dihapus.`
              : ''
          }
          confirmText="Hapus Pesanan"
          cancelText="Batal"
        />
      )}
    </div>
  );
}
