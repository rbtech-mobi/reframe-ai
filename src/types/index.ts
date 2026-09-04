/**
 * Shared type definitions used across services, hooks and components.
 * The ReframeResult type mirrors the JSON schema declared in the
 * system prompt at src/constants/prompts.ts.
 */

export type ReframeResult = {
  originalMessage: string;
  literalContent: string;
  userLikelyReading: string;
  alternativeReadings: [string, string, string];
  cannotConclude: string[];
  neutralView: string;
  suggestedReply: string;
};

export type ReframeState = {
  message: string;
  loading: boolean;
  result: ReframeResult | null;
  error: string | null;
};
