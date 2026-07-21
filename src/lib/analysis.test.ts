import assert from 'node:assert/strict';
import test from 'node:test';
import { analyzePayStub } from './analysis';

test('does not apply a weekly overtime threshold to multi-week aggregate hours', () => {
  const result = analyzePayStub({
    employerName: 'Power Mobile Life LLC',
    payPeriodStart: '07/01/2026',
    payPeriodEnd: '07/15/2026',
    hoursWorked: 86.67,
    hourlyRate: 55.28,
    grossPay: 4791.67,
    netPay: 3178.22,
  }, 'TX');

  assert.equal(result.status, 'needs_review');
  assert.equal(result.totalEstimatedLoss, 0);
  assert.deepEqual(result.violations.map((violation) => violation.type), ['data_quality']);
  assert.match(result.violations[0].description, /workweek/);
});
