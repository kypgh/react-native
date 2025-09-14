import React, { useState, useMemo } from 'react';
import { StyleSheet, View, ScrollView, Text, TouchableOpacity } from 'react-native';
import { BookingsScreenProps } from '../types';
import { useTheme } from '../theme/ThemeProvider';
import { spacing } from '../theme/spacing';
import { StatsCard } from '../components/common/StatsCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { AnimatedListItem, Card } from '../components/common';
import { formatBookingDate, formatClassTime } from '../utils/dateUtils';
import { formatStatusText } from '../utils/stringUtils';
import { mockBookingsData, BookingsScreenData } from '../data/mockBookingsData';

type FilterType = 'all' | 'pending' | 'upcoming' | 'completed' | 'total';


export default function BookingsScreen({ }: BookingsScreenProps) {
  const { theme } = useTheme();
  const { colors } = theme;
  const [bookingsData] = useState<BookingsScreenData>(mockBookingsData);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');



  // Filter bookings based on active filter
  const filteredBookings = useMemo(() => {
    if (activeFilter === 'all' || activeFilter === 'total') {
      return bookingsData.bookings;
    }
    
    if (activeFilter === 'upcoming') {
      // Upcoming includes both confirmed and pending bookings that are in the future
      return bookingsData.bookings.filter(booking => 
        (booking.status === 'confirmed' || booking.status === 'pending') && 
        booking.date > new Date()
      );
    }
    
    return bookingsData.bookings.filter(booking => {
      switch (activeFilter) {
        case 'pending':
          return booking.status === 'pending';
        case 'completed':
          return booking.status === 'completed';
        default:
          return true;
      }
    });
  }, [bookingsData.bookings, activeFilter]);

  // Handle stats card press for filtering
  const handleStatsCardPress = (filterType: FilterType) => {
    setActiveFilter(filterType);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>
          My Bookings
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Statistics Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <StatsCard
                title="Pending"
                value={bookingsData.stats.pending}
                color={colors.status.pending}
                size="small"
                onPress={() => handleStatsCardPress('pending')}
                selected={activeFilter === 'pending'}
                filterType="pending"
              />
            </View>
            <View style={styles.statCardLast}>
              <StatsCard
                title="Upcoming"
                value={bookingsData.stats.upcoming}
                color={colors.status.confirmed}
                size="small"
                onPress={() => handleStatsCardPress('upcoming')}
                selected={activeFilter === 'upcoming'}
                filterType="upcoming"
              />
            </View>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <StatsCard
                title="Completed"
                value={bookingsData.stats.completed}
                color={colors.status.completed}
                size="small"
                onPress={() => handleStatsCardPress('completed')}
                selected={activeFilter === 'completed'}
                filterType="completed"
              />
            </View>
            <View style={styles.statCardLast}>
              <StatsCard
                title="Total"
                value={bookingsData.stats.total}
                color={colors.primary}
                size="small"
                onPress={() => handleStatsCardPress('total')}
                selected={activeFilter === 'total'}
                filterType="total"
              />
            </View>
          </View>
        </View>

        {/* Bookings List */}
        <View style={styles.bookingsSection}>
          <View style={styles.sectionTitleContainer}>
            <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
              {activeFilter === 'all' || activeFilter === 'total' 
                ? 'Recent Bookings' 
                : `${activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)} Bookings`}
            </Text>
            {filteredBookings.length > 0 && (
              <Text style={[styles.sectionCount, { color: colors.text.secondary }]}>
                ({filteredBookings.length})
              </Text>
            )}
          </View>
          
          {filteredBookings.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyStateText, { color: colors.text.secondary }]}>
                No {activeFilter === 'all' || activeFilter === 'total' ? '' : activeFilter + ' '}bookings found
              </Text>
            </View>
          ) : (
            filteredBookings.map((booking, index) => (
            <AnimatedListItem key={booking.id} index={index} style={styles.bookingCard}>
              <Card
                elevation="low"
                variant="default"
                padding="medium"
                style={styles.bookingCardContent}
              >
                <View style={styles.bookingHeader}>
                  <View style={styles.bookingInfo}>
                    <Text style={[styles.className, { color: colors.text.primary }]}>
                      {booking.className}
                    </Text>
                    {booking.instructor && (
                      <Text style={[styles.instructor, { color: colors.text.secondary }]}>
                        with {booking.instructor}
                      </Text>
                    )}
                  </View>
                  <StatusBadge
                    status={booking.status}
                    text={formatStatusText(booking.status)}
                    size="small"
                  />
                </View>
                
                <View style={styles.bookingDetails}>
                  <View style={styles.detailItem}>
                    <Text style={[styles.detailLabel, { color: colors.text.secondary }]}>
                      Date:
                    </Text>
                    <Text style={[styles.detailValue, { color: colors.text.primary }]}>
                      {formatBookingDate(booking.date)}
                    </Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={[styles.detailLabel, { color: colors.text.secondary }]}>
                      Time:
                    </Text>
                    <Text style={[styles.detailValue, { color: colors.text.primary }]}>
                      {formatClassTime(booking.date)}
                    </Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={[styles.detailLabel, { color: colors.text.secondary }]}>
                      Duration:
                    </Text>
                    <Text style={[styles.detailValue, { color: colors.text.primary }]}>
                      {booking.duration} min
                    </Text>
                  </View>
                </View>

                <TouchableOpacity style={styles.viewDetailsButton}>
                  <Text style={[styles.viewDetailsText, { color: colors.primary }]}>
                    View Details
                  </Text>
                </TouchableOpacity>
              </Card>
            </AnimatedListItem>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },

  statsGrid: {
    marginBottom: spacing.lg,
    width: '100%',
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    width: '100%',
  },
  statCard: {
    flex: 1,
    marginRight: spacing.md,
  },
  statCardLast: {
    flex: 1,
    // No margin for last card in row
  },
  bookingsSection: {
    marginBottom: spacing.xl,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginRight: spacing.xs,
  },
  sectionCount: {
    fontSize: 16,
    fontWeight: 'normal',
  },
  emptyState: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
  },
  bookingCard: {
    marginBottom: spacing.md,
  },
  bookingCardContent: {
    // Additional styling for the card content if needed
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  bookingInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  className: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  instructor: {
    fontSize: 14,
  },
  bookingDetails: {
    marginBottom: spacing.md,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  viewDetailsButton: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.xs,
  },
  viewDetailsText: {
    fontSize: 14,
    fontWeight: '600',
  },
});