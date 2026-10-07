import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import MenuCard from '../../components/MenuCard/MenuCard';
import SearchBar from '../../components/SearchBar/SearchBar';
import Modal from '../../components/Modal/Modal';
import ConfirmDialog from '../../components/Modal/ConfirmDialog';
import LoadingState from '../../components/LoadingState/LoadingState';
import EmptyState from '../../components/EmptyState/EmptyState';
import ErrorState from '../../components/ErrorState/ErrorState';
import { IconCookingPot, IconCup } from '../../components/Icons';
import { isDrinkMenu } from '../../data/dummyData';

export default function MenuPage() {
  const {
    menus,
    addMenu,
    updateMenu,
    deleteMenu,
    simulationState,
    setSimulationState,
  } = useApp();

  // Search and Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAvailability, setFilterAvailability] = useState('semua'); // 'semua' | 'tersedia' | 'habis'

  // Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState(null);

  // Form Fields
  const [formData, setFormData] = useState({
    nama: '',
    harga: '',
    sisaPorsi: '',
    kategori: 'makanan',
    tersedia: true,
  });

  // Form Validation Errors
  const [errors, setErrors] = useState({});

  // Confirm Delete Dialog State
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Filter logic
  const filteredMenus = menus.filter((menu) => {
    const matchesSearch = menu.nama.toLowerCase().includes(searchTerm.toLowerCase());
    const isAvail = menu.sisaPorsi > 0 && menu.tersedia;
    if (!matchesSearch) return false;
    if (filterAvailability === 'tersedia') return isAvail;
    if (filterAvailability === 'habis') return !isAvail;
    return true;
  });

  // Open Form for Adding
  const handleOpenAdd = () => {
    setEditingMenu(null);
    setFormData({
      nama: '',
      harga: '',
      sisaPorsi: '',
      tersedia: true,
    });
    setErrors({});
    setIsFormOpen(true);
  };

  // Open Form for Editing
  const handleOpenEdit = (menu) => {
    setEditingMenu(menu);
    setFormData({
      nama: menu.nama,
      harga: menu.harga.toString(),
      sisaPorsi: menu.sisaPorsi.toString(),
      tersedia: menu.tersedia,
    });
    setErrors({});
    setIsFormOpen(true);
  };

  // Validation according to PRD Acceptance Criteria
  const validate = () => {
    const errs = {};
    if (!formData.nama.trim()) {
      errs.nama = 'Nama menu wajib diisi';
    }
    if (formData.harga === '' || isNaN(formData.harga)) {
      errs.harga = 'Harga menu wajib diisi berupa angka';
    } else if (Number(formData.harga) < 0) {
      errs.harga = 'Harga menu tidak boleh bernilai negatif';
    }
    if (formData.sisaPorsi === '' || isNaN(formData.sisaPorsi)) {
      errs.sisaPorsi = 'Sisa porsi wajib diisi berupa angka';
    } else if (Number(formData.sisaPorsi) < 0) {
      errs.sisaPorsi = 'Sisa porsi tidak boleh bernilai negatif';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Form Submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (editingMenu) {
      updateMenu(editingMenu.id, formData);
    } else {
      addMenu(formData);
    }

    setIsFormOpen(false);
  };

  // Confirm delete handler
  const handleConfirmDelete = () => {
    if (deleteTarget) {
      deleteMenu(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  // Simulation state handling
  if (simulationState === 'loading') {
    return (
      <div className="page-container">
        <LoadingState message="Menyiapkan menu..." />
      </div>
    );
  }

  if (simulationState === 'error') {
    return (
      <div className="page-container">
        <ErrorState
          title="Oops, terjadi kesalahan"
          subtitle="Data menu belum dapat dimuat dari sistem."
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
          <IconCookingPot size={22} color="var(--primary-dark)" />
          <span>Menu</span>
        </h1>
        <p className="page-subtitle">Kelola menu harian Dapur Nia</p>
      </div>

      {/* Search Bar */}
      <SearchBar
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Cari nama menu..."
      />

      {/* Filter Chips */}
      <div className="filter-chips-row" role="tablist" aria-label="Filter status menu">
        <button
          type="button"
          className={`filter-chip ${filterAvailability === 'semua' ? 'active' : ''}`}
          onClick={() => setFilterAvailability('semua')}
        >
          Semua ({menus.length})
        </button>
        <button
          type="button"
          className={`filter-chip ${filterAvailability === 'tersedia' ? 'active' : ''}`}
          onClick={() => setFilterAvailability('tersedia')}
        >
          Tersedia ({menus.filter((m) => m.sisaPorsi > 0 && m.tersedia).length})
        </button>
        <button
          type="button"
          className={`filter-chip ${filterAvailability === 'habis' ? 'active' : ''}`}
          onClick={() => setFilterAvailability('habis')}
        >
          Habis ({menus.filter((m) => m.sisaPorsi <= 0 || !m.tersedia).length})
        </button>
      </div>

      {/* Menu List / Empty State */}
      {simulationState === 'empty' || filteredMenus.length === 0 ? (
        <EmptyState
          icon={<IconCookingPot size={44} color="var(--primary-dark)" />}
          title="Belum ada data"
          subtitle={
            searchTerm || filterAvailability !== 'semua'
              ? 'Tidak ada menu yang sesuai dengan filter pencarian.'
              : 'Belum ada menu yang ditambahkan.'
          }
          actionLabel="+ Tambah Menu"
          onAction={handleOpenAdd}
        />
      ) : (
        <div>
          {filteredMenus.map((menu) => (
            <MenuCard
              key={menu.id}
              menu={menu}
              onEdit={handleOpenEdit}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      {/* FAB: Tambah Menu */}
      <button
        type="button"
        className="fab-btn"
        onClick={handleOpenAdd}
        title="Tambah Menu"
        aria-label="Tambah Menu Baru"
      >
        +
      </button>

      {/* Modal / Bottom Sheet Form */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingMenu ? 'Edit Menu' : 'Tambah Menu'}
      >
        <form onSubmit={handleSubmit}>
          {/* Field: Nama Menu */}
          <div className="form-field-group">
            <label className="form-label-top" htmlFor="input-nama-menu">
              Nama Menu <span className="form-label-required">*</span>
            </label>
            <input
              id="input-nama-menu"
              type="text"
              className={`form-control-input ${errors.nama ? 'has-error' : ''}`}
              placeholder="Contoh: Nasi Ayam Bakar atau Es Teh"
              value={formData.nama}
              onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
            />
            {errors.nama && (
              <div className="form-field-error-msg">⚠️ {errors.nama}</div>
            )}
          </div>

          {/* Field: Kategori */}
          <div className="form-field-group">
            <label className="form-label-top">
              Kategori Menu <span className="form-label-required">*</span>
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                type="button"
                className={`btn btn-sm ${formData.kategori === 'makanan' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setFormData({ ...formData, kategori: 'makanan' })}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <IconCookingPot size={16} />
                <span>Makanan</span>
              </button>
              <button
                type="button"
                className={`btn btn-sm ${formData.kategori === 'minuman' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setFormData({ ...formData, kategori: 'minuman' })}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <IconCup size={16} />
                <span>Minuman</span>
              </button>
            </div>
          </div>

          {/* Field: Harga */}
          <div className="form-field-group">
            <label className="form-label-top" htmlFor="input-harga-menu">
              Harga Satuan (Rp) <span className="form-label-required">*</span>
            </label>
            <input
              id="input-harga-menu"
              type="number"
              min="0"
              className={`form-control-input ${errors.harga ? 'has-error' : ''}`}
              placeholder="Contoh: 25000"
              value={formData.harga}
              onChange={(e) => setFormData({ ...formData, harga: e.target.value })}
            />
            {errors.harga && (
              <div className="form-field-error-msg">⚠️ {errors.harga}</div>
            )}
          </div>

          {/* Field: Sisa Porsi */}
          <div className="form-field-group">
            <label className="form-label-top" htmlFor="input-porsi-menu">
              Sisa Porsi <span className="form-label-required">*</span>
            </label>
            <input
              id="input-porsi-menu"
              type="number"
              min="0"
              className={`form-control-input ${errors.sisaPorsi ? 'has-error' : ''}`}
              placeholder="Contoh: 30"
              value={formData.sisaPorsi}
              onChange={(e) => setFormData({ ...formData, sisaPorsi: e.target.value })}
            />
            {errors.sisaPorsi && (
              <div className="form-field-error-msg">⚠️ {errors.sisaPorsi}</div>
            )}
          </div>

          {/* Field: Ketersediaan */}
          <div className="form-field-group">
            <label className="form-label-top">Ketersediaan Menu</label>
            <div
              className="toggle-field-row"
              onClick={() => setFormData({ ...formData, tersedia: !formData.tersedia })}
            >
              <div>
                <div style={{ fontSize: '14px', fontWeight: '600' }}>
                  {formData.tersedia ? 'Tersedia untuk Dipesan' : 'Habis / Tidak Tersedia'}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
                  Menu dengan porsi 0 akan otomatis berstatus habis
                </div>
              </div>
              <div className={`switch-control ${formData.tersedia ? 'is-on' : ''}`}>
                <div className="switch-thumb"></div>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="sheet-actions-row">
            <button
              type="button"
              className="btn btn-secondary btn-block"
              onClick={() => setIsFormOpen(false)}
            >
              Batal
            </button>
            <button type="submit" className="btn btn-primary btn-block">
              {editingMenu ? 'Simpan Perubahan' : 'Simpan Menu'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Hapus menu ini?"
        message={
          deleteTarget
            ? `Menu "${deleteTarget.nama}" akan dihapus dari daftar.`
            : ''
        }
        confirmText="Hapus Menu"
        cancelText="Batal"
      />
    </div>
  );
}
