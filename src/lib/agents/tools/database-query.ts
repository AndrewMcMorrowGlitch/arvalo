import { Tool } from '../types';
import { createClient } from '@/lib/supabase/server';

/**
 * Database query tool - query purchase history and user data
 */
export const databaseQueryTool: Tool = {
  name: 'database_query',
  description:
    'Query the database for purchase history, return policies, gift cards, or other user data. Use this to look up existing purchases, check return deadlines, or analyze purchase patterns.',
  input_schema: {
    type: 'object',
    properties: {
      table: {
        type: 'string',
        enum: ['purchases', 'return_policies', 'gift_cards', 'notifications'],
        description: 'The table to query',
      },
      filters: {
        type: 'object',
        description:
          'Filter conditions (e.g., {"merchant": "Amazon", "user_id": "123"})',
      },
      order_by: {
        type: 'string',
        description: 'Column to order by (e.g., "purchase_date")',
      },
      order_direction: {
        type: 'string',
        enum: ['asc', 'desc'],
        description: 'Sort direction (default: desc)',
      },
      limit: {
        type: 'number',
        description: 'Maximum number of rows to return (default: 10, max: 100)',
      },
    },
    required: ['table'],
  },
  execute: async (params: {
    table: string;
    filters?: Record<string, any>;
    order_by?: string;
    order_direction?: 'asc' | 'desc';
    limit?: number;
  }) => {
    try {
      const supabase = await createClient();

      // Build query
      let query = supabase.from(params.table).select('*');

      // Apply filters
      if (params.filters) {
        Object.entries(params.filters).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }

      // Apply ordering
      if (params.order_by) {
        query = query.order(params.order_by, {
          ascending: params.order_direction === 'asc',
        });
      }

      // Apply limit
      const limit = Math.min(params.limit || 10, 100);
      query = query.limit(limit);

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return {
        table: params.table,
        rows: data,
        count: data.length,
      };
    } catch (error) {
      console.error('Database query failed:', error);
      throw new Error(
        `Failed to query database: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  },
};
