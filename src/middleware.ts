import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const sessionToken = request.cookies.get('session_token')?.value;
  const userRole = request.cookies.get('user_role')?.value;
  const { pathname } = request.nextUrl;
  const activationCode = request.cookies.get('activation_code')?.value;
  const activationEnd = request.cookies.get('activation_end')?.value;
  const now = Date.now();
  const endTs = activationEnd ? Date.parse(activationEnd) : 0;

  const isStaticAsset =
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/assets') ||
    pathname === '/favicon.ico';
  const isActivationFlow = pathname.startsWith('/activation') || pathname.startsWith('/activation-admin');
  const isPublicPage = pathname === '/' || pathname === '/activation' || pathname === '/activation-admin/login';

  if (!isStaticAsset && !isActivationFlow && !isPublicPage) {
    if (!activationCode || !activationEnd || endTs <= now) {
      return NextResponse.redirect(new URL('/activation', request.url));
    }
  }
  // Also enforce activation on homepage to meet the requirement
  if (!isStaticAsset && pathname === '/' && (!activationCode || !activationEnd || endTs <= now)) {
    return NextResponse.redirect(new URL('/activation', request.url));
  }

  // 1. Protect Admin Routes
  if (pathname.startsWith('/admin')) {
    if (!sessionToken || userRole !== 'admin') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // 2. Protect Coordinator Routes
  if (pathname.startsWith('/coordinator')) {
    if (!sessionToken || userRole !== 'coordinator') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // 3. Protect Member Routes
  if (pathname.startsWith('/member')) {
    if (!sessionToken || userRole !== 'player') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // 4. Redirect logged-in users away from login page
  if (pathname === '/login') {
    if (sessionToken && userRole === 'admin') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    if (sessionToken && userRole === 'coordinator') {
      return NextResponse.redirect(new URL('/coordinator', request.url));
    }
    if (sessionToken && userRole === 'player') {
      return NextResponse.redirect(new URL('/member', request.url));
    }
  }

  // 5. Protect Activation Codes Admin
  if (pathname.startsWith('/activation-admin')) {
    const adminSession = request.cookies.get('codes_admin_session')?.value;
    if (!adminSession && pathname !== '/activation-admin/login') {
      return NextResponse.redirect(new URL('/activation-admin/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/(.*)'],
};
