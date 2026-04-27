import { db } from './config';
import { COLLECTIONS } from './collections';
import { 
  collection, 
  addDoc, 
  serverTimestamp,
  getDocs
} from 'firebase/firestore';

export const WASTE_TYPES = [
  { name: 'Plastic', defaultRate: 10.00 },
  { name: 'Paper', defaultRate: 5.00 },
  { name: 'Glass', defaultRate: 8.00 },
];

export const STUDENTS = [
  { name: 'Aarav Sharma', class: '6A', rollNo: '101', gender: 'Male' },
  { name: 'Priya Patel', class: '6A', rollNo: '102', gender: 'Female' },
  { name: 'Raj Kumar', class: '6B', rollNo: '201', gender: 'Male' },
  { name: 'Ananya Singh', class: '6B', rollNo: '202', gender: 'Female' },
  { name: 'Vikram Reddy', class: '7A', rollNo: '301', gender: 'Male' },
];

const generateWasteEntries = (studentDocs, wasteTypeDocs) => {
  const entries = [];
  const today = new Date();
  
  const weights = [1.5, 2.0, 2.5, 3.0, 1.0, 2.2, 1.8, 2.7, 3.2, 1.2];
  
  for (let i = 0; i < 10; i++) {
    const studentDoc = studentDocs[i % studentDocs.length];
    const wasteTypeDoc = wasteTypeDocs[i % wasteTypeDocs.length];
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    const weight = weights[i];
    const rate = wasteTypeDoc.defaultRate;
    
    entries.push({
      studentId: studentDoc.id,
      studentName: studentDoc.name,
      studentClass: studentDoc.class,
      date: date,
      wasteTypeId: wasteTypeDoc.id,
      wasteTypeName: wasteTypeDoc.name,
      weight: weight,
      rate: rate,
      amount: weight * rate,
      createdAt: new Date(),
    });
  }
  
  return entries;
};

export const seedDatabase = async () => {
  console.log('Starting database seeding...');
  
  const wasteTypesRef = collection(db, COLLECTIONS.WASTE_TYPES);
  const existingTypes = await getDocs(wasteTypesRef);
  
  if (!existingTypes.empty) {
    console.log('Database already contains data. Skipping seed.');
    return { alreadySeeded: true };
  }
  
  const wasteTypeDocs = [];
  for (const type of WASTE_TYPES) {
    const docRef = await addDoc(wasteTypesRef, {
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
    console.log(`Created student: ${student.name}`);
  }
  
  const entries = generateWasteEntries(studentDocs, wasteTypeDocs);
  
  for (const entry of entries) {
    const entryData = { ...entry };
    delete entryData.date;
    delete entryData.createdAt;
    
    await addDoc(collection(db, COLLECTIONS.WASTE_ENTRIES), {
      ...entryData,
      date: entry.date,
      createdAt: serverTimestamp(),
    });
    console.log(`Created waste entry for ${entry.studentName} - ${entry.wasteTypeName} (${entry.weight}kg)`);
  }
  
  console.log('Database seeding completed!');
  return { alreadySeeded: false, wasteTypes: wasteTypeDocs.length, students: studentDocs.length, entries: entries.length };
};