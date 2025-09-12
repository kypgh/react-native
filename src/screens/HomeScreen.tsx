import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Text, Button, Card } from 'react-native-elements';
import { StatusBar } from 'expo-status-bar';
import { HomeScreenProps } from '../types';
import { theme, spacing } from '../theme';

export default function HomeScreen({ navigation }: HomeScreenProps) {
  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Welcome Section */}
          <View style={styles.welcomeSection}>
            <Text h2 style={styles.welcomeTitle}>Welcome Back!</Text>
            <Text style={styles.welcomeSubtitle}>
              Manage your bookings and plans
            </Text>
          </View>

          {/* Quick Actions Grid */}
          <View style={styles.quickActionsContainer}>
            <Text h4 style={styles.sectionTitle}>Quick Actions</Text>

            <View style={styles.actionsGrid}>
              <Button
                title="My Bookings"
                icon={{
                  name: 'calendar-outline',
                  type: 'ionicon',
                  size: 20,
                  color: 'white',
                }}
                buttonStyle={{
                  ...styles.actionButton,
                  backgroundColor: theme.colors.primary,
                }}
                titleStyle={styles.actionButtonText}
                onPress={() => navigation.navigate('Bookings')}
              />

              <Button
                title="Payment Plans"
                icon={{
                  name: 'card-outline',
                  type: 'ionicon',
                  size: 20,
                  color: 'white',
                }}
                buttonStyle={{
                  ...styles.actionButton,
                  backgroundColor: theme.colors.secondary,
                }}
                titleStyle={styles.actionButtonText}
                onPress={() => navigation.navigate('PaymentPlans')}
              />
            </View>
          </View>

          {/* Recent Activity Card */}
          <Card containerStyle={styles.activityCard}>
            <Text h4 style={styles.cardTitle}>Recent Activity</Text>
            <View style={styles.divider} />

            <View style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Text style={styles.activityIconText}>📅</Text>
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>No recent bookings</Text>
                <Text style={styles.activitySubtitle}>Your booking history will appear here</Text>
              </View>
            </View>
          </Card>

          {/* Profile Quick Access */}
          <Card containerStyle={styles.profileCard}>
            <View style={styles.profileHeader}>
              <View style={styles.profileAvatar}>
                <Text style={styles.profileAvatarText}>👤</Text>
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>Your Profile</Text>
                <Text style={styles.profileSubtext}>Manage your account settings</Text>
              </View>
              <Button
                title="View"
                buttonStyle={styles.profileButton}
                titleStyle={styles.profileButtonText}
                onPress={() => navigation.navigate('Profile')}
              />
            </View>
          </Card>
        </View>
      </ScrollView>

      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: spacing.xl,
  },
  welcomeSection: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    backgroundColor: theme.colors.background,
    marginBottom: spacing.md,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: spacing.xs,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: theme.colors.grey2,
    lineHeight: 24,
  },
  quickActionsContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: spacing.md,
  },
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    minHeight: 80,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
  activityCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: 12,
    padding: spacing.lg,
    backgroundColor: theme.colors.background,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.divider,
    marginBottom: spacing.md,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  activityIconText: {
    fontSize: 18,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: spacing.xs,
  },
  activitySubtitle: {
    fontSize: 14,
    color: theme.colors.grey2,
  },
  profileCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: 12,
    padding: spacing.lg,
    backgroundColor: theme.colors.background,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  profileAvatarText: {
    fontSize: 20,
    color: 'white',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: spacing.xs,
  },
  profileSubtext: {
    fontSize: 14,
    color: theme.colors.grey2,
  },
  profileButton: {
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minWidth: 60,
  },
  profileButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
  },
});