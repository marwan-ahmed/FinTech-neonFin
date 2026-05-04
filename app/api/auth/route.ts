import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import { db } from '@/lib/db';
import { users, tenants } from '@/schema/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
  const { idToken, fullName, phoneNumber } = await request.json();

  if (!idToken) {
    return NextResponse.json({ error: 'Missing idToken' }, { status: 400 });
  }

  // Set session expiration to 5 days.
  const expiresIn = 60 * 60 * 24 * 5 * 1000;

  try {
    // Verify token to get uid and email
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    
    // Check if user exists in our DB
    const existingUser = await db.query.users.findFirst({
      where: eq(users.firebaseUid, decodedToken.uid),
    });

    if (!existingUser) {
      // For first time users, create a tenant for them, then create their user profile
      const newTenant = await db.insert(tenants).values({
        name: `Organization (${decodedToken.email || decodedToken.uid})`,
      }).returning();
      
      const isSuperAdmin = decodedToken.email === process.env.SUPERADMIN_EMAIL;

      await db.insert(users).values({
        firebaseUid: decodedToken.uid,
        tenantId: newTenant[0].id,
        role: isSuperAdmin ? 'superadmin' : 'admin',
        email: decodedToken.email,
        fullName: fullName || decodedToken.name || decodedToken.email,
        phoneNumber: phoneNumber || null,
      });
    }

    // Create the session cookie
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

    const options = {
      name: 'session',
      value: sessionCookie,
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
    };

    // Return successful response with the cookie
    const response = NextResponse.json({ success: true }, { status: 200 });
    response.cookies.set(options);
    
    return response;
  } catch (error: any) {
    console.error('Error creating session cookie', error);
    return NextResponse.json({ error: error.message || 'Unauthorized request!' }, { status: 401 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true }, { status: 200 });
  response.cookies.delete('session');
  return response;
}
