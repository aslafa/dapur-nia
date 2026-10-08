// src/data/dummyData.js
export const dummyMenus = [
  { id: 'menu-1', nama: 'Nasi Ayam Bakar', harga: 25000, sisaPorsi: 30, tersedia: true, kategori: 'makanan', createdAt: new Date('2024-01-15') },
  { id: 'menu-2', nama: 'Mie Ayam', harga: 18000, sisaPorsi: 15, tersedia: true, kategori: 'makanan', createdAt: new Date('2024-01-15') },
  { id: 'menu-3', nama: 'Nasi Goreng', harga: 20000, sisaPorsi: 20, tersedia: true, kategori: 'makanan', createdAt: new Date('2024-01-15') },
  { id: 'menu-4', nama: 'Soto Ayam', harga: 18000, sisaPorsi: 0, tersedia: false, kategori: 'makanan', createdAt: new Date('2024-01-15') },
  { id: 'menu-5', nama: 'Rendang Sapi', harga: 35000, sisaPorsi: 10, tersedia: true, kategori: 'makanan', createdAt: new Date('2024-01-15') },
  { id: 'menu-6', nama: 'Gado-gado', harga: 15000, sisaPorsi: 25, tersedia: true, kategori: 'makanan', createdAt: new Date('2024-01-15') },
  { id: 'menu-7', nama: 'Es Teh Manis', harga: 5000, sisaPorsi: 50, tersedia: true, kategori: 'minuman', createdAt: new Date('2024-01-15') },
  { id: 'menu-8', nama: 'Es Jeruk Segar', harga: 7000, sisaPorsi: 30, tersedia: true, kategori: 'minuman', createdAt: new Date('2024-01-15') },
];

export const dummyCustomers = [
  { id: 'cust-1', nama: 'Budi Santoso', whatsapp: '08123456789', alamat: 'Jl. Mawar No. 12, Bandung', createdAt: new Date('2024-01-10') },
  { id: 'cust-2', nama: 'Siti Rahayu', whatsapp: '08234567890', alamat: 'Jl. Melati No. 5, Bandung', createdAt: new Date('2024-01-11') },
  { id: 'cust-rasya', nama: 'Rasya Andrean', whatsapp: '083456789012', alamat: 'Jl. Merdeka No. 45, Bandung', createdAt: new Date('2024-01-12') },
  { id: 'cust-4', nama: 'Dewi Lestari', whatsapp: '08456789012', alamat: 'Jl. Kenanga No. 8, Cimahi', createdAt: new Date('2024-01-13') },
  { id: 'cust-5', nama: 'Rudi Hermawan', whatsapp: '08567890123', alamat: 'Jl. Anggrek No. 20, Bandung', createdAt: new Date('2024-01-14') },
];

export const dummyOrders = [
  { id: 'order-1', nomorPesanan: 'DN001', pelangganId: 'cust-1', pelangganNama: 'Budi Santoso', menuId: 'menu-1', menuNama: 'Nasi Ayam Bakar', hargaSatuan: 25000, jumlahPorsi: 2, ongkir: 5000, total: 55000, status: 'menunggu', buktiBayar: null, tanggal: new Date('2024-01-15'), createdAt: new Date('2024-01-15T08:00:00') },
  { id: 'order-2', nomorPesanan: 'DN002', pelangganId: 'cust-2', pelangganNama: 'Siti Rahayu', menuId: 'menu-2', menuNama: 'Mie Ayam', hargaSatuan: 18000, jumlahPorsi: 3, ongkir: 0, total: 54000, status: 'dibayar', buktiBayar: 'bukti-002.jpg', tanggal: new Date('2024-01-15'), createdAt: new Date('2024-01-15T09:30:00') },
  { id: 'order-rasya-1', nomorPesanan: 'DN003', pelangganId: 'cust-rasya', pelangganNama: 'Rasya Andrean', menuId: 'menu-5', menuNama: 'Rendang Sapi', hargaSatuan: 35000, jumlahPorsi: 2, ongkir: 5000, total: 75000, status: 'menunggu', buktiBayar: null, tanggal: new Date('2024-01-15'), createdAt: new Date('2024-01-15T10:00:00') },
  { id: 'order-4', nomorPesanan: 'DN004', pelangganId: 'cust-4', pelangganNama: 'Dewi Lestari', menuId: 'menu-3', menuNama: 'Nasi Goreng', hargaSatuan: 20000, jumlahPorsi: 2, ongkir: 5000, total: 45000, status: 'selesai', buktiBayar: 'bukti-004.jpg', tanggal: new Date('2024-01-14'), createdAt: new Date('2024-01-14T14:00:00') },
  { id: 'order-5', nomorPesanan: 'DN005', pelangganId: 'cust-5', pelangganNama: 'Rudi Hermawan', menuId: 'menu-6', menuNama: 'Gado-gado', hargaSatuan: 15000, jumlahPorsi: 5, ongkir: 8000, total: 83000, status: 'dibatalkan', buktiBayar: null, tanggal: new Date('2024-01-14'), createdAt: new Date('2024-01-14T16:00:00') },
];

export const ORDER_STATUS = {
  menunggu: { label: 'Menunggu Bayar', color: 'warning', next: ['dibayar', 'dibatalkan'] },
  dibayar: { label: 'Dibayar', color: 'info', next: ['diproses'] },
  diproses: { label: 'Diproses', color: 'primary', next: ['selesai'] },
  selesai: { label: 'Selesai', color: 'success', next: [] },
  dibatalkan: { label: 'Dibatalkan', color: 'danger', next: [] },
};

export const formatCurrency = (amount) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
export const formatDate = (rawDate) => {
  let date = rawDate;
  if (!date) return '-';

  if (typeof date?.toDate === 'function') {
    date = date.toDate();
  }

  if (!(date instanceof Date)) {
    date = new Date(date);
  }

  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
};

export const toDateObject = (rawDate) => {
  let date = rawDate;
  if (!date) return null;

  if (typeof date?.toDate === 'function') {
    date = date.toDate();
  }

  if (!(date instanceof Date)) {
    date = new Date(date);
  }

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
};
export const generateId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
export const generateOrderNumber = (orders) => `DN${String(orders.length + 1).padStart(3, '0')}`;

export const isDrinkMenu = (menu) => {
  if (!menu) return false;
  if (menu.kategori === 'minuman') return true;
  if (menu.kategori === 'makanan') return false;
  const name = (menu.nama || '').toLowerCase();
  return /(es\s|teh|jeruk|kopi|jus|air|minum|wedang|susu|sirup|lemon|boba)/i.test(name);
};
