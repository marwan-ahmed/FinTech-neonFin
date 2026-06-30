import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

let clientAuthInstance: Auth | null = null;
let clientFirestoreInstance: Firestore | null = null;

export function getFirebaseAuth(): Auth {
  if (clientAuthInstance) {
    return clientAuthInstance;
  }

  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!apiKey) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️ WARNING: NEXT_PUBLIC_FIREBASE_API_KEY is not configured in local environment.');
      const dummyConfig = {
        apiKey: 'DUMMY_KEY_FOR_DEV',
        authDomain: 'dummy.firebaseapp.com',
        projectId: 'dummy-project',
      };
      const app = !getApps().length ? initializeApp(dummyConfig) : getApp();
      clientAuthInstance = getAuth(app);
      return clientAuthInstance;
    }
    throw new Error('NEXT_PUBLIC_FIREBASE_API_KEY is not configured. Please add Firebase credentials to your environment variables.');
  }

  const firebaseConfig = {
    apiKey,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  clientAuthInstance = getAuth(app);
  
  return clientAuthInstance;
}

export function getFirebaseFirestore(): Firestore {
  if (clientFirestoreInstance) {
    return clientFirestoreInstance;
  }

  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!apiKey) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️ WARNING: NEXT_PUBLIC_FIREBASE_API_KEY is not configured in local environment.');
      const dummyConfig = {
        apiKey: 'DUMMY_KEY_FOR_DEV',
        authDomain: 'dummy.firebaseapp.com',
        projectId: 'dummy-project',
      };
      const app = !getApps().length ? initializeApp(dummyConfig) : getApp();
      clientFirestoreInstance = getFirestore(app);
      return clientFirestoreInstance;
    }
    throw new Error('NEXT_PUBLIC_FIREBASE_API_KEY is not configured. Please add Firebase credentials to your environment variables.');
  }

  const firebaseConfig = {
    apiKey,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  clientFirestoreInstance = getFirestore(app);
  
  return clientFirestoreInstance;
}
