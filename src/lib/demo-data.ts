import { analyzePayStub, type PayStubData } from '@/lib/analysis';

export const DEMO_PAY_STUB: PayStubData = {
  employerName: 'Lone Star Logistics LLC',
  payPeriodStart: '06/16/2026',
  payPeriodEnd: '06/22/2026',
  hoursWorked: 47.5,
  hourlyRate: 18,
  overtimeHours: 3,
  overtimeRate: 18,
  grossPay: 774,
  netPay: 641.73,
  deductions: [
    { name: 'Federal Tax', amount: 72.4 },
    { name: 'Social Security', amount: 47.99 },
    { name: 'Medicare', amount: 11.88 },
  ],
};

export const DEMO_ANALYSIS = {
  ...analyzePayStub(DEMO_PAY_STUB, 'TX'),
  extractedData: DEMO_PAY_STUB,
  extractionConfidence: 'high',
  source: 'demo' as const,
};
