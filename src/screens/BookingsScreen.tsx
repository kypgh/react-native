import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Text, TouchableOpacity } from 'react-native';
import { BookingsScreenProps } from '../types';
import { useTheme } from '../theme/ThemeProvider';
import { spacing } from '../theme/spacing';
import { StatsCard } from '../components/common/StatsCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { AnimatedListItem, FadeInView } from '../components/common';
import { formatBookingDate, formatClassTime } from '../utils/dateUtils';
import { formatStatusText } from '../utils/stringUtils';
import { mockBookingsData,  BookingsScreenData } from '../data/mockBookingsData';


export default function BookingsScreen({ }: BookingsScreenProps) {
  const { theme } = useTheme();
  const { colors } = theme;
  const [bookingsData, setBookingsData] = useState<BookingsScreenData>(mockBookingsData);
  const [selectedView, setSelectedView] = useState<'list' | 'grid'>('list');

  const sortOptions = [
    { label: 'Date', value: 'date' },
    { label: 'Status', value: 'status' },
    { label: 'Class', value: 'class' },
  ];

  const filterOptions = [
    { label: 'All', value: 'all' },
    { label: 'Pending', value: 'pending' },
    { label: 'Confirmed', value: 'confirmed' },
    { label: 'Completed', value: 'completed' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>
          My Bookings
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Controls Section */}
        <View style={styles.controlsSection}>
          {/* Sort and Filter Row */}
          <View style={styles.controlsRow}>
            {/* Sort Dropdown */}
            <View style={styles.dropdownContainer}>
              <Text style={[styles.controlLabel, { color: colors.text.secondary }]}>
                Sort by:
              </Text>
              <View style={[styles.dropdown, { backgroundColor: colors.surface }]}>
                <Text style={[styles.dropdownText, { color: colors.text.primary }]}>
                  {sortOptions.find(opt => opt.value === bookingsData.sortBy)?.label}
                </Text>
                <Text style={[styles.dropdownArrow, { color: colors.text.secondary }]}>
                  ▼
                </Text>
              </View>
            </View>

            {/* View Toggle Buttons */}
            <View style={styles.viewToggle}>
              <TouchableOpacity
                style={[
                  styles.viewButton,
                  selectedView === 'list' && { backgroundColor: colors.primary },
                  { borderColor: colors.primary }
                ]}
                onPress={() => setSelectedView('list')}
              >
                <Text style={[
                  styles.viewButtonText,
                  { color: selectedView === 'list' ? '#FFFFFF' : colors.primary }
                ]}>
                  List
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.viewButton,
                  selectedView === 'grid' && { backgroundColor: colors.primary },
                  { borderColor: colors.primary }
                ]}
                onPress={() => setSelectedView('grid')}
              >
                <Text style={[
                  styles.viewButtonText,
                  { color: selectedView === 'grid' ? '#FFFFFF' : colors.primary }
                ]}>
                  Grid
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Filter Chips */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.filterChips}
          >
            {filterOptions.map((filter) => (
              <TouchableOpacity
                key={filter.value}
                style={[
                  styles.filterChip,
                  { 
                    backgroundColor: filter.value === 'all' ? colors.primary : colors.surface,
                    borderColor: colors.primary 
                  }
                ]}
              >
                <Text style={[
                  styles.filterChipText,
                  { color: filter.value === 'all' ? '#FFFFFF' : colors.text.primary }
                ]}>
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Statistics Grid */}
        <FadeInView delay={100}>
          <View style={styles.statsGrid}>
          <View style={styles.statsRow}>
            <StatsCard
              title="Pending"
              value={bookingsData.stats.pending}
              color={colors.status.pending}
              size="small"
              style={styles.statCard}
            />
            <StatsCard
              title="Upcoming"
              value={bookingsData.stats.upcoming}
              color={colors.status.confirmed}
              size="small"
              style={styles.statCard}
            />
          </View>
          <View style={styles.statsRow}>
            <StatsCard
              title="Completed"
              value={bookingsData.stats.completed}
              color={colors.status.completed}
              size="small"
              style={styles.statCard}
            />
            <StatsCard
              title="Total"
              value={bookingsData.stats.total}
              color={colors.primary}
              size="small"
              style={styles.statCard}
            />
          </View>
        </View>
        </FadeInView>

        {/* Bookings List */}
        <View style={styles.bookingsSection}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
            Recent Bookings
          </Text>
          
          {bookingsData.bookings.map((booking, index) => (
            <AnimatedListItem key={booking.id} index={index} style={styles.bookingCard}>
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
            </AnimatedListItem>
          ))}
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
  controlsSection: {
    marginBottom: spacing.lg,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  dropdownContainer: {
    flex: 1,
    marginRight: spacing.md,
  },
  controlLabel: {
    fontSize: 14,
    marginBottom: spacing.xs,
    fontWeight: '500',
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    minHeight: 40,
  },
  dropdownText: {
    fontSize: 16,
    fontWeight: '500',
  },
  dropdownArrow: {
    fontSize: 12,
  },
  viewToggle: {
    flexDirection: 'row',
    borderRadius: 8,
    overflow: 'hidden',
  },
  viewButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    minWidth: 60,
    alignItems: 'center',
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  filterChips: {
    marginTop: spacing.xs,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: spacing.sm,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  statsGrid: {
    marginBottom: spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  statCard: {
    marginRight: spacing.sm,
  },
  bookingsSection: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: spacing.md,
  },
  bookingCard: {
    marginBottom: spacing.md,
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