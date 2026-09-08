/**
 * Primary action button with glass styling, disabled state
 * and haptic feedback on press.
 */

import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors } from '../constants/colors';
import { radius, spacing, typography } from '../constants/theme';

export type ButtonVariant = 'primary' | 'secondary' | 'glass';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void | Promise<void>;
  loading?: boolean;
  disabled?: boolean;
  variant?: ButtonVariant;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel: string;
  accessibilityHint?: string;
}

/**
 * Primary action button styled with glassmorphic tokens, haptic feedback,
 * a minimum touch target of 44x44, and full accessibility support.
 */
export function PrimaryButton({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  icon,
  style,
  accessibilityLabel,
  accessibilityHint,
}: PrimaryButtonProps) {
  const isInteractive = !disabled && !loading;

  const handlePress = async () => {
    if (!isInteractive) return;

    // Feedback tátil com degradação segura caso a plataforma não suporte
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Plataforma sem suporte a haptics (ex: web desktop)
    }

    onPress();
  };

  const buttonStyleByVariant = {
    primary: styles.buttonPrimary,
    secondary: styles.buttonSecondary,
    glass: styles.buttonGlass,
  }[variant];

  const textStyleByVariant = {
    primary: styles.textPrimaryVariant,
    secondary: styles.textSecondaryVariant,
    glass: styles.textGlassVariant,
  }[variant];

  return (
    <Pressable
      onPress={handlePress}
      disabled={!isInteractive}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={{
        disabled: !isInteractive,
        busy: loading,
      }}
      style={({ pressed }) => [
        styles.touchTarget,
        buttonStyleByVariant,
        !isInteractive && styles.buttonDisabled,
        pressed && isInteractive && styles.buttonPressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? colors.textPrimary : colors.accent}
        />
      ) : (
        <View style={styles.contentRow}>
          {icon && <View style={styles.iconWrapper}>{icon}</View>}
          <Text style={[styles.textBase, textStyleByVariant]}>{title}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  touchTarget: {
    minHeight: 48,
    minWidth: 44,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xs + 4,
    paddingHorizontal: spacing.md,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    marginRight: spacing.xs,
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  buttonSecondary: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  buttonGlass: {
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  textBase: {
    ...typography.body,
    fontWeight: '600',
    textAlign: 'center',
  },
  textPrimaryVariant: {
    color: colors.textPrimary,
  },
  textSecondaryVariant: {
    color: colors.textSecondary,
  },
  textGlassVariant: {
    color: colors.accent,
  },
});
