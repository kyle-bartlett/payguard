import { createHmac, randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { cookies } from 'next/headers';

const scryptAsync = promisify(scrypt);

export const AUTH_COOKIE_NAME = 'payguard_session';
export const AUTH_SESSION_MAX_AGE = 7 * 24 * 60 * 60;

export interface AuthSession {
  userId: string;
  role: 'employer';
  expiresAt: number;
}

function getAuthSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('AUTH_SECRET must be configured with at least 32 characters.');
  }
  return secret;
}

export function assertAuthConfigured(): void {
  void getAuthSecret();
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const hash = await scryptAsync(password, salt, 64) as Buffer;
  return `scrypt:${salt}:${hash.toString('hex')}`;
}

export async function verifyPassword(password: string, encodedHash: string): Promise<boolean> {
  const [scheme, salt, expectedHex] = encodedHash.split(':');
  if (scheme !== 'scrypt' || !salt || !expectedHex) return false;

  const expected = Buffer.from(expectedHex, 'hex');
  if (expected.length !== 64) return false;
  const actual = await scryptAsync(password, salt, expected.length) as Buffer;
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export function createSessionToken(
  userId: string,
  now = Date.now(),
  maxAgeSeconds = AUTH_SESSION_MAX_AGE,
): string {
  const payload = Buffer.from(JSON.stringify({
    userId,
    role: 'employer',
    expiresAt: Math.floor(now / 1000) + maxAgeSeconds,
  } satisfies AuthSession)).toString('base64url');
  const signature = createHmac('sha256', getAuthSecret()).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

export function verifySessionToken(token: string, now = Date.now()): AuthSession | null {
  try {
    const [payload, suppliedSignature] = token.split('.');
    if (!payload || !suppliedSignature) return null;

    const expectedSignature = createHmac('sha256', getAuthSecret()).update(payload).digest();
    const supplied = Buffer.from(suppliedSignature, 'base64url');
    if (expectedSignature.length !== supplied.length || !timingSafeEqual(expectedSignature, supplied)) return null;

    const session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as Partial<AuthSession>;
    if (typeof session.userId !== 'string'
      || session.role !== 'employer'
      || typeof session.expiresAt !== 'number'
      || session.expiresAt <= Math.floor(now / 1000)) return null;
    return session as AuthSession;
  } catch {
    return null;
  }
}

export async function getCurrentSession(): Promise<AuthSession | null> {
  const token = (await cookies()).get(AUTH_COOKIE_NAME)?.value;
  return token ? verifySessionToken(token) : null;
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: AUTH_SESSION_MAX_AGE,
  };
}

const attempts = new Map<string, number[]>();

export function isAuthRateLimited(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const recent = (attempts.get(key) ?? []).filter((time) => now - time < windowMs);
  if (recent.length >= limit) {
    attempts.set(key, recent);
    return true;
  }
  attempts.set(key, [...recent, now]);
  return false;
}

export function getClientIp(request: Request): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown';
}
