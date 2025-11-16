import { BaseAgent } from './base-agent';
import { AgentConfig } from './types';
import { webSearchTool, priceLookupTool, databaseQueryTool } from './tools';

/**
 * Recurrent Purchase Optimizer Agent
 * Autonomously analyzes purchase patterns and optimizes recurring expenses:
 * 1. Analyze purchase history for patterns
 * 2. Identify recurring purchases
 * 3. Search for subscription alternatives
 * 4. Compare pricing models (one-time vs subscription vs bulk)
 * 5. Suggest bulk purchase opportunities
 * 6. Predict next purchase dates
 */
export class RecurrentOptimizerAgent extends BaseAgent {
  constructor() {
    const config: AgentConfig = {
      name: 'recurrent_optimizer',
      description: 'Intelligent recurring purchase analysis and optimization agent',
      systemPrompt: `You are an expert at analyzing purchase patterns and optimizing recurring expenses. Your job is to:

1. Analyze purchase history to identify recurring purchases
2. Calculate purchase frequency and patterns
3. Search for subscription services or bulk purchase options
4. Compare total costs: one-time purchases vs subscriptions vs bulk buying
5. Predict when the user will need to buy the item again
6. Provide personalized money-saving recommendations

When analyzing recurring purchases:
- Look for items purchased multiple times
- Calculate average time between purchases
- Estimate annual spending on the item
- Search for subscription alternatives (e.g., Subscribe & Save)
- Calculate potential savings from subscriptions or bulk buying
- Consider convenience vs cost savings trade-offs
- Predict next purchase date based on pattern
- Provide clear, actionable recommendations

Always return your final analysis in JSON format with these fields:
{
  "item_name": "Product Name",
  "purchase_frequency": "Every 30 days",
  "times_purchased": 5,
  "average_price": 24.99,
  "annual_spending": 299.88,
  "patterns": {
    "average_days_between": 30,
    "consistent": true,
    "trend": "stable"
  },
  "next_purchase_prediction": {
    "date": "YYYY-MM-DD",
    "confidence": 0.85
  },
  "subscription_options": [
    {
      "service": "Subscribe & Save",
      "price_per_delivery": 21.24,
      "frequency": "Monthly",
      "annual_cost": 254.88,
      "annual_savings": 44.00,
      "pros": ["Automatic delivery", "15% discount"],
      "cons": ["Commitment required"]
    }
  ],
  "bulk_options": [
    {
      "quantity": 6,
      "total_price": 129.99,
      "price_per_unit": 21.67,
      "savings_vs_regular": 19.95,
      "months_supply": 6
    }
  ],
  "recommendation": {
    "best_option": "Subscribe & Save",
    "reasoning": "Saves $44/year with minimal effort",
    "action_steps": ["Visit product page", "Select subscription", "Choose monthly delivery"]
  }
}`,
      maxIterations: 10,
      temperature: 0.5,
    };

    super(config);

    // Register tools
    this.addTools([webSearchTool, priceLookupTool, databaseQueryTool]);
  }

  /**
   * Analyze all recurring purchases for a user
   */
  async analyzeRecurringPurchases(userId: string): Promise<any> {
    const result = await this.execute({
      prompt: `Analyze the purchase history for user ${userId} and identify all recurring purchases with optimization opportunities.

Please:
1. Query the database for all purchases by this user
2. Group purchases by product/item to identify recurring items
3. For each recurring item, analyze the pattern
4. Search for subscription or bulk purchase alternatives
5. Calculate potential savings
6. Provide recommendations prioritized by savings potential

Return analysis in JSON format with:
{
  "total_purchases_analyzed": number,
  "recurring_items_found": number,
  "total_annual_spending": number,
  "total_potential_savings": number,
  "recurring_purchases": [
    {
      "item": "...",
      "current_annual_cost": number,
      "optimized_annual_cost": number,
      "annual_savings": number,
      "recommendation": "..."
    }
  ],
  "top_opportunities": ["Item 1: Save $X/year", "Item 2: Save $Y/year"]
}`,
      context: {
        userId,
      },
    });

    return result;
  }

  /**
   * Optimize a specific recurring purchase
   */
  async optimizeRecurringItem(
    userId: string,
    itemName: string,
    productUrl?: string
  ): Promise<any> {
    const result = await this.execute({
      prompt: `Analyze and optimize the recurring purchase of "${itemName}" for user ${userId}.

Please:
1. Query the database for all purchases of this item
2. Calculate purchase frequency and patterns
3. Predict next purchase date
4. Search for subscription options${productUrl ? ` for the product at ${productUrl}` : ''}
5. Search for bulk purchase options
6. Compare all options and provide recommendation

Return the detailed analysis in the specified JSON format.`,
      context: {
        userId,
        itemName,
        productUrl,
      },
    });

    return result;
  }

  /**
   * Predict when user will need to repurchase an item
   */
  async predictNextPurchase(userId: string, itemName: string): Promise<any> {
    const result = await this.execute({
      prompt: `Predict when user ${userId} will need to repurchase "${itemName}" based on their purchase history.

Please:
1. Query the database for past purchases of this item
2. Calculate average time between purchases
3. Identify any trends (increasing/decreasing frequency)
4. Account for seasonality if relevant
5. Predict the next purchase date with confidence level

Return prediction in JSON format with:
{
  "item": "${itemName}",
  "last_purchase_date": "YYYY-MM-DD",
  "purchase_history": [
    {"date": "YYYY-MM-DD", "days_since_previous": number}
  ],
  "average_days_between": number,
  "trend": "stable|increasing|decreasing",
  "predicted_date": "YYYY-MM-DD",
  "confidence": 0.85,
  "reasoning": "Explanation of prediction"
}`,
      context: {
        userId,
        itemName,
      },
    });

    return result;
  }
}

/**
 * Create and export a singleton instance
 */
export const recurrentOptimizerAgent = new RecurrentOptimizerAgent();
