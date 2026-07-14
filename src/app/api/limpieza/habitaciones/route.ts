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
    return payload.rol === 'ADMIN' || payload.rol === 'EMPLEADA';
  } catch { return false; }
}

export async function GET() {
  if (!(await hasAccess())) return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  
  const habitaciones = await prisma.habitacion.findMany({
    orderBy: { numero: 'asc' }
  });
  
  return NextResponse.json(habitaciones);
}

export async function PATCH(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  let empleadaId = 0;
  if (!token) return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  
  try {
    const payload = await verifyAuth(token);
    if (payload.rol !== 'ADMIN' && payload.rol !== 'EMPLEADA') throw new Error();
    empleadaId = payload.id as number;
  } catch(e) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  const data = await req.json();
  try {
    const habitacionAntigua = await prisma.habitacion.findUnique({ where: { id: parseInt(data.id) } });

    const habitacion = await prisma.habitacion.update({
      where: { id: parseInt(data.id) },
      data: { estado: data.estado, notas_empleada: data.notas_empleada || null }
    });

    await prisma.limpieza.create({
      data: {
        habitacionId: habitacion.id,
        empleadaId: empleadaId,
        estadoAnterior: habitacionAntigua?.estado || 'DISPONIBLE',
        estadoNuevo: data.estado,
        observaciones: data.notas_empleada
      }
    });

    return NextResponse.json(habitacion);
  } catch(e) {
    return NextResponse.json({ error: 'Error al actualizar habitación.' }, { status: 400 });
  }
}
