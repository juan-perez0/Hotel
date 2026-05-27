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
    return payload.rol === 'ADMIN' || payload.rol === 'RECEPCIONISTA';
  } catch(e) { return false; }
}

export async function GET() {
  if (!(await hasAccess())) return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  
  const reservas = await prisma.reserva.findMany({
    orderBy: { fecha: 'asc' }
  });
  return NextResponse.json(reservas);
}

export async function POST(req: Request) {
  if (!(await hasAccess())) return NextResponse.json({ error: 'No autorizado' }, { status: 403 });

  const { fecha, notas } = await req.json();
  try {
    const reserva = await prisma.reserva.upsert({
      where: { fecha },
      update: { notas },
      create: { fecha, notas }
    });
    return NextResponse.json(reserva);
  } catch(e) {
    return NextResponse.json({ error: 'Error al actualizar reserva.' }, { status: 400 });
  }
}
