# Claude SDK Agentic Implementation Plan

## Overview
Transform the Arvalo application from single-shot Claude API calls to autonomous agentic workflows using Claude SDK's tool-use capabilities. This will enable multi-step reasoning, autonomous decision-making, and more intelligent automation.

---

## Phase 1: Foundation & Infrastructure

### 1.1 Update Dependencies
- [ ] Upgrade `@anthropic-ai/sdk` to latest version (check for tool-use features)
- [ ] Add any required dependencies for agent orchestration
- [ ] Update TypeScript types for tool definitions

### 1.2 Create Agent Framework
- [ ] Create `src/lib/agents/base-agent.ts` - Base agent class with:
  - Tool registration system
  - Agent loop with max iterations
  - State management
  - Error handling and retry logic
  - Conversation history tracking
- [ ] Create `src/lib/agents/tools/` directory for tool definitions
- [ ] Create `src/lib/agents/types.ts` - Type definitions for agents and tools

### 1.3 Define Core Tools
Create tool definitions that agents can use:
- [ ] `tools/web-search.ts` - Search the web for information
- [ ] `tools/web-scrape.ts` - Extract content from URLs
- [ ] `tools/price-lookup.ts` - Check current prices on retailer sites
- [ ] `tools/database-query.ts` - Query Supabase for purchase history
- [ ] `tools/database-update.ts` - Update purchase records
- [ ] `tools/email-draft.ts` - Draft emails for price matches/returns

---

## Phase 2: Smart Receipt Processing Agent

### 2.1 Create Receipt Agent
- [ ] Create `src/lib/agents/receipt-agent.ts`
- [ ] Implement multi-step workflow:
  1. OCR extraction from image
  2. Parse structured data (items, prices, merchant)
  3. Identify merchant website
  4. Cross-reference with existing purchases
  5. Auto-categorize items
  6. Detect potential price match opportunities
  7. Return comprehensive analysis

### 2.2 Tool Integration
- [ ] Connect receipt agent to OCR tool
- [ ] Connect to database query tool
- [ ] Connect to merchant lookup tool
- [ ] Add price comparison tool

### 2.3 API Integration
- [ ] Update `src/app/api/upload-receipt/route.ts` to use agent
- [ ] Add agent progress streaming to frontend
- [ ] Handle agent state persistence

### 2.4 Frontend Updates
- [ ] Add loading states for agent processing
- [ ] Show agent "thinking" steps to user
- [ ] Display agent findings and recommendations

---

## Phase 3: Return Policy Research Agent

### 3.1 Create Return Policy Agent
- [ ] Create `src/lib/agents/return-policy-agent.ts`
- [ ] Implement autonomous research workflow:
  1. Search for official return policy
  2. Check multiple sources (official site, Reddit, reviews)
  3. Compare with competitor policies
  4. Handle JavaScript-rendered sites
  5. Extract and structure policy data
  6. Assess confidence in findings

### 3.2 Enhanced Policy Scraping
- [ ] Replace simple scraping with agent-based approach
- [ ] Add tool for navigating paginated content
- [ ] Add tool for handling dynamic content
- [ ] Add verification tool to validate extracted data

### 3.3 Policy Comparison
- [ ] Create tool for comparing policies across retailers
- [ ] Add agent capability to suggest better alternatives
- [ ] Store policy change history

### 3.4 Integration
- [ ] Update return policy API endpoints
- [ ] Cache agent findings for performance
- [ ] Add background job for policy monitoring

---

## Phase 4: Price Drop Detective Agent

### 4.1 Create Price Monitoring Agent
- [ ] Create `src/lib/agents/price-detective-agent.ts`
- [ ] Implement monitoring workflow:
  1. Track purchase prices in database
  2. Periodically check current prices
  3. Compare across multiple retailers
  4. Analyze price history patterns
  5. Detect price drops within return/price-match windows
  6. Generate price match claims

### 4.2 Price Tools
- [ ] Create `tools/price-tracker.ts` - Check current prices
- [ ] Create `tools/price-history.ts` - Analyze historical pricing
- [ ] Create `tools/competitor-finder.ts` - Find same product elsewhere
- [ ] Integrate with existing Bright Data scraper

### 4.3 Automated Price Matching
- [ ] Agent drafts price match request emails
- [ ] Agent identifies required documentation
- [ ] Agent tracks price match submission status
- [ ] Add API endpoint for triggering price checks

### 4.4 Scheduled Jobs
- [ ] Create background job for daily price checks
- [ ] Add notification system for price drops
- [ ] Create dashboard for price drop opportunities

---

## Phase 5: Recurrent Purchase Optimizer Agent

### 5.1 Create Optimizer Agent
- [ ] Create `src/lib/agents/recurrent-optimizer-agent.ts`
- [ ] Implement optimization workflow:
  1. Analyze purchase patterns from history
  2. Identify recurring purchases
  3. Search for subscription alternatives
  4. Compare pricing models
  5. Suggest bulk purchase opportunities
  6. Predict next purchase date

### 5.2 Pattern Analysis Tools
- [ ] Create `tools/purchase-analyzer.ts` - Pattern detection
- [ ] Create `tools/subscription-finder.ts` - Find subscription options
- [ ] Create `tools/bulk-calculator.ts` - Calculate bulk savings
- [ ] Create `tools/prediction.ts` - Predict next purchase

### 5.3 Integration with Recurrent Purchases
- [ ] Enhance existing `src/lib/recurrent/index.ts` with agent
- [ ] Update `src/app/api/recurrent-purchases/route.ts`
- [ ] Add agent recommendations to frontend

---

## Phase 6: Testing & Optimization

### 6.1 Agent Testing
- [ ] Create test suite for each agent
- [ ] Test tool execution and chaining
- [ ] Test error handling and recovery
- [ ] Test agent decision-making quality
- [ ] Measure agent performance (time, cost)

### 6.2 Cost Optimization
- [ ] Add token usage tracking per agent
- [ ] Implement caching for repeated queries
- [ ] Add rate limiting and throttling
- [ ] Optimize prompts for efficiency

### 6.3 Monitoring
- [ ] Add logging for agent actions
- [ ] Track success/failure rates
- [ ] Monitor API costs
- [ ] Add alerts for agent failures

---

## Phase 7: Advanced Features

### 7.1 Multi-Agent Collaboration
- [ ] Create agent orchestrator for complex workflows
- [ ] Enable agents to delegate to specialized agents
- [ ] Implement agent-to-agent communication

### 7.2 User Approval Workflows
- [ ] Add approval gates for critical actions
- [ ] Create approval UI components
- [ ] Store approval history

### 7.3 Learning & Improvement
- [ ] Store successful agent workflows
- [ ] Learn from user feedback
- [ ] Improve tool selection over time

---

## Technical Architecture

### Agent Structure
```typescript
interface Agent {
  name: string;
  description: string;
  tools: Tool[];
  systemPrompt: string;
  maxIterations: number;

  execute(input: AgentInput): Promise<AgentResult>;
  addTool(tool: Tool): void;
  getHistory(): Message[];
}

interface Tool {
  name: string;
  description: string;
  inputSchema: JSONSchema;
  execute(params: any): Promise<any>;
}

interface AgentResult {
  success: boolean;
  data: any;
  reasoning: string[];
  toolsUsed: string[];
  tokensUsed: number;
  iterations: number;
}
```

### File Structure
```
src/lib/agents/
├── base-agent.ts          # Base agent class
├── types.ts               # Type definitions
├── receipt-agent.ts       # Receipt processing agent
├── return-policy-agent.ts # Return policy research agent
├── price-detective-agent.ts # Price monitoring agent
├── recurrent-optimizer-agent.ts # Purchase optimizer agent
├── tools/
│   ├── web-search.ts
│   ├── web-scrape.ts
│   ├── price-lookup.ts
│   ├── database-query.ts
│   ├── database-update.ts
│   ├── email-draft.ts
│   ├── purchase-analyzer.ts
│   └── ...
└── utils/
    ├── prompt-builder.ts
    ├── token-counter.ts
    └── cache.ts
```

---

## Success Metrics

### Performance
- Agent completion rate > 90%
- Average task completion time < 30 seconds
- Tool use accuracy > 85%

### User Experience
- Reduced manual data entry by 70%
- Increased price match discoveries by 300%
- Higher user satisfaction scores

### Cost Efficiency
- API costs per transaction < $0.10
- 50% reduction in wasted API calls through caching
- ROI positive within 3 months

---

## Timeline Estimate

- **Phase 1-2**: 1 week (Foundation + Receipt Agent)
- **Phase 3**: 3-4 days (Return Policy Agent)
- **Phase 4**: 1 week (Price Detective Agent)
- **Phase 5**: 4-5 days (Recurrent Purchase Agent)
- **Phase 6**: 3-4 days (Testing & Optimization)
- **Phase 7**: 1 week (Advanced Features)

**Total**: ~4-5 weeks for full implementation

---

## Risk Mitigation

### Technical Risks
- **Agent loops infinite**: Implement max iterations and timeouts
- **High API costs**: Add cost limits and caching
- **Poor tool selection**: Improve tool descriptions and examples
- **Data privacy**: Sanitize sensitive data before sending to API

### Business Risks
- **User trust**: Show agent reasoning transparently
- **Accuracy concerns**: Add confidence scores and human review for critical actions
- **Performance**: Run agents asynchronously, provide progress updates

---

## Next Steps

1. **Review this plan** - Confirm approach and priorities
2. **Set up development environment** - Ensure latest SDK and tools
3. **Start with Phase 1** - Build agent foundation
4. **Implement Receipt Agent first** - Most immediate user value
5. **Iterate based on feedback** - Adjust plan as needed

---

## Notes

- Keep each change **simple** and **incremental**
- Test thoroughly at each phase before moving forward
- Monitor costs closely during development
- Gather user feedback early and often
- Document agent behavior and decision-making patterns
