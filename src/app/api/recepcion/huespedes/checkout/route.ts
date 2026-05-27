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

export async function POST(req: Request) {
  if (!(await hasAccess())) return NextResponse.json({ error: 'No autorizado' }, { status: 403 });

  const { id, habitacionId } = await req.json();
  
  try {
    const huesped = await prisma.huesped.update({
      where: { id: parseInt(id) },
      data: { check_out: new Date() }
    });

    if (habitacionId) {
      await prisma.habitacion.update({
        where: { id: parseInt(habitacionId) },
        data: { estado: 'REQUIERE_LIMPIEZA' }
      });
    }

    return NextResponse.json(huesped);
  } catch(e) {
    return NextResponse.json({ error: 'Error al procesar check-out.' }, { status: 400 });
  }
}
