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
  } catch { return false; }
}

export async function GET() {
  if (!(await hasAccess())) return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  
  const reservas = await prisma.reserva.findMany({
    orderBy: { fecha: 'asc' },
    include: { habitacion: true },
  });
  return NextResponse.json(reservas);
}

export async function POST(req: Request) {
  if (!(await hasAccess())) return NextResponse.json({ error: 'No autorizado' }, { status: 403 });

  const { fecha, notas, habitacionId } = await req.json();

  try {
    // Buscar reserva existente para saber si tenía una habitación antes
    const reservaExistente = await prisma.reserva.findUnique({ where: { fecha } });
    const habitacionAnteriorId = reservaExistente?.habitacionId ?? null;
    const nuevaHabitacionId = habitacionId ? parseInt(habitacionId) : null;

    // Si cambió la habitación: restaurar la anterior a DISPONIBLE
    if (habitacionAnteriorId && habitacionAnteriorId !== nuevaHabitacionId) {
      await prisma.habitacion.update({
        where: { id: habitacionAnteriorId },
        data: { estado: 'DISPONIBLE' },
      });
    }

    // Guardar/actualizar la reserva
    const reserva = await prisma.reserva.upsert({
      where: { fecha },
      update: { notas, habitacionId: nuevaHabitacionId },
      create: { fecha, notas, habitacionId: nuevaHabitacionId },
      include: { habitacion: true },
    });

    // Si se asignó una habitación, marcarla como RESERVADA
    if (nuevaHabitacionId) {
      await prisma.habitacion.update({
        where: { id: nuevaHabitacionId },
        data: { estado: 'RESERVADA' },
      });
    }

    return NextResponse.json(reserva);
  } catch(e) {
    console.error(e);
    return NextResponse.json({ error: 'Error al actualizar reserva.' }, { status: 400 });
  }
}

// DELETE: eliminar una reserva y liberar la habitación
export async function DELETE(req: Request) {
  if (!(await hasAccess())) return NextResponse.json({ error: 'No autorizado' }, { status: 403 });

  const { fecha } = await req.json();
  try {
    const reserva = await prisma.reserva.findUnique({ where: { fecha } });
    if (!reserva) return NextResponse.json({ error: 'Reserva no encontrada' }, { status: 404 });

    // Liberar habitación si tenía una asignada
    if (reserva.habitacionId) {
      await prisma.habitacion.update({
        where: { id: reserva.habitacionId },
        data: { estado: 'DISPONIBLE' },
      });
    }

    await prisma.reserva.delete({ where: { fecha } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Error al eliminar reserva.' }, { status: 400 });
  }
}
