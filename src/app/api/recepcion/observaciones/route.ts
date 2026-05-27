import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  try {
    await verifyAuth(token);
    const habitacionesConObservacion = await prisma.habitacion.findMany({
      where: {
        notas_empleada: {
          not: null
        }
      },
      select: { numero: true, notas_empleada: true }
    });
    
    // Filter out empty strings in JS because Prisma sometimes stores empty strings instead of null
    const result = habitacionesConObservacion.filter(h => h.notas_empleada && h.notas_empleada.trim() !== '');
    return NextResponse.json(result);
  } catch(e) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }
}
