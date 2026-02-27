import { NextRequest, NextResponse } from 'next/server';
import { analyzePayStub, PayStubData } from '@/lib/analysis';
import { parsePayStubText } from '@/lib/ocr';
import Tesseract from 'tesseract.js';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const state = formData.get('state') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }
    if (!state) {
      return NextResponse.json({ error: 'State is required' }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');
    const dataUrl = `data:${file.type};base64,${base64}`;

    // Run OCR
    let ocrText: string;
    try {
      const result = await Tesseract.recognize(dataUrl, 'eng', {
        logger: () => {}, // silence logging
      });
      ocrText = result.data.text;
    } catch (ocrError) {
      console.error('OCR Error:', ocrError);
      return NextResponse.json(
        { error: 'Failed to read text from image. Please try a clearer photo.' },
        { status: 422 }
      );
    }

    if (!ocrText || ocrText.trim().length < 10) {
      return NextResponse.json(
        { error: 'Could not extract enough text from the image. Please try a clearer, well-lit photo.' },
        { status: 422 }
      );
    }

    // Parse OCR text into structured data
    const extractedData: PayStubData = parsePayStubText(ocrText);

    // If we couldn't extract key fields, provide manual entry hint
    const hasKeyData = extractedData.hourlyRate || extractedData.grossPay || extractedData.hoursWorked;
    if (!hasKeyData) {
      // Still run analysis with what we have, but note the limitation
      extractedData.hoursWorked = extractedData.hoursWorked || 0;
      extractedData.hourlyRate = extractedData.hourlyRate || 0;
    }

    // Run analysis
    const analysisResult = analyzePayStub(extractedData, state);

    return NextResponse.json({
      ...analysisResult,
      extractedData,
      ocrConfidence: ocrText.length > 50 ? 'high' : 'low',
      rawTextLength: ocrText.length,
    });
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
