/**
 * Reusable container with glassmorphism effect.
 * Uses expo-blur BlurView with a translucent overlay and subtle border.
 */

import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { colors, pastelColors, AppTheme } from '../constants/colors';

type Props = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  intensity?: number;
  theme?: AppTheme;
};

export function GlassCard({ children, style, intensity = 40, theme = 'pastel' }: Props) {
  if (theme === 'pastel') {
    return (
      <View style={[styles.pastelCard, style]}>
        {children}
      </View>
    );
  }

  return (
    <View style={[styles.wrapper, style]}>
      <BlurView intensity={intensity} tint="dark" style={styles.blur}>
        <View style={styles.overlay}>{children}</View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  pastelCard: {
    borderRadius: 20,
    backgroundColor: pastelColors.cardBg,
    borderWidth: 1,
    borderColor: pastelColors.cardBorder,
    padding: 20,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
  wrapper: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  blur: {
    flex: 1,
  },
  overlay: {
    backgroundColor: colors.glass,
    padding: 24,
  },
});
