// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  "projectId": "golf-customizer-3d",
  "appId": "1:554446603581:web:bb0eacb2096d7edabbf154",
  "storageBucket": "golf-customizer-3d.firebasestorage.app",
  "apiKey": "AIzaSyC-8g1pdaWLaAeAT7FLyNhBALviEqEoHSc",
  "authDomain": "golf-customizer-3d.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "554446603581"
};

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}


export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();