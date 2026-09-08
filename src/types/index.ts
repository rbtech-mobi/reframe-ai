/**
 * Shared type definitions used across services, hooks and components.
 * The ReframeResult type mirrors the JSON schema declared in the
 * system prompt at src/constants/prompts.ts.
 */

export type ReframeResult = {
  tone: string;
  interpretations: [string, string, string];
  suggestedReply: string;
};

export type ReframeStatus = 'idle' | 'loading' | 'success' | 'error';

export type ReframeState = {
  status: ReframeStatus;
  message: string;
  loading: boolean;
  result: ReframeResult | null;
  error: string | null;
};
