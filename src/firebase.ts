import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDhyr6w-gUqllTCcMQRlGJIweLkIeUA5q0",
  authDomain: "prepwise-app-b543a.firebaseapp.com",
  projectId: "prepwise-app-b543a",
  storageBucket: "prepwise-app-b543a.firebasestorage.app",
  messagingSenderId: "687185589638",
  appId: "1:687185589638:web:8dd61f77d24b4db330a807"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider();

// Initialize Firestore and export
export const db = getFirestore(app);

export default app; 