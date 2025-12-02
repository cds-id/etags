import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isOnManage = req.nextUrl.pathname.startsWith('/manage');
  const isOnLogin = req.nextUrl.pathname === '/login';
  const isOnRegister = req.nextUrl.pathname === '/register';

  // Redirect to login if trying to access manage pages without auth
  if (isOnManage && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Redirect to manage if already logged in and on login page
  if (isOnLogin && isLoggedIn) {
    return NextResponse.redirect(new URL('/manage', req.url));
  }

  // Redirect to manage if already logged in and on register page
  if (isOnRegister && isLoggedIn) {
    return NextResponse.redirect(new URL('/manage', req.url));
  }

  // NOTE: Onboarding check is now done in the manage layout (server component)
  // to ensure fresh database state is always checked

  // Add pathname header for server components
  const response = NextResponse.next();
  response.headers.set('x-pathname', req.nextUrl.pathname);
  return response;
});

export const config = {
  matcher: ['/manage/:path*', '/login', '/register'],
};
