import { NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import {
  AUTH_COOKIE_NAME,
  assertAuthConfigured,
  createSessionToken,
  getClientIp,
  isAuthRateLimited,
  sessionCookieOptions,
  verifyPassword,
} from '@/lib/auth';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  if (isAuthRateLimited(`login:${getClientIp(request)}`, 10, 15 * 60 * 1000)) {
    return NextResponse.json({ error: 'Too many sign-in attempts. Please wait and try again.' }, { status: 429 });
  }

  try {
    assertAuthConfigured();
    const prisma = getPrisma();
    const body = await request.json() as { email?: unknown; password?: unknown };
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';
    if (!email || !password || password.length > 128) {
      return NextResponse.json({ error: 'Enter your email and password.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, passwordHash: true, role: true },
    });
    const valid = user?.role === 'employer' && await verifyPassword(password, user.passwordHash);
    if (!user || !valid) {
      return NextResponse.json({ error: 'Email or password is incorrect.' }, { status: 401 });
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set(AUTH_COOKIE_NAME, createSessionToken(user.id), sessionCookieOptions());
    return response;
  } catch (error) {
    console.error('Login error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ error: 'We could not sign you in. Please try again.' }, { status: 500 });
  }
}
