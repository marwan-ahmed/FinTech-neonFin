import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/schema/schema';
import { eq } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

import { z } from 'zod';

const profileSchema = z.object({
  fullName: z.string().max(100, 'يجب ألا يتجاوز الاسم الكامل 100 حرف').optional().nullable(),
  phoneNumber: z.string().max(20, 'يجب ألا يتجاوز رقم الهاتف 20 حرفاً').optional().nullable(),
});

export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح لك للقيام بهذه العملية' }, { status: 401 });
    }

    const body = await request.json();
    
    // Validate input using Zod
    const validation = profileSchema.safeParse(body);
    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message || 'المدخلات غير صالحة';
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { fullName, phoneNumber } = validation.data;

    const updatedUser = await db.update(users)
      .set({
        fullName: fullName !== undefined ? fullName : user.fullName,
        phoneNumber: phoneNumber !== undefined ? phoneNumber : user.phoneNumber,
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
