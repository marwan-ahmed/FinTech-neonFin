import { cookies } from 'next/headers';
import { adminAuth } from '@/lib/firebase-admin';
import { db } from '@/lib/db';
import { users } from '@/schema/schema';
import { eq } from 'drizzle-orm';

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session')?.value;
    
    if (!sessionCookie) return null;
    
    // Verify session
    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, false);
    
    // Get user from DB
    const dbUser = await db.query.users.findFirst({
        where: eq(users.firebaseUid, decodedClaims.uid)
    });

    return dbUser || null;
  } catch (error) {
    console.error("getCurrentUser error:", error);
    return null;
  }
}
