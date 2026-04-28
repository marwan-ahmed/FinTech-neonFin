import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/schema/schema';
import { eq } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح لك للقيام بهذه العملية' }, { status: 401 });
    }

    const body = await request.json();
    const { fullName, phoneNumber } = body;

    const updatedUser = await db.update(users)
      .set({
        fullName: fullName ?? user.fullName,
        phoneNumber: phoneNumber ?? user.phoneNumber,
        updatedAt: new Date()
      })
      .where(eq(users.id, user.id))
      .returning();

    return NextResponse.json(updatedUser[0]);
  } catch (error: any) {
    console.error("Error updating profile:", error);
    return NextResponse.json({ error: 'حدث خطأ أثناء تحديث الملف الشخصي' }, { status: 500 });
  }
}
