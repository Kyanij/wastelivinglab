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
} from 'firebase/firestore';
import { db } from './config';
import { COLLECTIONS } from './collections';

const STUDENTS_COLLECTION = COLLECTIONS.STUDENTS;
const WASTE_ENTRIES_COLLECTION = COLLECTIONS.WASTE_ENTRIES;

export async function getStudentsCount() {
  const snapshot = await getCountFromServer(collection(db, STUDENTS_COLLECTION));
  return snapshot.data().count;
}

export async function getStudents(pageSize = 10, cursor = null) {
  let q = query(
    collection(db, STUDENTS_COLLECTION),
    orderBy('name', 'asc'),
    limit(pageSize)
  );

  if (cursor) {
    q = query(
      collection(db, STUDENTS_COLLECTION),
      orderBy('name', 'asc'),
      startAfter(cursor),
      limit(pageSize)
    );
  }

  const snapshot = await getDocs(q);
  const students = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  const lastVisible = snapshot.docs[snapshot.docs.length - 1];

  return {
    students,
    lastVisible,
    hasMore: snapshot.docs.length === pageSize,
  };
}

export async function getAllStudents() {
  const q = query(collection(db, STUDENTS_COLLECTION), orderBy('name', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

export async function getStudentById(id) {
  const docRef = doc(db, STUDENTS_COLLECTION, id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() };
}

export async function getEntriesByStudentId(studentId) {
  // Get all entries and filter by studentId (simple approach)
  const snapshot = await getDocs(collection(db, WASTE_ENTRIES_COLLECTION));
  const allEntries = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
  // Filter entries for this student
  return allEntries.filter(e => e.studentId === studentId);
}

export async function addStudent(data) {
  const docRef = await addDoc(collection(db, STUDENTS_COLLECTION), {
    name: data.name,
    class: data.class,
    studentId: data.studentId,
    gender: data.gender || 'Other',
    createdAt: serverTimestamp(),
    totalWaste: 0,
    totalEarnings: 0,
    lastEntryDate: null,
  });
  return docRef.id;
}

export async function updateStudent(id, data) {
  const docRef = doc(db, STUDENTS_COLLECTION, id);
  await updateDoc(docRef, {
    name: data.name,
    class: data.class,
    studentId: data.studentId,
    gender: data.gender,
  });
}

export async function deleteStudent(id) {
  const docRef = doc(db, STUDENTS_COLLECTION, id);
  await deleteDoc(docRef);
}

export async function checkDuplicateStudentId(classValue, studentId, excludeId = null) {
  const q = query(
    collection(db, STUDENTS_COLLECTION),
    where('class', '==', classValue),
    where('studentId', '==', studentId)
  );
  const snapshot = await getDocs(q);
  const duplicates = snapshot.docs.filter((d) => d.id !== excludeId);
  return duplicates.length > 0;
}

export async function getUniqueClasses() {
  const students = await getAllStudents();
  const classes = [...new Set(students.map((s) => s.class).filter(Boolean))];
  return classes.sort();
}

export async function searchStudentsByName(searchTerm) {
  if (!searchTerm || searchTerm.trim().length < 2) {
    return [];
  }
  const term = searchTerm.toLowerCase().trim();
  const q = query(
    collection(db, STUDENTS_COLLECTION),
    orderBy('name', 'asc'),
    limit(10)
  );
  const snapshot = await getDocs(q);
  const students = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
  
  // Filter by name, class, or studentId (client-side filtering since we don't have nameLower)
  return students.filter(s => 
    s.name?.toLowerCase().includes(term) ||
    s.class?.toLowerCase().includes(term) ||
    s.studentId?.toLowerCase().includes(term)
  ).slice(0, 10);
}