/**
 * Service layer responsible for communication with the Gemini model
 * through the Vercel AI SDK. Sends a structured prompt and parses
 * the JSON response into a typed ReframeResult.
 */

import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';
import { SYSTEM_PROMPT, buildUserPrompt } from '../constants/prompts';
import type { ReframeResult } from '../types';

const apiKey = process.env.EXPO_PUBLIC_GOOGLE_API_KEY;

if (!apiKey) {
  throw new Error(
    'Missing EXPO_PUBLIC_GOOGLE_API_KEY. Check your .env file.'
  );
}

const google = createGoogleGenerativeAI({ apiKey });

/**
 * Removes markdown code fences that some models add around JSON
 * responses despite instructions to output raw JSON.
 */
function stripCodeFences(text: string): string {
  return text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
}

/**
 * Sends a message (and optional context) to the Gemini model and
 * returns a parsed ReframeResult. Throws if the response cannot be
 * parsed as valid JSON matching the expected schema.
 */
export async function reframeMessage(
  message: string,
  context?: string
): Promise<ReframeResult> {
  const { text } = await generateText({
    model: google('gemini-3.5-flash-lite'),
    system: SYSTEM_PROMPT,
    prompt: buildUserPrompt(message, context),
    temperature: 0.7,
  });

  const cleaned = stripCodeFences(text);

  let parsed: ReframeResult;
  try {
    parsed = JSON.parse(cleaned) as ReframeResult;
  } catch {
    throw new Error(
      'The model returned a response that could not be parsed as JSON.'
    );
  }

  return parsed;
}

/**
 * Kept for backward compatibility with the connection test screen.
 * Will be removed when the main UI (Layer 5) is implemented.
 */
export async function testConnection(message: string): Promise<string> {
  const { text } = await generateText({
    model: google('gemini-3.5-flash-lite'),
    prompt: message,
  });
  return text;
}
