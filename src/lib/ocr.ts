import { PayStubData } from './analysis';

// Parse OCR text to extract pay stub data
export function parsePayStubText(text: string): PayStubData {
  const data: PayStubData = {};
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const fullText = text.toLowerCase();

  // Extract employer name (usually first few lines, largest text)
  const namePatterns = [
    /^([A-Z][A-Za-z\s&',.-]+(?:Inc|LLC|Corp|Co|Ltd|Company|Restaurant|Hotel|Store|Shop|Services)?\.?)/m,
  ];
  for (const pattern of namePatterns) {
    const match = text.match(pattern);
    if (match && match[1].length > 2 && match[1].length < 80) {
      data.employerName = match[1].trim();
      break;
    }
  }

  // Extract pay period
  const datePattern = /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/g;
  const dates = text.match(datePattern);
  if (dates && dates.length >= 2) {
    data.payPeriodStart = dates[0];
    data.payPeriodEnd = dates[1];
  } else if (dates && dates.length === 1) {
    data.payPeriodEnd = dates[0];
  }

  // Extract hours worked
  const hoursPatterns = [
    /(?:regular|reg|total)\s*(?:hours|hrs|hr)\s*[:\s]*(\d+\.?\d*)/i,
    /(?:hours|hrs)\s*(?:worked|regular)?\s*[:\s]*(\d+\.?\d*)/i,
    /(\d+\.?\d*)\s*(?:regular\s*)?(?:hours|hrs)/i,
  ];
  for (const pattern of hoursPatterns) {
    const match = fullText.match(pattern);
    if (match) {
      const hours = parseFloat(match[1]);
      if (hours > 0 && hours <= 200) { // sanity check
        data.hoursWorked = hours;
        break;
      }
    }
  }

  // Extract hourly rate
  const ratePatterns = [
    /(?:rate|hourly|pay\s*rate|reg\s*rate)\s*[:\s]*\$?\s*(\d+\.?\d*)/i,
    /\$\s*(\d+\.?\d*)\s*[\/\\]\s*(?:hr|hour)/i,
    /(\d+\.?\d*)\s*(?:per\s*hour|\/\s*hr|\/\s*hour)/i,
  ];
  for (const pattern of ratePatterns) {
    const match = fullText.match(pattern);
    if (match) {
      const rate = parseFloat(match[1]);
      if (rate > 0 && rate < 500) {
        data.hourlyRate = rate;
        break;
      }
    }
  }

  // Extract overtime hours
  const otHoursPatterns = [
    /(?:overtime|ot|over\s*time)\s*(?:hours|hrs|hr)\s*[:\s]*(\d+\.?\d*)/i,
    /(\d+\.?\d*)\s*(?:overtime|ot)\s*(?:hours|hrs)/i,
  ];
  for (const pattern of otHoursPatterns) {
    const match = fullText.match(pattern);
    if (match) {
      const otHours = parseFloat(match[1]);
      if (otHours >= 0 && otHours <= 100) {
        data.overtimeHours = otHours;
        break;
      }
    }
  }

  // Extract overtime rate
  const otRatePatterns = [
    /(?:overtime|ot)\s*(?:rate)\s*[:\s]*\$?\s*(\d+\.?\d*)/i,
    /ot\s*@?\s*\$?\s*(\d+\.?\d*)/i,
  ];
  for (const pattern of otRatePatterns) {
    const match = fullText.match(pattern);
    if (match) {
      const otRate = parseFloat(match[1]);
      if (otRate > 0 && otRate < 750) {
        data.overtimeRate = otRate;
        break;
      }
    }
  }

  // Extract tips
  const tipPatterns = [
    /(?:tips?|gratuity|gratuities)\s*[:\s]*\$?\s*(\d+\.?\d*)/i,
  ];
  for (const pattern of tipPatterns) {
    const match = fullText.match(pattern);
    if (match) {
      data.tips = parseFloat(match[1]);
      break;
    }
  }

  // Extract gross pay
  const grossPatterns = [
    /(?:gross\s*(?:pay|earnings|amount|total)|total\s*(?:gross|earnings))\s*[:\s]*\$?\s*(\d+[,]?\d*\.?\d*)/i,
    /gross\s*[:\s]*\$?\s*(\d+[,]?\d*\.?\d*)/i,
  ];
  for (const pattern of grossPatterns) {
    const match = fullText.match(pattern);
    if (match) {
      data.grossPay = parseFloat(match[1].replace(/,/g, ''));
      break;
    }
  }

  // Extract net pay
  const netPatterns = [
    /(?:net\s*(?:pay|amount|total)|take\s*home|total\s*net)\s*[:\s]*\$?\s*(\d+[,]?\d*\.?\d*)/i,
    /net\s*[:\s]*\$?\s*(\d+[,]?\d*\.?\d*)/i,
  ];
  for (const pattern of netPatterns) {
    const match = fullText.match(pattern);
    if (match) {
      data.netPay = parseFloat(match[1].replace(/,/g, ''));
      break;
    }
  }

  // Extract deductions
  const deductions: { name: string; amount: number }[] = [];
  const deductionPatterns = [
    /(?:federal\s*(?:tax|w\/h|withholding))\s*[:\s]*\$?\s*-?\s*(\d+\.?\d*)/gi,
    /(?:state\s*(?:tax|w\/h|withholding))\s*[:\s]*\$?\s*-?\s*(\d+\.?\d*)/gi,
    /(?:fica|social\s*security|ss\s*tax)\s*[:\s]*\$?\s*-?\s*(\d+\.?\d*)/gi,
    /(?:medicare|med\s*tax)\s*[:\s]*\$?\s*-?\s*(\d+\.?\d*)/gi,
    /(?:health\s*(?:insurance|ins)|medical|dental|vision)\s*[:\s]*\$?\s*-?\s*(\d+\.?\d*)/gi,
    /(?:401k|retirement|pension)\s*[:\s]*\$?\s*-?\s*(\d+\.?\d*)/gi,
  ];

  const deductionNames = ['Federal Tax', 'State Tax', 'Social Security', 'Medicare', 'Health Insurance', '401k/Retirement'];
  deductionPatterns.forEach((pattern, i) => {
    const match = fullText.match(pattern);
    if (match) {
      const amount = parseFloat(match[0].match(/(\d+\.?\d*)$/)?.[1] || '0');
      if (amount > 0) {
        deductions.push({ name: deductionNames[i], amount });
      }
    }
  });

  if (deductions.length > 0) {
    data.deductions = deductions;
  }

  return data;
}
