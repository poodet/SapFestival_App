import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Validate that all required environment variables are present
const requiredEnvVars = [
  'EXPO_PUBLIC_FIREBASE_API_KEY',
  'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
  'EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'EXPO_PUBLIC_FIREBASE_APP_ID'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0 && typeof window !== 'undefined') {
  console.error('Missing required Firebase environment variables:', missingVars);
  console.error('Please check your .env file');
}

// Firebase configuration from environment variables
// Note: In Expo, environment variables must be prefixed with EXPO_PUBLIC_ to be available in the app
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID
};

// Both on server AND client
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = app ? getStorage(app) : null as any;

// // Initialize Firebase only on client side
// let app;
// if (typeof window !== 'undefined' && !getApps().length) {
//   app = initializeApp(firebaseConfig);
// } else if (typeof window !== 'undefined') {
//   app = getApps()[0];
// }
// Initialize services (these will only work on client)
// export const auth = app ? getAuth(app) : null as any;
// export const db = app ? getFirestore(app) : null as any;
// export const storage = app ? getStorage(app) : null as any;


