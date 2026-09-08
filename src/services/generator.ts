/**
 * Service layer responsible for communication with the Gemini model
 * through the Vercel AI SDK. Sends a structured prompt and parses
 * the JSON response into a typed ReframeResult.
 */

import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';
import { SYSTEM_PROMPT, buildUserPrompt } from '../constants/prompts';
import type { ReframeResult } from '../types';

/**
 * Lazily retrieves the Google Generative AI provider instance.
 * Ensures the API key is read strictly from EXPO_PUBLIC_GOOGLE_API_KEY.
 */
function getGoogleProvider() {
  const apiKey = process.env.EXPO_PUBLIC_GOOGLE_API_KEY;

  if (!apiKey) {
    throw new Error(
      'Chave de API não configurada. Defina EXPO_PUBLIC_GOOGLE_API_KEY nas variáveis de ambiente.'
    );
  }

  return createGoogleGenerativeAI({ apiKey });
}

/**
 * Removes markdown code fences (e.g. ```json ... ```) that LLMs may output.
 */
export function stripCodeFences(text: string): string {
  return text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
}

/**
 * Validates and normalizes raw parsed JSON into strict ReframeResult without using `any`.
 * Guarantees tone, exactly 3 alternative interpretations, and suggestedReply.
 */
export function validateAndNormalizeReframeResult(raw: unknown): ReframeResult {
  if (typeof raw !== 'object' || raw === null) {
    throw new Error('Formato de resposta inválido retornado pelo modelo de IA.');
  }

  const obj = raw as Record<string, unknown>;

  // Extração e validação do tom detectado
  const tone =
    typeof obj.tone === 'string' && obj.tone.trim().length > 0
      ? obj.tone.trim()
      : typeof obj.neutralView === 'string' && obj.neutralView.trim().length > 0
        ? obj.neutralView.trim()
        : 'Neutro e direto';

  // Extração das interpretações alternativas (suporta também alternativeReadings)
  const rawInterpretations = Array.isArray(obj.interpretations)
    ? obj.interpretations
    : Array.isArray(obj.alternativeReadings)
      ? obj.alternativeReadings
      : [];

  const validStrings: string[] = rawInterpretations
    .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
    .map((item) => item.trim());

  if (validStrings.length < 3) {
    throw new Error('A resposta da IA não contém as três interpretações alternativas necessárias.');
  }

  const interpretations: [string, string, string] = [
    validStrings[0],
    validStrings[1],
    validStrings[2],
  ];

  // Extração da resposta sugerida
  const suggestedReply =
    typeof obj.suggestedReply === 'string'
      ? obj.suggestedReply.trim()
      : '';

  return {
    tone,
    interpretations,
    suggestedReply,
  };
}

/**
 * Sends an ambiguous message to Gemini and returns a parsed ReframeResult.
 * Validates input, handles markdown fences, and parses JSON strictly.
 */
export async function reframeMessage(
  message: string,
  context?: string
): Promise<ReframeResult> {
  const trimmed = message.trim();
  if (!trimmed) {
    throw new Error('A mensagem não pode estar vazia ou conter apenas espaços.');
  }

  const google = getGoogleProvider();

  let textResult: string;
  try {
    const { text } = await generateText({
      model: google('gemini-3.5-flash-lite'),
      system: SYSTEM_PROMPT,
      prompt: buildUserPrompt(trimmed, context),
      temperature: 0.7,
    });
    textResult = text;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Erro de conexão com o serviço de IA.';
    throw new Error(`Falha na comunicação com o Gemini: ${errorMsg}`);
  }

  const cleaned = stripCodeFences(textResult);

  let rawJson: unknown;
  try {
    rawJson = JSON.parse(cleaned);
  } catch {
    throw new Error('A resposta retornada pelo modelo não pôde ser interpretada como JSON válido.');
  }

  return validateAndNormalizeReframeResult(rawJson);
}

/**
 * Utility for basic connectivity checks.
 */
export async function testConnection(message: string): Promise<string> {
  const google = getGoogleProvider();
  const { text } = await generateText({
    model: google('gemini-3.5-flash-lite'),
    prompt: message,
  });
  return text;
}
