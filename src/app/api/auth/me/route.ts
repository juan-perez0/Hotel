import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return NextResponse.json({ rol: 'INVITADO' });
  try {
    const payload = await verifyAuth(token);
    return NextResponse.json({ rol: payload.rol });
  } catch(e) {
    return NextResponse.json({ rol: 'INVITADO' });
  }
}
