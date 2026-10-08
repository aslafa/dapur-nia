// src/context/AppContext.jsx
// Centralized App State connected to Firebase Cloud Firestore
// Collections: 'menu' | 'pelanggan' | 'pesanan'

import { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  ORDER_STATUS,
  generateId,
  generateOrderNumber,
  isDrinkMenu,
  dummyMenus,
  dummyCustomers,
  dummyOrders,
} from '../data/dummyData';
import {
  menuService,
  customerService,
  orderService,
  seedInitialDataToFirestore,
} from '../services/firestoreService';

const AppContext = createContext();

const defaultBusinessInfo = {
  namaUsaha: 'Dapur Nia',
  bidang: 'Katering Rumahan Harian & Prasmanan',
  alamatDapur: 'Jl. Anggrek No. 15, Bandung, Jawa Barat',
  jamOperasional: 'Setiap Hari, 06.00 - 18.00 WIB',
};

const defaultBusinessPreferences = {
  ongkirDefault: 5000,
  formatMataUang: 'IDR (Rupiah Indonesia)',
  notifikasiPesanan: true,
};

const defaultNotifications = [
  {
    id: 'notif-1',
    type: 'order_new',
    title: 'Pesanan baru',
    message: 'Pesanan baru dari Budi Santoso (#DN001)',
    orderId: 'order-1',
    orderNumber: 'DN001',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    id: 'notif-2',
    type: 'payment',
    title: 'Pembayaran diterima',
    message: 'Pembayaran pesanan #DN002 telah dikonfirmasi',
    orderId: 'order-2',
    orderNumber: 'DN002',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: 'notif-3',
    type: 'status_change',
    title: 'Status pesanan diperbarui',
    message: 'Pesanan #DN003 sedang diproses di dapur',
    orderId: 'order-3',
    orderNumber: 'DN003',
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
];

export const AppProvider = ({ children }) => {
  // Active Navigation Tab: 'home' | 'menu' | 'orders' | 'customers' | 'reports' | 'profile'
  const [activeTab, setActiveTab] = useState('home');

  // Simulation / Data State ('normal' | 'loading' | 'empty' | 'error')
  // Starts with 'loading' while Firestore is initially fetching
  const [simulationState, setSimulationState] = useState('loading');

  // Firestore status flags
  const [isFirestoreLoading, setIsFirestoreLoading] = useState(true);
  const [firestoreError, setFirestoreError] = useState(null);

  // Notification Modal State
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [targetOrderId, setTargetOrderId] = useState(null);

  // Main Entities State (Connected to Firestore)
  const [menus, setMenus] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);

  // Notifications state (saved locally)
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('dn_notifications');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return defaultNotifications;
      }
    }
    return defaultNotifications;
  });

  // Business Info & Preferences State
  const [businessInfo, setBusinessInfo] = useState(() => {
    const saved = localStorage.getItem('dn_business_info');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return defaultBusinessInfo;
      }
    }
    return defaultBusinessInfo;
  });

  const [businessPreferences, setBusinessPreferences] = useState(() => {
    const saved = localStorage.getItem('dn_business_prefs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return defaultBusinessPreferences;
      }
    }
    return defaultBusinessPreferences;
  });

  // Toasts
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync auxiliary states to localStorage
  useEffect(() => {
    localStorage.setItem('dn_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('dn_business_info', JSON.stringify(businessInfo));
  }, [businessInfo]);

  useEffect(() => {
    localStorage.setItem('dn_business_prefs', JSON.stringify(businessPreferences));
  }, [businessPreferences]);

  // ─── FIRESTORE REAL-TIME SUBSCRIPTIONS ───
  // Track readiness of 3 collections
  const readyMapRef = useRef({ menu: false, pelanggan: false, pesanan: false });

  useEffect(() => {
    let isMounted = true;

    const checkReady = () => {
      if (
        readyMapRef.current.menu &&
        readyMapRef.current.pelanggan &&
        readyMapRef.current.pesanan
      ) {
        if (isMounted) {
          setIsFirestoreLoading(false);
          setSimulationState((prev) => (prev === 'loading' ? 'normal' : prev));
        }
      }
    };

    const handleFirestoreError = (colName, err) => {
      console.warn(`Firestore subscription notice [${colName}]:`, err);
      if (isMounted) {
        setFirestoreError(err);
        readyMapRef.current[colName] = true;
        // If all errored or done, finish loading
        if (
          readyMapRef.current.menu &&
          readyMapRef.current.pelanggan &&
          readyMapRef.current.pesanan
        ) {
          setIsFirestoreLoading(false);
          // If we had no data at all and error occurred, switch to error state
          setSimulationState((prev) => (prev === 'loading' ? 'error' : prev));
        }
      }
    };

    // 1. Subscribe Menu
    const unsubMenu = menuService.subscribe(
      (items) => {
        if (!isMounted) return;
        setMenus(items);
        readyMapRef.current.menu = true;
        checkReady();
      },
      (err) => handleFirestoreError('menu', err)
    );

    // 2. Subscribe Pelanggan
    const unsubCustomer = customerService.subscribe(
      (items) => {
        if (!isMounted) return;
        setCustomers(items);
        readyMapRef.current.pelanggan = true;
        checkReady();
      },
      (err) => handleFirestoreError('pelanggan', err)
    );

    // 3. Subscribe Pesanan
    const unsubOrders = orderService.subscribe(
      (items) => {
        if (!isMounted) return;
        setOrders(items);
        readyMapRef.current.pesanan = true;
        checkReady();
      },
      (err) => handleFirestoreError('pesanan', err)
    );

    return () => {
      isMounted = false;
      if (typeof unsubMenu === 'function') unsubMenu();
      if (typeof unsubCustomer === 'function') unsubCustomer();
      if (typeof unsubOrders === 'function') unsubOrders();
    };
  }, []);

  // ─── NOTIFICATION ACTIONS ───
  const addNotification = ({ type, title, message, orderId, orderNumber }) => {
    const newNotif = {
      id: generateId('notif'),
      type, // 'order_new' | 'payment' | 'status_change'
      title,
      message,
      orderId,
      orderNumber,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const markNotificationAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    showToast('Semua notifikasi ditandai dibaca', 'info');
  };

  const unreadNotificationsCount = notifications.filter((n) => !n.isRead).length;

  const navigateToOrder = (orderId) => {
    setIsNotificationOpen(false);
    setActiveTab('orders');
    setTargetOrderId(orderId);
  };

  // ─── 5. CRUD MENU (Firestore: collection "menu") ───
  // Field: nama, harga, sisa_porsi, tersedia, dibuat_pada
  const addMenu = async (menuData) => {
    const porsi = Number(menuData.sisaPorsi ?? menuData.sisa_porsi ?? 0);
    const isDrink = menuData.kategori === 'minuman' || isDrinkMenu(menuData);
    const tempId = generateId('menu');
    const newMenu = {
      id: tempId,
      nama: menuData.nama.trim(),
      harga: Number(menuData.harga),
      sisa_porsi: porsi,
      sisaPorsi: porsi,
      kategori: menuData.kategori || (isDrink ? 'minuman' : 'makanan'),
      tersedia: porsi > 0 ? (menuData.tersedia ?? true) : false,
      dibuat_pada: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    // Optimistic UI update
    setMenus((prev) => [newMenu, ...prev]);
    showToast('Menu berhasil ditambahkan', 'success');

    try {
      await menuService.create(newMenu);
    } catch (err) {
      console.error('Error saving menu to Firestore:', err);
      showToast('Perhatian: Data tersimpan lokal, gagal sinkron Firestore', 'warning');
    }
    return newMenu;
  };

  const updateMenu = async (id, menuData) => {
    const porsi = Number(menuData.sisaPorsi ?? menuData.sisa_porsi ?? 0);
    const isDrink = menuData.kategori === 'minuman' || isDrinkMenu(menuData);

    // Optimistic UI update
    setMenus((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              nama: menuData.nama.trim(),
              harga: Number(menuData.harga),
              sisa_porsi: porsi,
              sisaPorsi: porsi,
              kategori: menuData.kategori || (isDrink ? 'minuman' : 'makanan'),
              tersedia: porsi > 0 ? (menuData.tersedia ?? true) : false,
            }
          : item
      )
    );
    showToast('Menu berhasil diperbarui', 'success');

    try {
      await menuService.update(id, menuData);
    } catch (err) {
      console.error('Error updating menu in Firestore:', err);
      showToast('Perhatian: Perubahan tersimpan lokal, gagal sinkron Firestore', 'warning');
    }
    return true;
  };

  const deleteMenu = async (id) => {
    // Optimistic UI update
    setMenus((prev) => prev.filter((item) => item.id !== id));
    showToast('Menu berhasil dihapus', 'success');

    try {
      await menuService.delete(id);
    } catch (err) {
      console.error('Error deleting menu in Firestore:', err);
      showToast('Perhatian: Dihapus lokal, gagal sinkron Firestore', 'warning');
    }
  };

  // ─── 6. CRUD CUSTOMER (Firestore: collection "pelanggan") ───
  // Field: nama, no_whatsapp, alamat, dibuat_pada (Doc ID = no_whatsapp)
  const addCustomer = async (customerData) => {
    const cleanWa = (customerData.no_whatsapp || customerData.whatsapp || '').trim();
    const exists = customers.some(
      (c) => (c.no_whatsapp || c.whatsapp || '').trim() === cleanWa
    );
    if (exists) {
      showToast('Nomor WhatsApp sudah digunakan oleh pelanggan lain', 'warning');
      return null;
    }

    const newCustomer = {
      id: cleanWa,
      nama: customerData.nama.trim(),
      no_whatsapp: cleanWa,
      whatsapp: cleanWa,
      alamat: customerData.alamat.trim(),
      dibuat_pada: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    // Optimistic UI update
    setCustomers((prev) => [newCustomer, ...prev]);
    showToast('Pelanggan berhasil ditambahkan', 'success');

    try {
      await customerService.create(newCustomer);
    } catch (err) {
      console.error('Error creating customer in Firestore:', err);
      showToast('Perhatian: Tersimpan lokal, gagal sinkron Firestore', 'warning');
    }
    return newCustomer;
  };

  const updateCustomer = async (id, customerData) => {
    const cleanWa = (customerData.no_whatsapp || customerData.whatsapp || id).trim();
    const exists = customers.some(
      (c) => c.id !== id && (c.no_whatsapp || c.whatsapp || '').trim() === cleanWa
    );
    if (exists) {
      showToast('Nomor WhatsApp sudah digunakan oleh pelanggan lain', 'warning');
      return false;
    }

    // Optimistic UI update
    setCustomers((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              id: cleanWa,
              nama: customerData.nama.trim(),
              no_whatsapp: cleanWa,
              whatsapp: cleanWa,
              alamat: customerData.alamat.trim(),
            }
          : item
      )
    );
    showToast('Pelanggan berhasil diperbarui', 'success');

    try {
      await customerService.update(id, customerData);
    } catch (err) {
      console.error('Error updating customer in Firestore:', err);
      showToast('Perhatian: Diperbarui lokal, gagal sinkron Firestore', 'warning');
    }
    return true;
  };

  const deleteCustomer = async (id) => {
    // Optimistic UI update
    setCustomers((prev) => prev.filter((item) => item.id !== id));
    showToast('Pelanggan berhasil dihapus', 'success');

    try {
      await customerService.delete(id);
    } catch (err) {
      console.error('Error deleting customer in Firestore:', err);
      showToast('Perhatian: Dihapus lokal, gagal sinkron Firestore', 'warning');
    }
  };

  // ─── 7. CRUD PESANAN (Firestore: collection "pesanan") ───
  // Field: pelanggan_id, nama_pelanggan, alamat_kirim, menu_id, nama_menu,
  //        harga_satuan, jumlah_porsi, ongkir, total, status, bukti_bayar, tanggal, dibuat_pada
  const addOrder = async (orderData) => {
    const selectedMenu = menus.find((m) => m.id === orderData.menuId);
    if (!selectedMenu) {
      showToast('Menu tidak ditemukan', 'danger');
      return null;
    }

    const porsi = Number(orderData.jumlahPorsi);
    const sisa = Number(selectedMenu.sisa_porsi ?? selectedMenu.sisaPorsi ?? 0);
    if (porsi > sisa) {
      showToast(`Sisa porsi hanya tersedia ${sisa}`, 'danger');
      return null;
    }

    const hargaSatuan = selectedMenu.harga;
    const ongkir = Number(orderData.ongkir) || 0;
    const total = hargaSatuan * porsi + ongkir;
    const orderNum = generateOrderNumber(orders);
    const tempId = generateId('order');

    const newOrder = {
      id: tempId,
      nomorPesanan: orderNum,
      nomor_pesanan: orderNum,
      pelanggan_id: orderData.pelangganId,
      pelangganId: orderData.pelangganId,
      nama_pelanggan: orderData.pelangganNama,
      pelangganNama: orderData.pelangganNama,
      alamat_kirim: orderData.alamatKirim || 'Jl. Anggrek No. 15, Bandung',
      alamatKirim: orderData.alamatKirim || 'Jl. Anggrek No. 15, Bandung',
      menu_id: orderData.menuId,
      menuId: orderData.menuId,
      nama_menu: selectedMenu.nama,
      menuNama: selectedMenu.nama,
      harga_satuan: hargaSatuan,
      hargaSatuan,
      jumlah_porsi: porsi,
      jumlahPorsi: porsi,
      ongkir,
      total,
      status: 'menunggu',
      bukti_bayar: orderData.buktiBayar || null,
      buktiBayar: orderData.buktiBayar || null,
      tanggal: new Date().toISOString(),
      dibuat_pada: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    // Optimistic update order & menu remaining portion
    const updatedSisa = Math.max(0, sisa - porsi);
    setMenus((prev) =>
      prev.map((m) =>
        m.id === selectedMenu.id
          ? {
              ...m,
              sisa_porsi: updatedSisa,
              sisaPorsi: updatedSisa,
              tersedia: updatedSisa > 0 ? m.tersedia : false,
            }
          : m
      )
    );
    setOrders((prev) => [newOrder, ...prev]);

    // TRIGGER NOTIFICATION: Pesanan baru
    addNotification({
      type: 'order_new',
      title: 'Pesanan baru',
      message: `Pesanan baru dari ${orderData.pelangganNama} (#${orderNum})`,
      orderId: newOrder.id,
      orderNumber: orderNum,
    });

    showToast('Pesanan berhasil dibuat', 'success');

    try {
      await orderService.create(newOrder);
      await menuService.update(selectedMenu.id, {
        sisa_porsi: updatedSisa,
        tersedia: updatedSisa > 0 ? selectedMenu.tersedia : false,
      });
    } catch (err) {
      console.error('Error saving order to Firestore:', err);
      showToast('Perhatian: Pesanan dibuat lokal, gagal sinkron Firestore', 'warning');
    }

    return newOrder;
  };

  const updateOrderStatus = async (orderId, targetStatus) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return false;

    const currentRules = ORDER_STATUS[order.status];
    if (!currentRules || !currentRules.next.includes(targetStatus)) {
      showToast(
        `Perubahan status tidak sah: Tidak boleh melompat atau mundur`,
        'danger'
      );
      return false;
    }

    // Optimistic update
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId ? { ...o, status: targetStatus } : o
      )
    );

    // TRIGGER NOTIFICATION: Pembayaran or Status Update
    if (targetStatus === 'dibayar') {
      addNotification({
        type: 'payment',
        title: 'Pembayaran dikonfirmasi',
        message: `Pembayaran pesanan #${order.nomorPesanan} telah dikonfirmasi`,
        orderId: order.id,
        orderNumber: order.nomorPesanan,
      });
    } else {
      addNotification({
        type: 'status_change',
        title: 'Status pesanan diperbarui',
        message: `Pesanan #${order.nomorPesanan} sekarang berstatus "${ORDER_STATUS[targetStatus]?.label || targetStatus}"`,
        orderId: order.id,
        orderNumber: order.nomorPesanan,
      });
    }

    showToast(
      `Status pesanan #${order.nomorPesanan} diubah ke ${ORDER_STATUS[targetStatus].label}`,
      'success'
    );

    try {
      await orderService.updateStatus(orderId, targetStatus);
    } catch (err) {
      console.error('Error updating order status in Firestore:', err);
      showToast('Perhatian: Status diubah lokal, gagal sinkron Firestore', 'warning');
    }

    return true;
  };

  const deleteOrder = async (orderId) => {
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
    showToast('Pesanan berhasil dihapus', 'success');

    try {
      await orderService.delete(orderId);
    } catch (err) {
      console.error('Error deleting order in Firestore:', err);
    }
  };

  const updateOrderBuktiBayar = async (orderId, buktiBayar) => {
    const order = orders.find((o) => o.id === orderId);
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId ? { ...o, buktiBayar: buktiBayar || null, bukti_bayar: buktiBayar || null } : o
      )
    );

    if (buktiBayar && order) {
      addNotification({
        type: 'payment',
        title: 'Bukti pembayaran diunggah',
        message: `Bukti transfer untuk pesanan #${order.nomorPesanan} berhasil diunggah`,
        orderId: order.id,
        orderNumber: order.nomorPesanan,
      });
    }

    showToast(
      buktiBayar ? 'Bukti pembayaran berhasil disimpan' : 'Bukti pembayaran dihapus',
      'success'
    );

    try {
      await orderService.updateBuktiBayar(orderId, buktiBayar);
    } catch (err) {
      console.error('Error updating bukti bayar in Firestore:', err);
    }
  };

  // ─── 8. SEED DATA FUNCTION ───
  // Manual / Development seed only. Does not run automatically.
  const handleSeedData = async () => {
    try {
      showToast('Menjalankan seed dummy data ke Firestore...', 'info');
      const res = await seedInitialDataToFirestore();
      showToast(
        `Seed selesai: ${res.menuCount} menu, ${res.customerCount} pelanggan, ${res.orderCount} pesanan ditambahkan (${res.skipped} sudah ada)`,
        'success'
      );
      return res;
    } catch (err) {
      console.error('Failed to seed Firestore:', err);
      showToast(`Gagal seed ke Firestore: ${err.message}`, 'danger');
      throw err;
    }
  };

  // ─── BUSINESS INFO & PREFERENCES ───
  const updateBusinessInfo = (newInfo) => {
    setBusinessInfo(newInfo);
    showToast('Informasi usaha berhasil diperbarui', 'success');
  };

  const updateBusinessPreferences = (newPrefs) => {
    setBusinessPreferences(newPrefs);
    showToast('Preferensi usaha berhasil diperbarui', 'success');
  };

  const resetData = () => {
    setMenus(dummyMenus);
    setCustomers(dummyCustomers);
    setOrders(dummyOrders);
    setNotifications(defaultNotifications);
    setBusinessInfo(defaultBusinessInfo);
    setBusinessPreferences(defaultBusinessPreferences);
    setSimulationState('normal');
    showToast('Semua data berhasil di-reset ke data bawaan', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        simulationState,
        setSimulationState,
        isFirestoreLoading,
        firestoreError,
        menus,
        customers,
        orders,
        notifications,
        unreadNotificationsCount,
        isNotificationOpen,
        setIsNotificationOpen,
        targetOrderId,
        setTargetOrderId,
        addNotification,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        navigateToOrder,
        businessInfo,
        businessPreferences,
        updateBusinessInfo,
        updateBusinessPreferences,
        toasts,
        showToast,
        removeToast,
        addMenu,
        updateMenu,
        deleteMenu,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        addOrder,
        updateOrderStatus,
        deleteOrder,
        updateOrderBuktiBayar,
        resetData,
        seedData: handleSeedData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
