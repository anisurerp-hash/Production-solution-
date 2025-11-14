import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBrJE2751ELnrGutszngCdO8kj3qw8ctRs",
  authDomain: "production-solution-erp.firebaseapp.com",
  projectId: "production-solution-erp",
  storageBucket: "production-solution-erp.firebasestorage.app",
  messagingSenderId: "158076664435",
  appId: "1:158076664435:web:6e6a908c8a88fbeba34806",
  measurementId: "G-VST6HYD4B3"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);