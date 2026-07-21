import laborLawsData from '@/data/labor-laws.json';

export interface PayStubData {
  employerName?: string;
  payPeriodStart?: string;
  payPeriodEnd?: string;
  hoursWorked?: number;
  hourlyRate?: number;
  overtimeHours?: number;
  overtimeRate?: number;
  tips?: number;
  grossPay?: number;
  netPay?: number;
  deductions?: { name: string; amount: number }[];
}

export interface ViolationResult {
  type: 'minimum_wage' | 'overtime' | 'tip_credit' | 'meal_break' | 'rest_break' | 'pay_discrepancy' | 'data_quality';
  severity: 'warning' | 'violation' | 'critical';
  description: string;
  estimatedLoss: number;
  lawReference: string;
}

export interface AnalysisResult {
  status: 'clean' | 'issues_found' | 'needs_review';
  violations: ViolationResult[];
  totalEstimatedLoss: number;
  summary: string;
  state: string;
  stateName: string;
}

type StateLaws = typeof laborLawsData.states.TX;

function parseCalendarDate(value?: string): number | undefined {
  if (!value) return undefined;
  const iso = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(value.trim());
  const us = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(value.trim());
  const parts = iso
    ? { year: Number(iso[1]), month: Number(iso[2]), day: Number(iso[3]) }
    : us
      ? { year: Number(us[3]), month: Number(us[1]), day: Number(us[2]) }
      : undefined;
  if (!parts) return undefined;

  const timestamp = Date.UTC(parts.year, parts.month - 1, parts.day);
  const date = new Date(timestamp);
  if (date.getUTCFullYear() !== parts.year
    || date.getUTCMonth() !== parts.month - 1
    || date.getUTCDate() !== parts.day) return undefined;
  return timestamp;
}

function getPayPeriodDays(data: PayStubData): number | undefined {
  const start = parseCalendarDate(data.payPeriodStart);
  const end = parseCalendarDate(data.payPeriodEnd);
  if (start === undefined || end === undefined || end < start) return undefined;
  return Math.floor((end - start) / 86_400_000) + 1;
}

export function analyzePayStub(
  data: PayStubData,
  stateCode: string,
  extractionWarnings: string[] = [],
): AnalysisResult {
  const violations: ViolationResult[] = [];
  const federal = laborLawsData.federal;
  const stateData = laborLawsData.states[stateCode as keyof typeof laborLawsData.states] as StateLaws | undefined;

  if (!stateData) {
    return {
      status: 'issues_found',
      violations: [{
        type: 'minimum_wage',
        severity: 'warning',
        description: `State "${stateCode}" is not yet in our database. Analysis was performed using federal rules only.`,
        estimatedLoss: 0,
        lawReference: federal.lawReference,
      }],
      totalEstimatedLoss: 0,
      summary: 'Analysis limited to federal rules.',
      state: stateCode,
      stateName: stateCode,
    };
  }

  const effectiveMinWage = Math.max(
    ('effectiveMinimum' in stateData ? (stateData as { effectiveMinimum: number }).effectiveMinimum : stateData.minimumWage),
    federal.minimumWage
  );
  const payPeriodDays = getPayPeriodDays(data);
  const isSingleWorkweek = payPeriodDays !== undefined && payPeriodDays <= 7;

  for (const warning of extractionWarnings) {
    violations.push({
      type: 'data_quality',
      severity: 'warning',
      description: warning,
      estimatedLoss: 0,
      lawReference: '',
    });
  }

  if (payPeriodDays !== undefined
    && payPeriodDays > 7
    && data.hoursWorked !== undefined
    && data.hoursWorked > 0) {
    violations.push({
      type: 'data_quality',
      severity: 'warning',
      description: `This statement spans ${payPeriodDays} calendar days and reports only ${data.hoursWorked} total hours. Overtime is measured by workweek, so total overtime cannot be calculated reliably without a weekly hours breakdown.`,
      estimatedLoss: 0,
      lawReference: federal.lawReference,
    });
  }

  // 1. Minimum Wage Check
  if (data.hourlyRate !== undefined && data.hourlyRate > 0) {
    // Check if tipped employee
    const isTipped = data.tips !== undefined && data.tips > 0;
    
    if (isTipped && stateData.tipCredit.allowed) {
      const effectiveCashWage = stateData.tipCredit.minimumCashWage;
      if (data.hourlyRate < effectiveCashWage) {
        const hoursWorked = data.hoursWorked || 0;
        const shortfall = effectiveCashWage - data.hourlyRate;
        violations.push({
          type: 'minimum_wage',
          severity: 'critical',
          description: `Your cash wage of $${data.hourlyRate.toFixed(2)}/hr is below the minimum tipped wage of $${effectiveCashWage.toFixed(2)}/hr in ${stateData.name}. Even with tip credit, your employer must pay at least $${effectiveCashWage.toFixed(2)}/hr in cash wages.`,
          estimatedLoss: shortfall * hoursWorked,
          lawReference: stateData.lawReference,
        });
      }
      // Check if tips + cash wage meet full minimum
      if (data.hoursWorked && data.hoursWorked > 0) {
        const totalHourlyWithTips = data.hourlyRate + ((data.tips || 0) / data.hoursWorked);
        if (totalHourlyWithTips < effectiveMinWage) {
          const shortfall = effectiveMinWage - totalHourlyWithTips;
          violations.push({
            type: 'tip_credit',
            severity: 'critical',
            description: `Your combined cash wage ($${data.hourlyRate.toFixed(2)}/hr) plus tips ($${((data.tips || 0) / data.hoursWorked).toFixed(2)}/hr average) totals $${totalHourlyWithTips.toFixed(2)}/hr — below the $${effectiveMinWage.toFixed(2)}/hr minimum wage. Your employer must make up the difference.`,
            estimatedLoss: shortfall * data.hoursWorked,
            lawReference: stateData.lawReference,
          });
        }
      }
    } else if (isTipped && !stateData.tipCredit.allowed) {
      // State doesn't allow tip credit
      if (data.hourlyRate < effectiveMinWage) {
        const hoursWorked = data.hoursWorked || 0;
        const shortfall = effectiveMinWage - data.hourlyRate;
        violations.push({
          type: 'tip_credit',
          severity: 'critical',
          description: `${stateData.name} does NOT allow tip credits. Your employer must pay the full minimum wage of $${effectiveMinWage.toFixed(2)}/hr regardless of tips received. You're being paid $${data.hourlyRate.toFixed(2)}/hr.`,
          estimatedLoss: shortfall * hoursWorked,
          lawReference: stateData.lawReference,
        });
      }
    } else {
      // Non-tipped employee
      if (data.hourlyRate < effectiveMinWage) {
        const hoursWorked = data.hoursWorked || 0;
        const shortfall = effectiveMinWage - data.hourlyRate;
        violations.push({
          type: 'minimum_wage',
          severity: 'critical',
          description: `Your hourly rate of $${data.hourlyRate.toFixed(2)}/hr is below the minimum wage of $${effectiveMinWage.toFixed(2)}/hr in ${stateData.name}.`,
          estimatedLoss: shortfall * hoursWorked,
          lawReference: stateData.lawReference,
        });
      }
    }
  }

  // 2. Overtime Check
  if (isSingleWorkweek && data.hoursWorked !== undefined && data.hoursWorked > 0 && data.hourlyRate !== undefined) {
    const otThreshold = stateData.overtimeThreshold || federal.overtimeThreshold;
    const otMultiplier = stateData.overtimeMultiplier || federal.overtimeMultiplier;
    
    if (data.hoursWorked > otThreshold) {
      const expectedOTHours = data.hoursWorked - otThreshold;
      const expectedOTRate = data.hourlyRate * otMultiplier;
      
      if (data.overtimeHours !== undefined && data.overtimeHours >= 0) {
        // Check if OT hours were reported correctly
        if (data.overtimeHours < expectedOTHours * 0.95) {
          const missingOTHours = expectedOTHours - data.overtimeHours;
          const lostPay = missingOTHours * (expectedOTRate - data.hourlyRate);
          violations.push({
            type: 'overtime',
            severity: 'critical',
            description: `You worked ${data.hoursWorked} hours but only ${data.overtimeHours} overtime hours were recorded. You should have ${expectedOTHours.toFixed(1)} overtime hours (anything over ${otThreshold} hours). Missing ${missingOTHours.toFixed(1)} OT hours.`,
            estimatedLoss: lostPay,
            lawReference: stateData.lawReference,
          });
        }
        
        // Check if OT rate is correct
        if (data.overtimeRate !== undefined && data.overtimeRate > 0 && data.overtimeRate < expectedOTRate * 0.95) {
          const rateDiff = expectedOTRate - data.overtimeRate;
          const otHours = data.overtimeHours || expectedOTHours;
          violations.push({
            type: 'overtime',
            severity: 'critical',
            description: `Your overtime rate is $${data.overtimeRate.toFixed(2)}/hr but should be at least $${expectedOTRate.toFixed(2)}/hr (${otMultiplier}x your regular rate of $${data.hourlyRate.toFixed(2)}/hr).`,
            estimatedLoss: rateDiff * otHours,
            lawReference: stateData.lawReference,
          });
        }
      } else if (data.overtimeHours === undefined) {
        // No OT hours reported but hours exceed threshold
        const expectedOTPay = expectedOTHours * (expectedOTRate - data.hourlyRate);
        violations.push({
          type: 'overtime',
          severity: 'violation',
          description: `You worked ${data.hoursWorked} hours (over the ${otThreshold}-hour threshold) but no overtime hours were reported on your pay stub. You may be owed overtime pay at $${expectedOTRate.toFixed(2)}/hr for ${expectedOTHours.toFixed(1)} hours.`,
          estimatedLoss: expectedOTPay,
          lawReference: stateData.lawReference,
        });
      }
    }
  }

  // Aggregate pay-period hours cannot establish shift-level meal or rest break violations.
  if (payPeriodDays === 1 && stateData.mealBreak.required && data.hoursWorked) {
    const afterHours = 'afterHours' in stateData.mealBreak ? (stateData.mealBreak as { afterHours: number }).afterHours : 6;
    if (data.hoursWorked > afterHours) {
      // Check deductions for meal break
      const hasBreakDeduction = data.deductions?.some(d => 
        d.name.toLowerCase().includes('meal') || d.name.toLowerCase().includes('lunch') || d.name.toLowerCase().includes('break')
      );
      
      if (!hasBreakDeduction) {
        violations.push({
          type: 'meal_break',
          severity: 'warning',
          description: `${stateData.name} requires a meal break for shifts over ${afterHours} hours. Your shift was ${data.hoursWorked} hours. We couldn't find a meal break deduction — if you weren't provided a meal break, you may be owed a penalty (typically 1 hour of additional pay).`,
          estimatedLoss: 0,
          lawReference: stateData.lawReference,
        });
      }
    }
  }

  // 4. Rest Break Check
  if (payPeriodDays === 1 && stateData.restBreak.required && data.hoursWorked) {
    const every = 'every' in stateData.restBreak ? (stateData.restBreak as { every: number }).every : 4;
    const requiredBreaks = Math.floor(data.hoursWorked / every);
    if (requiredBreaks > 0) {
      violations.push({
        type: 'rest_break',
        severity: 'warning',
        description: `${stateData.name} requires a paid rest break every ${every} hours. For your ${data.hoursWorked}-hour shift, you should have received ${requiredBreaks} rest break(s). If you weren't provided rest breaks, you may be owed additional pay.`,
        estimatedLoss: 0,
        lawReference: stateData.lawReference,
      });
    }
  }

  // 5. Gross pay verification
  if (data.grossPay && data.hourlyRate && data.hoursWorked) {
    const threshold = stateData.overtimeThreshold || 40;
    const canReconcileGross = data.overtimeHours !== undefined || isSingleWorkweek;
    const otHours = data.overtimeHours ?? Math.max(0, data.hoursWorked - threshold);
    const regularHours = Math.max(0, data.hoursWorked - otHours);
    const otRate = data.overtimeRate || (data.hourlyRate * (stateData.overtimeMultiplier || 1.5));
    const expectedGross = (regularHours * data.hourlyRate) + (otHours * otRate) + (data.tips || 0);
    
    const diff = expectedGross - data.grossPay;
    if (canReconcileGross && diff > Math.max(1, expectedGross * 0.01)) {
      violations.push({
        type: 'pay_discrepancy',
        severity: 'warning',
        description: `Your gross pay of $${data.grossPay.toFixed(2)} appears to be $${diff.toFixed(2)} less than expected based on your hours and rate ($${expectedGross.toFixed(2)} expected). This could indicate missing hours, incorrect pay rate, or unauthorized deductions.`,
        estimatedLoss: 0,
        lawReference: stateData.lawReference,
      });
    }
  }

  const issueCount = violations.filter(v => v.severity !== 'warning').length;
  const warningCount = violations.length - issueCount;
  const totalLoss = violations
    .filter(v => v.severity !== 'warning')
    .reduce((sum, v) => sum + v.estimatedLoss, 0);

  let summary: string;
  if (violations.length === 0) {
    summary = `Based on our analysis of your pay stub against ${stateData.name} labor laws, your pay appears to be correct. No violations detected.`;
  } else if (issueCount === 0) {
    summary = `We could not calculate a reliable underpayment estimate. Review ${warningCount === 1 ? 'the highlighted data note' : `the ${warningCount} highlighted data notes`} before relying on this analysis.`;
  } else {
    const critical = violations.filter(v => v.severity === 'critical').length;
    summary = `We found ${issueCount} potential issue${issueCount > 1 ? 's' : ''} with your pay${critical > 0 ? ` (${critical} critical)` : ''}${warningCount > 0 ? ` and ${warningCount} review note${warningCount > 1 ? 's' : ''}` : ''}. Estimated underpayment: $${totalLoss.toFixed(2)}.`;
  }

  return {
    status: violations.length === 0 ? 'clean' : issueCount > 0 ? 'issues_found' : 'needs_review',
    violations,
    totalEstimatedLoss: totalLoss,
    summary,
    state: stateCode,
    stateName: stateData.name,
  };
}

export function getStateList(): { code: string; name: string; minimumWage: number }[] {
  return Object.entries(laborLawsData.states).map(([code, data]) => ({
    code,
    name: data.name,
    minimumWage: 'effectiveMinimum' in data ? (data as { effectiveMinimum: number }).effectiveMinimum : data.minimumWage,
  })).sort((a, b) => a.name.localeCompare(b.name));
}
