import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';
import { cookies } from 'next/headers';

async function hasAccess() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return false;
  try {
    const payload = await verifyAuth(token);
    return payload.rol === 'ADMIN';
  } catch (e) { return false; }
}

export async function GET() {
  if (!(await hasAccess())) return NextResponse.json({ error: 'No autorizado' }, { status: 403 });

  const limpiezas = await prisma.limpieza.findMany({
    include: {
      habitacion: { select: { numero: true, piso: true } },
      usuario: { select: { nombre: true, email: true } }
    },
    orderBy: { fecha: 'desc' }
  });

  return NextResponse.json(limpiezas);
}
