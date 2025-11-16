import Anthropic from '@anthropic-ai/sdk';
import { anthropic, MODELS } from '@/lib/anthropic';
import {
  Tool,
  AgentConfig,
  AgentInput,
  AgentResult,
  AgentState,
  AgentMessage,
} from './types';

/**
 * Base Agent class with tool-use capabilities
 * Implements agentic loop with autonomous decision-making
 */
export class BaseAgent {
  protected config: AgentConfig;
  protected tools: Map<string, Tool>;
  protected anthropic: Anthropic;

  constructor(config: AgentConfig) {
    this.config = {
      maxIterations: 10,
      model: MODELS.SONNET,
      temperature: 0.7,
      maxTokens: 4096,
      ...config,
    };
    this.tools = new Map();
    this.anthropic = anthropic;
  }

  /**
   * Register a tool for the agent to use
   */
  addTool(tool: Tool): void {
    this.tools.set(tool.name, tool);
  }

  /**
   * Register multiple tools
   */
  addTools(tools: Tool[]): void {
    tools.forEach((tool) => this.addTool(tool));
  }

  /**
   * Get tool definitions in Anthropic format
   */
  protected getToolDefinitions(): Anthropic.Tool[] {
    return Array.from(this.tools.values()).map((tool) => ({
      name: tool.name,
      description: tool.description,
      input_schema: tool.input_schema,
    }));
  }

  /**
   * Execute a tool by name with given parameters
   */
  protected async executeTool(
    toolName: string,
    params: any
  ): Promise<{ success: boolean; data: any; error?: string }> {
    const tool = this.tools.get(toolName);
    if (!tool) {
      return {
        success: false,
        data: null,
        error: `Tool ${toolName} not found`,
      };
    }

    try {
      console.log(`[Agent] Executing tool: ${toolName}`, params);
      const data = await tool.execute(params);
      return { success: true, data };
    } catch (error) {
      console.error(`[Agent] Tool execution failed: ${toolName}`, error);
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Main agent execution loop
   */
  async execute(input: AgentInput): Promise<AgentResult> {
    const maxIterations = input.maxIterations || this.config.maxIterations!;
    const state: AgentState = {
      messages: [],
      iterations: 0,
      toolsUsed: [],
      reasoning: [],
      tokensUsed: 0,
      isComplete: false,
    };

    // Initial user message
    state.messages.push({
      role: 'user',
      content: this.buildInitialPrompt(input),
    });

    try {
      while (state.iterations < maxIterations && !state.isComplete) {
        state.iterations++;
        console.log(`[Agent] Iteration ${state.iterations}/${maxIterations}`);

        // Call Claude with tools
        const response = await this.anthropic.messages.create({
          model: this.config.model!,
          max_tokens: this.config.maxTokens!,
          temperature: this.config.temperature,
          system: this.config.systemPrompt,
          messages: state.messages,
          tools: this.getToolDefinitions(),
        });

        // Track token usage
        state.tokensUsed += response.usage.input_tokens + response.usage.output_tokens;

        // Process response
        const { isComplete, assistantMessage } = await this.processResponse(
          response,
          state
        );

        // Add assistant message to history
        state.messages.push(assistantMessage);

        if (isComplete) {
          state.isComplete = true;
          break;
        }
      }

      // Extract final answer
      const finalAnswer = this.extractFinalAnswer(state);

      return {
        success: true,
        data: finalAnswer,
        reasoning: state.reasoning,
        toolsUsed: state.toolsUsed,
        tokensUsed: state.tokensUsed,
        iterations: state.iterations,
        cost: this.calculateCost(state.tokensUsed),
      };
    } catch (error) {
      console.error('[Agent] Execution failed:', error);
      return {
        success: false,
        data: null,
        reasoning: state.reasoning,
        toolsUsed: state.toolsUsed,
        tokensUsed: state.tokensUsed,
        iterations: state.iterations,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Process Claude's response and execute any tool calls
   */
  protected async processResponse(
    response: Anthropic.Message,
    state: AgentState
  ): Promise<{ isComplete: boolean; assistantMessage: AgentMessage }> {
    const content: Array<Anthropic.ContentBlock | Anthropic.ToolUseBlock> = [];
    let hasToolUse = false;

    // Check for text content (reasoning)
    for (const block of response.content) {
      if (block.type === 'text') {
        state.reasoning.push(block.text);
        content.push(block);
      } else if (block.type === 'tool_use') {
        hasToolUse = true;
        content.push(block);

        // Execute the tool
        state.toolsUsed.push(block.name);
        const result = await this.executeTool(block.name, block.input);

        // Add tool result to messages
        state.messages.push({
          role: 'assistant',
          content: [block],
        });

        state.messages.push({
          role: 'user',
          content: [
            {
              type: 'tool_result',
              tool_use_id: block.id,
              content: JSON.stringify(result),
            },
          ],
        });
      }
    }

    // If no tool use, we're done
    const isComplete = !hasToolUse || response.stop_reason === 'end_turn';

    return {
      isComplete,
      assistantMessage: {
        role: 'assistant',
        content: content,
      },
    };
  }

  /**
   * Build initial prompt with context
   */
  protected buildInitialPrompt(input: AgentInput): string {
    let prompt = input.prompt;

    if (input.context && Object.keys(input.context).length > 0) {
      prompt += '\n\nContext:\n' + JSON.stringify(input.context, null, 2);
    }

    return prompt;
  }

  /**
   * Extract final answer from agent state
   */
  protected extractFinalAnswer(state: AgentState): any {
    // Get the last text content from assistant messages
    for (let i = state.messages.length - 1; i >= 0; i--) {
      const msg = state.messages[i];
      if (msg.role === 'assistant' && Array.isArray(msg.content)) {
        for (const block of msg.content) {
          if (block.type === 'text') {
            // Try to parse as JSON first
            try {
              return JSON.parse(block.text);
            } catch {
              return block.text;
            }
          }
        }
      }
    }

    return null;
  }

  /**
   * Calculate approximate cost based on token usage
   * Sonnet 4.5: $3/M input, $15/M output (approximate)
   */
  protected calculateCost(tokensUsed: number): number {
    const avgCostPerToken = 0.000009; // Average cost
    return tokensUsed * avgCostPerToken;
  }

  /**
   * Get agent configuration
   */
  getConfig(): AgentConfig {
    return { ...this.config };
  }

  /**
   * Get registered tools
   */
  getTools(): Tool[] {
    return Array.from(this.tools.values());
  }
}
