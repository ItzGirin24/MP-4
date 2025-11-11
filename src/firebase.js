import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyClRJpYJbAtYh-19Ru1bWBw25y9IXpmS9c",
  authDomain: "gameonline-b4b2b.firebaseapp.com",
  projectId: "gameonline-b4b2b",
  storageBucket: "gameonline-b4b2b.firebasestorage.app",
  messagingSenderId: "638708454469",
  appId: "1:638708454469:web:de313a072199aa4866ff2c",
  measurementId: "G-1GKV1ZMVMZ"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
