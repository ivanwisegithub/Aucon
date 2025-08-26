
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "feedback-system-67d5f.firebaseapp.com",
  projectId: "feedback-system-67d5f",
  storageBucket: "feedback-system-67d5f.firebasestorage.app",
  messagingSenderId: "929029380549",
  appId: "1:929029380549:web:93c75ddf9b5cddd09553ac"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);