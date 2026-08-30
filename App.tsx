/**
 * Entry point of the ReframeIA application.
 * Renders a design system showcase with multiple glass elements
 * over decorative background blobs for visual reference.
 */

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { GradientBackground } from './src/components/GradientBackground';
import { GlassCard } from './src/components/GlassCard';
import { colors } from './src/constants/colors';
import { spacing, typography } from './src/constants/theme';

export default function App() {
  return (
    <GradientBackground>
      <StatusBar style="light" />

      {/* Decorative color blobs behind the glass to reveal the blur effect */}
      <View style={styles.blobBlue} />
      <View style={styles.blobPurple} />

      <SafeAreaView style={styles.safe}>
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>ReframeIA</Text>
          <Text style={styles.subtitle}>
            Reinterpret social messages with a calm perspective.
          </Text>

          {/* Primary glass card */}
          <GlassCard style={styles.card}>
            <Text style={styles.cardTitle}>Design system preview</Text>
            <Text style={styles.cardBody}>
              This card demonstrates the glassmorphism effect used
              throughout the application.
            </Text>
          </GlassCard>

          {/* Secondary glass card with different intensity */}
          <GlassCard intensity={60} style={styles.card}>
            <Text style={styles.cardTitle}>Higher blur intensity</Text>
            <Text style={styles.cardBody}>
              The intensity prop controls how strong the background
              blur effect appears.
            </Text>
          </GlassCard>

          {/* Two side-by-side glass buttons */}
          <View style={styles.row}>
            <Pressable style={styles.buttonWrapper}>
              <GlassCard intensity={50} style={styles.button}>
                <Text style={styles.buttonText}>Reinterpret</Text>
              </GlassCard>
            </Pressable>

            <Pressable style={styles.buttonWrapper}>
              <GlassCard intensity={50} style={styles.button}>
                <Text style={styles.buttonText}>Clear</Text>
              </GlassCard>
            </Pressable>
          </View>

          {/* Wide primary button */}
          <Pressable>
            <GlassCard intensity={70} style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>New analysis</Text>
            </GlassCard>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  container: {
    padding: spacing.md,
    paddingTop: spacing.lg,
    gap: spacing.md,
  },
  title: {
    ...typography.title,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.subtitle,
    color: colors.textSecondary,
  },
  card: {
    marginTop: spacing.xs,
  },
  cardTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  cardBody: {
    ...typography.body,
    color: colors.textSecondary,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  buttonWrapper: {
    flex: 1,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  primaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  primaryButtonText: {
    ...typography.body,
    fontWeight: '700',
    color: colors.accent,
  },
  // Decorative blobs to reveal the glass blur effect
  blobBlue: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: colors.primary,
    opacity: 0.35,
    top: 120,
    left: -60,
  },
  blobPurple: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#8B5CF6',
    opacity: 0.3,
    top: 380,
    right: -80,
  },
});
