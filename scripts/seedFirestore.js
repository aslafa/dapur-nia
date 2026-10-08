// scripts/seedFirestore.js
// Development seed script to populate existing dummy data into Cloud Firestore
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDocs, collection } from 'firebase/firestore';
import { dummyMenus, dummyCustomers, dummyOrders } from '../src/data/dummyData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read .env file
const envPath = path.resolve(__dirname, '../.env');
const envConfig = {};
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const [k, ...v] = trimmed.split('=');
      envConfig[k.trim()] = v.join('=').trim();
    }
  });
}

const firebaseConfig = {
  apiKey: envConfig.VITE_FIREBASE_API_KEY || process.env.VITE_FIREBASE_API_KEY,
  authDomain: envConfig.VITE_FIREBASE_AUTH_DOMAIN || process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: envConfig.VITE_FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID || 'dapur-nia-a8364',
  storageBucket: envConfig.VITE_FIREBASE_STORAGE_BUCKET || process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: envConfig.VITE_FIREBASE_MESSAGING_SENDER_ID || process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: envConfig.VITE_FIREBASE_APP_ID || process.env.VITE_FIREBASE_APP_ID,
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 * seedFirestore
 * 1. Membaca dummy menu existing -> menulis ke collection "menu"
 * 2. Membaca dummy pelanggan existing -> menulis ke collection "pelanggan" (ID = no_whatsapp)
 * 3. Membaca dummy pesanan existing -> menulis ke collection "pesanan"
 * Menggunakan deterministic document ID agar tidak membuat duplicate.
 */
export async function seedFirestore() {
  console.log(`====================================================`);
  console.log(`🌱 MEMULAI SEED DATA DUMMY KE FIRESTORE`);
  console.log(`Project ID : ${firebaseConfig.projectId}`);
  console.log(`Auth Domain: ${firebaseConfig.authDomain}`);
  console.log(`====================================================`);

  try {
    // 1. Menu (Collection: "menu")
    // Field: nama, harga, sisa_porsi, tersedia, dibuat_pada
    console.log(`\n[1/3] Menulis ${dummyMenus.length} menu ke collection "menu"...`);
    let menuWritten = 0;
    for (const m of dummyMenus) {
      const docId = m.id; // Deterministic ID
      const menuData = {
        nama: m.nama,
        harga: Number(m.harga),
        sisa_porsi: Number(m.sisaPorsi ?? m.sisa_porsi ?? 0),
        tersedia: Boolean(m.tersedia),
        dibuat_pada: m.createdAt instanceof Date ? m.createdAt.toISOString() : (m.createdAt || new Date().toISOString()),
      };
      await setDoc(doc(db, 'menu', docId), menuData, { merge: true });
      menuWritten++;
      console.log(`  ✓ [menu/${docId}] ${m.nama} | Rp ${menuData.harga.toLocaleString('id-ID')} | Porsi: ${menuData.sisa_porsi}`);
    }

    // 2. Pelanggan (Collection: "pelanggan")
    // Field: nama, no_whatsapp, alamat, dibuat_pada
    // Document ID: no_whatsapp
    console.log(`\n[2/3] Menulis ${dummyCustomers.length} pelanggan ke collection "pelanggan"...`);
    let customerWritten = 0;
    for (const c of dummyCustomers) {
      const docId = (c.whatsapp || c.no_whatsapp || '').trim(); // Deterministic ID = no_whatsapp
      if (!docId) continue;
      const customerData = {
        nama: c.nama,
        no_whatsapp: docId,
        alamat: c.alamat || '',
        dibuat_pada: c.createdAt instanceof Date ? c.createdAt.toISOString() : (c.createdAt || new Date().toISOString()),
      };
      await setDoc(doc(db, 'pelanggan', docId), customerData, { merge: true });
      customerWritten++;
      console.log(`  ✓ [pelanggan/${docId}] ${c.nama} | ${c.alamat}`);
    }

    // 3. Pesanan (Collection: "pesanan")
    // Field: pelanggan_id, nama_pelanggan, alamat_kirim, menu_id, nama_menu,
    //        harga_satuan, jumlah_porsi, ongkir, total, status, bukti_bayar, tanggal, dibuat_pada
    console.log(`\n[3/3] Menulis ${dummyOrders.length} pesanan ke collection "pesanan"...`);
    let orderWritten = 0;
    for (const o of dummyOrders) {
      const docId = o.id; // Deterministic ID
      const matchedCustomer = dummyCustomers.find(
        (c) => c.id === o.pelangganId || c.nama === o.pelangganNama
      );
      const alamatKirim = matchedCustomer?.alamat || 'Jl. Anggrek No. 15, Bandung';
      const pelangganId = matchedCustomer?.whatsapp || o.pelangganId || '';

      const orderData = {
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
      };
      await setDoc(doc(db, 'pesanan', docId), orderData, { merge: true });
      orderWritten++;
      console.log(`  ✓ [pesanan/${docId}] ${o.nomorPesanan || docId} | ${o.pelangganNama} -> ${o.menuNama} (${orderData.status})`);
    }

    // 4. VERIFIKASI LANGSUNG DARI CLOUD FIRESTORE
    console.log(`\n====================================================`);
    console.log(`🔍 MEMVERIFIKASI DATA YANG SUDAH TERSIMPAN DI CLOUD FIRESTORE...`);
    const menuSnap = await getDocs(collection(db, 'menu'));
    const custSnap = await getDocs(collection(db, 'pelanggan'));
    const orderSnap = await getDocs(collection(db, 'pesanan'));

    console.log(`📊 Hasil Verifikasi Firestore:`);
    console.log(`  • Collection "menu"     : ${menuSnap.size} document`);
    console.log(`  • Collection "pelanggan": ${custSnap.size} document`);
    console.log(`  • Collection "pesanan"  : ${orderSnap.size} document`);
    console.log(`====================================================`);
    console.log(`✅ SEED BERHASIL! Total ${menuWritten + customerWritten + orderWritten} data dummy tersimpan di Cloud Firestore.`);

    return {
      success: true,
      menuCount: menuSnap.size,
      customerCount: custSnap.size,
      orderCount: orderSnap.size,
    };
  } catch (err) {
    console.error(`\n❌ ERROR FIREBASE TERDETEKSI:`);
    console.error(`Pesan Error : ${err.message}`);
    if (err.code) console.error(`Kode Error  : ${err.code}`);
    if (err.stack) console.error(`Stack Trace :\n${err.stack}`);
    throw err;
  }
}

// Execute if run directly from CLI (e.g. node scripts/seedFirestore.js)
if (process.argv[1] && process.argv[1].endsWith('seedFirestore.js')) {
  seedFirestore()
    .then(() => process.exit(0))
    .catch((err) => {
      process.exit(1);
    });
}
