import { BaseAgent } from './base-agent';
import { receiptAgent } from './receipt-agent';
import { returnPolicyAgent } from './return-policy-agent';
import { priceDetectiveAgent } from './price-detective-agent';
import { recurrentOptimizerAgent } from './recurrent-optimizer-agent';
import { AgentResult } from './types';

/**
 * Agent Orchestrator
 * Coordinates multiple agents for complex workflows
 */
export class AgentOrchestrator {
  private agents: Map<string, BaseAgent>;

  constructor() {
    this.agents = new Map([
      ['receipt', receiptAgent],
      ['return_policy', returnPolicyAgent],
      ['price_detective', priceDetectiveAgent],
      ['recurrent_optimizer', recurrentOptimizerAgent],
    ]);
  }

  /**
   * Get an agent by name
   */
  getAgent(name: string): BaseAgent | undefined {
    return this.agents.get(name);
  }

  /**
   * Execute a workflow with multiple agents
   * Agents run sequentially and can pass data to each other
   */
  async executeWorkflow(
    workflow: {
      name: string;
      steps: Array<{
        agent: string;
        input: any;
        onSuccess?: (result: AgentResult) => any;
        onError?: (error: Error) => any;
      }>;
    },
    context: Record<string, any> = {}
  ): Promise<{
    success: boolean;
    results: AgentResult[];
    error?: string;
  }> {
    console.log(`[Orchestrator] Starting workflow: ${workflow.name}`);

    const results: AgentResult[] = [];
    let workflowContext = { ...context };

    try {
      for (let i = 0; i < workflow.steps.length; i++) {
        const step = workflow.steps[i];
        console.log(
          `[Orchestrator] Executing step ${i + 1}/${workflow.steps.length}: ${step.agent}`
        );

        const agent = this.agents.get(step.agent);
        if (!agent) {
          throw new Error(`Agent not found: ${step.agent}`);
        }

        // Execute agent with context
        const result = await agent.execute({
          ...step.input,
          context: workflowContext,
        });

        results.push(result);

        if (!result.success) {
          if (step.onError) {
            step.onError(new Error(result.error || 'Agent execution failed'));
          }
          throw new Error(`Agent ${step.agent} failed: ${result.error}`);
        }

        // Update context with result
        workflowContext = {
          ...workflowContext,
          [`${step.agent}_result`]: result.data,
        };

        // Call success callback if provided
        if (step.onSuccess) {
          const callbackResult = step.onSuccess(result);
          if (callbackResult) {
            workflowContext = { ...workflowContext, ...callbackResult };
          }
        }
      }

      console.log(`[Orchestrator] Workflow completed: ${workflow.name}`);

      return {
        success: true,
        results,
      };
    } catch (error) {
      console.error(`[Orchestrator] Workflow failed: ${workflow.name}`, error);

      return {
        success: false,
        results,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Execute multiple agents in parallel
   */
  async executeParallel(
    tasks: Array<{
      agent: string;
      input: any;
    }>
  ): Promise<{
    success: boolean;
    results: AgentResult[];
    errors: Array<{ agent: string; error: string }>;
  }> {
    console.log(`[Orchestrator] Executing ${tasks.length} agents in parallel`);

    const promises = tasks.map(async (task) => {
      const agent = this.agents.get(task.agent);
      if (!agent) {
        throw new Error(`Agent not found: ${task.agent}`);
      }

      try {
        const result = await agent.execute(task.input);
        return { agent: task.agent, result, error: null };
      } catch (error) {
        return {
          agent: task.agent,
          result: null,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    });

    const settled = await Promise.all(promises);

    const results: AgentResult[] = [];
    const errors: Array<{ agent: string; error: string }> = [];

    for (const item of settled) {
      if (item.result) {
        results.push(item.result);
      }
      if (item.error) {
        errors.push({ agent: item.agent, error: item.error });
      }
    }

    return {
      success: errors.length === 0,
      results,
      errors,
    };
  }

  /**
   * Comprehensive purchase analysis workflow
   * Combines multiple agents to fully analyze a purchase
   */
  async analyzePurchase(
    purchaseId: string,
    userId: string
  ): Promise<{
    success: boolean;
    analysis: {
      returnPolicy?: any;
      priceDrops?: any;
      recurrentPattern?: any;
    };
    recommendations: string[];
  }> {
    console.log(`[Orchestrator] Analyzing purchase: ${purchaseId}`);

    // Execute agents in parallel for faster results
    const { results, errors } = await this.executeParallel([
      {
        agent: 'return_policy',
        input: {
          prompt: `Get return policy details for purchase ${purchaseId}`,
          context: { purchaseId, userId },
        },
      },
      {
        agent: 'price_detective',
        input: {
          prompt: `Check for price drops on purchase ${purchaseId}`,
          context: { purchaseId, userId },
        },
      },
      {
        agent: 'recurrent_optimizer',
        input: {
          prompt: `Check if purchase ${purchaseId} is part of a recurring pattern`,
          context: { purchaseId, userId },
        },
      },
    ]);

    // Compile analysis
    const analysis: any = {};
    const recommendations: string[] = [];

    if (results[0]?.success) {
      analysis.returnPolicy = results[0].data;
      if (results[0].data.recommendations) {
        recommendations.push(...results[0].data.recommendations);
      }
    }

    if (results[1]?.success) {
      analysis.priceDrops = results[1].data;
      if (results[1].data.recommendations) {
        recommendations.push(...results[1].data.recommendations);
      }
    }

    if (results[2]?.success) {
      analysis.recurrentPattern = results[2].data;
      if (results[2].data.recommendation) {
        recommendations.push(results[2].data.recommendation);
      }
    }

    return {
      success: errors.length === 0,
      analysis,
      recommendations: [...new Set(recommendations)], // Remove duplicates
    };
  }
}

/**
 * Create and export a singleton instance
 */
export const orchestrator = new AgentOrchestrator();
