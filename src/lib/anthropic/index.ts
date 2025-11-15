import Anthropic from '@anthropic-ai/sdk';

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

// Use Haiku for cost efficiency on simple tasks
// Use Sonnet 3.5 for complex reasoning
export const MODELS = {
  HAIKU: 'claude-3-5-haiku-latest',
  SONNET: 'claude-3-5-sonnet-latest',
} as const;
