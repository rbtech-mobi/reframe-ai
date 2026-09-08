const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const sucrase = require('sucrase');

// Hook into require.extensions for .ts and .tsx
require.extensions['.ts'] = function (module, filename) {
  const code = fs.readFileSync(filename, 'utf8');
  const transformed = sucrase.transform(code, {
    transforms: ['typescript', 'imports'],
  });
  module._compile(transformed.code, filename);
};

require.extensions['.tsx'] = function (module, filename) {
  const code = fs.readFileSync(filename, 'utf8');
  const transformed = sucrase.transform(code, {
    transforms: ['jsx', 'typescript', 'imports'],
  });
  module._compile(transformed.code, filename);
};

// Intercept require for React Native and Expo modules so we can run unit tests in Node
const originalRequire = Module.prototype.require;
Module.prototype.require = function (id) {
  if (id === 'react-native') {
    return {
      StyleSheet: { create: (styles) => styles },
      View: 'View',
      Text: 'Text',
      Pressable: 'Pressable',
      TextInput: 'TextInput',
      ActivityIndicator: 'ActivityIndicator',
      SafeAreaView: 'SafeAreaView',
      ScrollView: 'ScrollView',
      KeyboardAvoidingView: 'KeyboardAvoidingView',
      Platform: { OS: 'ios' },
    };
  }
  if (id === 'expo-clipboard') {
    let clipboardStore = '';
    return {
      getStringAsync: async () => clipboardStore,
      setStringAsync: async (text) => {
        clipboardStore = text;
        return true;
      },
      hasStringAsync: async () => Boolean(clipboardStore),
    };
  }
  if (id === 'expo-haptics') {
    return {
      impactAsync: async () => {},
      notificationAsync: async () => {},
      NotificationFeedbackType: { Success: 'success', Warning: 'warning', Error: 'error' },
      ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
    };
  }
  if (id === 'expo-blur') {
    return { BlurView: 'BlurView' };
  }
  if (id === '@expo/vector-icons') {
    return { Feather: () => null, Ionicons: () => null };
  }
  return originalRequire.apply(this, arguments);
};

const { stripCodeFences, validateAndNormalizeReframeResult } = require('../src/services/generator.ts');
const { formatFullResult } = require('../src/components/ReframeResult.tsx');
const { SYSTEM_PROMPT } = require('../src/constants/prompts.ts');

describe('ReframeIA Complete Requirements Verification', () => {
  describe('Requirement 1: Clipboard Functionality & Formatting', () => {
    const mockResult = {
      tone: 'Neutro e direto',
      interpretations: [
        'A pessoa respondeu de forma breve por estar ocupada.',
        'A mensagem tem objetivo prático sem conotação negativa.',
        'Um estilo de comunicação conciso típico em mensagens rápidas.',
      ],
      suggestedReply: 'Entendi, obrigado! Depois nos falamos com calma.',
    };

    test('1a: formatFullResult formats complete result (detected tone + 3 alternative interpretations + suggested reply)', () => {
      const formatted = formatFullResult(mockResult);

      assert.ok(formatted.includes('Tom detectado:\nNeutro e direto'), 'Must include detected tone');
      assert.ok(formatted.includes('Interpretações alternativas:'), 'Must include interpretations header');
      assert.ok(formatted.includes('1. A pessoa respondeu de forma breve'), 'Must include first interpretation');
      assert.ok(formatted.includes('2. A mensagem tem objetivo prático'), 'Must include second interpretation');
      assert.ok(formatted.includes('3. Um estilo de comunicação conciso'), 'Must include third interpretation');
      assert.ok(formatted.includes('Resposta sugerida:\nEntendi, obrigado! Depois nos falamos com calma.'), 'Must include suggested reply');
    });

    test('1b: Suggested reply can be copied independently', () => {
      assert.equal(mockResult.suggestedReply, 'Entendi, obrigado! Depois nos falamos com calma.');
    });

    test('1c: Component source verifies expo-clipboard and expo-haptics integration', () => {
      const messageInputCode = fs.readFileSync(path.resolve(__dirname, '../src/components/MessageInput.tsx'), 'utf8');
      const reframeResultCode = fs.readFileSync(path.resolve(__dirname, '../src/components/ReframeResult.tsx'), 'utf8');

      // MessageInput paste & clear
      assert.ok(messageInputCode.includes("from 'expo-clipboard'"), 'MessageInput must import expo-clipboard');
      assert.ok(messageInputCode.includes('Clipboard.getStringAsync()'), 'MessageInput must call getStringAsync()');
      assert.ok(messageInputCode.includes("from 'expo-haptics'"), 'MessageInput must import expo-haptics');
      assert.ok(messageInputCode.includes('Haptics.impactAsync'), 'MessageInput must provide haptic feedback');
      assert.ok(messageInputCode.includes('handleClear'), 'MessageInput must contain clear action');
      assert.ok(messageInputCode.includes('Colado!'), 'MessageInput must provide temporary visual feedback');

      // ReframeResult copy actions
      assert.ok(reframeResultCode.includes("from 'expo-clipboard'"), 'ReframeResult must import expo-clipboard');
      assert.ok(reframeResultCode.includes('Clipboard.setStringAsync(result.suggestedReply)'), 'ReframeResult must copy suggestedReply independently');
      assert.ok(reframeResultCode.includes('Clipboard.setStringAsync(formatted)'), 'ReframeResult must copy full result independently');
      assert.ok(reframeResultCode.includes("from 'expo-haptics'"), 'ReframeResult must import expo-haptics');
      assert.ok(reframeResultCode.includes('Haptics.notificationAsync'), 'ReframeResult must provide haptic feedback on copy');
      assert.ok(reframeResultCode.includes('Copiada!'), 'ReframeResult must provide temporary visual feedback on reply copy');
      assert.ok(reframeResultCode.includes('Análise completa copiada!'), 'ReframeResult must provide temporary visual feedback on full copy');
    });
  });

  describe('Requirement 2: Data Flow & AI Integration', () => {
    test('2a: stripCodeFences removes markdown wrapping', () => {
      const input = '```json\n{"tone": "Calmo", "interpretations": ["1","2","3"], "suggestedReply": "Oi"}\n```';
      const output = stripCodeFences(input);
      assert.equal(output, '{"tone": "Calmo", "interpretations": ["1","2","3"], "suggestedReply": "Oi"}');
    });

    test('2b: validateAndNormalizeReframeResult strictly returns typed ReframeResult (tone, 3 interpretations, reply)', () => {
      const validPayload = {
        tone: 'Amigável',
        interpretations: ['Opção 1', 'Opção 2', 'Opção 3'],
        suggestedReply: 'Obrigado!',
      };

      const result = validateAndNormalizeReframeResult(validPayload);
      assert.deepEqual(result, {
        tone: 'Amigável',
        interpretations: ['Opção 1', 'Opção 2', 'Opção 3'],
        suggestedReply: 'Obrigado!',
      });
    });

    test('2c: validateAndNormalizeReframeResult handles alternativeReadings schema mapping', () => {
      const alternativePayload = {
        tone: 'Reflexivo',
        alternativeReadings: ['Alt 1', 'Alt 2', 'Alt 3'],
        suggestedReply: 'Tudo bem.',
      };

      const result = validateAndNormalizeReframeResult(alternativePayload);
      assert.equal(result.tone, 'Reflexivo');
      assert.equal(result.interpretations.length, 3);
      assert.deepEqual(result.interpretations, ['Alt 1', 'Alt 2', 'Alt 3']);
      assert.equal(result.suggestedReply, 'Tudo bem.');
    });

    test('2d: validateAndNormalizeReframeResult rejects invalid responses with fewer than 3 interpretations', () => {
      const invalidPayload = {
        tone: 'Neutro',
        interpretations: ['Apenas uma'],
        suggestedReply: '',
      };

      assert.throws(() => validateAndNormalizeReframeResult(invalidPayload));
    });

    test('2e: SYSTEM_PROMPT contains exact JSON schema and Portuguese guidelines', () => {
      assert.ok(SYSTEM_PROMPT.includes('"tone": string'));
      assert.ok(SYSTEM_PROMPT.includes('"interpretations": [string, string, string]'));
      assert.ok(SYSTEM_PROMPT.includes('"suggestedReply": string'));
      assert.ok(SYSTEM_PROMPT.includes('português brasileiro'));
    });

    test('2f: useReframe hook enforces input validation and reset option', () => {
      const hookCode = fs.readFileSync(path.resolve(__dirname, '../src/hooks/useReframe.ts'), 'utf8');

      // Validates message before sending (blocks empty or whitespace-only)
      assert.ok(hookCode.includes('state.message.trim()'), 'useReframe must trim message');
      assert.ok(hookCode.includes('if (!trimmed)'), 'useReframe must block empty message');
      assert.ok(hookCode.includes("'idle'") && hookCode.includes("'loading'") && hookCode.includes("'success'") && hookCode.includes("'error'"), 'useReframe must use all four states');

      // Provides reset function
      assert.ok(hookCode.includes('const reset = useCallback('), 'useReframe must provide reset function');
      assert.ok(hookCode.includes("status: 'idle'"), 'reset must return to idle status');
      assert.ok(hookCode.includes("message: ''"), 'reset must clear message');
      assert.ok(hookCode.includes('result: null'), 'reset must clear result');
      assert.ok(hookCode.includes('error: null'), 'reset must clear error');
    });
  });

  describe('Requirement 3: UI & Accessibility', () => {
    test('3a: No emojis anywhere in UI component files', () => {
      const emojiRegex = /[\u{1F300}-\u{1F5FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F1E0}-\u{1F1FF}]/u;

      const filesToCheck = [
        '../App.tsx',
        '../src/components/MessageInput.tsx',
        '../src/components/ReframeResult.tsx',
        '../src/components/PrimaryButton.tsx',
        '../src/components/GlassCard.tsx',
        '../src/components/GradientBackground.tsx',
      ];

      for (const relativePath of filesToCheck) {
        const fullPath = path.resolve(__dirname, relativePath);
        const content = fs.readFileSync(fullPath, 'utf8');
        const lines = content.split('\n');
        lines.forEach((line, index) => {
          assert.ok(
            !emojiRegex.test(line),
            `Emoji found in ${relativePath} on line ${index + 1}: ${line}`
          );
        });
      }
    });

    test('3b: Accessibility labels and hints on interactive buttons', () => {
      const messageInputCode = fs.readFileSync(path.resolve(__dirname, '../src/components/MessageInput.tsx'), 'utf8');
      const reframeResultCode = fs.readFileSync(path.resolve(__dirname, '../src/components/ReframeResult.tsx'), 'utf8');
      const primaryButtonCode = fs.readFileSync(path.resolve(__dirname, '../src/components/PrimaryButton.tsx'), 'utf8');
      const appCode = fs.readFileSync(path.resolve(__dirname, '../App.tsx'), 'utf8');

      assert.ok(messageInputCode.includes('accessibilityLabel="Limpar texto digitado"'));
      assert.ok(messageInputCode.includes('accessibilityHint="Apaga todo o conteúdo atual do campo de texto"'));
      assert.ok(messageInputCode.includes('accessibilityLabel="Colar texto da área de transferência"'));
      assert.ok(messageInputCode.includes('accessibilityHint="Cola o texto copiado diretamente no campo de mensagem"'));

      assert.ok(reframeResultCode.includes('accessibilityLabel="Copiar apenas a resposta sugerida"'));
      assert.ok(reframeResultCode.includes('accessibilityHint="Copia o texto da resposta sugerida para a área de transferência"'));
      assert.ok(reframeResultCode.includes('accessibilityLabel="Copiar resultado completo"'));
      assert.ok(reframeResultCode.includes('accessibilityHint="Copia o tom detectado, as interpretações alternativas e a resposta sugerida"'));

      assert.ok(primaryButtonCode.includes('accessibilityRole="button"'));
      assert.ok(primaryButtonCode.includes('accessibilityLabel={accessibilityLabel}'));
      assert.ok(primaryButtonCode.includes('accessibilityHint={accessibilityHint}'));

      assert.ok(appCode.includes('accessibilityLabel="Analisar mensagem"'));
      assert.ok(appCode.includes('accessibilityLabel="Iniciar nova análise"'));
    });

    test('3c: Minimum touch target of 44x44 points on all interactive elements', () => {
      const messageInputCode = fs.readFileSync(path.resolve(__dirname, '../src/components/MessageInput.tsx'), 'utf8');
      const reframeResultCode = fs.readFileSync(path.resolve(__dirname, '../src/components/ReframeResult.tsx'), 'utf8');
      const primaryButtonCode = fs.readFileSync(path.resolve(__dirname, '../src/components/PrimaryButton.tsx'), 'utf8');

      // MessageInput buttons
      assert.ok(messageInputCode.includes('minWidth: 44'));
      assert.ok(messageInputCode.includes('minHeight: 44'));

      // ReframeResult copy buttons
      assert.ok(reframeResultCode.includes('minWidth: 44'));
      assert.ok(reframeResultCode.includes('minHeight: 44'));
      assert.ok(reframeResultCode.includes('minHeight: 48'));

      // PrimaryButton
      assert.ok(primaryButtonCode.includes('minWidth: 44'));
      assert.ok(primaryButtonCode.includes('minHeight: 48'));
    });
  });

  describe('Requirement 4: Code Quality & Security', () => {
    test('4a: Zero console.log across all application source files', () => {
      function checkDir(dir) {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          const full = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            if (!['node_modules', '.git', '.expo', 'test'].includes(entry.name)) {
              checkDir(full);
            }
          } else if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) {
            const content = fs.readFileSync(full, 'utf8');
            assert.ok(!content.includes('console.log'), `Residual console.log found in ${full}`);
          }
        }
      }

      checkDir(path.resolve(__dirname, '../src'));
      const appContent = fs.readFileSync(path.resolve(__dirname, '../App.tsx'), 'utf8');
      assert.ok(!appContent.includes('console.log'), 'Residual console.log found in App.tsx');
    });

    test('4b: Strict TypeScript - No "any" types in source files', () => {
      function checkAnyInDir(dir) {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          const full = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            if (!['node_modules', '.git', '.expo', 'test'].includes(entry.name)) {
              checkAnyInDir(full);
            }
          } else if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) {
            const content = fs.readFileSync(full, 'utf8');
            assert.ok(!content.includes(': any'), `Use of ': any' found in ${full}`);
            assert.ok(!content.includes('as any'), `Use of 'as any' found in ${full}`);
            assert.ok(!content.includes('<any>'), `Use of '<any>' found in ${full}`);
          }
        }
      }

      checkAnyInDir(path.resolve(__dirname, '../src'));
      const appContent = fs.readFileSync(path.resolve(__dirname, '../App.tsx'), 'utf8');
      assert.ok(!appContent.includes(': any'), "Use of ': any' in App.tsx");
      assert.ok(!appContent.includes('as any'), "Use of 'as any' in App.tsx");
    });

    test('4c: API key is read exclusively from EXPO_PUBLIC_GOOGLE_API_KEY environment variable', () => {
      const generatorCode = fs.readFileSync(path.resolve(__dirname, '../src/services/generator.ts'), 'utf8');
      assert.ok(generatorCode.includes('process.env.EXPO_PUBLIC_GOOGLE_API_KEY'));
      assert.ok(!generatorCode.includes('AIzaSy'));
    });
  });
});
