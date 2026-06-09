import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp | undefined;
let db: Firestore | undefined;
let auth: Auth | undefined;

try {
  if (typeof window !== 'undefined') {
    if (!getApps().length) {
      if (firebaseConfig.apiKey) {
        app = initializeApp(firebaseConfig);
        const dbId = process.env.NEXT_PUBLIC_FIRESTORE_DATABASE_ID || '(default)';
        db = getFirestore(app, dbId);
        auth = getAuth(app);
      } else {
        console.warn("Firebase config is missing NEXT_PUBLIC_FIREBASE_API_KEY. Firebase will not initialize.");
      }
    } else {
      app = getApps()[0];
      const dbId = process.env.NEXT_PUBLIC_FIRESTORE_DATABASE_ID || '(default)';
      db = getFirestore(app, dbId);
      auth = getAuth(app);
    }
  }
} catch (error) {
  console.error("Firebase initialization failed:", error);
}

export { app, db, auth };
