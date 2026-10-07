import { createContext, useContext, useState, useEffect } from 'react';
import {
  dummyMenus,
  dummyCustomers,
  dummyOrders,
  ORDER_STATUS,
  generateId,
  generateOrderNumber,
  isDrinkMenu,
} from '../data/dummyData';

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

  // Simulation mode for testing UI states required by PRD (normal, loading, empty, error)
  const [simulationState, setSimulationState] = useState('normal');

  // Notification Modal State
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [targetOrderId, setTargetOrderId] = useState(null);

  // State with LocalStorage fallback
  const [menus, setMenus] = useState(() => {
    const saved = localStorage.getItem('dn_menus');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return dummyMenus;
      }
    }
    return dummyMenus;
  });

  const [customers, setCustomers] = useState(() => {
    const saved = localStorage.getItem('dn_customers');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return dummyCustomers;
      }
    }
    return dummyCustomers;
  });

  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem('dn_orders');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return dummyOrders;
      }
    }
    return dummyOrders;
  });

  // Notifications state
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

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('dn_menus', JSON.stringify(menus));
  }, [menus]);

  useEffect(() => {
    localStorage.setItem('dn_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('dn_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('dn_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('dn_business_info', JSON.stringify(businessInfo));
  }, [businessInfo]);

  useEffect(() => {
    localStorage.setItem('dn_business_prefs', JSON.stringify(businessPreferences));
  }, [businessPreferences]);

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

  // ─── CRUD MENU ───
  const addMenu = (menuData) => {
    const isDrink = menuData.kategori === 'minuman' || isDrinkMenu(menuData);
    const newMenu = {
      id: generateId('menu'),
      nama: menuData.nama.trim(),
      harga: Number(menuData.harga),
      sisaPorsi: Number(menuData.sisaPorsi),
      kategori: menuData.kategori || (isDrink ? 'minuman' : 'makanan'),
      tersedia: Number(menuData.sisaPorsi) > 0 ? (menuData.tersedia ?? true) : false,
      createdAt: new Date().toISOString(),
    };
    setMenus((prev) => [newMenu, ...prev]);
    showToast('Menu berhasil ditambahkan', 'success');
    return newMenu;
  };

  const updateMenu = (id, menuData) => {
    const isDrink = menuData.kategori === 'minuman' || isDrinkMenu(menuData);
    setMenus((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              nama: menuData.nama.trim(),
              harga: Number(menuData.harga),
              sisaPorsi: Number(menuData.sisaPorsi),
              kategori: menuData.kategori || (isDrink ? 'minuman' : 'makanan'),
              tersedia:
                Number(menuData.sisaPorsi) > 0 ? (menuData.tersedia ?? true) : false,
            }
          : item
      )
    );
    showToast('Menu berhasil diperbarui', 'success');
    return true;
  };

  const deleteMenu = (id) => {
    setMenus((prev) => prev.filter((item) => item.id !== id));
    showToast('Menu berhasil dihapus', 'success');
  };

  // ─── CRUD CUSTOMER ───
  const addCustomer = (customerData) => {
    const exists = customers.some(
      (c) => c.whatsapp.trim() === customerData.whatsapp.trim()
    );
    if (exists) {
      showToast('Nomor WhatsApp sudah digunakan oleh pelanggan lain', 'warning');
      return null;
    }

    const newCustomer = {
      id: generateId('cust'),
      nama: customerData.nama.trim(),
      whatsapp: customerData.whatsapp.trim(),
      alamat: customerData.alamat.trim(),
      createdAt: new Date().toISOString(),
    };
    setCustomers((prev) => [newCustomer, ...prev]);
    showToast('Pelanggan berhasil ditambahkan', 'success');
    return newCustomer;
  };

  const updateCustomer = (id, customerData) => {
    const exists = customers.some(
      (c) => c.id !== id && c.whatsapp.trim() === customerData.whatsapp.trim()
    );
    if (exists) {
      showToast('Nomor WhatsApp sudah digunakan oleh pelanggan lain', 'warning');
      return false;
    }

    setCustomers((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              nama: customerData.nama.trim(),
              whatsapp: customerData.whatsapp.trim(),
              alamat: customerData.alamat.trim(),
            }
          : item
      )
    );
    showToast('Pelanggan berhasil diperbarui', 'success');
    return true;
  };

  const deleteCustomer = (id) => {
    setCustomers((prev) => prev.filter((item) => item.id !== id));
    showToast('Pelanggan berhasil dihapus', 'success');
  };

  // ─── CRUD ORDER ───
  const addOrder = (orderData) => {
    const selectedMenu = menus.find((m) => m.id === orderData.menuId);
    if (!selectedMenu) {
      showToast('Menu tidak ditemukan', 'danger');
      return null;
    }

    const porsi = Number(orderData.jumlahPorsi);
    if (porsi > selectedMenu.sisaPorsi) {
      showToast(`Sisa porsi hanya tersedia ${selectedMenu.sisaPorsi}`, 'danger');
      return null;
    }

    const hargaSatuan = selectedMenu.harga;
    const ongkir = Number(orderData.ongkir) || 0;
    const total = hargaSatuan * porsi + ongkir;
    const orderNum = generateOrderNumber(orders);

    const newOrder = {
      id: generateId('order'),
      nomorPesanan: orderNum,
      pelangganId: orderData.pelangganId,
      pelangganNama: orderData.pelangganNama,
      menuId: orderData.menuId,
      menuNama: selectedMenu.nama,
      hargaSatuan,
      jumlahPorsi: porsi,
      ongkir,
      total,
      status: 'menunggu',
      buktiBayar: orderData.buktiBayar || null,
      tanggal: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    // Update sisa porsi menu
    setMenus((prev) =>
      prev.map((m) =>
        m.id === selectedMenu.id
          ? {
              ...m,
              sisaPorsi: Math.max(0, m.sisaPorsi - porsi),
              tersedia: m.sisaPorsi - porsi > 0 ? m.tersedia : false,
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
    return newOrder;
  };

  const updateOrderStatus = (orderId, targetStatus) => {
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
    return true;
  };

  const deleteOrder = (orderId) => {
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
    showToast('Pesanan berhasil dihapus', 'success');
  };

  const updateOrderBuktiBayar = (orderId, buktiBayar) => {
    const order = orders.find((o) => o.id === orderId);
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId ? { ...o, buktiBayar: buktiBayar || null } : o
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
    localStorage.removeItem('dn_menus');
    localStorage.removeItem('dn_customers');
    localStorage.removeItem('dn_orders');
    localStorage.removeItem('dn_notifications');
    localStorage.removeItem('dn_business_info');
    localStorage.removeItem('dn_business_prefs');
    showToast('Semua data berhasil di-reset ke nilai awal', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        simulationState,
        setSimulationState,
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
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
