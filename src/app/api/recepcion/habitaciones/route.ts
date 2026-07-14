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
    return payload.rol === 'ADMIN' || payload.rol === 'RECEPCIONISTA' || payload.rol === 'EMPLEADA';
  } catch { return false; }
}

export async function GET() {
  if (!(await hasAccess())) return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  
  const habitaciones = await prisma.habitacion.findMany({
    orderBy: { numero: 'asc' }
  });
  
  return NextResponse.json(habitaciones);
}

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  let rol = '';
  if (token) {
    try {
      const payload = await verifyAuth(token);
      rol = payload.rol as string;
    } catch(e) {}
  }
  
  if (rol !== 'ADMIN') return NextResponse.json({ error: 'No autorizado' }, { status: 403 });

  const { numero, piso } = await req.json();
  try {
    const habitacion = await prisma.habitacion.create({
      data: { numero, piso: parseInt(piso) || 1, estado: 'DISPONIBLE' }
    });
    return NextResponse.json(habitacion);
  } catch(e) {
    return NextResponse.json({ error: 'Error al crear habitación, es posible que el número ya exista.' }, { status: 400 });
  }
}
