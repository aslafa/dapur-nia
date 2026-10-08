// src/services/firestoreService.js
// Cloud Firestore Service for Dapur Nia
// Collections: 'menu' | 'pelanggan' | 'pesanan'

import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import {
  dummyMenus,
  dummyCustomers,
  dummyOrders,
  ORDER_STATUS,
} from '../data/dummyData';

// ─── COLLECTION REFERENCES ───
export const COLLECTIONS = {
  MENU: 'menu',
  PELANGGAN: 'pelanggan',
  PESANAN: 'pesanan',
};

// ─── 1. MENU OPERATIONS (collection: "menu") ───
// Fields: nama, harga, sisa_porsi, tersedia, dibuat_pada
export const menuService = {
  subscribe(onData, onError) {
    try {
      const colRef = collection(db, COLLECTIONS.MENU);
      return onSnapshot(
        colRef,
        (snapshot) => {
          const items = snapshot.docs.map((d) => {
            const data = d.data();
            return {
              id: d.id,
              nama: data.nama || '',
              harga: Number(data.harga) || 0,
              sisa_porsi: Number(data.sisa_porsi ?? data.sisaPorsi ?? 0),
              sisaPorsi: Number(data.sisa_porsi ?? data.sisaPorsi ?? 0),
              tersedia: Boolean(data.tersedia),
              dibuat_pada: data.dibuat_pada || '',
              createdAt: data.dibuat_pada || '',
            };
          });
          onData(items);
        },
        (error) => {
          console.error('Firestore Error [menu subscribe]:', error);
          if (onError) onError(error);
        }
      );
    } catch (err) {
      console.error('Firestore Setup Error [menu subscribe]:', err);
      if (onError) onError(err);
      return () => {};
    }
  },

  async getAll() {
    const colRef = collection(db, COLLECTIONS.MENU);
    const snapshot = await getDocs(colRef);
    return snapshot.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        nama: data.nama || '',
        harga: Number(data.harga) || 0,
        sisa_porsi: Number(data.sisa_porsi ?? 0),
        sisaPorsi: Number(data.sisa_porsi ?? 0),
        tersedia: Boolean(data.tersedia),
        dibuat_pada: data.dibuat_pada || '',
        createdAt: data.dibuat_pada || '',
      };
    });
  },

  async create(menuData) {
    const porsi = Number(menuData.sisaPorsi ?? menuData.sisa_porsi ?? 0);
    const colRef = collection(db, COLLECTIONS.MENU);
    const docData = {
      nama: (menuData.nama || '').trim(),
      harga: Number(menuData.harga) || 0,
      sisa_porsi: porsi,
      tersedia: porsi > 0 ? (menuData.tersedia ?? true) : false,
      dibuat_pada: new Date().toISOString(),
    };
    const res = await addDoc(colRef, docData);
    return { id: res.id, ...docData, sisaPorsi: porsi };
  },

  async update(id, menuData) {
    const porsi = Number(menuData.sisaPorsi ?? menuData.sisa_porsi ?? 0);
    const docRef = doc(db, COLLECTIONS.MENU, id);
    const updatePayload = {
      nama: (menuData.nama || '').trim(),
      harga: Number(menuData.harga) || 0,
      sisa_porsi: porsi,
      tersedia: porsi > 0 ? (menuData.tersedia ?? true) : false,
    };
    await updateDoc(docRef, updatePayload);
    return true;
  },

  async delete(id) {
    const docRef = doc(db, COLLECTIONS.MENU, id);
    await deleteDoc(docRef);
    return true;
  },
};

// ─── 2. PELANGGAN OPERATIONS (collection: "pelanggan") ───
// Fields: nama, no_whatsapp, alamat, dibuat_pada
// Document ID pelanggan = no_whatsapp
export const customerService = {
  subscribe(onData, onError) {
    try {
      const colRef = collection(db, COLLECTIONS.PELANGGAN);
      return onSnapshot(
        colRef,
        (snapshot) => {
          const items = snapshot.docs.map((d) => {
            const data = d.data();
            return {
              id: d.id, // no_whatsapp as document ID
              nama: data.nama || '',
              no_whatsapp: data.no_whatsapp || d.id,
              whatsapp: data.no_whatsapp || d.id,
              alamat: data.alamat || '',
              dibuat_pada: data.dibuat_pada || '',
              createdAt: data.dibuat_pada || '',
            };
          });
          onData(items);
        },
        (error) => {
          console.error('Firestore Error [pelanggan subscribe]:', error);
          if (onError) onError(error);
        }
      );
    } catch (err) {
      console.error('Firestore Setup Error [pelanggan subscribe]:', err);
      if (onError) onError(err);
      return () => {};
    }
  },

  async getAll() {
    const colRef = collection(db, COLLECTIONS.PELANGGAN);
    const snapshot = await getDocs(colRef);
    return snapshot.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        nama: data.nama || '',
        no_whatsapp: data.no_whatsapp || d.id,
        whatsapp: data.no_whatsapp || d.id,
        alamat: data.alamat || '',
        dibuat_pada: data.dibuat_pada || '',
        createdAt: data.dibuat_pada || '',
      };
    });
  },

  async create(customerData) {
    const cleanWa = (customerData.no_whatsapp || customerData.whatsapp || '').trim();
    if (!cleanWa) throw new Error('Nomor WhatsApp wajib diisi');

    const docRef = doc(db, COLLECTIONS.PELANGGAN, cleanWa);
    const existing = await getDoc(docRef);
    if (existing.exists()) {
      throw new Error('Nomor WhatsApp sudah digunakan oleh pelanggan lain');
    }

    const docData = {
      nama: (customerData.nama || '').trim(),
      no_whatsapp: cleanWa,
      alamat: (customerData.alamat || '').trim(),
      dibuat_pada: new Date().toISOString(),
    };
    await setDoc(docRef, docData);
    return { id: cleanWa, ...docData, whatsapp: cleanWa };
  },

  async update(id, customerData) {
    const targetWa = (customerData.no_whatsapp || customerData.whatsapp || id).trim();

    // If ID changed (WhatsApp number modified)
    if (targetWa !== id) {
      const newRef = doc(db, COLLECTIONS.PELANGGAN, targetWa);
      const existing = await getDoc(newRef);
      if (existing.exists()) {
        throw new Error('Nomor WhatsApp baru sudah terdaftar');
      }

      await setDoc(newRef, {
        nama: (customerData.nama || '').trim(),
        no_whatsapp: targetWa,
        alamat: (customerData.alamat || '').trim(),
        dibuat_pada: customerData.dibuat_pada || new Date().toISOString(),
      });
      // Delete old doc
      await deleteDoc(doc(db, COLLECTIONS.PELANGGAN, id));
    } else {
      const docRef = doc(db, COLLECTIONS.PELANGGAN, id);
      await updateDoc(docRef, {
        nama: (customerData.nama || '').trim(),
        no_whatsapp: targetWa,
        alamat: (customerData.alamat || '').trim(),
      });
    }
    return true;
  },

  async delete(id) {
    const docRef = doc(db, COLLECTIONS.PELANGGAN, id);
    await deleteDoc(docRef);
    return true;
  },
};

// ─── 3. PESANAN OPERATIONS (collection: "pesanan") ───
// Fields: pelanggan_id, nama_pelanggan, alamat_kirim, menu_id, nama_menu,
//         harga_satuan, jumlah_porsi, ongkir, total, status, bukti_bayar, tanggal, dibuat_pada
export const orderService = {
  subscribe(onData, onError) {
    try {
      const colRef = collection(db, COLLECTIONS.PESANAN);
      return onSnapshot(
        colRef,
        (snapshot) => {
          const items = snapshot.docs.map((d) => {
            const data = d.data();
            return {
              id: d.id,
              nomorPesanan:
                data.nomor_pesanan ||
                data.nomorPesanan ||
                `DN${d.id.slice(-4).toUpperCase()}`,
              pelanggan_id: data.pelanggan_id || data.pelangganId || '',
              pelangganId: data.pelanggan_id || data.pelangganId || '',
              nama_pelanggan: data.nama_pelanggan || data.pelangganNama || '',
              pelangganNama: data.nama_pelanggan || data.pelangganNama || '',
              alamat_kirim: data.alamat_kirim || data.alamatKirim || '',
              alamatKirim: data.alamat_kirim || data.alamatKirim || '',
              menu_id: data.menu_id || data.menuId || '',
              menuId: data.menu_id || data.menuId || '',
              nama_menu: data.nama_menu || data.menuNama || '',
              menuNama: data.nama_menu || data.menuNama || '',
              harga_satuan: Number(data.harga_satuan ?? data.hargaSatuan ?? 0),
              hargaSatuan: Number(data.harga_satuan ?? data.hargaSatuan ?? 0),
              jumlah_porsi: Number(data.jumlah_porsi ?? data.jumlahPorsi ?? 0),
              jumlahPorsi: Number(data.jumlah_porsi ?? data.jumlahPorsi ?? 0),
              ongkir: Number(data.ongkir ?? 0),
              total: Number(data.total ?? 0),
              status: data.status || 'menunggu',
              bukti_bayar: data.bukti_bayar ?? data.buktiBayar ?? null,
              buktiBayar: data.bukti_bayar ?? data.buktiBayar ?? null,
              tanggal: data.tanggal || '',
              dibuat_pada: data.dibuat_pada || '',
              createdAt: data.dibuat_pada || '',
            };
          });
          onData(items);
        },
        (error) => {
          console.error('Firestore Error [pesanan subscribe]:', error);
          if (onError) onError(error);
        }
      );
    } catch (err) {
      console.error('Firestore Setup Error [pesanan subscribe]:', err);
      if (onError) onError(err);
      return () => {};
    }
  },

  async getAll() {
    const colRef = collection(db, COLLECTIONS.PESANAN);
    const snapshot = await getDocs(colRef);
    return snapshot.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        nomorPesanan:
          data.nomor_pesanan ||
          data.nomorPesanan ||
          `DN${d.id.slice(-4).toUpperCase()}`,
        pelanggan_id: data.pelanggan_id || data.pelangganId || '',
        pelangganId: data.pelanggan_id || data.pelangganId || '',
        nama_pelanggan: data.nama_pelanggan || data.pelangganNama || '',
        pelangganNama: data.nama_pelanggan || data.pelangganNama || '',
        alamat_kirim: data.alamat_kirim || data.alamatKirim || '',
        alamatKirim: data.alamat_kirim || data.alamatKirim || '',
        menu_id: data.menu_id || data.menuId || '',
        menuId: data.menu_id || data.menuId || '',
        nama_menu: data.nama_menu || data.menuNama || '',
        menuNama: data.nama_menu || data.menuNama || '',
        harga_satuan: Number(data.harga_satuan ?? data.hargaSatuan ?? 0),
        hargaSatuan: Number(data.harga_satuan ?? data.hargaSatuan ?? 0),
        jumlah_porsi: Number(data.jumlah_porsi ?? data.jumlahPorsi ?? 0),
        jumlahPorsi: Number(data.jumlah_porsi ?? data.jumlahPorsi ?? 0),
        ongkir: Number(data.ongkir ?? 0),
        total: Number(data.total ?? 0),
        status: data.status || 'menunggu',
        bukti_bayar: data.bukti_bayar ?? data.buktiBayar ?? null,
        buktiBayar: data.bukti_bayar ?? data.buktiBayar ?? null,
        tanggal: data.tanggal || '',
        dibuat_pada: data.dibuat_pada || '',
        createdAt: data.dibuat_pada || '',
      };
    });
  },

  async create(orderData) {
    const colRef = collection(db, COLLECTIONS.PESANAN);
    const docData = {
      pelanggan_id: orderData.pelanggan_id || orderData.pelangganId || '',
      nama_pelanggan: orderData.nama_pelanggan || orderData.pelangganNama || '',
      alamat_kirim: orderData.alamat_kirim || orderData.alamatKirim || '',
      menu_id: orderData.menu_id || orderData.menuId || '',
      nama_menu: orderData.nama_menu || orderData.menuNama || '',
      harga_satuan: Number(orderData.harga_satuan ?? orderData.hargaSatuan ?? 0),
      jumlah_porsi: Number(orderData.jumlah_porsi ?? orderData.jumlahPorsi ?? 1),
      ongkir: Number(orderData.ongkir ?? 0),
      total: Number(orderData.total ?? 0),
      status: orderData.status || 'menunggu',
      bukti_bayar: orderData.bukti_bayar ?? orderData.buktiBayar ?? null,
      tanggal: orderData.tanggal || new Date().toISOString(),
      dibuat_pada: new Date().toISOString(),
      nomor_pesanan: orderData.nomorPesanan || orderData.nomor_pesanan || '',
    };
    const res = await addDoc(colRef, docData);
    return { id: res.id, ...docData };
  },

  async updateStatus(id, newStatus) {
    const docRef = doc(db, COLLECTIONS.PESANAN, id);
    await updateDoc(docRef, { status: newStatus });
    return true;
  },

  async updateBuktiBayar(id, buktiBayar) {
    const docRef = doc(db, COLLECTIONS.PESANAN, id);
    await updateDoc(docRef, { bukti_bayar: buktiBayar || null });
    return true;
  },

  async delete(id) {
    const docRef = doc(db, COLLECTIONS.PESANAN, id);
    await deleteDoc(docRef);
    return true;
  },
};

// ─── 4. SEED DATA FUNCTION ───
// Seed initial dummy data into Firestore collections without duplicate documents.
// Only executed manually / development.
export async function seedInitialDataToFirestore() {
  const result = {
    menuCount: 0,
    customerCount: 0,
    orderCount: 0,
  };

  // 1. Seed Menu (deterministic doc ID = m.id)
  for (const m of dummyMenus) {
    const docId = m.id;
    const docRef = doc(db, COLLECTIONS.MENU, docId);
    await setDoc(
      docRef,
      {
        nama: m.nama,
        harga: Number(m.harga),
        sisa_porsi: Number(m.sisaPorsi ?? m.sisa_porsi ?? 0),
        tersedia: Boolean(m.tersedia),
        dibuat_pada: m.createdAt instanceof Date ? m.createdAt.toISOString() : (m.createdAt || new Date().toISOString()),
      },
      { merge: true }
    );
    result.menuCount++;
  }

  // 2. Seed Pelanggan (Document ID = no_whatsapp)
  for (const c of dummyCustomers) {
    const docId = (c.whatsapp || c.no_whatsapp || '').trim();
    if (!docId) continue;
    const docRef = doc(db, COLLECTIONS.PELANGGAN, docId);
    await setDoc(
      docRef,
      {
        nama: c.nama,
        no_whatsapp: docId,
        alamat: c.alamat || '',
        dibuat_pada: c.createdAt instanceof Date ? c.createdAt.toISOString() : (c.createdAt || new Date().toISOString()),
      },
      { merge: true }
    );
    result.customerCount++;
  }

  // 3. Seed Pesanan (deterministic doc ID = o.id)
  for (const o of dummyOrders) {
    const docId = o.id;
    const docRef = doc(db, COLLECTIONS.PESANAN, docId);
    const matchedCustomer = dummyCustomers.find(
      (c) => c.id === o.pelangganId || c.nama === o.pelangganNama
    );
    const alamatKirim = matchedCustomer?.alamat || 'Jl. Anggrek No. 15, Bandung';
    const pelangganId = matchedCustomer?.whatsapp || o.pelangganId || '';

    await setDoc(
      docRef,
      {
        pelanggan_id: pelangganId,
        nama_pelanggan: o.pelangganNama || '',
        alamat_kirim: alamatKirim,
        menu_id: o.menuId || '',
        nama_menu: o.menuNama || '',
        harga_satuan: Number(o.hargaSatuan),
        jumlah_porsi: Number(o.jumlahPorsi),
        ongkir: Number(o.ongkir || 0),
        total: Number(o.total),
        status: o.status || 'menunggu',
        bukti_bayar: o.buktiBayar || null,
        tanggal: o.tanggal instanceof Date ? o.tanggal.toISOString() : (o.tanggal || new Date().toISOString()),
        dibuat_pada: o.createdAt instanceof Date ? o.createdAt.toISOString() : (o.createdAt || new Date().toISOString()),
      },
      { merge: true }
    );
    result.orderCount++;
  }

  return result;
}

export const seedFirestore = seedInitialDataToFirestore;

