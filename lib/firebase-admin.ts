import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

if (!getApps().length) {
  const serviceAccount = {
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    // Note: handle escaped newlines in private key
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  };

  // Only initialize if we have the credentials, to avoid crashing immediately in dev
  // if user hasn't set them up yet
  if (serviceAccount.projectId && serviceAccount.clientEmail && serviceAccount.privateKey) {
    initializeApp({
      credential: cert(serviceAccount as any),
    });
  } else {
    // If we call initializeApp() without credentials in an environment where the metadata server 
    // isn't accessible for Firebase Admin ADCs, it will hang indefinitely.
    console.error("FIREBASE ADMIN NOT CONFIGURED: Missing FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL, or PROJECT_ID");
    // We throw an error so it fails fast instead of hanging.
    throw new Error("Firebase Admin credentials not configured.");
  }
}

const adminAuth = getAuth();
export { adminAuth };
