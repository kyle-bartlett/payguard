import { NextRequest, NextResponse } from 'next/server';
import { analyzePayStub } from '@/lib/analysis';
import { AnalysisRequestError, extractPayStatement } from '@/lib/pay-statement-analysis';

export const runtime = 'nodejs';
export const maxDuration = 60;

const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const requestLog = new Map<string, number[]>();

function getClientIp(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown';
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (requestLog.get(ip) ?? []).filter((time) => now - time < RATE_WINDOW_MS);
  if (recent.length >= RATE_LIMIT) {
    requestLog.set(ip, recent);
    return true;
  }
  requestLog.set(ip, [...recent, now]);
  return false;
}

export async function POST(request: NextRequest) {
  try {
    if (isRateLimited(getClientIp(request))) {
      return NextResponse.json(
        { error: 'Too many analyses. Please wait a few minutes and try again.' },
        { status: 429 },
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Live analysis is not configured yet. Please use the Demo button for now.' },
        { status: 503 },
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const state = formData.get('state') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }
    if (!state) {
      return NextResponse.json({ error: 'State is required' }, { status: 400 });
    }

    const { extractedData, confidence } = await extractPayStatement(file, apiKey);
    const hasKeyData = extractedData.hourlyRate || extractedData.grossPay || extractedData.hoursWorked;
    if (!hasKeyData) {
      return NextResponse.json(
        { error: 'We could not find hours, a pay rate, or gross pay. Try a clearer image or the original PDF.' },
        { status: 422 },
      );
    }

    const analysisResult = analyzePayStub(extractedData, state);

    return NextResponse.json({
      ...analysisResult,
      extractedData,
      extractionConfidence: confidence,
      source: 'live',
    });
  } catch (error) {
    console.error('Analysis error:', error);
    if (error instanceof AnalysisRequestError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
