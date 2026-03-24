// lib/firebase/config.ts
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBTUKz9T4tHFHlftB7naNYzQshD_RzlRhI",
  authDomain: "eazy-campus.firebaseapp.com",
  projectId: "eazy-campus",
  storageBucket: "eazy-campus.firebasestorage.app", // Make sure this is correct
  messagingSenderId: "1018191661407",
  appId: "1:1018191661407:web:9f57208a33cc71f85a8eea",
  measurementId: "G-TW6JQR3850"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };