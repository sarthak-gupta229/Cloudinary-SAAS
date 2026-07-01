import { createRouteMatcher, clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
  '/sign-in',
  '/sign-up',
  '/',
  '/home',
]);
const isPublicApiRoute = createRouteMatcher(['/api/videos']);

export default clerkMiddleware(async (auth, req) => {
  const userId = await auth();
  const currentUrl = req.nextUrl.pathname;
  const isAccessingDashboard = currentUrl === '/home';
  const isApiRequest = currentUrl.startsWith('/api');

  if (userId && isPublicApiRoute(req) && !isAccessingDashboard) {
    return NextResponse.redirect(new URL('/home', req.url));
  }

  if (!userId) {
    if (!isPublicRoute(req) && !isPublicApiRoute(req)) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    if (isApiRequest && !isPublicApiRoute(req)) {
      return NextResponse.redirect(new URL('/sign-in', req.url));
    }
  }
  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
