import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, Card } from 'react-native-elements';
import { ProfileScreenProps } from '../types';
import { theme, spacing } from '../theme';

export default function ProfileScreen({ navigation }: ProfileScreenProps) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Card containerStyle={styles.card}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>👤</Text>
          </View>
          <Text h3 style={styles.title}>Profile Setup</Text>
          <Text style={styles.subtitle}>
            Complete your profile to personalize your booking experience and manage your account settings.
          </Text>
        </Card>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  card: {
    borderRadius: 12,
    padding: spacing.xl,
    backgroundColor: theme.colors.background,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  icon: {
    fontSize: 48,
  },
  title: {
    textAlign: 'center',
    marginBottom: spacing.md,
    color: theme.colors.text,
    fontSize: 24,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.grey2,
    textAlign: 'center',
    lineHeight: 24,
  },
});