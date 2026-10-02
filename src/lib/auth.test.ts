import assert from 'node:assert/strict';
import test from 'node:test';
import { createSessionToken, getClientIp, hashPassword, verifyPassword, verifySessionToken } from './auth';

process.env.AUTH_SECRET = 'test-only-secret-with-more-than-thirty-two-characters';

test('hashes passwords with salt and verifies only the correct password', async () => {
  const hash = await hashPassword('correct horse battery staple');

  assert.match(hash, /^scrypt:[a-f0-9]{32}:[a-f0-9]{128}$/);
  assert.equal(hash.includes('correct horse battery staple'), false);
  assert.equal(await verifyPassword('correct horse battery staple', hash), true);
  assert.equal(await verifyPassword('wrong password', hash), false);
});

test('accepts valid signed sessions and rejects tampered or expired sessions', () => {
  const now = Date.UTC(2026, 6, 21);
  const token = createSessionToken('user-123', now, 60);

  assert.deepEqual(verifySessionToken(token, now), {
    userId: 'user-123',
    role: 'employer',
    expiresAt: Math.floor(now / 1000) + 60,
  });
  assert.equal(verifySessionToken(`${token}x`, now), null);
  assert.equal(verifySessionToken(createSessionToken('user-123', now, -1), now), null);
});

test('client IP ignores spoofed leading X-Forwarded-For hops', () => {
  const key = (headers: Record<string, string>) => getClientIp(new Request('http://x', { headers }));
  // Behind Cloudflare the trusted header wins no matter what XFF says.
  assert.equal(key({ 'cf-connecting-ip': '203.0.113.9', 'x-forwarded-for': '1.1.1.1, 203.0.113.9' }), '203.0.113.9');
  assert.equal(key({ 'cf-connecting-ip': '203.0.113.9', 'x-forwarded-for': '2.2.2.2, 203.0.113.9' }), '203.0.113.9');
  // Without it, only the hop our own proxy appended (rightmost) counts.
  assert.equal(key({ 'x-forwarded-for': '1.1.1.1, 198.51.100.7' }), key({ 'x-forwarded-for': '2.2.2.2, 198.51.100.7' }));
  assert.equal(key({}), 'unknown');
});
