/**
 * Entry point of the ReframeIA application.
 * Temporary integration test: sends a fixed ambiguous message
 * to the Gemini model and renders the parsed structured response.
 */

import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
} from 'react-native';
import { GradientBackground } from './src/components/GradientBackground';
import { GlassCard } from './src/components/GlassCard';
import { reframeMessage } from './src/services/generator';
import type { ReframeResult } from './src/types';
import { colors } from './src/constants/colors';
import { spacing, typography } from './src/constants/theme';

const SAMPLE_MESSAGE = 'Você está muito bonito nessa foto.';

export default function App() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ReframeResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleTest() {
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const data = await reframeMessage(SAMPLE_MESSAGE);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <GradientBackground>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>ReframeIA</Text>
          <Text style={styles.subtitle}>Structured prompt test</Text>

          <GlassCard style={styles.card}>
            <Text style={styles.cardTitle}>Sample input</Text>
            <Text style={styles.cardBody}>"{SAMPLE_MESSAGE}"</Text>
          </GlassCard>

          <Pressable onPress={handleTest} disabled={loading}>
            <GlassCard intensity={60} style={styles.button}>
              {loading ? (
                <ActivityIndicator color={colors.textPrimary} />
              ) : (
                <Text style={styles.buttonText}>Reframe this message</Text>
              )}
            </GlassCard>
          </Pressable>

          {result && (
            <>
              <GlassCard style={styles.card}>
                <Text style={styles.cardTitle}>Literal content</Text>
                <Text style={styles.cardBody}>{result.literalContent}</Text>
              </GlassCard>

              <GlassCard style={styles.card}>
                <Text style={styles.cardTitle}>Your likely reading</Text>
                <Text style={styles.cardBody}>{result.userLikelyReading}</Text>
              </GlassCard>

              <GlassCard style={styles.card}>
                <Text style={styles.cardTitle}>Alternative readings</Text>
                {result.alternativeReadings.map((r, i) => (
                  <Text key={i} style={styles.cardBody}>
                    {i + 1}. {r}
                  </Text>
                ))}
              </GlassCard>

              <GlassCard style={styles.card}>
                <Text style={styles.cardTitle}>Cannot conclude</Text>
                {result.cannotConclude.map((r, i) => (
                  <Text key={i} style={styles.cardBody}>
                    - {r}
                  </Text>
                ))}
              </GlassCard>

              <GlassCard style={styles.card}>
                <Text style={styles.cardTitle}>Neutral view</Text>
                <Text style={styles.cardBody}>{result.neutralView}</Text>
              </GlassCard>

              <GlassCard style={styles.card}>
                <Text style={styles.cardTitle}>Suggested reply</Text>
                <Text style={styles.cardBody}>{result.suggestedReply}</Text>
              </GlassCard>
            </>
          )}

          {error && (
            <GlassCard style={styles.card}>
              <Text style={[styles.cardTitle, { color: colors.danger }]}>
                Error
              </Text>
              <Text style={styles.cardBody}>{error}</Text>
            </GlassCard>
          )}
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: {
    padding: spacing.md,
    paddingTop: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  title: { ...typography.title, color: colors.textPrimary },
  subtitle: { ...typography.subtitle, color: colors.textSecondary },
  card: {},
  cardTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  cardBody: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  buttonText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
  },
});
