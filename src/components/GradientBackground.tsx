/**
 * Full-screen linear gradient background used as the base layer
 * of every screen. Transitions from deep blue to blue-gray.
 */

import React from 'react';
import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, pastelColors, AppTheme } from '../constants/colors';

type Props = {
  children: React.ReactNode;
  theme?: AppTheme;
};

export function GradientBackground({ children, theme = 'pastel' }: Props) {
  const gradientColors: [string, string] =
    theme === 'pastel'
      ? [pastelColors.bgTop, pastelColors.bgBottom]
      : [colors.bgTop, colors.bgBottom];

  return (
    <LinearGradient
      colors={gradientColors}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
