import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from './config';
import { COLLECTIONS } from './collections';

export async function getAllWasteEntries() {
  const q = query(collection(db, COLLECTIONS.WASTE_ENTRIES), orderBy('date', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

export async function getWasteEntriesByDateRange(startDate, endDate) {
  const q = query(
    collection(db, COLLECTIONS.WASTE_ENTRIES),
    where('date', '>=', startDate),
    where('date', '<=', endDate),
    orderBy('date', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

export async function getRecentEntries(count = 10) {
  const q = query(
    collection(db, COLLECTIONS.WASTE_ENTRIES),
    orderBy('createdAt', 'desc'),
    limit(count)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

export async function getEntriesByType(wasteTypeName) {
  const q = query(
    collection(db, COLLECTIONS.WASTE_ENTRIES),
    where('wasteTypeName', '==', wasteTypeName),
    orderBy('date', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

export async function getEntriesByClass(studentClass) {
  const q = query(
    collection(db, COLLECTIONS.WASTE_ENTRIES),
    where('studentClass', '==', studentClass),
    orderBy('date', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}