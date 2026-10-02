import type { PrismaClient } from '@prisma/client';
import type { AnalysisResult, PayStubData } from '@/lib/analysis';

export interface EmployerSummary {
  companyName: string;
  statementsChecked: number;
  cleanChecks: number;
  issuesFound: number;
  complianceScore: number | null;
  recent: {
    id: string;
    employerName: string | null;
    state: string;
    status: string;
    detail: string;
    createdAt: string;
  }[];
}

export async function savePayStubAnalysis(
  prisma: PrismaClient,
  userId: string,
  extracted: PayStubData,
  analysis: AnalysisResult,
): Promise<string> {
  const stub = await prisma.payStub.create({
    data: {
      userId,
      state: analysis.state,
      employerName: extracted.employerName?.slice(0, 200),
      payPeriodStart: extracted.payPeriodStart,
      payPeriodEnd: extracted.payPeriodEnd,
      hoursWorked: extracted.hoursWorked,
      hourlyRate: extracted.hourlyRate,
      overtimeHours: extracted.overtimeHours,
      overtimeRate: extracted.overtimeRate,
      tips: extracted.tips,
      grossPay: extracted.grossPay,
      netPay: extracted.netPay,
      deductions: extracted.deductions ? JSON.stringify(extracted.deductions) : null,
      analysisStatus: 'complete',
      analysisResult: JSON.stringify({ status: analysis.status, summary: analysis.summary }),
      violations: {
        create: analysis.violations.map((v) => ({
          type: v.type,
          severity: v.severity,
          description: v.description,
          estimatedLoss: v.estimatedLoss,
          lawReference: v.lawReference,
        })),
      },
    },
    select: { id: true },
  });
  return stub.id;
}

export async function getEmployerSummary(prisma: PrismaClient, userId: string): Promise<EmployerSummary | null> {
  const employer = await prisma.employer.findUnique({ where: { userId }, select: { companyName: true } });
  if (!employer) return null;

  const [statementsChecked, issueGroups, cleanChecks, issuesFound, recent] = await Promise.all([
    prisma.payStub.count({ where: { userId } }),
    prisma.payStub.count({ where: { userId, violations: { some: { severity: { not: 'warning' } } } } }),
    prisma.payStub.count({ where: { userId, violations: { none: {} } } }),
    prisma.violation.count({ where: { severity: { not: 'warning' }, payStub: { userId } } }),
    prisma.payStub.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 8,
      select: {
        id: true,
        employerName: true,
        state: true,
        createdAt: true,
        violations: { select: { description: true, severity: true } },
      },
    }),
  ]);

  return {
    companyName: employer.companyName,
    statementsChecked,
    cleanChecks,
    issuesFound,
    complianceScore: statementsChecked === 0
      ? null
      : Math.round(((statementsChecked - issueGroups) / statementsChecked) * 100),
    recent: recent.map((stub) => {
      const flagged = stub.violations.find((v) => v.severity !== 'warning');
      const noted = stub.violations[0];
      return {
        id: stub.id,
        employerName: stub.employerName,
        state: stub.state,
        status: flagged ? 'issue' : noted ? 'review' : 'clean',
        detail: (flagged ?? noted)?.description ?? 'No issues found',
        createdAt: stub.createdAt.toISOString(),
      };
    }),
  };
}
