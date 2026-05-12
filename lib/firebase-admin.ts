import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

function getInitializedAuth() {
  if (!getApps().length) {
    let privateKey = process.env.FIREBASE_PRIVATE_KEY;
    if (privateKey) {
      // Remove wrapping double or single quotes if copied directly from Vercel/env files
      if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
        privateKey = privateKey.slice(1, -1);
      } else if (privateKey.startsWith("'") && privateKey.endsWith("'")) {
        privateKey = privateKey.slice(1, -1);
      }
      // Handle escaped newlines or literal \n sequences robustly
      privateKey = privateKey.replace(/\\n/g, '\n');
    }

    const serviceAccount = {
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey,
    };

    // Only initialize if we have the credentials, to avoid crashing immediately in dev
    // if user hasn't set them up yet
    if (serviceAccount.projectId && serviceAccount.clientEmail && serviceAccount.privateKey) {
      initializeApp({
        credential: cert(serviceAccount as any),
      });
    } else {
      const missing: string[] = [];
      if (!serviceAccount.projectId) missing.push('NEXT_PUBLIC_FIREBASE_PROJECT_ID');
      if (!serviceAccount.clientEmail) missing.push('FIREBASE_CLIENT_EMAIL');
      if (!serviceAccount.privateKey) missing.push('FIREBASE_PRIVATE_KEY');

      console.error(`FIREBASE ADMIN NOT CONFIGURED: Missing variables: ${missing.join(', ')}`);
      throw new Error(`Firebase Admin credentials not configured. Missing variables: ${missing.join(', ')}`);
    }
  }
  return getAuth();
}

// Lazy initialization proxy to prevent Next.js eval-time errors during build or app startup
// when credentials are not yet configured. Initialization occurs only on method access.
const adminAuth = new Proxy({} as ReturnType<typeof getAuth>, {
  get(target, prop) {
    const auth = getInitializedAuth();
    const value = (auth as any)[prop];
    if (typeof value === 'function') {
      return value.bind(auth);
    }
    return value;
  },
});

export { adminAuth };
