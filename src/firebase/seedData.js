import { db } from './config';
import { COLLECTIONS } from './collections';
import { 
  collection, 
  addDoc, 
  serverTimestamp,
  getDocs,
  writeBatch,
  doc,
  increment,
  updateDoc
} from 'firebase/firestore';
import { startOfDay, subDays, format } from 'date-fns';

export const WASTE_TYPES = [
  { name: 'Plastic', defaultRate: 10.00 },
  { name: 'Paper', defaultRate: 5.00 },
  { name: 'Glass', defaultRate: 8.00 },
  { name: 'Metal', defaultRate: 12.00 },
  { name: 'Clothing', defaultRate: 15.00 },
  { name: 'Electronics', defaultRate: 20.00 },
];

export const STUDENTS = [
  { name: 'Alisha Puteri', class: '7.1', studentId: '71101', gender: 'Female' },
  { name: 'Dimas Pratama', class: '7.1', studentId: '71102', gender: 'Male' },
  { name: 'Salsa Aulia', class: '7.1', studentId: '71103', gender: 'Female' },
  { name: 'Bagus Wijaya', class: '7.1', studentId: '71104', gender: 'Male' },
  { name: 'Ratna Sari', class: '7.1', studentId: '71105', gender: 'Female' },
  
  { name: 'Fajar Nugroho', class: '7.2', studentId: '72101', gender: 'Male' },
  { name: 'Nadia Hakim', class: '7.2', studentId: '72102', gender: 'Female' },
  { name: 'Reza Fernando', class: '7.2', studentId: '72103', gender: 'Male' },
  { name: 'Sinta Dewi', class: '7.2', studentId: '72104', gender: 'Female' },
  { name: 'Herman Saputra', class: '7.2', studentId: '72105', gender: 'Male' },
  
  { name: 'Rina Kusuma', class: '8.1', studentId: '81101', gender: 'Female' },
  { name: 'Wahyuono', class: '8.1', studentId: '81102', gender: 'Male' },
  { name: 'Devi Andini', class: '8.1', studentId: '81103', gender: 'Female' },
  { name: 'Toni Setiawan', class: '8.1', studentId: '81104', gender: 'Male' },
  { name: 'Lisa Permata', class: '8.1', studentId: '81105', gender: 'Female' },
  
  { name: 'Budi Santoso', class: '8.2', studentId: '82101', gender: 'Male' },
  { name: 'Ani Wulandari', class: '8.2', studentId: '82102', gender: 'Female' },
  { name: 'Hendro Wijaya', class: '8.2', studentId: '82103', gender: 'Male' },
  { name: 'Yuni Astuti', class: '8.2', studentId: '82104', gender: 'Female' },
  { name: 'Doni Kusuma', class: '8.2', studentId: '82105', gender: 'Male' },
  
  { name: 'Ahmad Fauzi', class: '9.1', studentId: '91101', gender: 'Male' },
  { name: 'Siti Rahayu', class: '9.1', studentId: '91102', gender: 'Female' },
  { name: 'Joko Pramono', class: '9.1', studentId: '91103', gender: 'Male' },
  { name: 'Maya Angelica', class: '9.1', studentId: '91104', gender: 'Female' },
  
  { name: 'Rudi Hermawan', class: '9.2', studentId: '92101', gender: 'Male' },
  { name: 'Dewi Lestari', class: '9.2', studentId: '92102', gender: 'Female' },
  { name: 'Hendra Gunawan', class: '9.2', studentId: '92103', gender: 'Male' },
  { name: 'Vita Melati', class: '9.2', studentId: '92104', gender: 'Female' },
  
  { name: 'Umar Firdaus', class: '9.3', studentId: '93101', gender: 'Male' },
  { name: 'Laras Shinta', class: '9.3', studentId: '93102', gender: 'Female' },
];

const generateEntriesDistribution = (studentDocs, wasteTypeDocs) => {
  const entries = [];
  const weights = [0.5, 0.8, 1.0, 1.2, 1.5, 1.8, 2.0, 2.2, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0];
  
  const today = startOfDay(new Date());
  
  const dateRanges = [
    { daysAgo: 7, count: 25 },
    { daysAgo: 30, count: 35 },
    { daysAgo: 60, count: 30 },
    { daysAgo: 90, count: 25 },
    { daysAgo: 120, count: 20 },
    { daysAgo: 180, count: 15 },
  ];
  
  let entryIndex = 0;
  
  dateRanges.forEach((range, rangeIndex) => {
    for (let i = 0; i < range.count; i++) {
      const studentDoc = studentDocs[entryIndex % studentDocs.length];
      const wasteTypeDoc = wasteTypeDocs[entryIndex % wasteTypeDocs.length];
      
      const randomDaysOffset = Math.floor(Math.random() * range.daysAgo);
      const date = subDays(today, randomDaysOffset);
      
      const weight = weights[Math.floor(Math.random() * weights.length)];
      const rate = wasteTypeDoc.defaultRate + (Math.random() * 2 - 1);
      
      entries.push({
        studentId: studentDoc.id,
        studentName: studentDoc.name,
        studentClass: studentDoc.class,
        date: date,
        wasteTypeId: wasteTypeDoc.id,
        wasteTypeName: wasteTypeDoc.name,
        weight: Math.round(weight * 100) / 100,
        rate: Math.round(rate * 100) / 100,
        amount: Math.round(weight * rate * 100) / 100,
        createdAt: date,
      });
      
      entryIndex++;
    }
  });
  
  return entries;
};

const clearExistingData = async () => {
  const batch = writeBatch(db);
  
  const entriesSnapshot = await getDocs(collection(db, COLLECTIONS.WASTE_ENTRIES));
  entriesSnapshot.forEach(doc => {
    batch.delete(doc.ref);
  });
  
  const studentsSnapshot = await getDocs(collection(db, COLLECTIONS.STUDENTS));
  studentsSnapshot.forEach(doc => {
    batch.delete(doc.ref);
  });
  
  const typesSnapshot = await getDocs(collection(db, COLLECTIONS.WASTE_TYPES));
  typesSnapshot.forEach(doc => {
    batch.delete(doc.ref);
  });
  
  await batch.commit();
  console.log('Cleared existing data');
};

export const seedDatabase = async () => {
  console.log('Starting database seeding...');
  
  await clearExistingData();
  
  const wasteTypeDocs = [];
  for (const type of WASTE_TYPES) {
    const docRef = await addDoc(collection(db, COLLECTIONS.WASTE_TYPES), {
      ...type,
      createdAt: serverTimestamp(),
    });
    wasteTypeDocs.push({ id: docRef.id, ...type });
    console.log(`Created waste type: ${type.name}`);
  }
  
  const studentDocs = [];
  for (const student of STUDENTS) {
    const docRef = await addDoc(collection(db, COLLECTIONS.STUDENTS), {
      ...student,
      totalWaste: 0,
      totalEarnings: 0,
      lastEntryDate: null,
      createdAt: serverTimestamp(),
    });
    studentDocs.push({ id: docRef.id, ...student });
    console.log(`Created student: ${student.name} (${student.class})`);
  }
  
  const entries = generateEntriesDistribution(studentDocs, wasteTypeDocs);
  
  for (const entry of entries) {
    const entryData = { ...entry };
    delete entryData.date;
    delete entryData.createdAt;
    
    const entryRef = await addDoc(collection(db, COLLECTIONS.WASTE_ENTRIES), {
      ...entryData,
      date: entry.date,
      createdAt: serverTimestamp(),
    });
    
    const studentRef = doc(db, COLLECTIONS.STUDENTS, entry.studentId);
    await updateDoc(studentRef, {
      totalWaste: increment(entry.weight),
      totalEarnings: increment(entry.amount),
      lastEntryDate: entry.date,
    });
    
    console.log(`Created entry: ${entry.studentName} - ${entry.wasteTypeName} (${entry.weight}kg = ₹${entry.amount})`);
  }
  
  console.log('Database seeding completed!');
  return { 
    alreadySeeded: false, 
    wasteTypes: wasteTypeDocs.length, 
    students: studentDocs.length, 
    entries: entries.length 
  };
};