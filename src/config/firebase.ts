import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAJ9cus6x49op_oo57XhvVksrVTWz1Y5VI",
  authDomain: "confessionmanagementapp.firebaseapp.com",
  projectId: "confessionmanagementapp",
  storageBucket: "confessionmanagementapp.firebasestorage.app",
  messagingSenderId: "389157278465",
  appId: "1:389157278465:web:78f8c648496612cbd74100"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const appId = 'confession-app-v1';