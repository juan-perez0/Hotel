import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ message: 'Sesión cerrada exitosamente' }, { status: 200 });
  response.cookies.set({
    name: 'token',
    value: '',
    httpOnly: true,
    path: '/',
    expires: new Date(0),
    sameSite: 'strict'
  });
  return response;
}
