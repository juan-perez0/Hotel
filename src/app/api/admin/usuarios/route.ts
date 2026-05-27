import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { verifyAuth } from '@/lib/auth';
import { cookies } from 'next/headers';

async function isAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return false;
  try {
    const payload = await verifyAuth(token);
    return payload.rol === 'ADMIN';
  } catch(e) { return false; }
}

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  const usuarios = await prisma.usuario.findMany({
    select: { id: true, nombre: true, email: true, rol: true, createdAt: true }
  });
  return NextResponse.json(usuarios);
}

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  
  const { nombre, email, password, rol } = await req.json();
  const hashedPassword = await bcrypt.hash(password, 10);
  
  try {
    const usuario = await prisma.usuario.create({
      data: { nombre, email, password: hashedPassword, rol }
    });
    return NextResponse.json({ id: usuario.id, email: usuario.email });
  } catch(e) {
    return NextResponse.json({ error: 'Error al crear usuario. El email podría estar duplicado.' }, { status: 400 });
  }
}
