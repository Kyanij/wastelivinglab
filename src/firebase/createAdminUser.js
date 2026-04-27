/**
 * Admin User Creation Script
 * 
 * Due to Firebase Authentication constraints, you need to manually create 
 * the admin user in Firebase Console first (since there's no admin to run this script).
 * 
 * TO CREATE ADMIN USER IN FIREBASE CONSOLE:
 * 1. Go to: https://console.firebase.google.com/
 * 2. Select your project
 * 3. Go to "Authentication" (left sidebar)
 * 4. Click "Users" tab
 * 5. Click "Add user" button
 * 6. Enter:
 *    - Email: admin@greenchamps.com
 *    - Password: admin123
 * 7. Click "Add user"
 * 
 * After that, you can login with:
 *    Username: admin
 *    Password: admin123
 */

import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const adminEmail = 'admin@greenchamps.com';
const adminPassword = 'admin123';

export async function createAdminUser() {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
    console.log('✅ Admin user created successfully!');
    console.log('User UID:', userCredential.user.uid);
    console.log('Email:', adminEmail);
    console.log('Password:', adminPassword);
    return true;
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.log('ℹ️ Admin user already exists in Firebase Authentication');
      return true;
    } else {
      console.error('❌ Error creating admin user:', error.message);
      return false;
    }
  }
}