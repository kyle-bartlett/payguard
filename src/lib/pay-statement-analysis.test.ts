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

test('turns non-JSON provider failures into a controlled upstream error', async () => {
  const fakeFetch = async () => new Response('<!DOCTYPE html><h1>Bad Gateway</h1>', { status: 502 });
  await assert.rejects(
    extractPayStatement(new File(['pdf'], 'statement.pdf', { type: 'application/pdf' }), 'test-key', fakeFetch as typeof fetch),
    (error: unknown) => error instanceof AnalysisRequestError
      && error.status === 502
      && !error.message.includes('<!DOCTYPE'),
  );
});

test('does not expose provider authentication details', async () => {
  const fakeFetch = async () => new Response(
    JSON.stringify({ error: { message: 'Incorrect API key provided: secret-value' } }),
    { status: 401, headers: { 'content-type': 'application/json' } },
  );
  await assert.rejects(
    extractPayStatement(new File(['pdf'], 'statement.pdf', { type: 'application/pdf' }), 'test-key', fakeFetch as typeof fetch),
    (error: unknown) => error instanceof AnalysisRequestError
      && error.status === 503
      && error.message.includes('authentication')
      && !error.message.includes('secret-value'),
  );
});
