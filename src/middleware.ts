import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isOnManage = req.nextUrl.pathname.startsWith('/manage');
  const isOnLogin = req.nextUrl.pathname === '/login';

  if (isOnManage && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  if (isOnLogin && isLoggedIn) {
    return NextResponse.redirect(new URL('/manage', req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/manage/:path*', '/login'],
};
