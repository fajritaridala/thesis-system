import { getToken } from 'next-auth/jwt';
import { type NextRequest, NextResponse } from 'next/server';
import { JwtExt } from '@/types/auth.types';
import { AUTH_SECRET } from './utils/config/env';

const AUTH_PAGES = ['/auth/login', '/auth/register'];
const ADMIN = '/admin';
const PESERTA = '/peserta';
const SCHEDULE = '/schedule';

export async function middleware(request: NextRequest) {
  const token: JwtExt | null = await getToken({
    req: request,
    secret: AUTH_SECRET,
  });
  const { pathname } = request.nextUrl;

  // Menolak akses jika token tidak ada dan halaman yang diakses adalah halaman auth
  if (AUTH_PAGES.includes(pathname) && token)
    NextResponse.redirect(new URL('/', request.url));

  // middleware admin
  if (pathname.startsWith(ADMIN)) {
    // tolak akses jika token tidak ada
    if (!token) {
      const url = new URL(AUTH_PAGES[0], request.url);
      url.searchParams.set('callbackUrl', encodeURI(request.url));
      return NextResponse.redirect(url);
    }

    // tolak akses jika role bukan admin
    if (token?.role !== 'admin')
      NextResponse.redirect(new URL('/', request.url));

    // mengarahkan ke dashboard jika path adalah /admin
    if (pathname === ADMIN) {
      return NextResponse.redirect(new URL(`${ADMIN}/dashboard`, request.url));
    }
    return NextResponse.next();
  }

  // middleware peserta
  if (pathname.startsWith(PESERTA) && !token) {
    const url = new URL(AUTH_PAGES[0], request.url);
    url.searchParams.set('callbackUrl', encodeURI(request.url));
    return NextResponse.redirect(url);
  }

  // middleware pendaftaran jadwal: wajib login saat akses register
  if (
    pathname.startsWith(SCHEDULE) &&
    pathname.includes('/register') &&
    !token
  ) {
    const url = new URL(AUTH_PAGES[0], request.url);
    url.searchParams.set('callbackUrl', encodeURI(request.url));
    return NextResponse.redirect(url);
  }

  // mengarahkan ke dashboard jika path adalah /peserta
  if (pathname === PESERTA) NextResponse.redirect(new URL('/', request.url));

  return NextResponse.next();
}

export const config = {
  matcher: ['/auth/:path*', '/admin/:path*', '/schedule/:path*'],
};
