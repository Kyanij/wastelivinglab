import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  getCountFromServer,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  increment,
} from 'firebase/firestore';
import { db } from './config';
import { COLLECTIONS } from './collections';

const CLASSES_COLLECTION = COLLECTIONS.CLASSES;
const CLASS_WASTE_ENTRIES_COLLECTION = COLLECTIONS.CLASS_WASTE_ENTRIES;

export async function getClassesCount() {
  const snapshot = await getCountFromServer(collection(db, CLASSES_COLLECTION));
  return snapshot.data().count;
}

export async function getClasses(pageSize = 50, cursor = null) {
  let q = query(
    collection(db, CLASSES_COLLECTION),
    orderBy('name', 'asc'),
    limit(pageSize)
  );

  if (cursor) {
    q = query(
      collection(db, CLASSES_COLLECTION),
      orderBy('name', 'asc'),
      startAfter(cursor),
      limit(pageSize)
    );
  }

  const snapshot = await getDocs(q);
  const classes = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  const lastVisible = snapshot.docs[snapshot.docs.length - 1];

  return {
    classes,
    lastVisible,
    hasMore: snapshot.docs.length === pageSize,
  };
}

export async function getAllClasses() {
  const q = query(collection(db, CLASSES_COLLECTION), orderBy('name', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

export async function getClassById(id) {
  const docRef = doc(db, CLASSES_COLLECTION, id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() };
}

export async function getClassByName(name) {
  const q = query(collection(db, CLASSES_COLLECTION), where('name', '==', name));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() };
}

export async function addClass(data) {
  const normalizedName = normalizeClassName(data.name);
  
  const existingClass = await getClassByName(normalizedName);
  if (existingClass) {
    throw new Error('Class already exists');
  }

  const docRef = await addDoc(collection(db, CLASSES_COLLECTION), {
    name: normalizedName,
    createdAt: serverTimestamp(),
    totalWaste: 0,
    totalEarnings: 0,
    lastEntryDate: null,
  });
  return docRef.id;
}

export async function updateClass(id, data) {
  const docRef = doc(db, CLASSES_COLLECTION, id);
  const normalizedName = normalizeClassName(data.name);
  await updateDoc(docRef, {
    name: normalizedName,
  });
}

export async function deleteClass(id) {
  const docRef = doc(db, CLASSES_COLLECTION, id);
  await deleteDoc(docRef);
}

export async function checkDuplicateClassName(name, excludeId = null) {
  const normalizedName = normalizeClassName(name);
  const q = query(
    collection(db, CLASSES_COLLECTION),
    where('name', '==', normalizedName)
  );
  const snapshot = await getDocs(q);
  const duplicates = snapshot.docs.filter((d) => d.id !== excludeId);
  return duplicates.length > 0;
}

function normalizeClassName(name) {
  if (!name) return '';
  const trimmed = name.trim().toUpperCase();
  const match = trimmed.match(/^(\d+)\.(\d+)$/);
  if (match) {
    return `${match[1]}.${parseInt(match[2], 10)}`;
  }
  return trimmed;
}

export function validateClassName(name) {
  if (!name || !name.trim()) {
    return { valid: false, error: 'class.errors.required' };
  }
  const normalized = normalizeClassName(name);
  const pattern = /^\d+\.\d+$/;
  if (!pattern.test(normalized)) {
    return { valid: false, error: 'class.errors.format' };
  }
  return { valid: true, error: null };
}

export async function getOrCreateClass(name) {
  const normalizedName = normalizeClassName(name);
  const existingClass = await getClassByName(normalizedName);
  if (existingClass) {
    return existingClass;
  }
  
  const docRef = await addDoc(collection(db, CLASSES_COLLECTION), {
    name: normalizedName,
    createdAt: serverTimestamp(),
    totalWaste: 0,
    totalEarnings: 0,
    lastEntryDate: null,
  });
  
  return {
    id: docRef.id,
    name: normalizedName,
    totalWaste: 0,
    totalEarnings: 0,
    lastEntryDate: null,
  };
}

export async function addClassWasteEntry(data) {
  const classData = await getOrCreateClass(data.className);
  const normalizedName = normalizeClassName(data.className);
  
  const entries = [];
  for (const item of data.items) {
    const amount = item.weight * item.price;
    const entryRef = await addDoc(collection(db, CLASS_WASTE_ENTRIES_COLLECTION), {
      classId: classData.id,
      className: normalizedName,
      date: data.date,
      wasteTypeId: item.wasteTypeId,
      wasteTypeName: item.wasteTypeName,
      weight: item.weight,
      price: item.price,
      amount: amount,
      createdAt: serverTimestamp(),
    });
    entries.push({ id: entryRef.id, ...item, amount });
  }
  
  const totalWeight = data.items.reduce((sum, item) => sum + item.weight, 0);
  const totalAmount = data.items.reduce((sum, item) => sum + (item.weight * item.price), 0);
  
  const classRef = doc(db, CLASSES_COLLECTION, classData.id);
  await updateDoc(classRef, {
    totalWaste: increment(totalWeight),
    totalEarnings: increment(totalAmount),
    lastEntryDate: data.date,
  });
  
  return { classId: classData.id, entries };
}

export async function getEntriesByClassId(classId) {
  const q = query(
    collection(db, CLASS_WASTE_ENTRIES_COLLECTION),
    where('classId', '==', classId),
    orderBy('date', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

export async function getEntriesByClassName(className) {
  const normalizedName = normalizeClassName(className);
  const q = query(
    collection(db, CLASS_WASTE_ENTRIES_COLLECTION),
    where('className', '==', normalizedName),
    orderBy('date', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

export async function updateClassWasteEntry(entryId, oldData, newData) {
  const entryRef = doc(db, CLASS_WASTE_ENTRIES_COLLECTION, entryId);
  const newAmount = newData.weight * newData.price;
  
  await updateDoc(entryRef, {
    wasteTypeId: newData.wasteTypeId,
    wasteTypeName: newData.wasteTypeName,
    weight: newData.weight,
    price: newData.price,
    amount: newAmount,
  });
  
  const weightDiff = newData.weight - oldData.weight;
  const amountDiff = newAmount - oldData.amount;
  
  const classRef = doc(db, CLASSES_COLLECTION, oldData.classId);
  await updateDoc(classRef, {
    totalWaste: increment(weightDiff),
    totalEarnings: increment(amountDiff),
  });
}

export async function deleteClassWasteEntry(entry) {
  const entryRef = doc(db, CLASS_WASTE_ENTRIES_COLLECTION, entry.id);
  await deleteDoc(entryRef);
  
  const classRef = doc(db, CLASSES_COLLECTION, entry.classId);
  await updateDoc(classRef, {
    totalWaste: increment(-entry.weight),
    totalEarnings: increment(-entry.amount),
  });
}

export async function deleteClassWasteEntriesByDate(classId, entries) {
  const batch = [];
  
  for (const entry of entries) {
    const entryRef = doc(db, CLASS_WASTE_ENTRIES_COLLECTION, entry.id);
    batch.push(deleteDoc(entryRef));
  }
  
  await Promise.all(batch);
  
  const totalWeight = entries.reduce((sum, e) => sum + e.weight, 0);
  const totalAmount = entries.reduce((sum, e) => sum + e.amount, 0);
  
  const classRef = doc(db, CLASSES_COLLECTION, classId);
  await updateDoc(classRef, {
    totalWaste: increment(-totalWeight),
    totalEarnings: increment(-totalAmount),
  });
}

export async function updateClassEntriesByDate(classId, originalEntries, updatedRows, removedRows, addedRows, date) {
  const batch = [];
  
  for (const row of removedRows) {
    const entryRef = doc(db, CLASS_WASTE_ENTRIES_COLLECTION, row.id);
    batch.push(deleteDoc(entryRef));
  }
  
  for (const row of updatedRows) {
    const entryRef = doc(db, CLASS_WASTE_ENTRIES_COLLECTION, row.id);
    const newAmount = row.weight * row.price;
    batch.push(updateDoc(entryRef, {
      wasteTypeId: row.wasteTypeId,
      wasteTypeName: row.wasteTypeName,
      weight: row.weight,
      price: row.price,
      amount: newAmount,
    }));
  }
  
  for (const row of addedRows) {
    const entryRef = await addDoc(collection(db, CLASS_WASTE_ENTRIES_COLLECTION), {
      classId: classId,
      className: originalEntries[0]?.className || '',
      date: date,
      wasteTypeId: row.wasteTypeId,
      wasteTypeName: row.wasteTypeName,
      weight: row.weight,
      price: row.price,
      amount: row.weight * row.price,
      createdAt: serverTimestamp(),
    });
    batch.push(entryRef);
  }
  
  await Promise.all(batch);
  
  const oldWeight = originalEntries.reduce((sum, e) => sum + e.weight, 0);
  const oldAmount = originalEntries.reduce((sum, e) => sum + e.amount, 0);
  const newWeight = updatedRows.reduce((sum, e) => sum + e.weight, 0) + addedRows.reduce((sum, e) => sum + e.weight, 0);
  const newAmount = updatedRows.reduce((sum, e) => sum + (e.weight * e.price), 0) + addedRows.reduce((sum, e) => sum + (e.weight * e.price), 0);
  
  const weightDiff = newWeight - oldWeight;
  const amountDiff = newAmount - oldAmount;
  
  const classRef = doc(db, CLASSES_COLLECTION, classId);
  await updateDoc(classRef, {
    totalWaste: increment(weightDiff),
    totalEarnings: increment(amountDiff),
    lastEntryDate: date,
  });
}

export async function getClassesTotalStats() {
  const classes = await getAllClasses();
  return {
    totalClasses: classes.length,
    totalWaste: classes.reduce((sum, c) => sum + (c.totalWaste || 0), 0),
    totalEarnings: classes.reduce((sum, c) => sum + (c.totalEarnings || 0), 0),
  };
}