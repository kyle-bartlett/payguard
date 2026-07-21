import { NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import {
  AUTH_COOKIE_NAME,
  assertAuthConfigured,
  createSessionToken,
  getClientIp,
  hashPassword,
  isAuthRateLimited,
  sessionCookieOptions,
} from '@/lib/auth';

export const runtime = 'nodejs';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export async function POST(request: Request) {
  if (isAuthRateLimited(`signup:${getClientIp(request)}`, 5, 60 * 60 * 1000)) {
    return NextResponse.json({ error: 'Too many signup attempts. Please try again later.' }, { status: 429 });
  }

  try {
    assertAuthConfigured();
    const prisma = getPrisma();
    const body: unknown = await request.json();
    if (!isRecord(body)) return NextResponse.json({ error: 'Invalid signup request.' }, { status: 400 });

    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const company = typeof body.company === 'string' ? body.company.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';

    if (name.length < 2 || name.length > 100 || company.length < 2 || company.length > 120) {
      return NextResponse.json({ error: 'Enter your full name and company name.' }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
      return NextResponse.json({ error: 'Enter a valid work email.' }, { status: 400 });
    }
    if (password.length < 8 || password.length > 128) {
      return NextResponse.json({ error: 'Password must be between 8 and 128 characters.' }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (existing) {
      return NextResponse.json(
        { error: 'An account already exists for this email. Sign in instead.' },
        { status: 409 },
      );
    }

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: await hashPassword(password),
        name,
        role: 'employer',
        employer: { create: { companyName: company } },
      },
      select: { id: true },
    });

    const response = NextResponse.json({ ok: true }, { status: 201 });
    response.cookies.set(AUTH_COOKIE_NAME, createSessionToken(user.id), sessionCookieOptions());
    return response;
  } catch (error) {
    if (isRecord(error) && error.code === 'P2002') {
      return NextResponse.json(
        { error: 'An account already exists for this email. Sign in instead.' },
        { status: 409 },
      );
    }
    console.error('Signup error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ error: 'We could not create your account. Please try again.' }, { status: 500 });
  }
}
