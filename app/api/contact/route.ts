import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { contactMessages } from '@/schema/schema';

export async function POST(request: Request) {
  try {
    const { name, email, message } = await request.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'جميع الحقول مطلوبة.' }, { status: 400 });
    }

    // Insert into contact_messages table
    await db.insert(contactMessages).values({
      name,
      email,
      message,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Failed to save contact message:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء إرسال رسالتك. يرجى المحاولة لاحقاً.' }, { status: 500 });
  }
}
