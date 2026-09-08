/**
 * Entry point of the ReframeIA application.
 * Main interactive screen featuring input handling, dynamic theme toggling,
 * structured AI reinterpretation results, and clipboard actions.
 */

import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
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
import { colors, pastelColors, AppTheme } from './src/constants/colors';
import { radius, spacing, typography } from './src/constants/theme';

export default function App() {
  const [theme, setTheme] = useState<AppTheme>('pastel');
  const isPastel = theme === 'pastel';

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
    <GradientBackground theme={theme}>
      <StatusBar style={isPastel ? 'dark' : 'light'} />

      {/* Esferas decorativas ativas apenas no tema escuro para o contraste do blur */}
      {!isPastel && (
        <>
          <View style={styles.blobBlue} pointerEvents="none" />
          <View style={styles.blobPurple} pointerEvents="none" />
        </>
      )}

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
              <View style={styles.headerTopRow}>
                <View style={styles.logoRow}>
                  <View
                    style={[
                      styles.iconCircle,
                      isPastel && styles.iconCirclePastel,
                    ]}
                  >
                    <Feather
                      name="shield"
                      size={20}
                      color={isPastel ? pastelColors.primary : colors.accent}
                    />
                  </View>
                  <Text style={[styles.title, isPastel && styles.titlePastel]}>
                    ReframeIA
                  </Text>
                </View>

                {/* Alternador de tema para comparação direta */}
                <Pressable
                  onPress={() =>
                    setTheme((prev) => (prev === 'pastel' ? 'dark' : 'pastel'))
                  }
                  accessibilityRole="button"
                  accessibilityLabel="Alternar tema visual"
                  accessibilityHint="Alterna entre o visual pastel claro com cartões brancos e o visual escuro com glassmorphism"
                  style={({ pressed }) => [
                    styles.themeToggle,
                    isPastel ? styles.themeTogglePastel : styles.themeToggleDark,
                    pressed && styles.themeTogglePressed,
                  ]}
                >
                  <Feather
                    name={isPastel ? 'moon' : 'sun'}
                    size={14}
                    color={isPastel ? pastelColors.primary : colors.accent}
                  />
                  <Text
                    style={[
                      styles.themeToggleText,
                      isPastel
                        ? styles.themeToggleTextPastel
                        : styles.themeToggleTextDark,
                    ]}
                  >
                    {isPastel ? 'Visual Pastel' : 'Visual Glass'}
                  </Text>
                </Pressable>
              </View>

              <Text
                style={[
                  styles.subtitle,
                  isPastel && styles.subtitlePastel,
                ]}
              >
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
                  theme={theme}
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
                  theme={theme}
                />

                {/* Feedback intermediário enquanto a requisição está em andamento */}
                {loading && (
                  <GlassCard
                    intensity={30}
                    theme={theme}
                    style={[
                      styles.loadingCard,
                      isPastel && styles.loadingCardPastel,
                    ]}
                  >
                    <ActivityIndicator
                      size="small"
                      color={isPastel ? pastelColors.primary : colors.accent}
                    />
                    <Text
                      style={[
                        styles.loadingText,
                        isPastel && styles.loadingTextPastel,
                      ]}
                    >
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
                <GlassCard
                  intensity={30}
                  theme={theme}
                  style={[
                    styles.originalCard,
                    isPastel && styles.originalCardPastel,
                  ]}
                >
                  <View style={styles.originalHeader}>
                    <Feather
                      name="message-circle"
                      size={14}
                      color={
                        isPastel
                          ? pastelColors.textSecondary
                          : colors.textSecondary
                      }
                    />
                    <Text
                      style={[
                        styles.originalLabel,
                        isPastel && styles.originalLabelPastel,
                      ]}
                    >
                      Mensagem analisada
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.originalText,
                      isPastel && styles.originalTextPastel,
                    ]}
                  >
                    "{message}"
                  </Text>
                </GlassCard>

                {/* Componente estruturado com tom, interpretações e ações de cópia */}
                <ReframeResult result={result} theme={theme} />

                {/* Ação de Reset: Nova Análise para retornar ao estado inicial */}
                <PrimaryButton
                  title="Nova Análise"
                  onPress={reset}
                  variant="secondary"
                  icon={
                    <Feather
                      name="rotate-ccw"
                      size={16}
                      color={
                        isPastel
                          ? pastelColors.textPrimary
                          : colors.textPrimary
                      }
                    />
                  }
                  accessibilityLabel="Iniciar nova análise"
                  accessibilityHint="Limpa a análise atual e retorna ao formulário inicial"
                  style={styles.resetButton}
                  theme={theme}
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
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
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
  iconCirclePastel: {
    backgroundColor: 'rgba(14, 165, 233, 0.12)',
    borderColor: pastelColors.accent,
  },
  title: {
    ...typography.title,
    color: colors.textPrimary,
  },
  titlePastel: {
    color: pastelColors.textPrimary,
  },
  subtitle: {
    ...typography.subtitle,
    color: colors.textSecondary,
    marginTop: 2,
  },
  subtitlePastel: {
    color: pastelColors.textSecondary,
  },
  themeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 44,
    minWidth: 44,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  themeTogglePastel: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: pastelColors.cardBorder,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  themeToggleDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  themeTogglePressed: {
    opacity: 0.7,
    transform: [{ scale: 0.96 }],
  },
  themeToggleText: {
    ...typography.caption,
    fontWeight: '600',
  },
  themeToggleTextPastel: {
    color: pastelColors.primary,
  },
  themeToggleTextDark: {
    color: colors.textPrimary,
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
  loadingCardPastel: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: pastelColors.cardBorder,
    borderRadius: 20,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  loadingText: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '500',
  },
  loadingTextPastel: {
    color: pastelColors.primary,
  },
  originalCard: {
    borderRadius: radius.md,
    padding: spacing.sm,
  },
  originalCardPastel: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: pastelColors.cardBorder,
    borderRadius: 20,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
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
  originalLabelPastel: {
    color: pastelColors.textSecondary,
  },
  originalText: {
    ...typography.body,
    color: colors.textPrimary,
    fontStyle: 'italic',
  },
  originalTextPastel: {
    color: pastelColors.textPrimary,
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
