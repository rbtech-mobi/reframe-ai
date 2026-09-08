/**
 * Multiline text input with character counter and focus animation.
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  Text,
  Pressable,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { Feather } from '@expo/vector-icons';
import { GlassCard } from './GlassCard';
import { colors, pastelColors, AppTheme } from '../constants/colors';
import { radius, spacing, typography } from '../constants/theme';

interface MessageInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onClear?: () => void;
  placeholder?: string;
  maxLength?: number;
  disabled?: boolean;
  error?: string | null;
  theme?: AppTheme;
}

/**
 * Multiline text input with glass styling, clipboard paste, content clear,
 * haptic and temporary visual feedback, character count and full accessibility.
 */
export function MessageInput({
  value,
  onChangeText,
  onClear,
  placeholder = 'Cole ou digite aqui a mensagem ambígua...',
  maxLength = 1000,
  disabled = false,
  error,
  theme = 'pastel',
}: MessageInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [justPasted, setJustPasted] = useState(false);
  const pasteTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Limpa o timer ao desmontar o componente para evitar vazamento de memória
  useEffect(() => {
    return () => {
      if (pasteTimerRef.current) {
        clearTimeout(pasteTimerRef.current);
      }
    };
  }, []);

  /**
   * Cola texto da área de transferência com feedback tátil e visual temporário.
   */
  const handlePaste = async () => {
    if (disabled) return;

    try {
      // Feedback tátil de impacto leve
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch {
        // Degradação elegante caso haptics não estejam disponíveis
      }

      const clipboardContent = await Clipboard.getStringAsync();
      if (clipboardContent) {
        onChangeText(clipboardContent);

        // Feedback visual temporário de 2 segundos
        setJustPasted(true);
        if (pasteTimerRef.current) {
          clearTimeout(pasteTimerRef.current);
        }
        pasteTimerRef.current = setTimeout(() => {
          setJustPasted(false);
        }, 2000);
      }
    } catch {
      // Ignora falhas de leitura da área de transferência
    }
  };

  /**
   * Limpa o conteúdo digitado com feedback tátil.
   */
  const handleClear = async () => {
    if (disabled || !value) return;

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Degradação elegante caso haptics não estejam disponíveis
    }

    if (onClear) {
      onClear();
    } else {
      onChangeText('');
    }
  };

  const hasContent = value.trim().length > 0;
  const isPastel = theme === 'pastel';

  return (
    <View style={styles.container}>
      <GlassCard
        intensity={50}
        theme={theme}
        style={[
          styles.card,
          isPastel && styles.cardPastel,
          isFocused ? (isPastel ? styles.cardFocusedPastel : styles.cardFocused) : null,
          error ? styles.cardError : null,
        ]}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={isPastel ? pastelColors.textSecondary : colors.textSecondary}
          multiline
          maxLength={maxLength}
          editable={!disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={[styles.textInput, isPastel && styles.textInputPastel]}
          textAlignVertical="top"
          accessibilityLabel="Campo de texto para mensagem ambígua"
          accessibilityHint="Digite ou cole aqui a mensagem que você gostaria de reinterpretar"
        />

        {/* Barra de ações inferiores do input */}
        <View style={[styles.actionToolbar, isPastel && styles.actionToolbarPastel]}>
          {/* Contador de caracteres */}
          <Text style={[styles.charCounter, isPastel && styles.charCounterPastel]}>
            {value.length}/{maxLength}
          </Text>

          <View style={styles.buttonsGroup}>
            {/* Botão de Limpar */}
            {hasContent && (
              <Pressable
                onPress={handleClear}
                disabled={disabled}
                accessibilityRole="button"
                accessibilityLabel="Limpar texto digitado"
                accessibilityHint="Apaga todo o conteúdo atual do campo de texto"
                style={({ pressed }) => [
                  styles.actionButton,
                  isPastel && styles.actionButtonPastel,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Feather name="x" size={16} color={isPastel ? pastelColors.textSecondary : colors.textSecondary} />
                <Text style={[styles.actionButtonText, isPastel && styles.textPastelSecondary]}>Limpar</Text>
              </Pressable>
            )}

            {/* Botão de Colar da Área de Transferência */}
            <Pressable
              onPress={handlePaste}
              disabled={disabled}
              accessibilityRole="button"
              accessibilityLabel="Colar texto da área de transferência"
              accessibilityHint="Cola o texto copiado diretamente no campo de mensagem"
              style={({ pressed }) => [
                styles.actionButton,
                isPastel && styles.actionButtonPastelChip,
                justPasted && (isPastel ? styles.actionButtonPastelSuccess : styles.actionButtonSuccess),
                pressed && styles.buttonPressed,
              ]}
            >
              {justPasted ? (
                <>
                  <Feather name="check" size={16} color={colors.success} />
                  <Text style={[styles.actionButtonText, styles.textSuccess]}>
                    Colado!
                  </Text>
                </>
              ) : (
                <>
                  <Feather name="clipboard" size={16} color={isPastel ? pastelColors.accent : colors.accent} />
                  <Text style={[styles.actionButtonText, isPastel ? styles.textPastelAccent : styles.textAccent]}>
                    Colar
                  </Text>
                </>
              )}
            </Pressable>
          </View>
        </View>
      </GlassCard>

      {/* Exibição de mensagem de erro de validação */}
      {error && (
        <View style={styles.errorRow}>
          <Feather name="alert-circle" size={14} color={colors.danger} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  card: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  cardPastel: {
    borderRadius: 20,
    backgroundColor: pastelColors.cardBg,
    borderColor: pastelColors.cardBorder,
  },
  cardFocused: {
    borderColor: colors.accent,
  },
  cardFocusedPastel: {
    borderColor: pastelColors.accent,
  },
  cardError: {
    borderColor: colors.danger,
  },
  textInput: {
    ...typography.body,
    color: colors.textPrimary,
    minHeight: 120,
    maxHeight: 220,
    paddingHorizontal: 0,
    paddingTop: 0,
    paddingBottom: spacing.sm,
  },
  textInputPastel: {
    color: pastelColors.textPrimary,
    lineHeight: 22,
  },
  actionToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    marginTop: spacing.xs,
  },
  actionToolbarPastel: {
    borderTopColor: '#F1F5F9',
  },
  charCounter: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  charCounterPastel: {
    color: pastelColors.textSecondary,
  },
  buttonsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 44,
    minHeight: 44,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  actionButtonPastel: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
  },
  actionButtonPastelChip: {
    backgroundColor: pastelColors.chipBg,
    borderWidth: 1,
    borderColor: pastelColors.chipBorder,
    borderRadius: 8,
  },
  actionButtonPastelSuccess: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderColor: colors.success,
  },
  textPastelSecondary: {
    color: pastelColors.textSecondary,
  },
  textPastelAccent: {
    color: pastelColors.accent,
    fontWeight: '700',
  },
  actionButtonSuccess: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: colors.success,
  },
  buttonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.96 }],
  },
  actionButtonText: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.textSecondary,
    marginLeft: 6,
  },
  textAccent: {
    color: colors.accent,
  },
  textSuccess: {
    color: colors.success,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    paddingHorizontal: spacing.xs,
    gap: 6,
  },
  errorText: {
    ...typography.caption,
    color: colors.danger,
  },
});
