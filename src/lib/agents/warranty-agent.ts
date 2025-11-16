import { BaseAgent } from './base-agent';
import { AgentConfig } from './types';
import {
  webSearchTool,
  webScrapeTool,
  databaseQueryTool,
  databaseUpdateTool,
} from './tools';
import { warrantyLookupTool } from './tools/warranty-lookup';

/**
 * Warranty Agent with Personality
 * A friendly, empathetic agent that helps users track warranties and file claims.
 *
 * Personality Traits:
 * - Empathetic when products break
 * - Proactive about expiring warranties
 * - Helpful and patient with claim processes
 * - Celebrates when coverage saves money
 */
export class WarrantyAgent extends BaseAgent {
  constructor() {
    const config: AgentConfig = {
      name: 'warranty_guardian',
      description: 'Friendly warranty tracking and claims assistant',
      systemPrompt: `You are the Warranty Guardian - a friendly, empathetic AI assistant who helps people navigate warranties and product protection.

## Your Personality
- **Empathetic**: When someone's product breaks, acknowledge their frustration. "Oh no, that's really frustrating! Let me see if we can get this covered."
- **Proactive**: Alert users before warranties expire. "Hey! Your MacBook's warranty expires in 30 days - let me help you document everything now, just in case."
- **Patient & Supportive**: Filing claims can be stressful. Guide users step-by-step with encouragement.
- **Celebratory**: When coverage saves money, celebrate with them! "Great news! Your TV is covered - we just saved you $800!"
- **Honest**: If something isn't covered, be clear but helpful. "Unfortunately, this isn't covered, but here's what we can do..."

## Your Capabilities
1. **Track Warranties**: Find and monitor warranty information for purchases
2. **Scrape Warranty Terms**: Search manufacturer websites for coverage details
3. **Calculate Coverage**: Determine if products are still under warranty
4. **File Claims**: Help users file warranty claims with manufacturers
5. **Provide Guidance**: Explain what's covered and what documentation is needed

## How to Communicate
- Use conversational, friendly language (not corporate-speak)
- Add personality: "Let's get your money back!" not "I will process your claim"
- Show empathy: "I know dealing with broken products is stressful..."
- Be clear about next steps: "Here's exactly what we need to do..."
- Celebrate wins: "We got it covered! 🎉"

## When Processing Warranties
For each product:
1. Search for warranty information (manufacturer website, retailer policy)
2. Determine warranty duration (usually 1 year for electronics, varies by category)
3. Calculate warranty end date from purchase date
4. Check current status (covered, expiring soon, expired)
5. If filing a claim, find the claim process and required documents

## Response Format
Always return JSON with these fields:
{
  "product_name": "MacBook Pro 14\\"",
  "manufacturer": "Apple",
  "retailer": "Apple Store",
  "purchase_date": "2024-11-15",
  "warranty_duration_months": 12,
  "warranty_end_date": "2025-11-15",
  "days_remaining": 365,
  "status": "covered|expiring_soon|expired",
  "coverage_type": "manufacturer|extended|store",
  "coverage_details": "1-year limited hardware warranty covering defects",
  "claim_process": {
    "url": "https://...",
    "phone": "1-800-...",
    "required_documents": ["Receipt", "Serial number", "Photos of issue"],
    "estimated_time": "3-5 business days"
  },
  "agent_message": "Your empathetic, friendly message here",
  "next_steps": ["Step 1", "Step 2"]
}

Remember: You're not just tracking warranties - you're helping people get peace of mind about their purchases!`,
      maxIterations: 8,
      temperature: 0.7, // Higher temperature for more personality
    };

    super(config);

    // Register tools
    this.addTools([
      webSearchTool,
      webScrapeTool,
      warrantyLookupTool,
      databaseQueryTool,
      databaseUpdateTool,
    ]);
  }

  /**
   * Extract and track warranty from a purchase
   */
  async extractWarranty(
    purchase: {
      id: string;
      merchant: string;
      purchaseDate: string;
      items: Array<{
        name: string;
        price: number;
        category?: string;
      }>;
    },
    userId: string
  ): Promise<any> {
    const result = await this.execute({
      prompt: `Help me track the warranty for this purchase.

Purchase Details:
- Merchant: ${purchase.merchant}
- Purchase Date: ${purchase.purchaseDate}
- Items: ${JSON.stringify(purchase.items)}

Please:
1. For each item, look up warranty information
2. Determine warranty duration (search manufacturer websites if needed)
3. Calculate warranty end dates
4. Provide a friendly summary with next steps
5. Save warranty data to database

Be warm and helpful in your response!`,
      context: {
        purchaseId: purchase.id,
        userId,
        purchase,
      },
    });

    return result;
  }

  /**
   * Check warranty status for a product
   */
  async checkWarrantyStatus(
    productId: string,
    userId: string
  ): Promise<any> {
    const result = await this.execute({
      prompt: `Check the warranty status for product ${productId}.

Please:
1. Query the database for the product details
2. Check current warranty status (covered, expiring soon, expired)
3. If expiring soon, be proactive with recommendations
4. If expired, offer helpful alternatives
5. Provide a friendly, clear summary

Remember to be empathetic and supportive!`,
      context: {
        productId,
        userId,
      },
    });

    return result;
  }

  /**
   * Help file a warranty claim
   */
  async fileWarrantyClaim(
    productId: string,
    issueDescription: string,
    userId: string
  ): Promise<any> {
    const result = await this.execute({
      prompt: `Help the user file a warranty claim for product ${productId}.

Issue: ${issueDescription}

Please:
1. Query the database for product and warranty details
2. Check if the issue is covered under warranty
3. Search for the claim filing process (manufacturer website)
4. List required documents and steps
5. Provide encouraging, step-by-step guidance

Be patient and supportive - filing claims can be stressful!

Return detailed claim instructions in JSON format.`,
      context: {
        productId,
        issueDescription,
        userId,
      },
    });

    return result;
  }

  /**
   * Get warranty reminders for expiring coverage
   */
  async getExpiringWarranties(userId: string, daysThreshold: number = 60): Promise<any> {
    const result = await this.execute({
      prompt: `Find all warranties expiring in the next ${daysThreshold} days for user ${userId}.

Please:
1. Query the database for user's warranties
2. Calculate days remaining for each
3. Filter for those expiring within ${daysThreshold} days
4. Provide proactive, friendly reminders
5. Suggest actions to take before expiration

Be proactive and helpful - remind them before it's too late!

Return a list of expiring warranties with friendly reminders.`,
      context: {
        userId,
        daysThreshold,
      },
    });

    return result;
  }

  /**
   * Analyze all warranties for a user
   */
  async analyzeAllWarranties(userId: string): Promise<any> {
    const result = await this.execute({
      prompt: `Analyze all warranties for user ${userId} and provide a comprehensive overview.

Please:
1. Query all warranties from database
2. Categorize by status (covered, expiring soon, expired)
3. Calculate total coverage value
4. Identify actionable items (expiring soon, claim opportunities)
5. Provide a friendly, comprehensive summary

Be encouraging and highlight the value of their coverage!

Return comprehensive warranty analysis in JSON format.`,
      context: {
        userId,
      },
    });

    return result;
  }
}

/**
 * Create and export a singleton instance
 */
export const warrantyAgent = new WarrantyAgent();
