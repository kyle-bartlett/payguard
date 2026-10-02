import { NextRequest, NextResponse } from 'next/server';
import { analyzePayStub, getStateList } from '@/lib/analysis';
import { getClientIp, getCurrentSession, isAuthRateLimited } from '@/lib/auth';
import { getPrisma } from '@/lib/prisma';
import { savePayStubAnalysis } from '@/lib/pay-stub-store';
import { AnalysisRequestError, extractPayStatement } from '@/lib/pay-statement-analysis';

export const runtime = 'nodejs';
export const maxDuration = 60;

const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 10 * 60 * 1000;

export async function POST(request: NextRequest) {
  try {
    if (isAuthRateLimited(`analyze:${getClientIp(request)}`, RATE_LIMIT, RATE_WINDOW_MS)) {
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

    const formData = await request.formData().catch(() => null);
    if (!formData) {
      return NextResponse.json({ error: 'Invalid upload request.' }, { status: 400 });
    }
    const file = formData.get('file');
    const state = formData.get('state');

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }
    if (typeof state !== 'string' || !state) {
      return NextResponse.json({ error: 'State is required' }, { status: 400 });
    }
    if (!getStateList().some((known) => known.code === state)) {
      return NextResponse.json({ error: 'Unsupported state.' }, { status: 400 });
    }

    const { extractedData, confidence, extractionWarnings } = await extractPayStatement(file, apiKey);
    const hasKeyData = extractedData.hourlyRate || extractedData.grossPay || extractedData.hoursWorked;
    if (!hasKeyData) {
      return NextResponse.json(
        { error: 'We could not find hours, a pay rate, or gross pay. Try a clearer image or the original PDF.' },
        { status: 422 },
      );
    }

    const analysisResult = analyzePayStub(extractedData, state, extractionWarnings);

    let saved = false;
    const session = await getCurrentSession();
    if (session) {
      try {
        await savePayStubAnalysis(getPrisma(), session.userId, extractedData, analysisResult);
        saved = true;
      } catch (saveError) {
        console.error('Save error:', saveError instanceof Error ? saveError.message : 'Unknown error');
      }
    }

    return NextResponse.json({
      ...analysisResult,
      saved,
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
