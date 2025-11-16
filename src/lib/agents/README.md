# Claude SDK Agentic System

A comprehensive agentic framework built on Claude SDK for autonomous task execution with tool-use capabilities.

## Overview

This system transforms Arvalo from simple single-shot API calls into an intelligent, autonomous platform powered by specialized AI agents that can:

- Make multi-step decisions autonomously
- Use tools to interact with external systems
- Chain actions together intelligently
- Learn from context and adapt behavior

## Architecture

### Core Components

1. **BaseAgent** - Foundation class with tool-use loop
2. **Tools** - Reusable functions agents can execute
3. **Specialized Agents** - Domain-specific agents for different tasks
4. **Orchestrator** - Coordinates multiple agents for complex workflows
5. **Utilities** - Caching, monitoring, and optimization

### File Structure

```
src/lib/agents/
├── base-agent.ts                 # Base agent with agentic loop
├── types.ts                      # Type definitions
├── orchestrator.ts               # Multi-agent coordination
├── receipt-agent.ts              # Receipt processing agent
├── return-policy-agent.ts        # Return policy research agent
├── price-detective-agent.ts      # Price monitoring agent
├── recurrent-optimizer-agent.ts  # Purchase pattern optimizer
├── tools/
│   ├── web-search.ts            # Web search capability
│   ├── web-scrape.ts            # Content extraction
│   ├── price-lookup.ts          # Price checking
│   ├── database-query.ts        # Database reads
│   └── database-update.ts       # Database writes
└── utils/
    ├── cache.ts                 # Result caching
    └── monitor.ts               # Metrics & monitoring
```

## Agents

### 1. Receipt Processing Agent

**Purpose**: Intelligently process receipt images with autonomous research

**Capabilities**:
- Extract text via OCR
- Parse structured data (items, prices, merchant)
- Identify merchant website
- Cross-reference purchase history
- Detect price match opportunities
- Auto-categorize items

**Usage**:
```typescript
import { receiptAgent } from '@/lib/agents';

const result = await receiptAgent.processReceipt(
  imageData,
  mimeType,
  userId
);
```

### 2. Return Policy Research Agent

**Purpose**: Autonomously research and analyze return policies

**Capabilities**:
- Find official return policy URLs
- Scrape and analyze policy pages
- Compare with competitors
- Analyze return eligibility
- Provide confidence scores

**Usage**:
```typescript
import { returnPolicyAgent } from '@/lib/agents';

// Research policy
const policy = await returnPolicyAgent.researchPolicy(
  'Amazon',
  'amazon.com',
  true // compare with competitors
);

// Analyze eligibility
const eligibility = await returnPolicyAgent.analyzeReturnEligibility(
  purchase,
  policyText
);
```

### 3. Price Drop Detective Agent

**Purpose**: Monitor prices and find savings opportunities

**Capabilities**:
- Check current prices
- Find competitor prices
- Detect price drops
- Generate price match claims
- Calculate potential savings

**Usage**:
```typescript
import { priceDetectiveAgent } from '@/lib/agents';

// Check specific purchase
const drops = await priceDetectiveAgent.checkPriceDrops(
  purchaseId,
  userId
);

// Monitor all purchases
const opportunities = await priceDetectiveAgent.monitorAllPurchases(
  userId
);
```

### 4. Recurrent Purchase Optimizer Agent

**Purpose**: Analyze patterns and optimize recurring expenses

**Capabilities**:
- Identify recurring purchases
- Calculate purchase frequency
- Find subscription alternatives
- Compare pricing models
- Predict next purchase date

**Usage**:
```typescript
import { recurrentOptimizerAgent } from '@/lib/agents';

// Analyze all recurring purchases
const analysis = await recurrentOptimizerAgent.analyzeRecurringPurchases(
  userId
);

// Optimize specific item
const optimization = await recurrentOptimizerAgent.optimizeRecurringItem(
  userId,
  'Paper Towels'
);
```

## Tools

Tools are reusable capabilities that agents can use. Each tool has:
- **name**: Unique identifier
- **description**: What the tool does (used by agent for selection)
- **input_schema**: JSON schema for parameters
- **execute**: Async function to perform the action

### Available Tools

1. **web_search** - Search the internet for information
2. **web_scrape** - Extract content from URLs
3. **price_lookup** - Check product prices
4. **database_query** - Query purchase history
5. **database_update** - Update records

### Creating New Tools

```typescript
import { Tool } from './types';

export const myTool: Tool = {
  name: 'my_tool',
  description: 'Description of what this tool does',
  input_schema: {
    type: 'object',
    properties: {
      param1: {
        type: 'string',
        description: 'Description of param1'
      }
    },
    required: ['param1']
  },
  execute: async (params) => {
    // Implement tool logic
    return result;
  }
};
```

## Orchestrator

The orchestrator coordinates multiple agents for complex workflows.

### Sequential Workflow

```typescript
import { orchestrator } from '@/lib/agents/orchestrator';

const result = await orchestrator.executeWorkflow({
  name: 'Complete Purchase Analysis',
  steps: [
    {
      agent: 'receipt',
      input: { /* ... */ },
      onSuccess: (result) => {
        console.log('Receipt processed:', result.data);
      }
    },
    {
      agent: 'price_detective',
      input: { /* ... */ }
    }
  ]
}, context);
```

### Parallel Execution

```typescript
const { results, errors } = await orchestrator.executeParallel([
  { agent: 'return_policy', input: { /* ... */ } },
  { agent: 'price_detective', input: { /* ... */ } },
  { agent: 'recurrent_optimizer', input: { /* ... */ } }
]);
```

### Comprehensive Analysis

```typescript
const analysis = await orchestrator.analyzePurchase(
  purchaseId,
  userId
);

console.log(analysis.returnPolicy);
console.log(analysis.priceDrops);
console.log(analysis.recurrentPattern);
console.log(analysis.recommendations);
```

## API Integration

Example API routes are provided in `src/app/api/agents/`:

### Receipt Processing

```
POST /api/agents/receipt
Body: { imageData: string, mimeType: string }
```

### Price Checking

```
POST /api/agents/price-check
Body: { purchaseId: string } | { monitorAll: true }
```

## Monitoring & Optimization

### Caching

```typescript
import { agentCache } from '@/lib/agents/utils/cache';

// Cache result
agentCache.set('key', data, 3600000); // 1 hour TTL

// Retrieve
const cached = agentCache.get('key');

// Stats
console.log(agentCache.getStats());
```

### Monitoring

```typescript
import { agentMonitor } from '@/lib/agents/utils/monitor';

// Get statistics
const stats = agentMonitor.getStats();
console.log('Success rate:', stats.successRate);
console.log('Total cost:', stats.totalCost);
console.log('By agent:', stats.byAgent);
```

## Best Practices

1. **Tool Selection**: Write clear tool descriptions so agents can select the right tool
2. **System Prompts**: Provide detailed instructions in agent system prompts
3. **Error Handling**: Always handle agent failures gracefully
4. **Caching**: Use caching for repeated queries to reduce costs
5. **Monitoring**: Track agent performance and costs
6. **Iterations**: Set appropriate max iterations based on task complexity
7. **Context**: Provide relevant context to improve agent decisions

## Cost Management

- Average cost per agent execution: $0.01 - $0.10
- Monitor costs using `agentMonitor.getStats()`
- Use caching to reduce redundant API calls
- Set appropriate maxIterations limits
- Consider using Haiku model for simpler tasks

## Extending the System

### Adding a New Agent

1. Create agent file: `src/lib/agents/my-agent.ts`
2. Extend `BaseAgent`
3. Define system prompt and tools
4. Implement specific methods
5. Export singleton instance
6. Register in orchestrator

```typescript
import { BaseAgent } from './base-agent';
import { AgentConfig } from './types';

export class MyAgent extends BaseAgent {
  constructor() {
    const config: AgentConfig = {
      name: 'my_agent',
      description: 'What this agent does',
      systemPrompt: 'Detailed instructions...',
      maxIterations: 8,
    };

    super(config);
    this.addTools([/* tools */]);
  }

  async myMethod(params: any): Promise<any> {
    return await this.execute({
      prompt: 'Task description...',
      context: params
    });
  }
}

export const myAgent = new MyAgent();
```

## Testing

Test agents with sample inputs:

```typescript
const result = await receiptAgent.processReceipt(
  testImageData,
  'image/jpeg',
  'test-user-id'
);

console.log('Success:', result.success);
console.log('Data:', result.data);
console.log('Tokens used:', result.tokensUsed);
console.log('Cost:', result.cost);
```

## Future Enhancements

- [ ] Streaming agent responses
- [ ] User approval workflows for critical actions
- [ ] Agent learning from user feedback
- [ ] Multi-agent collaboration
- [ ] Background job scheduling
- [ ] Advanced prompt optimization
- [ ] Cost prediction before execution
