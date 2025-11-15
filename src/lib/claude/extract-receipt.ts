import { anthropic, MODELS } from '@/lib/anthropic';
import { retryWithTimeout, logError } from '@/lib/utils/error-handling';

export interface ReceiptData {
  merchant: string;
  date: string;
  total: number;
  currency: string;
  items: Array<{
    name: string;
    price: number;
    quantity: number;
  }>;
  confidence: number;
}

/**
 * Extract structured data from receipt OCR text using Claude
 * Now with timeout and retry logic for reliability
 */
export async function extractReceiptData(
  ocrText: string
): Promise<ReceiptData> {
  try {
    const message = await retryWithTimeout(
      () => anthropic.messages.create({
        model: MODELS.SONNET,
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: `You are a receipt data extraction expert. Extract structured data from this receipt OCR text.

OCR Text:
${ocrText}

Return a JSON object with this exact structure:
{
  "merchant": "store name",
  "date": "YYYY-MM-DD",
  "total": 0.00,
  "currency": "USD",
  "items": [
    {"name": "item name", "price": 0.00, "quantity": 1}
  ],
  "confidence": 0.95
}

Rules:
- merchant: Identify the store name (e.g., "Target", "Walmart", "Amazon")
- date: Extract purchase date in ISO format (YYYY-MM-DD)
- total: Final total amount paid (as a number)
- currency: Default to "USD" unless specified
- items: List all purchased items with prices (be thorough)
- confidence: Your confidence in the extraction (0-1)

Return ONLY the JSON object, no explanation or markdown.`,
          },
        ],
      }),
      {
        maxRetries: 3,
        baseDelay: 1000,
        timeoutMs: 30000, // 30 second timeout
        onRetry: (attempt, error) => {
          console.log(`Retrying receipt extraction (attempt ${attempt}): ${error.message}`);
        }
      }
    );

    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    // Parse the JSON response
    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not extract JSON from Claude response');
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    logError(error, 'extractReceiptData');
    if (shouldFallbackToLocalParser(error)) {
      console.warn('Falling back to basic receipt parser due to Anthropic auth failure.');
      return basicReceiptParser(ocrText);
    }
    throw new Error('Failed to extract receipt data. Please try again or check the image quality.');
  }
}

function shouldFallbackToLocalParser(error: unknown) {
  if (!error) return false;
  const message = typeof error === 'string' ? error : (error as Error)?.message || '';
  const status = (error as any)?.status;
  if (status === 401) return true;
  return /x-api-key|authentication_error|api key|unauthorized/i.test(message);
}

function basicReceiptParser(rawText: string): ReceiptData {
  const lines = rawText
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const merchant = lines[0]?.slice(0, 80) || 'Unknown Merchant';
  const date = extractDate(rawText);
  const total = extractTotal(lines);
  const items = extractItems(lines, total);

  return {
    merchant,
    date,
    total,
    currency: 'USD',
    items,
    confidence: 0.45,
  };
}

function extractDate(text: string) {
  const dateRegex =
    /(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})|(\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2})/;
  const match = text.match(dateRegex);
  if (!match) {
    return new Date().toISOString().split('T')[0];
  }

  const raw = match[0].replace(/\./g, '/');
  const parts = raw.includes('-') ? raw.split('-') : raw.split('/');
  if (parts[0].length === 4) {
    // YYYY/MM/DD
    const [year, month, day] = parts.map((p) => p.padStart(2, '0'));
    return `${year}-${month}-${day}`;
  }

  // Assume MM/DD/YYYY or MM/DD/YY
  let [month, day, year] = parts;
  if (year.length === 2) {
    year = `20${year}`;
  }
  return `${year.padStart(4, '0')}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

function extractTotal(lines: string[]) {
  const totalLine = lines.find((line) => /total/i.test(line));
  const amounts = lines
    .map((line) => extractAmount(line))
    .filter((value): value is number => value !== null && value > 0);

  if (totalLine) {
    const totalFromLine = extractAmount(totalLine);
    if (totalFromLine) {
      return totalFromLine;
    }
  }

  if (amounts.length > 0) {
    return amounts.sort((a, b) => b - a)[0];
  }

  return 0;
}

function extractItems(lines: string[], total: number) {
  const items = lines
    .filter((line) => !/subtotal|total|tax|payment|change/i.test(line))
    .map((line) => {
      const amount = extractAmount(line);
      if (!amount) return null;
      const name = line.replace(/\$?\d+[\d,]*(\.\d{2})?.*$/, '').trim();
      return {
        name: name || 'Item',
        price: amount,
        quantity: 1,
      };
    })
    .filter((item): item is { name: string; price: number; quantity: number } => !!item);

  if (items.length === 0) {
    return [
      {
        name: 'Receipt total',
        price: total,
        quantity: 1,
      },
    ];
  }

  return items.slice(0, 20);
}

function extractAmount(line: string): number | null {
  const match = line.match(/(\d{1,4}(?:,\d{3})*(?:\.\d{2})|\d+\.\d{2})/);
  if (!match) return null;
  const value = parseFloat(match[1].replace(/,/g, ''));
  return isNaN(value) ? null : value;
}
