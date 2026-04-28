// src/services/firebase.js
// Replace all values below with your actual Google Cloud / Firebase project credentials

import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, push, set, serverTimestamp } from "firebase/database";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT-default-rtdb.firebaseio.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const auth = getAuth(app);
export { ref, onValue, push, set, serverTimestamp };

// Google API Keys — set in .env as VITE_GEMINI_KEY, VITE_MAPS_KEY, VITE_TRANSLATE_KEY
export const GEMINI_KEY   = import.meta.env.VITE_GEMINI_KEY   || "YOUR_GEMINI_API_KEY";
