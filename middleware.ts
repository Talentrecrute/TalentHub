import { withAuth } from 'next-auth/middleware';
import createIntlMiddleware from 'next-intl/middleware';
import { NextRequest } from 'next/server';
import { defaultLocale, locales } from './i18n/routing';

const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'as-needed'
});

const authMiddleware = withAuth(
  function onSuccess(req) {
    return intlMiddleware(req);
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

// Paths that require authentication
const protectedPaths = [
  '/dashboard',
  '/applications',
  '/profile',
  '/employer',
];

function isProtectedPath(pathname: string) {
  return protectedPaths.some(path => 
    pathname.startsWith(path) || 
    pathname.startsWith(`/fr${path}`) || 
    pathname.startsWith(`/en${path}`)
  );
}

export default function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  
  // Skip for API routes and static files
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.includes('.')
  ) {
    return;
  }
  
  // Use auth middleware for protected paths
  if (isProtectedPath(pathname)) {
    return (authMiddleware as any)(req);
  }
  
  // Use intl middleware for public paths
  return intlMiddleware(req);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
