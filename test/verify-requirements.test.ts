import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { stripCodeFences, validateAndNormalizeReframeResult } from '../src/services/generator';
import { formatFullResult } from '../src/components/ReframeResult';
import { SYSTEM_PROMPT } from '../src/constants/prompts';
import type { ReframeResult } from '../src/types';

describe('ReframeIA Requirements Verification Suite', () => {
  describe('1. Clipboard & Formatting Functionality', () => {
    const sampleResult: ReframeResult = {
      tone: 'Neutro e direto',
      interpretations: [
        'A pessoa estava apenas respondendo de forma sucinta por falta de tempo.',
        'A mensagem reflete um estilo de comunicação objetivo sem conotação negativa.',
        'Pode haver cansaço momentâneo sem qualquer relação com a sua pessoa.',
      ],
      suggestedReply: 'Entendi, obrigado pelo retorno! Conversamos depois.',
    };

    test('formatFullResult formats tone, all 3 interpretations and suggestedReply', () => {
      const formatted = formatFullResult(sampleResult);

      assert.match(formatted, /Tom detectado:\s*Neutro e direto/);
      assert.match(formatted, /Interpretações alternativas:/);
      assert.match(formatted, /1\.\s*A pessoa estava apenas respondendo/);
      assert.match(formatted, /2\.\s*A mensagem reflete um estilo/);
      assert.match(formatted, /3\.\s*Pode haver cansaço momentâneo/);
      assert.match(formatted, /Resposta sugerida:\s*Entendi, obrigado pelo retorno!/);
    });

    test('suggestedReply can be isolated independently for single-copy action', () => {
      assert.equal(sampleResult.suggestedReply, 'Entendi, obrigado pelo retorno! Conversamos depois.');
    });
  });

  describe('2. AI Generator & Input Validation', () => {
    test('stripCodeFences removes markdown code fences around JSON', () => {
      const withJsonFences = '```json\n{"tone": "Neutro", "interpretations": ["a","b","c"], "suggestedReply": "ok"}\n```';
      assert.equal(
        stripCodeFences(withJsonFences),
        '{"tone": "Neutro", "interpretations": ["a","b","c"], "suggestedReply": "ok"}'
      );

      const withGenericFences = '```\n{"tone": "Amigável"}\n```';
      assert.equal(stripCodeFences(withGenericFences), '{"tone": "Amigável"}');
    });

    test('validateAndNormalizeReframeResult parses valid payload with tone, 3 interpretations and reply', () => {
      const raw = {
        tone: 'Amigável e acolhedor',
        interpretations: [
          'Leitura positiva com carinho',
          'Comentário casual entre amigos',
          'Expressão de gentileza',
        ],
        suggestedReply: 'Muito obrigado pelas palavras gentis!',
      };

      const normalized = validateAndNormalizeReframeResult(raw);
      assert.equal(normalized.tone, 'Amigável e acolhedor');
      assert.equal(normalized.interpretations.length, 3);
      assert.equal(normalized.interpretations[0], 'Leitura positiva com carinho');
      assert.equal(normalized.interpretations[1], 'Comentário casual entre amigos');
      assert.equal(normalized.interpretations[2], 'Expressão de gentileza');
      assert.equal(normalized.suggestedReply, 'Muito obrigado pelas palavras gentis!');
    });

    test('validateAndNormalizeReframeResult adapts alternativeReadings if returned', () => {
      const raw = {
        tone: 'Curioso',
        alternativeReadings: ['Leitura 1', 'Leitura 2', 'Leitura 3'],
        suggestedReply: 'Sim, concordo.',
      };

      const normalized = validateAndNormalizeReframeResult(raw);
      assert.equal(normalized.interpretations.length, 3);
      assert.deepEqual(normalized.interpretations, ['Leitura 1', 'Leitura 2', 'Leitura 3']);
    });

    test('validateAndNormalizeReframeResult rejects payload with fewer than 3 interpretations', () => {
      const raw = {
        tone: 'Neutro',
        interpretations: ['Apenas uma interpretação'],
        suggestedReply: '',
      };

      assert.throws(() => validateAndNormalizeReframeResult(raw), /três interpretações/);
    });

    test('validateAndNormalizeReframeResult rejects non-object or null input', () => {
      assert.throws(() => validateAndNormalizeReframeResult(null), /Formato de resposta inválido/);
      assert.throws(() => validateAndNormalizeReframeResult('not an object'), /Formato de resposta inválido/);
    });

    test('SYSTEM_PROMPT instructs the model to return tone, interpretations, suggestedReply in Brazilian Portuguese', () => {
      assert.ok(SYSTEM_PROMPT.includes('"tone": string'));
      assert.ok(SYSTEM_PROMPT.includes('"interpretations": [string, string, string]'));
      assert.ok(SYSTEM_PROMPT.includes('"suggestedReply": string'));
      assert.ok(SYSTEM_PROMPT.includes('português brasileiro'));
    });
  });

  describe('3. Code Quality, Security & Accessibility Audits', () => {
    function getAllSourceFiles(dir: string): string[] {
      const result: string[] = [];
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          if (!['node_modules', '.git', '.expo', 'test'].includes(entry.name)) {
            result.push(...getAllSourceFiles(fullPath));
          }
        } else if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) {
          result.push(fullPath);
        }
      }
      return result;
    }

    const sourceFiles = getAllSourceFiles(path.resolve(__dirname, '../src'));
    const appTsx = path.resolve(__dirname, '../App.tsx');
    const allProjectFiles = [...sourceFiles, appTsx];

    test('No residual console.log in any application source files', () => {
      for (const file of allProjectFiles) {
        const content = fs.readFileSync(file, 'utf8');
        assert.ok(
          !content.includes('console.log'),
          `Residual console.log found in ${file}`
        );
      }
    });

    test('No emojis in any UI source components or constants', () => {
      const emojiRegex = /[\u{1F300}-\u{1F5FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F1E0}-\u{1F1FF}]/u;

      for (const file of allProjectFiles) {
        const content = fs.readFileSync(file, 'utf8');
        const lines = content.split('\n');
        lines.forEach((line, index) => {
          assert.ok(
            !emojiRegex.test(line),
            `Emoji found in ${file} at line ${index + 1}: ${line}`
          );
        });
      }
    });

    test('API key is read exclusively from EXPO_PUBLIC_GOOGLE_API_KEY environment variable', () => {
      const generatorContent = fs.readFileSync(path.resolve(__dirname, '../src/services/generator.ts'), 'utf8');
      assert.ok(
        generatorContent.includes('process.env.EXPO_PUBLIC_GOOGLE_API_KEY'),
        'API key must be read from EXPO_PUBLIC_GOOGLE_API_KEY'
      );
      // Ensure no hardcoded API key exists in source files
      for (const file of allProjectFiles) {
        const content = fs.readFileSync(file, 'utf8');
        assert.ok(
          !content.includes('AIzaSy'),
          `Hardcoded Google API key found in ${file}`
        );
      }
    });

    test('Accessibility attributes (accessibilityLabel & accessibilityHint) on interactive buttons', () => {
      const messageInputContent = fs.readFileSync(path.resolve(__dirname, '../src/components/MessageInput.tsx'), 'utf8');
      const reframeResultContent = fs.readFileSync(path.resolve(__dirname, '../src/components/ReframeResult.tsx'), 'utf8');
      const primaryButtonContent = fs.readFileSync(path.resolve(__dirname, '../src/components/PrimaryButton.tsx'), 'utf8');
      const appContent = fs.readFileSync(appTsx, 'utf8');

      // MessageInput buttons
      assert.ok(messageInputContent.includes('accessibilityLabel="Limpar texto digitado"'));
      assert.ok(messageInputContent.includes('accessibilityHint='));
      assert.ok(messageInputContent.includes('accessibilityLabel="Colar texto da área de transferência"'));
      assert.ok(messageInputContent.includes('accessibilityHint='));

      // ReframeResult buttons
      assert.ok(reframeResultContent.includes('accessibilityLabel="Copiar apenas a resposta sugerida"'));
      assert.ok(reframeResultContent.includes('accessibilityHint='));
      assert.ok(reframeResultContent.includes('accessibilityLabel="Copiar resultado completo"'));
      assert.ok(reframeResultContent.includes('accessibilityHint='));

      // PrimaryButton
      assert.ok(primaryButtonContent.includes('accessibilityLabel={accessibilityLabel}'));
      assert.ok(primaryButtonContent.includes('accessibilityRole="button"'));

      // App.tsx buttons
      assert.ok(appContent.includes('accessibilityLabel="Analisar mensagem"'));
      assert.ok(appContent.includes('accessibilityHint="Envia a mensagem digitada para análise'));
      assert.ok(appContent.includes('accessibilityLabel="Iniciar nova análise"'));
      assert.ok(appContent.includes('accessibilityHint="Limpa a análise atual'));
    });

    test('Buttons specify a minimum touch target size of 44x44', () => {
      const messageInputContent = fs.readFileSync(path.resolve(__dirname, '../src/components/MessageInput.tsx'), 'utf8');
      const reframeResultContent = fs.readFileSync(path.resolve(__dirname, '../src/components/ReframeResult.tsx'), 'utf8');
      const primaryButtonContent = fs.readFileSync(path.resolve(__dirname, '../src/components/PrimaryButton.tsx'), 'utf8');

      // Check minWidth and minHeight >= 44
      assert.ok(messageInputContent.includes('minWidth: 44'));
      assert.ok(messageInputContent.includes('minHeight: 44'));
      assert.ok(reframeResultContent.includes('minWidth: 44'));
      assert.ok(reframeResultContent.includes('minHeight: 44'));
      assert.ok(primaryButtonContent.includes('minWidth: 44'));
      assert.ok(primaryButtonContent.includes('minHeight: 48'));
    });
  });
});
