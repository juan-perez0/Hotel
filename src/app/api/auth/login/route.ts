import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { signToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y contraseña son obligatorios' },
        { status: 400 }
      );
    }

    const unUsuario = await prisma.usuario.findUnique({
      where: { email },
    });

    if (!unUsuario) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    const passwordMatch = await bcrypt.compare(password, unUsuario.password);
    if (!passwordMatch) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    const token = await signToken({
      id: unUsuario.id,
      email: unUsuario.email,
      rol: unUsuario.rol,
    });

    const dest = unUsuario.rol === 'ADMIN' ? '/admin' : unUsuario.rol === 'RECEPCIONISTA' ? '/recepcion' : '/limpieza';

    const response = NextResponse.json({ message: 'Login exitoso', dest }, { status: 200 });
    
    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 12, // 12 hours
      sameSite: 'strict'
    });

    return response;
  } catch (error) {
    console.error('Error en login:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
