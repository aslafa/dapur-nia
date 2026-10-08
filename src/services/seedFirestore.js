import { writeBatch, doc } from "firebase/firestore";
import { db } from "../lib/firebase";
import {
    dummyMenus,
    dummyCustomers,
    dummyOrders,
} from "../data/dummyData";

export async function seedFirestore() {
    const batch = writeBatch(db);

    // Menu
    dummyMenus.forEach((item) => {
        const { id, ...data } = item;
        batch.set(doc(db, "menu", id), data);
    });

    // Pelanggan
    dummyCustomers.forEach((item) => {
        const { id, ...data } = item;
        batch.set(doc(db, "pelanggan", id), data);
    });

    // Pesanan
    dummyOrders.forEach((item) => {
        const { id, ...data } = item;
        batch.set(doc(db, "pesanan", id), data);
    });

    await batch.commit();

    console.log("✅ SEED FIRESTORE BERHASIL");
}