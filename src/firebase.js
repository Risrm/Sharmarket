// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD_t6IjI8UMVH8botf-Qr9IKmuMm4DuBT4",
  authDomain: "share-market-461806.firebaseapp.com",
  projectId: "share-market-461806",
  storageBucket: "share-market-461806.firebasestorage.app",
  messagingSenderId: "109484276663",
  appId: "1:109484276663:web:6373bfdd546ed6e46fc632",
  measurementId: "G-872MS6WKSN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);