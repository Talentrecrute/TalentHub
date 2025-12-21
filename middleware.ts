import { getToken } from 'next-auth/jwt';
import { withAuth } from 'next-auth/middleware';
import createIntlMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
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
  '/admin',
];

// Paths that admins should NOT access (they should stay in admin area)
const nonAdminPaths = [
  '/dashboard',
  '/applications',
  '/profile',
  '/employer',
];

// Paths only for admins
const adminOnlyPaths = ['/admin'];

function isProtectedPath(pathname: string) {
  return protectedPaths.some(path => 
    pathname.startsWith(path) || 
    pathname.startsWith(`/fr${path}`) || 
    pathname.startsWith(`/en${path}`)
  );
}

function isAdminPath(pathname: string) {
  return adminOnlyPaths.some(path => 
    pathname.startsWith(path) || 
    pathname.startsWith(`/fr${path}`) || 
    pathname.startsWith(`/en${path}`)
  );
}

function isNonAdminPath(pathname: string) {
  return nonAdminPaths.some(path => 
    pathname.startsWith(path) || 
    pathname.startsWith(`/fr${path}`) || 
    pathname.startsWith(`/en${path}`)
  );
}

export default async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  
  // Skip for API routes and static files
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.includes('.')
  ) {
    return;
  }
  
  // Get user token
  const token = await getToken({ req });
  
  // If user is admin and trying to access non-admin protected routes, redirect to admin
  if (token?.role === 'ADMIN' && isNonAdminPath(pathname)) {
    const locale = pathname.startsWith('/fr') ? 'fr' : pathname.startsWith('/en') ? 'en' : 'fr';
    return NextResponse.redirect(new URL(`/${locale}/admin`, req.url));
  }
  
  // If non-admin user tries to access admin routes, redirect to home
  if (token && token.role !== 'ADMIN' && isAdminPath(pathname)) {
    const locale = pathname.startsWith('/fr') ? 'fr' : pathname.startsWith('/en') ? 'en' : 'fr';
    return NextResponse.redirect(new URL(`/${locale}`, req.url));
  }
  
  // Use auth middleware for protected paths
  if (isProtectedPath(pathname)) {
    return (authMiddleware as any)(req);
  }
  
  // Use intl middleware for public paths
  return intlMiddleware(req);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'
]};
