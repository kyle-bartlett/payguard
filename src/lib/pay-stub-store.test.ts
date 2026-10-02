import assert from 'node:assert/strict';
import test from 'node:test';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { analyzePayStub } from './analysis';
import { getEmployerSummary, savePayStubAnalysis } from './pay-stub-store';

// Runs against a real Postgres; set DATABASE_URL to a disposable database.
const url = process.env.DATABASE_URL;

test('saved analyses roll up into the employer summary', { skip: !url }, async () => {
  const prisma = new PrismaClient({ adapter: new PrismaPg(url as string) });
  const email = `store-test-${Date.now()}@example.com`;
  try {
    const user = await prisma.user.create({
      data: { email, passwordHash: 'x', role: 'employer', employer: { create: { companyName: 'Test Co' } } },
    });

    assert.equal((await getEmployerSummary(prisma, user.id))?.complianceScore, null);

    const low = { employerName: 'Acme', hoursWorked: 40, hourlyRate: 3, grossPay: 120 };
    const high = { employerName: 'Fine LLC', hoursWorked: 40, hourlyRate: 40, grossPay: 1600 };
    const lowResult = analyzePayStub(low, 'TX');
    const highResult = analyzePayStub(high, 'TX');
    assert.ok(lowResult.violations.some((v) => v.severity !== 'warning'));
    await savePayStubAnalysis(prisma, user.id, low, lowResult);
    await savePayStubAnalysis(prisma, user.id, high, highResult);

    const summary = await getEmployerSummary(prisma, user.id);
    assert.equal(summary?.companyName, 'Test Co');
    assert.equal(summary?.statementsChecked, 2);
    assert.equal(summary?.complianceScore, 50);
    assert.ok((summary?.issuesFound ?? 0) >= 1);
    assert.equal(summary?.recent[0].employerName, 'Fine LLC');

    const other = await prisma.user.create({
      data: { email: `other-${email}`, passwordHash: 'x', role: 'employer', employer: { create: { companyName: 'Other' } } },
    });
    assert.equal((await getEmployerSummary(prisma, other.id))?.statementsChecked, 0);
  } finally {
    await prisma.violation.deleteMany({ where: { payStub: { user: { email: { contains: email } } } } });
    await prisma.payStub.deleteMany({ where: { user: { email: { contains: email } } } });
    await prisma.employer.deleteMany({ where: { user: { email: { contains: email } } } });
    await prisma.user.deleteMany({ where: { email: { contains: email } } });
    await prisma.$disconnect();
  }
});
