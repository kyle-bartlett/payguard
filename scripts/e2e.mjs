// End-to-end check against a running `next start` and a real Postgres.
// OpenAI is replaced by a local stub via OPENAI_BASE_URL, so no paid calls are made.
// Usage: BASE_URL=http://127.0.0.1:3000 node scripts/e2e.mjs
import assert from 'node:assert/strict';
import { createServer } from 'node:http';

const base = process.env.BASE_URL ?? 'http://127.0.0.1:3000';
const stubPort = Number(process.env.STUB_PORT ?? 54330);

const statement = {
  documentType: 'pay_statement', confidence: 'high', employerName: 'Stub Diner',
  payPeriodStart: '2026-09-01', payPeriodEnd: '2026-09-07', hoursWorked: 40, hourlyRate: 3,
  overtimeHours: null, overtimeRate: null, tips: null, grossPay: 120, netPay: 100, deductions: [],
};
const stub = createServer((req, res) => {
  req.resume();
  req.on('end', () => {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ output: [{ content: [{ type: 'output_text', text: JSON.stringify(statement) }] }] }));
  });
}).listen(stubPort);

let cookie = '';
async function call(path, init = {}) {
  const res = await fetch(base + path, { ...init, headers: { ...init.headers, ...(cookie && { cookie }) } });
  const set = res.headers.get('set-cookie');
  if (set) cookie = set.split(';')[0];
  return res;
}
const json = (body) => ({ method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
function upload() {
  const form = new FormData();
  form.set('file', new File([new Uint8Array([137, 80, 78, 71])], 'stub.png', { type: 'image/png' }));
  form.set('state', 'TX');
  return { method: 'POST', body: form };
}

try {
  const email = `e2e-${Date.now()}@example.com`;
  assert.equal((await call('/api/employer/summary')).status, 401, 'summary requires auth');

  assert.equal((await call('/api/auth/signup', json({ name: 'E2E Tester', company: 'E2E Co', email, password: 'correct horse' }))).status, 201);
  assert.equal((await call('/api/auth/signup', json({ name: 'E2E Tester', company: 'E2E Co', email, password: 'correct horse' }))).status, 409);
  cookie = '';
  assert.equal((await call('/api/auth/login', json({ email, password: 'wrong password' }))).status, 401);
  assert.equal((await call('/api/auth/login', json({ email, password: 'correct horse' }))).status, 200);

  let summary = await (await call('/api/employer/summary')).json();
  assert.equal(summary.companyName, 'E2E Co');
  assert.equal(summary.statementsChecked, 0);

  const analyzed = await call('/api/analyze', upload());
  assert.equal(analyzed.status, 200);
  const result = await analyzed.json();
  assert.equal(result.saved, true);
  assert.equal(result.status, 'issues_found');

  summary = await (await call('/api/employer/summary')).json();
  assert.equal(summary.statementsChecked, 1);
  assert.equal(summary.complianceScore, 0);
  assert.ok(summary.issuesFound >= 1);
  assert.equal(summary.recent[0].employerName, 'Stub Diner');

  const badState = upload();
  badState.body.set('state', 'ZZ');
  assert.equal((await call('/api/analyze', badState)).status, 400, 'unknown state rejected');

  // Anonymous workers still get an analysis, but nothing is saved.
  cookie = '';
  const anon = await (await call('/api/analyze', upload())).json();
  assert.equal(anon.saved, false);

  assert.equal((await call('/employer/dashboard', { redirect: 'manual' })).status, 307);
  console.log('e2e passed');
} finally {
  stub.close();
}
