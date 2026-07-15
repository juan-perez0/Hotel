import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAuth } from './lib/auth';

export async function proxy(req: NextRequest) {
  const token = req.cookies.get('token')?.value;

  const url = req.nextUrl;

  // Rutas públicas: auth APIs, login, y assets de Next.js
  if (url.pathname.startsWith('/api/auth') || url.pathname.startsWith('/_next')) {
    return NextResponse.next();
  }

  // Si ya está autenticado y visita /login, redirigir a su módulo
  if (url.pathname === '/login') {
    if (token) {
      try {
        const verifiedToken = await verifyAuth(token);
        const dest = verifiedToken.rol === 'ADMIN' ? '/admin' : verifiedToken.rol === 'RECEPCIONISTA' ? '/recepcion' : '/limpieza';
        return NextResponse.redirect(new URL(dest, req.url));
      } catch {
        // Token inválido — dejar pasar al login
      }
    }
    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  try {
    const verifiedToken = await verifyAuth(token);
    const rol = verifiedToken.rol as string;

    if (url.pathname.startsWith('/admin') && rol !== 'ADMIN') {
      return NextResponse.redirect(new URL('/acceso-denegado', req.url));
    }

    if (url.pathname.startsWith('/recepcion') && rol !== 'RECEPCIONISTA' && rol !== 'ADMIN') {
      return NextResponse.redirect(new URL('/acceso-denegado', req.url));
    }

    if (url.pathname.startsWith('/limpieza') && rol !== 'EMPLEADA' && rol !== 'ADMIN') {
      return NextResponse.redirect(new URL('/acceso-denegado', req.url));
    }

    if (url.pathname === '/') {
      const dest = rol === 'ADMIN' ? '/admin' : rol === 'RECEPCIONISTA' ? '/recepcion' : '/limpieza';
      return NextResponse.redirect(new URL(dest, req.url));
    }

    return NextResponse.next();
  } catch (error) {
    const response = NextResponse.redirect(new URL('/login', req.url));
    response.cookies.delete('token');
    return response;
  }
}

export const config = {
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico|acceso-denegado).*)'],
};
