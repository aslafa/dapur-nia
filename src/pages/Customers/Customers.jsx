import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import CustomerCard from '../../components/CustomerCard/CustomerCard';
import SearchBar from '../../components/SearchBar/SearchBar';
import Modal from '../../components/Modal/Modal';
import ConfirmDialog from '../../components/Modal/ConfirmDialog';
import LoadingState from '../../components/LoadingState/LoadingState';
import EmptyState from '../../components/EmptyState/EmptyState';
import ErrorState from '../../components/ErrorState/ErrorState';
import { IconUsers } from '../../components/Icons';

export default function CustomersPage() {
  const {
    customers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    simulationState,
    setSimulationState,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);

  const [formData, setFormData] = useState({
    nama: '',
    whatsapp: '',
    alamat: '',
  });

  const [errors, setErrors] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);

  const filteredCustomers = customers.filter(
    (c) =>
      c.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.whatsapp.includes(searchTerm) ||
      c.alamat.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenAdd = () => {
    setEditingCustomer(null);
    setFormData({
      nama: '',
      whatsapp: '',
      alamat: '',
    });
    setErrors({});
    setIsFormOpen(true);
  };

  const handleOpenEdit = (customer) => {
    setEditingCustomer(customer);
    setFormData({
      nama: customer.nama,
      whatsapp: customer.whatsapp,
      alamat: customer.alamat,
    });
    setErrors({});
    setIsFormOpen(true);
  };

  const validate = () => {
    const errs = {};
    if (!formData.nama.trim()) {
      errs.nama = 'Nama pelanggan wajib diisi';
    }
    if (!formData.whatsapp.trim()) {
      errs.whatsapp = 'Nomor WhatsApp wajib diisi';
    } else if (!/^[0-9+]{9,15}$/.test(formData.whatsapp.trim())) {
      errs.whatsapp = 'Nomor WhatsApp harus valid (9-15 digit angka)';
    }

    // Check duplicate WhatsApp
    const isDuplicate = customers.some(
      (c) =>
        c.whatsapp.trim() === formData.whatsapp.trim() &&
        (!editingCustomer || c.id !== editingCustomer.id)
    );
    if (isDuplicate) {
      errs.whatsapp = 'Nomor WhatsApp sudah terdaftar pada pelanggan lain';
    }

    if (!formData.alamat.trim()) {
      errs.alamat = 'Alamat pengiriman wajib diisi';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (editingCustomer) {
      const ok = updateCustomer(editingCustomer.id, formData);
      if (ok) setIsFormOpen(false);
    } else {
      const res = addCustomer(formData);
      if (res) setIsFormOpen(false);
    }
  };

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      deleteCustomer(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  if (simulationState === 'loading') {
    return (
      <div className="page-container">
        <LoadingState message="Menyiapkan data pelanggan..." />
      </div>
    );
  }

  if (simulationState === 'error') {
    return (
      <div className="page-container">
        <ErrorState
          title="Oops, terjadi kesalahan"
          subtitle="Data pelanggan belum dapat dimuat."
          onRetry={() => setSimulationState('normal')}
        />
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-title-block">
        <h1 className="page-title">
          <IconUsers size={22} color="var(--primary-dark)" />
          <span>Pelanggan</span>
        </h1>
        <p className="page-subtitle">Kelola data pelanggan Dapur Nia</p>
      </div>

      <SearchBar
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Cari nama, WhatsApp, atau alamat..."
      />

      {simulationState === 'empty' || filteredCustomers.length === 0 ? (
        <EmptyState
          icon={<IconUsers size={44} color="var(--primary-dark)" />}
          title="Belum ada data pelanggan"
          subtitle={
            searchTerm
              ? 'Tidak ada pelanggan yang sesuai dengan pencarian.'
              : 'Belum ada pelanggan yang ditambahkan.'
          }
          actionLabel="+ Tambah Pelanggan"
          onAction={handleOpenAdd}
        />
      ) : (
        <div>
          {filteredCustomers.map((cust) => (
            <CustomerCard
              key={cust.id}
              customer={cust}
              onEdit={handleOpenEdit}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      {/* FAB: Tambah Pelanggan */}
      <button
        type="button"
        className="fab-btn"
        onClick={handleOpenAdd}
        title="Tambah Pelanggan"
        aria-label="Tambah Pelanggan Baru"
      >
        +
      </button>

      {/* Modal Form */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingCustomer ? 'Edit Pelanggan' : 'Tambah Pelanggan'}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-field-group">
            <label className="form-label-top" htmlFor="input-nama-cust">
              Nama Pelanggan <span className="form-label-required">*</span>
            </label>
            <input
              id="input-nama-cust"
              type="text"
              className={`form-control-input ${errors.nama ? 'has-error' : ''}`}
              placeholder="Contoh: Budi Santoso"
              value={formData.nama}
              onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
            />
            {errors.nama && (
              <div className="form-field-error-msg">⚠️ {errors.nama}</div>
            )}
          </div>

          <div className="form-field-group">
            <label className="form-label-top" htmlFor="input-wa-cust">
              Nomor WhatsApp <span className="form-label-required">*</span>
            </label>
            <input
              id="input-wa-cust"
              type="tel"
              className={`form-control-input ${errors.whatsapp ? 'has-error' : ''}`}
              placeholder="Contoh: 08123456789"
              value={formData.whatsapp}
              onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
            />
            {errors.whatsapp && (
              <div className="form-field-error-msg">⚠️ {errors.whatsapp}</div>
            )}
          </div>

          <div className="form-field-group">
            <label className="form-label-top" htmlFor="input-alamat-cust">
              Alamat Pengiriman <span className="form-label-required">*</span>
            </label>
            <textarea
              id="input-alamat-cust"
              className={`form-control-textarea ${errors.alamat ? 'has-error' : ''}`}
              placeholder="Contoh: Jl. Mawar No. 12, Bandung"
              rows="3"
              value={formData.alamat}
              onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
            />
            {errors.alamat && (
              <div className="form-field-error-msg">⚠️ {errors.alamat}</div>
            )}
          </div>

          <div className="sheet-actions-row">
            <button
              type="button"
              className="btn btn-secondary btn-block"
              onClick={() => setIsFormOpen(false)}
            >
              Batal
            </button>
            <button type="submit" className="btn btn-primary btn-block">
              {editingCustomer ? 'Simpan Perubahan' : 'Simpan Pelanggan'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Hapus pelanggan ini?"
        message={
          deleteTarget
            ? `Data pelanggan "${deleteTarget.nama}" akan dihapus dari sistem.`
            : ''
        }
        confirmText="Hapus Pelanggan"
        cancelText="Batal"
      />
    </div>
  );
}
