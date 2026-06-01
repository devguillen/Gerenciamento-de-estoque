import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

async function getSessionFromRequest(request: NextRequest): Promise<boolean> {
  const session = request.cookies.get('session')?.value;
  return !!session;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAuthenticated = await getSessionFromRequest(request);

  const isLoginPage = pathname.startsWith('/login');
  const isDashboardPage = pathname.startsWith('/dashboard');

  if (isLoginPage) {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  if (isDashboardPage && !isAuthenticated) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  if (pathname === '/') {
      if (isAuthenticated) {
          return NextResponse.redirect(new URL('/dashboard', request.url));
      }
      return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Match all paths except for static files, API routes, and image optimization.
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
