import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isOnManage = req.nextUrl.pathname.startsWith('/manage');
  const isOnOnboarding = req.nextUrl.pathname.startsWith('/manage/onboarding');
  const isOnLogin = req.nextUrl.pathname === '/login';
  const isOnRegister = req.nextUrl.pathname === '/register';

  // Redirect to login if trying to access manage pages without auth
  if (isOnManage && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Redirect to manage if already logged in and on login page
  if (isOnLogin && isLoggedIn) {
    // Check if brand user needs onboarding
    const isBrandUser = req.auth?.user?.role === 'brand';
    const onboardingComplete = req.auth?.user?.onboardingComplete;

    if (isBrandUser && !onboardingComplete) {
      return NextResponse.redirect(new URL('/manage/onboarding', req.url));
    }
    return NextResponse.redirect(new URL('/manage', req.url));
  }

  // Redirect to manage if already logged in and on register page
  if (isOnRegister && isLoggedIn) {
    const isBrandUser = req.auth?.user?.role === 'brand';
    const onboardingComplete = req.auth?.user?.onboardingComplete;

    if (isBrandUser && !onboardingComplete) {
      return NextResponse.redirect(new URL('/manage/onboarding', req.url));
    }
    return NextResponse.redirect(new URL('/manage', req.url));
  }

  // Brand users who haven't completed onboarding should be redirected to onboarding
  if (isOnManage && !isOnOnboarding && isLoggedIn) {
    const isBrandUser = req.auth?.user?.role === 'brand';
    const onboardingComplete = req.auth?.user?.onboardingComplete;

    if (isBrandUser && !onboardingComplete) {
      return NextResponse.redirect(new URL('/manage/onboarding', req.url));
    }
  }

  // Add pathname header for server components
  const response = NextResponse.next();
  response.headers.set('x-pathname', req.nextUrl.pathname);
  return response;
});

export const config = {
  matcher: ['/manage/:path*', '/login', '/register'],
};
