import { db } from './config';
import { COLLECTIONS } from './collections';
import {
  collection,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
} from 'firebase/firestore';

const wasteTypesRef = collection(db, COLLECTIONS.WASTE_TYPES);

export const getWasteTypes = (callback) => {
  const q = query(wasteTypesRef, orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const types = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(types);
  });
};

export const addWasteType = async (data) => {
  const docRef = await addDoc(wasteTypesRef, {
    name: data.name,
    defaultRate: data.defaultRate,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

export const updateWasteType = async (id, data) => {
  const docRef = doc(db, COLLECTIONS.WASTE_TYPES, id);
  await updateDoc(docRef, {
    name: data.name,
    defaultRate: data.defaultRate,
  });
};

export const deleteWasteType = async (id) => {
  const docRef = doc(db, COLLECTIONS.WASTE_TYPES, id);
  await deleteDoc(docRef);
};