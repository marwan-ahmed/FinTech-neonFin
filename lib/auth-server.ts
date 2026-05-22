import { cookies } from 'next/headers';
import { adminAuth } from './firebase-admin';
import { db } from '@/lib/db';
import { users, tenants } from '@/schema/schema';
import { eq } from 'drizzle-orm';

export async function verifySession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session');

  if (!sessionCookie) {
    return null;
  }

  try {
    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie.value, false);
    
    // Get user from DB to check role and tenant
    const dbUser = await db.query.users.findFirst({
        where: eq(users.firebaseUid, decodedClaims.uid)
    });

    if (dbUser && dbUser.role !== 'superadmin') {
      const tenant = await db.query.tenants.findFirst({
        where: eq(tenants.id, dbUser.tenantId!)
      });
      if (tenant) {
        if (tenant.status === 'frozen') {
          return { isFrozen: true, ...decodedClaims };
        }

        if (tenant.status === 'pending') {
          return { isPending: true, ...decodedClaims };
        }
        if (tenant.subscriptionEndDate && new Date() > new Date(tenant.subscriptionEndDate)) {
          return { isExpired: true, ...decodedClaims };
        }
      }
    }

    return decodedClaims;
  } catch (error) {
    console.error('Session verification failed:', error);
    return null;
  }
}
