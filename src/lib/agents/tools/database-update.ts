import { Tool } from '../types';
import { createClient } from '@/lib/supabase/server';

/**
 * Database update tool - update purchase records
 */
export const databaseUpdateTool: Tool = {
  name: 'database_update',
  description:
    'Update existing records in the database. Use this to update purchase information, mark items as returned, or modify other records. Requires record ID.',
  input_schema: {
    type: 'object',
    properties: {
      table: {
        type: 'string',
        enum: ['purchases', 'gift_cards', 'notifications'],
        description: 'The table to update',
      },
      id: {
        type: 'string',
        description: 'The ID of the record to update',
      },
      updates: {
        type: 'object',
        description: 'The fields to update with their new values',
      },
    },
    required: ['table', 'id', 'updates'],
  },
  execute: async (params: {
    table: string;
    id: string;
    updates: Record<string, any>;
  }) => {
    try {
      const supabase = await createClient();

      const { data, error } = await supabase
        .from(params.table)
        .update(params.updates)
        .eq('id', params.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return {
        success: true,
        table: params.table,
        id: params.id,
        updated_record: data,
      };
    } catch (error) {
      console.error('Database update failed:', error);
      throw new Error(
        `Failed to update database: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  },
};
