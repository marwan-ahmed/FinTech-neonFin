import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';

export async function POST(request: Request) {
  const { idToken } = await request.json();

  if (!idToken) {
    return NextResponse.json({ error: 'Missing idToken' }, { status: 400 });
  }

  // Set session expiration to 5 days.
  const expiresIn = 60 * 60 * 24 * 5 * 1000;

  try {
    // Create the session cookie. This will also verify the ID token.
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

    const options = {
      name: 'session',
      value: sessionCookie,
      maxAge: expiresIn,
      httpOnly: true,
      secure: true,
      sameSite: 'none' as const,
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
