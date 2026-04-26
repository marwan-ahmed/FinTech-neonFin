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
    console.warn("Firebase Admin credentials not fully configured. Some features may fail.");
    // Fallback initialize without explicit cert if running on GCP/Firebase env
    initializeApp();
  }
}

const adminAuth = getAuth();
export { adminAuth };
