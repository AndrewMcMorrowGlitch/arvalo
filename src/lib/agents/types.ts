import Anthropic from '@anthropic-ai/sdk';

/**
 * Tool definition for agents
 */
export interface Tool {
  name: string;
  description: string;
  input_schema: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
  execute: (params: any) => Promise<any>;
}

/**
 * Agent message in conversation history
 */
export type AgentMessage = Anthropic.MessageParam;

/**
 * Agent execution result
 */
export interface AgentResult {
  success: boolean;
  data: any;
  reasoning: string[];
  toolsUsed: string[];
  tokensUsed: number;
  iterations: number;
  cost?: number;
  error?: string;
}

/**
 * Agent input for execution
 */
export interface AgentInput {
  prompt: string;
  context?: Record<string, any>;
  maxIterations?: number;
  userId?: string;
}

/**
 * Agent configuration
 */
export interface AgentConfig {
  name: string;
  description: string;
  systemPrompt: string;
  model?: string;
  maxIterations?: number;
  temperature?: number;
  maxTokens?: number;
}

/**
 * Tool execution result
 */
export interface ToolResult {
  success: boolean;
  data: any;
  error?: string;
}

/**
 * Agent state during execution
 */
export interface AgentState {
  messages: AgentMessage[];
  iterations: number;
  toolsUsed: string[];
  reasoning: string[];
  tokensUsed: number;
  isComplete: boolean;
}
