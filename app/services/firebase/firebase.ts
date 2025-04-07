// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCMzE751ohtlx23kyOYoMlvvAP8Y32P2io",
  authDomain: "teamsync-webrtc.firebaseapp.com",
  projectId: "teamsync-webrtc",
  storageBucket: "teamsync-webrtc.firebasestorage.app",
  messagingSenderId: "865438010568",
  appId: "1:865438010568:web:2f707b58decb83a33b29fd",
  measurementId: "G-0B7E9HHLK2",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

export { app, analytics, db };
