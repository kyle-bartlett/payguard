import assert from 'node:assert/strict';
import test from 'node:test';
import { DEMO_ANALYSIS } from './demo-data';

test('demo fixture produces the intended overtime underpayment result', () => {
  assert.equal(DEMO_ANALYSIS.source, 'demo');
  assert.equal(DEMO_ANALYSIS.state, 'TX');
  assert.equal(DEMO_ANALYSIS.status, 'issues_found');
  assert.equal(DEMO_ANALYSIS.totalEstimatedLoss, 67.5);
  assert.deepEqual(
    DEMO_ANALYSIS.violations.map((violation) => violation.type),
    ['overtime', 'overtime'],
  );
});
