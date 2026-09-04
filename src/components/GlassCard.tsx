/**
 * Reusable container with glassmorphism effect.
 * Uses expo-blur BlurView with a translucent overlay and subtle border.
 */

import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { colors } from '../constants/colors';

type Props = {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
};

export function GlassCard({ children, style, intensity = 40 }: Props) {
  return (
    <View style={[styles.wrapper, style]}>
      <BlurView intensity={intensity} tint="dark" style={styles.blur}>
        <View style={styles.overlay}>{children}</View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
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
