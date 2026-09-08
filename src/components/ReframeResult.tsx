/**
 * Result card that renders the detected tone, three alternative
 * interpretations and a suggested reply. Includes copy-to-clipboard
 * action and entrance animation.
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { Feather } from '@expo/vector-icons';
import { GlassCard } from './GlassCard';
import type { ReframeResult as ReframeResultType } from '../types';
import { colors } from '../constants/colors';
import { radius, spacing, typography } from '../constants/theme';

interface ReframeResultProps {
  result: ReframeResultType;
}

/**
 * Formats the full analysis result into a clean, human-readable string.
 * Used for clipboard copying of the full result.
 */
export function formatFullResult(result: ReframeResultType): string {
  return [
    'Tom detectado:',
    result.tone,
    '',
    'Interpretações alternativas:',
    `1. ${result.interpretations[0]}`,
    `2. ${result.interpretations[1]}`,
    `3. ${result.interpretations[2]}`,
    '',
    'Resposta sugerida:',
    result.suggestedReply,
  ].join('\n');
}

/**
 * Result component displaying detected tone, 3 alternative interpretations,
 * and suggested reply. Provides independent copy actions for the reply and
 * for the full result, with tactile (expo-haptics) and visual feedback.
 */
export function ReframeResult({ result }: ReframeResultProps) {
  const [copiedReply, setCopiedReply] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);

  const replyTimerRef = useRef<NodeJS.Timeout | null>(null);
  const allTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Limpa timers ao desmontar para evitar vazamento de memória
  useEffect(() => {
    return () => {
      if (replyTimerRef.current) clearTimeout(replyTimerRef.current);
      if (allTimerRef.current) clearTimeout(allTimerRef.current);
    };
  }, []);

  /**
   * Executa feedback tátil seguro.
   */
  const triggerHapticFeedback = async () => {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      // Degradação elegante caso o dispositivo não suporte haptics
    }
  };

  /**
   * Ação A: Copiar apenas a resposta sugerida.
   */
  const handleCopyReply = async () => {
    if (!result.suggestedReply) return;

    await triggerHapticFeedback();
    await Clipboard.setStringAsync(result.suggestedReply);

    setCopiedReply(true);
    if (replyTimerRef.current) clearTimeout(replyTimerRef.current);
    replyTimerRef.current = setTimeout(() => {
      setCopiedReply(false);
    }, 2000);
  };

  /**
   * Ação B: Copiar o resultado completo (tom + interpretações + resposta).
   */
  const handleCopyAll = async () => {
    await triggerHapticFeedback();
    const formatted = formatFullResult(result);
    await Clipboard.setStringAsync(formatted);

    setCopiedAll(true);
    if (allTimerRef.current) clearTimeout(allTimerRef.current);
    allTimerRef.current = setTimeout(() => {
      setCopiedAll(false);
    }, 2000);
  };

  return (
    <View style={styles.container}>
      {/* 1. Tom Detectado */}
      <GlassCard intensity={45} style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Feather name="compass" size={18} color={colors.accent} />
          <Text style={styles.sectionTitle}>Tom detectado</Text>
        </View>
        <Text style={styles.toneText}>{result.tone}</Text>
      </GlassCard>

      {/* 2. Interpretações Alternativas */}
      <GlassCard intensity={45} style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Feather name="layers" size={18} color={colors.accent} />
          <Text style={styles.sectionTitle}>Interpretações alternativas</Text>
        </View>
        <View style={styles.interpretationsList}>
          {result.interpretations.map((item, index) => (
            <View key={index} style={styles.interpretationItem}>
              <View style={styles.indexBadge}>
                <Text style={styles.indexBadgeText}>{index + 1}</Text>
              </View>
              <Text style={styles.interpretationText}>{item}</Text>
            </View>
          ))}
        </View>
      </GlassCard>

      {/* 3. Resposta Sugerida com Ação Independente de Cópia */}
      <GlassCard intensity={50} style={styles.sectionCard}>
        <View style={styles.sectionHeaderBetween}>
          <View style={styles.sectionHeader}>
            <Feather name="message-square" size={18} color={colors.accent} />
            <Text style={styles.sectionTitle}>Resposta sugerida</Text>
          </View>

          {/* Ação A: Copiar apenas a resposta sugerida */}
          <Pressable
            onPress={handleCopyReply}
            accessibilityRole="button"
            accessibilityLabel="Copiar apenas a resposta sugerida"
            accessibilityHint="Copia o texto da resposta sugerida para a área de transferência"
            style={({ pressed }) => [
              styles.copyIconButton,
              copiedReply && styles.copyButtonSuccess,
              pressed && styles.buttonPressed,
            ]}
          >
            {copiedReply ? (
              <>
                <Feather name="check" size={15} color={colors.success} />
                <Text style={[styles.copyButtonText, styles.textSuccess]}>
                  Copiada!
                </Text>
              </>
            ) : (
              <>
                <Feather name="copy" size={15} color={colors.accent} />
                <Text style={[styles.copyButtonText, styles.textAccent]}>
                  Copiar resposta
                </Text>
              </>
            )}
          </Pressable>
        </View>

        <Text style={styles.replyText}>
          {result.suggestedReply || 'Nenhuma resposta específica necessária.'}
        </Text>
      </GlassCard>

      {/* 4. Ação B: Copiar o resultado completo */}
      <View style={styles.fullActionWrapper}>
        <Pressable
          onPress={handleCopyAll}
          accessibilityRole="button"
          accessibilityLabel="Copiar resultado completo"
          accessibilityHint="Copia o tom detectado, as interpretações alternativas e a resposta sugerida"
          style={({ pressed }) => [
            styles.copyAllButton,
            copiedAll && styles.copyAllButtonSuccess,
            pressed && styles.buttonPressed,
          ]}
        >
          {copiedAll ? (
            <>
              <Feather name="check" size={18} color={colors.success} />
              <Text style={[styles.copyAllText, styles.textSuccess]}>
                Análise completa copiada!
              </Text>
            </>
          ) : (
            <>
              <Feather name="copy" size={18} color={colors.textPrimary} />
              <Text style={styles.copyAllText}>
                Copiar resultado completo
              </Text>
            </>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: spacing.md,
  },
  sectionCard: {
    borderRadius: radius.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs + 2,
  },
  sectionHeaderBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs + 2,
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  sectionTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  toneText: {
    ...typography.body,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  interpretationsList: {
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  interpretationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs + 4,
  },
  indexBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(96, 165, 250, 0.18)',
    borderWidth: 1,
    borderColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  indexBadgeText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.accent,
    fontSize: 11,
  },
  interpretationText: {
    ...typography.body,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 22,
  },
  replyText: {
    ...typography.body,
    color: colors.textPrimary,
    lineHeight: 22,
    fontStyle: 'italic',
    marginTop: spacing.xs,
  },
  copyIconButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 44,
    minHeight: 44,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    gap: 6,
  },
  copyButtonSuccess: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  copyButtonText: {
    ...typography.caption,
    fontWeight: '600',
  },
  textAccent: {
    color: colors.accent,
  },
  textSuccess: {
    color: colors.success,
  },
  fullActionWrapper: {
    marginTop: spacing.xs,
  },
  copyAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    minWidth: 44,
    paddingVertical: spacing.xs + 4,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: colors.glassBorder,
    gap: spacing.xs,
  },
  copyAllButtonSuccess: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: colors.success,
  },
  copyAllText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  buttonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
});
