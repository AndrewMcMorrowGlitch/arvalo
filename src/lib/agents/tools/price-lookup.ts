import { Tool } from '../types';
import { checkProductPrice } from '@/lib/bright-data/price-tracker';

/**
 * Price lookup tool - checks current product prices
 * Integrates with existing Bright Data price checking
 */
export const priceLookupTool: Tool = {
  name: 'price_lookup',
  description:
    'Check the current price of a product from a given URL. Use this to verify current prices, detect price drops, or compare prices. Returns price, availability, and product details.',
  input_schema: {
    type: 'object',
    properties: {
      product_url: {
        type: 'string',
        description: 'The product URL to check the price for',
      },
    },
    required: ['product_url'],
  },
  execute: async (params: { product_url: string }) => {
    try {
      const result = await checkProductPrice(params.product_url);

      return {
        url: result.url,
        current_price: result.current_price,
        currency: result.currency,
        available: result.available,
        title: result.title,
        image_url: result.image_url,
        checked_at: result.timestamp,
      };
    } catch (error) {
      console.error('Price lookup failed:', error);
      throw new Error(
        `Failed to check price: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  },
};
