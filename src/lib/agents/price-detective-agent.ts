import { BaseAgent } from './base-agent';
import { AgentConfig } from './types';
import {
  webSearchTool,
  priceLookupTool,
  databaseQueryTool,
  databaseUpdateTool,
} from './tools';

/**
 * Price Drop Detective Agent
 * Autonomously monitors prices and identifies savings opportunities:
 * 1. Track purchase prices
 * 2. Check current prices periodically
 * 3. Compare across multiple retailers
 * 4. Analyze price history patterns
 * 5. Detect price drops within return/price-match windows
 * 6. Generate price match claim documents
 */
export class PriceDetectiveAgent extends BaseAgent {
  constructor() {
    const config: AgentConfig = {
      name: 'price_detective',
      description: 'Intelligent price monitoring and savings detection agent',
      systemPrompt: `You are an expert price detective and savings finder. Your job is to:

1. Monitor product prices for users' purchases
2. Detect price drops within return or price-match windows
3. Find the same products at competing retailers for better prices
4. Analyze pricing patterns and predict future drops
5. Generate clear price match claims with evidence
6. Provide actionable recommendations for maximum savings

When analyzing prices:
- Check the current price of products from the original purchase
- Search for the same product at competing retailers
- Calculate potential savings
- Verify the user is still within the price-match or return window
- Draft a clear price match request with all required details
- Provide step-by-step instructions for claiming the price match

Always return your final analysis in JSON format with these fields:
{
  "purchase_id": "123",
  "product_name": "Product Name",
  "original_price": 99.99,
  "current_price": 79.99,
  "price_drop": 20.00,
  "price_drop_percentage": 20.1,
  "competitor_prices": [
    {
      "retailer": "Competitor A",
      "price": 75.00,
      "url": "https://..."
    }
  ],
  "best_price": 75.00,
  "best_price_retailer": "Competitor A",
  "within_price_match_window": true,
  "days_remaining": 10,
  "eligible_for_price_match": true,
  "estimated_refund": 24.99,
  "price_match_claim": {
    "subject": "Price Match Request for [Product]",
    "body": "Draft email or claim text",
    "required_documents": ["Receipt", "Competitor URL"]
  },
  "recommendations": ["Action items"]
}`,
      maxIterations: 10,
      temperature: 0.5,
    };

    super(config);

    // Register tools
    this.addTools([
      webSearchTool,
      priceLookupTool,
      databaseQueryTool,
      databaseUpdateTool,
    ]);
  }

  /**
   * Check for price drops on a specific purchase
   */
  async checkPriceDrops(purchaseId: string, userId: string): Promise<any> {
    const result = await this.execute({
      prompt: `Check if there are any price drops or savings opportunities for purchase ID: ${purchaseId}

Please:
1. Query the database to get the purchase details
2. Check the current price of the product
3. Search for the same product at competing retailers
4. Calculate potential savings
5. Verify if still within price-match window (check return policy)
6. If eligible, draft a price match claim
7. Provide clear recommendations

Return the analysis in the specified JSON format.`,
      context: {
        purchaseId,
        userId,
      },
    });

    return result;
  }

  /**
   * Monitor all purchases for a user and detect savings opportunities
   */
  async monitorAllPurchases(userId: string): Promise<any> {
    const result = await this.execute({
      prompt: `Monitor all recent purchases for user ${userId} and identify any price drop opportunities.

Please:
1. Query the database for all purchases in the last 30 days
2. For each purchase with a product URL, check current prices
3. Identify which purchases have price drops
4. Prioritize by potential savings amount
5. Check which are still within price-match windows
6. Generate summary of all opportunities

Return analysis in JSON format with:
{
  "total_purchases_checked": number,
  "opportunities_found": number,
  "total_potential_savings": number,
  "opportunities": [
    {
      "purchase_id": "...",
      "product": "...",
      "savings": number,
      "eligible": true/false,
      "days_remaining": number
    }
  ],
  "prioritized_actions": ["Action 1", "Action 2"]
}`,
      context: {
        userId,
      },
    });

    return result;
  }

  /**
   * Find better prices for a product across retailers
   */
  async findBetterPrices(
    productName: string,
    currentPrice: number,
    currentRetailer: string
  ): Promise<any> {
    const result = await this.execute({
      prompt: `Find better prices for "${productName}" which is currently $${currentPrice} at ${currentRetailer}.

Please:
1. Search for the product at major competing retailers
2. Check current prices at each retailer
3. Compare with the current price
4. Identify the best deal
5. Provide URLs and availability information

Return findings in JSON format with:
{
  "product": "${productName}",
  "current_price": ${currentPrice},
  "current_retailer": "${currentRetailer}",
  "competitors": [
    {
      "retailer": "Name",
      "price": number,
      "url": "https://...",
      "available": true/false,
      "savings": number
    }
  ],
  "best_deal": {
    "retailer": "Name",
    "price": number,
    "savings": number
  }
}`,
      context: {
        productName,
        currentPrice,
        currentRetailer,
      },
    });

    return result;
  }
}

/**
 * Create and export a singleton instance
 */
export const priceDetectiveAgent = new PriceDetectiveAgent();
