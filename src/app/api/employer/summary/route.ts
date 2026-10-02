import { NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import { getPrisma } from '@/lib/prisma';
import { getEmployerSummary } from '@/lib/pay-stub-store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getCurrentSession();
    if (!session) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });

    const summary = await getEmployerSummary(getPrisma(), session.userId);
    if (!summary) return NextResponse.json({ error: 'Employer account not found.' }, { status: 404 });
    return NextResponse.json(summary);
  } catch (error) {
    console.error('Summary error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ error: 'We could not load your dashboard.' }, { status: 500 });
  }
}
