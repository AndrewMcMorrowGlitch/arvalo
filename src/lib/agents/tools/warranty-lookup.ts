import { Tool } from '../types';

/**
 * Warranty lookup tool - finds warranty information for products
 * Scrapes manufacturer websites for warranty terms
 */
export const warrantyLookupTool: Tool = {
  name: 'warranty_lookup',
  description:
    'Look up warranty information for a product by searching manufacturer websites. Returns warranty duration, terms, coverage details, and claim process. Use this when you need to find warranty details for a specific product or brand.',
  input_schema: {
    type: 'object',
    properties: {
      product_name: {
        type: 'string',
        description: 'The product name or model number',
      },
      manufacturer: {
        type: 'string',
        description: 'The manufacturer/brand name',
      },
      product_category: {
        type: 'string',
        description:
          'Product category (e.g., electronics, appliances, furniture)',
      },
    },
    required: ['product_name', 'manufacturer'],
  },
  execute: async (params: {
    product_name: string;
    manufacturer: string;
    product_category?: string;
  }) => {
    try {
      // Search for warranty information
      const searchQuery = `${params.manufacturer} ${params.product_name} warranty information terms`;
      const encodedQuery = encodeURIComponent(searchQuery);

      // Use DuckDuckGo for initial search
      const searchResponse = await fetch(
        `https://api.duckduckgo.com/?q=${encodedQuery}&format=json`
      );

      if (!searchResponse.ok) {
        throw new Error('Failed to search for warranty information');
      }

      const searchData = await searchResponse.json();
      let warrantyUrl = '';

      // Look for warranty URL in results
      if (searchData.AbstractURL) {
        warrantyUrl = searchData.AbstractURL;
      } else if (searchData.RelatedTopics && searchData.RelatedTopics.length > 0) {
        // Find first warranty-related topic
        for (const topic of searchData.RelatedTopics) {
          if (
            topic.FirstURL &&
            (topic.Text?.toLowerCase().includes('warranty') ||
              topic.FirstURL.toLowerCase().includes('warranty'))
          ) {
            warrantyUrl = topic.FirstURL;
            break;
          }
        }
      }

      // If we found a URL, try to scrape it
      if (warrantyUrl) {
        try {
          const pageResponse = await fetch(warrantyUrl, {
            headers: {
              'User-Agent':
                'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
            },
          });

          if (pageResponse.ok) {
            const html = await pageResponse.text();

            // Extract warranty-related text
            const text = html
              .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
              .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
              .replace(/<[^>]+>/g, ' ')
              .replace(/\s+/g, ' ')
              .trim();

            // Look for warranty duration patterns
            const durationPatterns = [
              /(\d+)[-\s]?year\s+(?:limited\s+)?warranty/gi,
              /(\d+)[-\s]?month\s+(?:limited\s+)?warranty/gi,
              /warranty\s+(?:period|duration)[:\s]+(\d+)\s+(year|month)/gi,
            ];

            let duration = null;
            let durationUnit = null;

            for (const pattern of durationPatterns) {
              const match = text.match(pattern);
              if (match) {
                const numMatch = match[0].match(/\d+/);
                if (numMatch) {
                  duration = parseInt(numMatch[0]);
                  durationUnit = match[0].toLowerCase().includes('year')
                    ? 'years'
                    : 'months';
                  break;
                }
              }
            }

            return {
              product: params.product_name,
              manufacturer: params.manufacturer,
              warranty_found: true,
              warranty_duration: duration,
              warranty_unit: durationUnit,
              warranty_url: warrantyUrl,
              warranty_excerpt: text.substring(0, 500),
              coverage_type: text.toLowerCase().includes('limited')
                ? 'limited'
                : 'full',
            };
          }
        } catch (scrapeError) {
          console.log('Failed to scrape warranty page:', scrapeError);
        }
      }

      // Default response if no specific info found
      // Use common industry standards as fallback
      const defaultWarranties: Record<string, { duration: number; unit: string }> = {
        electronics: { duration: 1, unit: 'years' },
        appliances: { duration: 1, unit: 'years' },
        furniture: { duration: 1, unit: 'years' },
        clothing: { duration: 90, unit: 'days' },
        toys: { duration: 90, unit: 'days' },
      };

      const categoryLower = params.product_category?.toLowerCase() || 'electronics';
      const defaultWarranty =
        defaultWarranties[categoryLower] || defaultWarranties.electronics;

      return {
        product: params.product_name,
        manufacturer: params.manufacturer,
        warranty_found: false,
        warranty_duration: defaultWarranty.duration,
        warranty_unit: defaultWarranty.unit,
        warranty_url: warrantyUrl || null,
        warranty_excerpt: 'Standard manufacturer warranty (estimated)',
        coverage_type: 'limited',
        note: 'Could not find specific warranty information. Using industry standard estimate.',
      };
    } catch (error) {
      console.error('Warranty lookup failed:', error);
      throw new Error(
        `Failed to lookup warranty: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  },
};
