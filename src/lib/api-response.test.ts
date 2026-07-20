import assert from 'node:assert/strict';
import test from 'node:test';
import { readApiResponse } from './api-response';

test('reads successful JSON and uses JSON API errors', async () => {
  const value = await readApiResponse<{ ok: boolean }>(
    new Response('{"ok":true}', { status: 200, headers: { 'content-type': 'application/json' } }),
  );
  assert.equal(value.ok, true);
  await assert.rejects(
    readApiResponse(new Response('{"error":"Use a clearer image."}', { status: 422 })),
    /Use a clearer image/,
  );
});

test('does not expose or JSON-parse HTML error pages', async () => {
  await assert.rejects(
    readApiResponse(new Response('<!DOCTYPE html><h1>Gateway Timeout</h1>', { status: 504 })),
    (error: unknown) => error instanceof Error
      && error.message.includes('temporarily unavailable')
      && !error.message.includes('<!DOCTYPE'),
  );
});
