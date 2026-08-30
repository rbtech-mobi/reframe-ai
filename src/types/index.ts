/**
 * Shared type definitions used across services, hooks and components.
 */

export type ReframeResult = {
  tone: string;
  interpretations: [string, string, string];
  suggestedReply: string;
};

export type ReframeState = {
  message: string;
  loading: boolean;
  result: ReframeResult | null;
  error: string | null;
};
