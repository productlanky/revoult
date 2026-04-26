import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Replace these with your actual Firebase project credentials from the console
// const firebaseConfig = {
//   apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
//   authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
//   projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
//   storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
//   messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
//   appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
// };

const firebaseConfig = {
  apiKey: "AIzaSyDtR8_mOrvsDm-5LfpAQfqkQpJoRZjwSbQ",
  authDomain: "onlinebanking-47d54.firebaseapp.com",
  projectId: "onlinebanking-47d54",
  storageBucket: "onlinebanking-47d54.firebasestorage.app",
  messagingSenderId: "132970681810",
  appId: "1:132970681810:web:4e5d1b70d82a84ed70240b"
};

// Initialize Firebase (Prevents "already exists" errors during Next.js Hot Reloads)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Export the services needed for the Sovereign Terminal
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;