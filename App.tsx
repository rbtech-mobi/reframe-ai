/**
 * Entry point of the ReframeIA application.
 * Temporary integration test: sends a fixed ambiguous message
 * to the Gemini model and renders the parsed structured response.
 */

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { GradientBackground } from './src/components/GradientBackground';
import { GlassCard } from './src/components/GlassCard';
import { MessageInput } from './src/components/MessageInput';
import { PrimaryButton } from './src/components/PrimaryButton';
import { ReframeResult } from './src/components/ReframeResult';
import { useReframe } from './src/hooks/useReframe';
import { colors } from './src/constants/colors';
import { radius, spacing, typography } from './src/constants/theme';

export default function App() {
  const {
    status,
    message,
    loading,
    result,
    error,
    setMessage,
    submit,
    reset,
    clearMessage,
  } = useReframe();

  const isFormDisabled = loading;
  const canSubmit = message.trim().length > 0 && !loading;

  return (
    <GradientBackground>
      <StatusBar style="light" />

      {/* Esferas decorativas de fundo para revelar o efeito glassmorphism com blur */}
      <View style={styles.blobBlue} pointerEvents="none" />
      <View style={styles.blobPurple} pointerEvents="none" />

      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardContainer}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Cabeçalho da Aplicação */}
            <View style={styles.header}>
              <View style={styles.logoRow}>
                <View style={styles.iconCircle}>
                  <Feather name="shield" size={20} color={colors.accent} />
                </View>
                <Text style={styles.title}>ReframeIA</Text>
              </View>
              <Text style={styles.subtitle}>
                Reinterprete mensagens sociais ambíguas com serenidade e empatia.
              </Text>
            </View>

            {/* Fluxo 1: Entrada de Dados quando nenhum resultado está ativo */}
            {!result && (
              <View style={styles.section}>
                <MessageInput
                  value={message}
                  onChangeText={setMessage}
                  onClear={clearMessage}
                  disabled={isFormDisabled}
                  error={status === 'error' ? error : null}
                  placeholder="Cole ou digite aqui uma mensagem ambígua recebida..."
                />

                <PrimaryButton
                  title="Analisar mensagem"
                  onPress={submit}
                  loading={loading}
                  disabled={!canSubmit}
                  icon={<Feather name="send" size={16} color={colors.textPrimary} />}
                  accessibilityLabel="Analisar mensagem"
                  accessibilityHint="Envia a mensagem digitada para análise e reinterpretação pela IA"
                  style={styles.submitButton}
                />

                {/* Feedback intermediário enquanto a requisição está em andamento */}
                {loading && (
                  <GlassCard intensity={30} style={styles.loadingCard}>
                    <ActivityIndicator size="small" color={colors.accent} />
                    <Text style={styles.loadingText}>
                      Analisando nuances e gerando interpretações calmas...
                    </Text>
                  </GlassCard>
                )}
              </View>
            )}

            {/* Fluxo 2: Exibição do Resultado e Opção de Nova Análise */}
            {result && (
              <View style={styles.section}>
                {/* Citação da mensagem original submetida */}
                <GlassCard intensity={30} style={styles.originalCard}>
                  <View style={styles.originalHeader}>
                    <Feather name="message-circle" size={14} color={colors.textSecondary} />
                    <Text style={styles.originalLabel}>Mensagem analisada</Text>
                  </View>
                  <Text style={styles.originalText}>"{message}"</Text>
                </GlassCard>

                {/* Componente estruturado com tom, interpretações e ações de cópia */}
                <ReframeResult result={result} />

                {/* Ação de Reset: Nova Análise para retornar ao estado inicial */}
                <PrimaryButton
                  title="Nova Análise"
                  onPress={reset}
                  variant="secondary"
                  icon={<Feather name="rotate-ccw" size={16} color={colors.textPrimary} />}
                  accessibilityLabel="Iniciar nova análise"
                  accessibilityHint="Limpa a análise atual e retorna ao formulário inicial"
                  style={styles.resetButton}
                />
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  header: {
    marginBottom: spacing.xs,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
    marginBottom: spacing.xs - 2,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderWidth: 1,
    borderColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...typography.title,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.subtitle,
    color: colors.textSecondary,
    marginTop: 2,
  },
  section: {
    gap: spacing.md,
  },
  submitButton: {
    marginTop: spacing.xs,
  },
  loadingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  loadingText: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '500',
  },
  originalCard: {
    borderRadius: radius.md,
    padding: spacing.sm,
  },
  originalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  originalLabel: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  originalText: {
    ...typography.body,
    color: colors.textPrimary,
    fontStyle: 'italic',
  },
  resetButton: {
    marginTop: spacing.sm,
  },
  // Esferas decorativas de fundo para contraste do blur glassmorphism
  blobBlue: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: colors.primary,
    opacity: 0.28,
    top: 60,
    left: -80,
  },
  blobPurple: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: '#7C3AED',
    opacity: 0.22,
    top: 360,
    right: -100,
  },
});
