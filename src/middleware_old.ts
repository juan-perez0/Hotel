import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAuth } from './lib/auth';

export async function middleware(req: NextRequest) {
  const token = req.cookies.get('token')?.value;

  const url = req.nextUrl;
  
  if (url.pathname.startsWith('/api/auth') || url.pathname === '/login' || url.pathname.startsWith('/_next')) {
      if(url.pathname === '/login' && token) {
          try {
              const verifiedToken = await verifyAuth(token);
              if(verifiedToken) {
                 const dest = verifiedToken.rol === 'ADMIN' ? '/admin' : verifiedToken.rol === 'RECEPCIONISTA' ? '/recepcion' : '/limpieza';
                 return NextResponse.redirect(new URL(dest, req.url));
              }
          } catch(e) {}
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
