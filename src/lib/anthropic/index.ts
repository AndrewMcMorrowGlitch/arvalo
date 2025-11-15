import Anthropic from '@anthropic-ai/sdk';

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

// Use Haiku for both tasks - it's fast, cheap, and available on free tier
// SONNET is aliased to HAIKU to ensure compatibility with free tier API keys
export const MODELS = {
  HAIKU: 'claude-3-haiku-20240307',
  SONNET: 'claude-3-haiku-20240307', // Using Haiku for compatibility with free tier
} as const;
