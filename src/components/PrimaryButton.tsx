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
import { LinearGradient } from 'expo-linear-gradient';
import { colors, pastelColors, AppTheme } from '../constants/colors';
import { radius, spacing, typography } from '../constants/theme';

export type ButtonVariant = 'primary' | 'secondary' | 'glass';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void | Promise<void>;
  loading?: boolean;
  disabled?: boolean;
  variant?: ButtonVariant;
  theme?: AppTheme;
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
  theme = 'pastel',
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

  const isPastel = theme === 'pastel';

  const buttonStyleByVariant = {
    primary: isPastel ? styles.buttonPastelPrimary : styles.buttonPrimary,
    secondary: isPastel ? styles.buttonPastelSecondary : styles.buttonSecondary,
    glass: styles.buttonGlass,
  }[variant];

  const textStyleByVariant = {
    primary: isPastel ? styles.textWhite : styles.textPrimaryVariant,
    secondary: isPastel ? styles.textPastelSecondary : styles.textSecondaryVariant,
    glass: styles.textGlassVariant,
  }[variant];

  const renderContent = () => (
    loading ? (
      <ActivityIndicator
        size="small"
        color={variant === 'primary' ? colors.textPrimary : isPastel ? pastelColors.primary : colors.accent}
      />
    ) : (
      <View style={styles.contentRow}>
        {icon && <View style={styles.iconWrapper}>{icon}</View>}
        <Text style={[styles.textBase, textStyleByVariant]}>{title}</Text>
      </View>
    )
  );

  if (isPastel && variant === 'primary' && !disabled) {
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
          styles.touchTargetPill,
          pressed && isInteractive && styles.buttonPressed,
          style,
        ]}
      >
        <LinearGradient
          colors={[pastelColors.ribbonStart, pastelColors.ribbonEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientPill}
        >
          {renderContent()}
        </LinearGradient>
      </Pressable>
    );
  }

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
        isPastel && styles.touchTargetPill,
        buttonStyleByVariant,
        !isInteractive && styles.buttonDisabled,
        pressed && isInteractive && styles.buttonPressed,
        style,
      ]}
    >
      {renderContent()}
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
  touchTargetPill: {
    minHeight: 52,
    minWidth: 44,
    borderRadius: 999,
    paddingVertical: 0,
    paddingHorizontal: 0,
    overflow: 'hidden',
  },
  gradientPill: {
    width: '100%',
    minHeight: 52,
    minWidth: 44,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
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
  buttonPastelPrimary: {
    backgroundColor: pastelColors.primary,
    borderRadius: 999,
  },
  buttonSecondary: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  buttonPastelSecondary: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: pastelColors.cardBorder,
    borderRadius: 999,
    minHeight: 52,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
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
  textWhite: {
    color: '#FFFFFF',
  },
  textPastelSecondary: {
    color: pastelColors.textPrimary,
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
