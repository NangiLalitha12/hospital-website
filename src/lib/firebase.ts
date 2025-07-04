
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBOR0pb1BrfcLILdU9LUpOZ36DAOPaftYA",
  authDomain: "hospital-cc9bd.firebaseapp.com",
  projectId: "hospital-cc9bd",
  storageBucket: "hospital-cc9bd.firebasestorage.app",
  messagingSenderId: "132550769874",
  appId: "1:132550769874:web:260487d4dcdb28ce9ac10b",
  measurementId: "G-DJE5DRZ4WD"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
