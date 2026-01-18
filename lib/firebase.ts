import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || '',
};

// Validate that all required config values are present
const requiredFields = ['apiKey', 'projectId', 'appId', 'authDomain'];
const missingFields = requiredFields.filter(
  (field) => !firebaseConfig[field as keyof typeof firebaseConfig]
);

if (missingFields.length > 0) {
  console.error(
    `Missing Firebase config: ${missingFields.join(', ')}. Please add NEXT_PUBLIC_FIREBASE_* environment variables.`
  );
}

// Initialize Firebase - use singleton pattern to prevent multiple initializations
let app;
try {
  // Check if Firebase is already initialized
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
} catch (error) {
  console.error('Firebase initialization error:', error);
  // If initialization fails, we'll still create empty exports for type safety
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
}

// Initialize Firebase Authentication
let auth;
try {
  auth = getAuth(app);
  // Uncomment below if using Firebase emulator for local development
  // if (typeof window !== 'undefined' && !auth.emulatorConfig) {
  //   connectAuthEmulator(auth, 'http://localhost:9099');
  // }
} catch (error) {
  console.error('Auth initialization error:', error);
  auth = getAuth(app);
}

// Initialize Firestore
let db;
try {
  db = getFirestore(app);
  // Uncomment below if using Firestore emulator for local development
  // if (typeof window !== 'undefined' && !db._settingsFrozen) {
  //   connectFirestoreEmulator(db, 'localhost', 8080);
  // }
} catch (error) {
  console.error('Firestore initialization error:', error);
  db = getFirestore(app);
}

// Initialize Storage
let storage;
try {
  storage = getStorage(app);
} catch (error) {
  console.error('Storage initialization error:', error);
  storage = getStorage(app);
}

export { auth, db, storage };
export default app;
