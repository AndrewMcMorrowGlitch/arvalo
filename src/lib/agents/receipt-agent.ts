import { BaseAgent } from './base-agent';
import { AgentConfig } from './types';
import { webSearchTool, webScrapeTool, databaseQueryTool } from './tools';
import { extractTextFromImage } from '@/lib/claude/ocr';

/**
 * Receipt Processing Agent
 * Autonomously processes receipt images with multi-step reasoning:
 * 1. Extract text from receipt image
 * 2. Parse structured data (merchant, items, prices)
 * 3. Identify merchant website
 * 4. Cross-reference with existing purchases
 * 5. Auto-categorize items
 * 6. Detect price match opportunities
 */
export class ReceiptAgent extends BaseAgent {
  constructor() {
    const config: AgentConfig = {
      name: 'receipt_processor',
      description: 'Intelligent receipt processing and analysis agent',
      systemPrompt: `You are an expert receipt processing assistant. Your job is to:

1. Analyze receipt data to extract structured information
2. Identify the merchant and find their website/return policy
3. Cross-reference with the user's purchase history to detect duplicates
4. Categorize items intelligently
5. Detect potential price match opportunities by checking if items are available cheaper elsewhere
6. Provide actionable recommendations

When processing a receipt:
- Be thorough in extracting all relevant details
- Use web search to find merchant information if needed
- Query the database to check for existing purchases
- Look for price match opportunities within the return/price-match window
- Provide clear, actionable recommendations

Always return your final analysis in JSON format with these fields:
{
  "merchant": "Store Name",
  "merchant_website": "https://...",
  "purchase_date": "YYYY-MM-DD",
  "total_amount": 99.99,
  "items": [
    {
      "name": "Product Name",
      "price": 49.99,
      "category": "Electronics",
      "price_match_opportunity": false
    }
  ],
  "duplicate_purchase": false,
  "recommendations": [
    "Action items for the user"
  ]
}`,
      maxIterations: 8,
      temperature: 0.5,
    };

    super(config);

    // Register tools
    this.addTools([webSearchTool, webScrapeTool, databaseQueryTool]);
  }

  /**
   * Process a receipt image
   */
  async processReceipt(
    imageData: string,
    mimeType: string,
    userId: string
  ): Promise<any> {
    // First, extract text from the image using OCR
    console.log('[ReceiptAgent] Extracting text from receipt image...');
    const receiptText = await extractTextFromImage(imageData, mimeType);

    // Now let the agent process the extracted text
    const result = await this.execute({
      prompt: `Analyze this receipt and provide comprehensive information about the purchase.

Receipt Text:
${receiptText}

Please:
1. Extract merchant name, date, items, and prices
2. Find the merchant's website
3. Check if this purchase already exists in the database
4. Categorize the items
5. Check if there are any price match opportunities
6. Provide recommendations

Return the analysis in the specified JSON format.`,
      context: {
        userId,
        receiptText,
      },
    });

    return result;
  }
}

/**
 * Create and export a singleton instance
 */
export const receiptAgent = new ReceiptAgent();
