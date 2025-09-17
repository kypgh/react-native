import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { spacing } from '../../theme/spacing';
import {
  SkeletonLoader,
  SkeletonText,
  SkeletonCircle,
  SkeletonCard,
  SkeletonList,
} from './SkeletonLoader';

// Home Screen Skeleton - Full screen loading
export const HomeScreenSkeleton: React.FC = () => {
  const { theme } = useTheme();
  const { colors } = theme;

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.categoriesSection}>
        <View style={styles.categoriesHeader}>
          <SkeletonLoader 
            width={140} 
            height={20} 
            borderRadius={4}
            backgroundColor={colors.background}
            opacity={0.3}
          />
          <SkeletonLoader 
            width={80} 
            height={16} 
            borderRadius={4}
            backgroundColor={colors.background}
            opacity={0.3}
          />
        </View>
        <ClassCategoriesContentSkeleton />
      </View>
      
      <View style={styles.scheduleSection}>
        <SkeletonLoader 
          width={80} 
          height={20} 
          borderRadius={4}
          backgroundColor={colors.background}
          opacity={0.3}
          style={styles.sectionTitle}
        />
        <View style={styles.scheduleDates}>
          {Array.from({ length: 5 }).map((_, index) => (
            <View key={index} style={styles.dateItem}>
              <SkeletonLoader 
                width={48} 
                height={64} 
                borderRadius={12}
                backgroundColor={index === 2 ? colors.primary : colors.surface}
                opacity={index === 2 ? 0.8 : 0.4}
              />
            </View>
          ))}
        </View>
      </View>
      
      <View style={styles.classListSection}>
        <SkeletonLoader 
          width={140} 
          height={20} 
          borderRadius={4}
          backgroundColor={colors.background}
          opacity={0.3}
          style={styles.sectionTitle}
        />
        <ClassListContentSkeleton />
      </View>
    </ScrollView>
  );
};

// Class Categories Content Skeleton (just the tabs, no title)
export const ClassCategoriesContentSkeleton: React.FC = () => {
  const { theme } = useTheme();
  const { colors } = theme;

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={styles.categoriesTabs}>
        <SkeletonLoader
          width={90}
          height={44}
          borderRadius={22}
          backgroundColor={colors.primary}
          opacity={0.6}
          style={styles.categoryTabActive}
        />
        {Array.from({ length: 2 }).map((_, index) => (
          <SkeletonLoader
            key={index}
            width={70}
            height={44}
            borderRadius={22}
            backgroundColor={colors.surface}
            opacity={0.4}
            style={styles.categoryTab}
          />
        ))}
      </View>
    </ScrollView>
  );
};



// Class List Content Skeleton (just the cards, no title)
export const ClassListContentSkeleton: React.FC = () => {
  return (
    <>
      {Array.from({ length: 2 }).map((_, index) => (
        <ClassCardSkeleton key={index} />
      ))}
    </>
  );
};

// Individual Class Card Skeleton
export const ClassCardSkeleton: React.FC = () => {
  const { theme } = useTheme();
  const { colors } = theme;

  return (
    <View style={[styles.classCardSkeleton, { backgroundColor: colors.surface }]}>
      <View style={styles.classCardHeader}>
        <View style={styles.classCardInfo}>
          <SkeletonLoader 
            width={120} 
            height={18} 
            borderRadius={4}
            backgroundColor={colors.background}
            opacity={0.4}
          />
          <SkeletonLoader 
            width={100} 
            height={14} 
            borderRadius={4}
            backgroundColor={colors.background}
            opacity={0.3}
            style={styles.classCardSubtitle}
          />
        </View>
        <SkeletonLoader 
          width={60} 
          height={36} 
          borderRadius={8}
          backgroundColor={colors.primary}
          opacity={0.6}
        />
      </View>
      
      <View style={styles.classCardDetails}>
        <View style={styles.classDetailItem}>
          <SkeletonLoader 
            width={30} 
            height={12} 
            borderRadius={4}
            backgroundColor={colors.background}
            opacity={0.25}
          />
          <SkeletonLoader 
            width={50} 
            height={14} 
            borderRadius={4}
            backgroundColor={colors.background}
            opacity={0.35}
            style={styles.classDetailValue}
          />
        </View>
        
        <View style={styles.classDetailItem}>
          <SkeletonLoader 
            width={50} 
            height={12} 
            borderRadius={4}
            backgroundColor={colors.background}
            opacity={0.25}
          />
          <SkeletonLoader 
            width={40} 
            height={14} 
            borderRadius={4}
            backgroundColor={colors.background}
            opacity={0.35}
            style={styles.classDetailValue}
          />
        </View>
        
        <View style={styles.classDetailItem}>
          <SkeletonLoader 
            width={80} 
            height={12} 
            borderRadius={4}
            backgroundColor={colors.background}
            opacity={0.25}
          />
          <SkeletonLoader 
            width={60} 
            height={14} 
            borderRadius={4}
            backgroundColor={colors.background}
            opacity={0.35}
            style={styles.classDetailValue}
          />
        </View>
      </View>
    </View>
  );
};

// Profile Screen Skeleton
export const ProfileScreenSkeleton: React.FC = () => {
  const { theme } = useTheme();
  const { colors } = theme;

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <SkeletonCircle size={80} style={styles.profileAvatar} />
        <SkeletonText lines={2} lineHeight={20} style={styles.profileInfo} />
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        {Array.from({ length: 3 }).map((_, index) => (
          <View key={index} style={styles.statCard}>
            <SkeletonLoader height={24} width="60%" />
            <SkeletonLoader height={16} width="40%" style={styles.statValue} />
          </View>
        ))}
      </View>

      {/* Menu Items */}
      <View style={styles.menuSection}>
        <SkeletonList
          itemCount={6}
          itemHeight={50}
          showSeparator={true}
        />
      </View>
    </ScrollView>
  );
};

// Payment Plans Screen Skeleton
export const PaymentPlansScreenSkeleton: React.FC = () => {
  const { theme } = useTheme();
  const { colors } = theme;

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.plansHeader}>
        <SkeletonText lines={2} lineHeight={20} />
      </View>

      {/* Plan Type Tabs */}
      <View style={styles.planTabs}>
        <SkeletonLoader width={120} height={40} borderRadius={20} />
        <SkeletonLoader width={120} height={40} borderRadius={20} />
      </View>

      {/* Plan Cards */}
      <View style={styles.planCards}>
        {Array.from({ length: 3 }).map((_, index) => (
          <View key={index} style={[styles.planCard, { backgroundColor: colors.surface }]}>
            <SkeletonLoader height={20} width="70%" style={styles.planTitle} />
            <SkeletonLoader height={32} width="50%" style={styles.planPrice} />
            <SkeletonText lines={3} lineHeight={14} style={styles.planFeatures} />
            <SkeletonLoader height={44} borderRadius={22} style={styles.planButton} />
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

// Bookings Screen Skeleton
export const BookingsScreenSkeleton: React.FC = () => {
  const { theme } = useTheme();
  const { colors } = theme;

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header with Tabs */}
      <View style={styles.bookingsHeader}>
        <View style={styles.bookingTabs}>
          {Array.from({ length: 3 }).map((_, index) => (
            <SkeletonLoader
              key={index}
              width={80}
              height={32}
              borderRadius={16}
              style={styles.bookingTab}
            />
          ))}
        </View>
      </View>

      {/* Booking Cards */}
      <View style={styles.bookingCards}>
        {Array.from({ length: 4 }).map((_, index) => (
          <View key={index} style={[styles.bookingCard, { backgroundColor: colors.surface }]}>
            <View style={styles.bookingCardHeader}>
              <SkeletonLoader width={60} height={60} borderRadius={8} />
              <View style={styles.bookingCardInfo}>
                <SkeletonLoader height={18} width="80%" />
                <SkeletonLoader height={14} width="60%" style={styles.bookingTime} />
                <SkeletonLoader height={12} width="40%" style={styles.bookingStatus} />
              </View>
            </View>
            <View style={styles.bookingCardActions}>
              <SkeletonLoader width={80} height={32} borderRadius={16} />
              <SkeletonLoader width={80} height={32} borderRadius={16} />
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

// Generic Loading Screen
export const GenericLoadingSkeleton: React.FC<{
  showHeader?: boolean;
  showList?: boolean;
  showCards?: boolean;
  itemCount?: number;
}> = ({
  showHeader = true,
  showList = false,
  showCards = true,
  itemCount = 3,
}) => {
  const { theme } = useTheme();
  const { colors } = theme;

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {showHeader && (
        <View style={styles.genericHeader}>
          <SkeletonText lines={1} lineHeight={24} />
        </View>
      )}

      {showList && (
        <SkeletonList itemCount={itemCount} />
      )}

      {showCards && (
        <View style={styles.genericCards}>
          {Array.from({ length: itemCount }).map((_, index) => (
            <SkeletonCard
              key={index}
              showImage={true}
              showTitle={true}
              showSubtitle={true}
              showDescription={true}
            />
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  // Home Screen Skeleton Styles
  categoriesSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  categoriesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  categoriesTabs: {
    flexDirection: 'row',
    paddingRight: spacing.lg,
  },
  categoryTabActive: {
    marginRight: spacing.md,
  },
  categoryTab: {
    marginRight: spacing.md,
  },
  
  scheduleSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  sectionTitle: {
    marginBottom: spacing.sm,
  },
  scheduleDates: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateItem: {
    alignItems: 'center',
  },
  
  classListSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  
  classCardSkeleton: {
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    marginHorizontal: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  classCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  classCardInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  classCardSubtitle: {
    marginTop: spacing.xs,
  },
  classCardDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  classDetailItem: {
    flex: 1,
  },
  classDetailValue: {
    marginTop: spacing.xs,
  },

  // Profile Screen Styles
  profileHeader: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  profileAvatar: {
    marginBottom: spacing.md,
  },
  profileInfo: {
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: spacing.xs,
  },
  statValue: {
    marginTop: spacing.xs,
  },
  menuSection: {
    paddingHorizontal: spacing.lg,
  },

  // Payment Plans Styles
  plansHeader: {
    padding: spacing.lg,
  },
  planTabs: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  planCards: {
    paddingHorizontal: spacing.lg,
  },
  planCard: {
    padding: spacing.lg,
    borderRadius: 12,
    marginBottom: spacing.md,
  },
  planTitle: {
    marginBottom: spacing.sm,
  },
  planPrice: {
    marginBottom: spacing.md,
  },
  planFeatures: {
    marginBottom: spacing.lg,
  },
  planButton: {
    // No additional styles needed
  },

  // Bookings Screen Styles
  bookingsHeader: {
    padding: spacing.lg,
  },
  bookingTabs: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
  },
  bookingTab: {
    // No additional styles needed
  },
  bookingCards: {
    paddingHorizontal: spacing.lg,
  },
  bookingCard: {
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.md,
  },
  bookingCardHeader: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  bookingCardInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  bookingTime: {
    marginTop: spacing.xs,
  },
  bookingStatus: {
    marginTop: spacing.xs,
  },
  bookingCardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
  },

  // Generic Styles
  genericHeader: {
    padding: spacing.lg,
  },
  genericCards: {
    paddingHorizontal: spacing.lg,
  },
});