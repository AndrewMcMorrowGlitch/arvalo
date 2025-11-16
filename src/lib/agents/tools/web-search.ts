import { Tool } from '../types';

/**
 * Web search tool - searches the internet for information
 * Uses a simple fetch-based approach (can be enhanced with dedicated search API)
 */
export const webSearchTool: Tool = {
  name: 'web_search',
  description:
    'Search the internet for information. Use this to find current information, product prices, store policies, or any other web-based data. Returns search results with titles, URLs, and snippets.',
  input_schema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'The search query to execute',
      },
      num_results: {
        type: 'number',
        description: 'Number of results to return (default: 5)',
      },
    },
    required: ['query'],
  },
  execute: async (params: { query: string; num_results?: number }) => {
    try {
      // For now, use a simple DuckDuckGo instant answer API
      // In production, consider using Google Custom Search, Bing API, or SerpAPI
      const query = encodeURIComponent(params.query);
      const response = await fetch(
        `https://api.duckduckgo.com/?q=${query}&format=json`
      );

      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
      }

      const data = await response.json();

      // Format results
      const results = [];

      // Add instant answer if available
      if (data.AbstractText) {
        results.push({
          title: data.Heading || 'Instant Answer',
          url: data.AbstractURL,
          snippet: data.AbstractText,
        });
      }

      // Add related topics
      if (data.RelatedTopics && data.RelatedTopics.length > 0) {
        for (const topic of data.RelatedTopics.slice(
          0,
          (params.num_results || 5) - results.length
        )) {
          if (topic.Text && topic.FirstURL) {
            results.push({
              title: topic.Text.split(' - ')[0],
              url: topic.FirstURL,
              snippet: topic.Text,
            });
          }
        }
      }

      return {
        query: params.query,
        results: results.slice(0, params.num_results || 5),
        total_results: results.length,
      };
    } catch (error) {
      console.error('Web search failed:', error);
      throw new Error(
        `Failed to search: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  },
};
