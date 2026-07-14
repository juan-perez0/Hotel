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
  
  const huespedes = await prisma.huesped.findMany({
    include: { habitacion: true },
    orderBy: { createdAt: 'desc' }
  });
  
  return NextResponse.json(huespedes);
}

export async function POST(req: Request) {
  if (!(await hasAccess())) return NextResponse.json({ error: 'No autorizado' }, { status: 403 });

  const data = await req.json();
  try {
    const huesped = await prisma.huesped.create({
      data: {
        tipo_identificacion: data.tipo_identificacion,
        numero_identificacion: data.numero_identificacion,
        nombres: data.nombres,
        apellidos: data.apellidos,
        ciudad_residencia: data.ciudad_residencia,
        ciudad_procedencia: data.ciudad_procedencia,
        habitacionId: parseInt(data.habitacionId),
        motivo_viaje: data.motivo_viaje,
        numero_acompanantes: parseInt(data.numero_acompanantes) || 0,
        tipo_acomodacion: data.tipo_acomodacion,
        valor_pagado: parseFloat(data.valor_pagado) || 0,
      }
    });

    if (data.habitacionId) {
      await prisma.habitacion.update({
        where: { id: parseInt(data.habitacionId) },
        data: { estado: 'OCUPADA' }
      });
    }

    return NextResponse.json(huesped);
  } catch {
    return NextResponse.json({ error: 'Error al registrar huésped.' }, { status: 400 });
  }
}
