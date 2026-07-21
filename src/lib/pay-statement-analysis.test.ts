import assert from 'node:assert/strict';
import test from 'node:test';
import {
  AnalysisRequestError,
  extractPayStatement,
  extractResponseText,
  MAX_STATEMENT_BYTES,
  validatePayStatement,
} from './pay-statement-analysis';

test('accepts supported statements and rejects unsupported or oversized files', () => {
  assert.doesNotThrow(() => validatePayStatement(new File(['stub'], 'pay-stub.pdf', { type: 'application/pdf' })));
  assert.throws(
    () => validatePayStatement(new File(['text'], 'notes.txt', { type: 'text/plain' })),
    (error: unknown) => error instanceof AnalysisRequestError && error.message.includes('not supported'),
  );
  assert.throws(
    () => validatePayStatement({ name: 'huge.pdf', size: MAX_STATEMENT_BYTES + 1 } as File),
    (error: unknown) => error instanceof AnalysisRequestError && error.status === 413,
  );
});

test('extracts structured text and surfaces model refusals', () => {
  assert.equal(
    extractResponseText({ output: [{ content: [{ type: 'output_text', text: '{"hoursWorked":40}' }] }] }),
    '{"hoursWorked":40}',
  );
  assert.throws(
    () => extractResponseText({ output: [{ content: [{ type: 'refusal', refusal: 'Cannot process.' }] }] }),
    (error: unknown) => error instanceof AnalysisRequestError && error.status === 422,
  );
});

test('normalizes structured statement output and sends images as image input', async () => {
  const modelResult = {
    documentType: 'pay_statement', confidence: 'high', employerName: 'Acme LLC',
    payPeriodStart: null, payPeriodEnd: null, hoursWorked: 45, hourlyRate: 20,
    overtimeHours: 5, overtimeRate: 30, tips: null, grossPay: 950, netPay: null,
    deductions: [],
  };
  let requestBody = '';
  const fakeFetch = async (_input: string | URL | Request, init?: RequestInit) => {
    requestBody = String(init?.body);
    return new Response(JSON.stringify({
      output: [{ content: [{ type: 'output_text', text: JSON.stringify(modelResult) }] }],
    }), { status: 200, headers: { 'content-type': 'application/json' } });
  };

  const result = await extractPayStatement(
    new File(['image'], 'statement.jpg', { type: 'image/jpeg' }),
    'test-key',
    fakeFetch as typeof fetch,
  );
  assert.equal(result.extractedData.hoursWorked, 45);
  assert.equal(result.extractedData.payPeriodStart, undefined);
  assert.match(requestBody, /"type":"input_image"/);
  assert.match(requestBody, /"store":false/);
});

test('rejects an extracted pay-period amount masquerading as an hourly rate', async () => {
  const modelResult = {
    documentType: 'pay_statement', confidence: 'high', employerName: 'Power Mobile Life LLC',
    payPeriodStart: '07/01/2026', payPeriodEnd: '07/15/2026', hoursWorked: 86.67,
    hourlyRate: 4791.67, overtimeHours: null, overtimeRate: null, tips: null,
    grossPay: 4791.67, netPay: 3178.22, deductions: [],
  };
  const fakeFetch = async () => new Response(JSON.stringify({
    output: [{ content: [{ type: 'output_text', text: JSON.stringify(modelResult) }] }],
  }), { status: 200, headers: { 'content-type': 'application/json' } });

  const result = await extractPayStatement(
    new File(['pdf'], 'statement.pdf', { type: 'application/pdf' }),
    'test-key',
    fakeFetch as typeof fetch,
  );

  assert.equal(result.extractedData.hourlyRate, undefined);
  assert.equal(result.extractedData.grossPay, 4791.67);
  assert.equal(result.extractionWarnings.length, 1);
});

test('turns provider failures into controlled errors without exposing secrets', async () => {
  const fakeFetch = async () => new Response('<!DOCTYPE html><h1>Bad Gateway</h1>', { status: 502 });
  await assert.rejects(
    extractPayStatement(new File(['pdf'], 'statement.pdf', { type: 'application/pdf' }), 'test-key', fakeFetch as typeof fetch),
    (error: unknown) => error instanceof AnalysisRequestError
      && error.status === 502
      && !error.message.includes('<!DOCTYPE'),
  );
  const fakeAuthFetch = async () => new Response(
    JSON.stringify({ error: { message: 'Incorrect API key provided: secret-value' } }),
    { status: 401, headers: { 'content-type': 'application/json' } },
  );
  await assert.rejects(
    extractPayStatement(new File(['pdf'], 'statement.pdf', { type: 'application/pdf' }), 'test-key', fakeAuthFetch as typeof fetch),
    (error: unknown) => error instanceof AnalysisRequestError
      && error.status === 503
      && error.message.includes('authentication')
      && !error.message.includes('secret-value'),
  );
});
