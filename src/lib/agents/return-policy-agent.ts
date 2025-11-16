import { BaseAgent } from './base-agent';
import { AgentConfig } from './types';
import { webSearchTool, webScrapeTool, databaseQueryTool } from './tools';

/**
 * Return Policy Research Agent
 * Autonomously researches and analyzes return policies:
 * 1. Search for official return policy
 * 2. Check multiple sources (official site, reviews, forums)
 * 3. Compare with competitor policies
 * 4. Handle JavaScript-rendered sites
 * 5. Extract and structure policy data
 * 6. Assess confidence in findings
 */
export class ReturnPolicyAgent extends BaseAgent {
  constructor() {
    const config: AgentConfig = {
      name: 'return_policy_researcher',
      description: 'Intelligent return policy research and analysis agent',
      systemPrompt: `You are an expert return policy researcher. Your job is to:

1. Find the official return/exchange policy for a given merchant
2. Search multiple sources to verify information
3. Extract key policy details (return window, conditions, exclusions)
4. Compare the policy with competitors if requested
5. Identify price match policies
6. Provide confidence scores for your findings

When researching a return policy:
- Start with web search to find the official policy URL
- Scrape and analyze the policy page
- Look for: return window (days), conditions, restocking fees, price match policy
- Cross-reference with user reviews or forums if official policy is unclear
- Compare with competitors to provide context
- Be honest about confidence level

Always return your final analysis in JSON format with these fields:
{
  "merchant_name": "Store Name",
  "merchant_domain": "store.com",
  "policy_url": "https://...",
  "policy_text": "Clear summary of the return policy",
  "return_days": 30,
  "has_price_match": true,
  "price_match_days": 14,
  "conditions": ["Item must be in original packaging", "Receipt required"],
  "exclusions": ["Final sale items", "Opened software"],
  "restocking_fee": 0,
  "confidence": 0.95,
  "sources": ["Official policy page", "Customer service FAQ"],
  "competitor_comparison": {
    "better_than": ["Competitor A"],
    "worse_than": ["Competitor B"]
  }
}`,
      maxIterations: 10,
      temperature: 0.5,
    };

    super(config);

    // Register tools
    this.addTools([webSearchTool, webScrapeTool, databaseQueryTool]);
  }

  /**
   * Research return policy for a merchant
   */
  async researchPolicy(
    merchantName: string,
    merchantDomain?: string,
    compareWithCompetitors: boolean = false
  ): Promise<any> {
    const result = await this.execute({
      prompt: `Research the return and exchange policy for ${merchantName}${merchantDomain ? ` (${merchantDomain})` : ''}.

Please:
1. Find the official return policy URL
2. Scrape and analyze the policy page
3. Extract all key details (return window, conditions, price match, etc.)
4. Assess your confidence in the findings
5. ${compareWithCompetitors ? 'Compare with 2-3 major competitors in the same industry' : 'Skip competitor comparison'}

Return the analysis in the specified JSON format.`,
      context: {
        merchantName,
        merchantDomain,
        compareWithCompetitors,
      },
    });

    return result;
  }

  /**
   * Analyze if a specific purchase is still returnable
   */
  async analyzeReturnEligibility(
    purchase: {
      merchant: string;
      purchaseDate: string;
      totalAmount: number;
      items: any[];
    },
    policyText: string
  ): Promise<any> {
    const today = new Date().toISOString().split('T')[0];

    const result = await this.execute({
      prompt: `Analyze if this purchase is still eligible for return based on the policy.

Purchase Details:
- Merchant: ${purchase.merchant}
- Purchase Date: ${purchase.purchaseDate}
- Today's Date: ${today}
- Total Amount: $${purchase.totalAmount}
- Items: ${JSON.stringify(purchase.items)}

Return Policy:
${policyText}

Please provide:
1. Is the purchase still returnable?
2. How many days remain?
3. What is the exact deadline?
4. Are there any conditions that might affect eligibility?
5. Recommendations for the user

Return analysis in JSON format with fields:
{
  "is_returnable": true/false,
  "days_remaining": number,
  "return_deadline": "YYYY-MM-DD",
  "reasoning": "Explanation",
  "conditions_met": ["Condition 1", "Condition 2"],
  "potential_issues": ["Issue 1"],
  "recommendations": ["Action 1", "Action 2"]
}`,
      context: { purchase, policyText, today },
    });

    return result;
  }
}

/**
 * Create and export a singleton instance
 */
export const returnPolicyAgent = new ReturnPolicyAgent();
