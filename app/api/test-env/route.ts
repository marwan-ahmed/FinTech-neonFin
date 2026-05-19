import { NextResponse } from 'next/server';

export async function GET() {
  const keys = Object.keys(process.env);
  return NextResponse.json({ envKeys: keys });
}
