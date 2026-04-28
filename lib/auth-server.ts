import { cookies } from 'next/headers';
import { adminAuth } from './firebase-admin';

export async function verifySession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session');

  if (!sessionCookie) {
    return null;
  }

  try {
    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie.value, false);
    return decodedClaims;
  } catch (error) {
    console.error('Session verification failed:', error);
    return null;
  }
}
