import { Tool } from '../types';

/**
 * Web scraping tool - extracts content from URLs
 */
export const webScrapeTool: Tool = {
  name: 'web_scrape',
  description:
    'Fetch and extract content from a specific URL. Use this to read web pages, extract text, or get HTML content from websites. Returns the page content.',
  input_schema: {
    type: 'object',
    properties: {
      url: {
        type: 'string',
        description: 'The URL to scrape',
      },
      extract_type: {
        type: 'string',
        enum: ['text', 'html'],
        description:
          'What to extract: "text" for clean text content, "html" for raw HTML (default: text)',
      },
      max_length: {
        type: 'number',
        description: 'Maximum content length to return in characters (default: 50000)',
      },
    },
    required: ['url'],
  },
  execute: async (params: {
    url: string;
    extract_type?: 'text' | 'html';
    max_length?: number;
  }) => {
    try {
      const response = await fetch(params.url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
      }

      const html = await response.text();
      const maxLength = params.max_length || 50000;

      if (params.extract_type === 'html') {
        return {
          url: params.url,
          content: html.substring(0, maxLength),
          content_type: 'html',
          truncated: html.length > maxLength,
        };
      }

      // Extract text content
      let text = html
        // Remove script and style tags
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        // Remove HTML tags
        .replace(/<[^>]+>/g, ' ')
        // Decode HTML entities
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        // Clean up whitespace
        .replace(/\s+/g, ' ')
        .trim();

      return {
        url: params.url,
        content: text.substring(0, maxLength),
        content_type: 'text',
        truncated: text.length > maxLength,
      };
    } catch (error) {
      console.error('Web scraping failed:', error);
      throw new Error(
        `Failed to scrape URL: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  },
};
