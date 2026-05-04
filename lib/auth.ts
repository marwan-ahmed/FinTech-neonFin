import { cookies } from 'next/headers';
import { adminAuth } from '@/lib/firebase-admin';
import { db } from '@/lib/db';
import { users, tenants } from '@/schema/schema';
import { eq } from 'drizzle-orm';

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session')?.value;
    
    if (!sessionCookie) return null;
    
    // Verify session
    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, false);
    
    // Get user from DB
    let dbUser = await db.query.users.findFirst({
        where: eq(users.firebaseUid, decodedClaims.uid)
    });

    const isSuperAdminEmail = decodedClaims.email === process.env.SUPERADMIN_EMAIL;

    // Auto-upgrade existing user to superadmin if email matches
    if (dbUser && dbUser.role !== 'superadmin' && isSuperAdminEmail) {
        const upgraded = await db.update(users)
            .set({ role: 'superadmin' })
            .where(eq(users.id, dbUser.id))
            .returning();
        dbUser = upgraded[0];
    }

    if (!dbUser && decodedClaims.uid) {
        // Auto-create user if they are logged in via Firebase but not in the new Neon DB.
        console.log("User missing in DB, recreating...");
        const newTenant = await db.insert(tenants).values({
            name: `Organization (${decodedClaims.email || decodedClaims.uid})`,
        }).returning();
        
        const isSuperAdmin = decodedClaims.email === process.env.SUPERADMIN_EMAIL; 

        const newUsers = await db.insert(users).values({
            firebaseUid: decodedClaims.uid,
            tenantId: newTenant[0].id,
            role: isSuperAdmin ? 'superadmin' : 'admin',
            email: decodedClaims.email,
            fullName: decodedClaims.name || decodedClaims.email || 'Admin',
            phoneNumber: null,
        }).returning();
        dbUser = newUsers[0];
    }

    return dbUser || null;
  } catch (error) {
    console.error("getCurrentUser error:", error);
    return null;
  }
}
