/**
 * Monitoring and logging utilities for agents
 */

export interface AgentMetrics {
  agentName: string;
  executionId: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  success: boolean;
  iterations: number;
  tokensUsed: number;
  cost: number;
  toolsUsed: string[];
  error?: string;
}

class AgentMonitor {
  private metrics: AgentMetrics[] = [];
  private maxMetrics: number = 1000; // Keep last 1000 executions

  /**
   * Start tracking an agent execution
   */
  startExecution(agentName: string): string {
    const executionId = `${agentName}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const metric: AgentMetrics = {
      agentName,
      executionId,
      startTime: Date.now(),
      success: false,
      iterations: 0,
      tokensUsed: 0,
      cost: 0,
      toolsUsed: [],
    };

    this.metrics.push(metric);

    // Keep only last maxMetrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }

    console.log(`[Monitor] Started ${agentName} execution: ${executionId}`);

    return executionId;
  }

  /**
   * Complete tracking an agent execution
   */
  endExecution(
    executionId: string,
    success: boolean,
    data: {
      iterations: number;
      tokensUsed: number;
      cost: number;
      toolsUsed: string[];
      error?: string;
    }
  ): void {
    const metric = this.metrics.find((m) => m.executionId === executionId);

    if (!metric) {
      console.error(`[Monitor] Execution not found: ${executionId}`);
      return;
    }

    metric.endTime = Date.now();
    metric.duration = metric.endTime - metric.startTime;
    metric.success = success;
    metric.iterations = data.iterations;
    metric.tokensUsed = data.tokensUsed;
    metric.cost = data.cost;
    metric.toolsUsed = data.toolsUsed;
    metric.error = data.error;

    console.log(
      `[Monitor] Completed ${metric.agentName} in ${metric.duration}ms:`,
      {
        success,
        iterations: metric.iterations,
        tokens: metric.tokensUsed,
        cost: `$${metric.cost.toFixed(4)}`,
        tools: metric.toolsUsed,
      }
    );
  }

  /**
   * Get metrics for a specific agent
   */
  getAgentMetrics(agentName: string): AgentMetrics[] {
    return this.metrics.filter((m) => m.agentName === agentName);
  }

  /**
   * Get all metrics
   */
  getAllMetrics(): AgentMetrics[] {
    return [...this.metrics];
  }

  /**
   * Get aggregate statistics
   */
  getStats(): {
    totalExecutions: number;
    successRate: number;
    averageDuration: number;
    averageIterations: number;
    totalTokens: number;
    totalCost: number;
    byAgent: Record<
      string,
      {
        executions: number;
        successRate: number;
        avgDuration: number;
        totalCost: number;
      }
    >;
  } {
    const total = this.metrics.length;
    const successful = this.metrics.filter((m) => m.success).length;
    const totalTokens = this.metrics.reduce((sum, m) => sum + m.tokensUsed, 0);
    const totalCost = this.metrics.reduce((sum, m) => sum + m.cost, 0);
    const avgDuration =
      this.metrics.reduce((sum, m) => sum + (m.duration || 0), 0) / total;
    const avgIterations =
      this.metrics.reduce((sum, m) => sum + m.iterations, 0) / total;

    // By agent
    const agentNames = [...new Set(this.metrics.map((m) => m.agentName))];
    const byAgent: Record<string, any> = {};

    for (const name of agentNames) {
      const agentMetrics = this.getAgentMetrics(name);
      const agentTotal = agentMetrics.length;
      const agentSuccessful = agentMetrics.filter((m) => m.success).length;
      const agentAvgDuration =
        agentMetrics.reduce((sum, m) => sum + (m.duration || 0), 0) / agentTotal;
      const agentTotalCost = agentMetrics.reduce((sum, m) => sum + m.cost, 0);

      byAgent[name] = {
        executions: agentTotal,
        successRate: (agentSuccessful / agentTotal) * 100,
        avgDuration: agentAvgDuration,
        totalCost: agentTotalCost,
      };
    }

    return {
      totalExecutions: total,
      successRate: (successful / total) * 100,
      averageDuration: avgDuration,
      averageIterations: avgIterations,
      totalTokens,
      totalCost,
      byAgent,
    };
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics = [];
  }
}

// Singleton instance
export const agentMonitor = new AgentMonitor();
