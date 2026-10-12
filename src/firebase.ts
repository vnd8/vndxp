import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAT2suYRtuLrtq35D4GQoJrsCZsbtS68vA",
  authDomain: "vndxp-2244a.firebaseapp.com",
  projectId: "vndxp-2244a",
  storageBucket: "vndxp-2244a.firebasestorage.app",
  messagingSenderId: "44636089761",
  appId: "1:44636089761:web:dc30888d15afd50741afe0",
  measurementId: "G-T8Y4FGGQMT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// التصدير للاستخدام في جميع أنحاء التطبيق
export const db = getFirestore(app);
export const auth = getAuth(app);