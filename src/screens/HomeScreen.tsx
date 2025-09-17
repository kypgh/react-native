import React, { useCallback, useMemo } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Text,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { HomeScreenProps } from "../types";
import { Session } from "../types/api";
import { spacing, useResponsiveLayout, useTheme } from "../theme";
import { AnimatedListItem, FadeInView, DateScrollPicker } from "../components";
import {
  ErrorDisplay,
  HomeScreenSkeleton,
  ClassCategoriesContentSkeleton,
  ClassListContentSkeleton,
} from "../components/common";
import { formatAvailableSpots } from "../utils/formatUtils";
import { useHomeData } from "../hooks/useHomeData";
import {
  createGymInfoFromBrand,
  formatSessionTime,
  getSessionDurationText,
  hasLowAvailability,
} from "../utils/homeDataTransformer";

export default function HomeScreen(_props: HomeScreenProps) {
  const layout = useResponsiveLayout();
  const { theme } = useTheme();
  const styles = createStyles(layout, theme);

  // Use the home data hook for real API integration
  const {
    brands,
    selectedDate,
    selectedCategory,
    isLoading,
    error,
    isRefreshing,
    filteredSessions,
    availableCategories,
    availableDates,
    hasData,
    hasAnySessions,
    setSelectedDate,
    setSelectedCategory,
    refreshData,
    retryWithDelay,
  } = useHomeData();

  // Create gym info from the first brand or use fallback
  const gymInfo = useMemo(() => {
    return createGymInfoFromBrand(brands[0]);
  }, [brands]);

  // Handle refresh
  const onRefresh = useCallback(() => {
    refreshData();
  }, [refreshData]);

  // Handle book button press
  const handleBookClass = useCallback((session: Session) => {
    // TODO: Navigate to booking screen or show booking modal
    console.log("Book class:", session.class?.name);
  }, []);

  // Show error state if there's an error and no data
  if (error && !hasData) {
    const handleRetry =
      error.code === "RATE_LIMIT" ? () => retryWithDelay(5000) : refreshData;

    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <ErrorDisplay
          error={error}
          onRetry={handleRetry}
          style={styles.errorContainer}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Modern Clean Header */}
      <LinearGradient
        colors={["#6366F1", "#8B5CF6"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.gymName}>{gymInfo.name}</Text>
          <View style={styles.taglineContainer}>
            <View style={styles.taglineDot} />
            <Text style={styles.gymTagline}>{gymInfo.tagline}</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
      >
        <View style={styles.content}>
          {/* Class Filter Tabs Section */}
          <FadeInView delay={100}>
            <View style={styles.filterSection}>
              <View style={styles.filterHeader}>
                <Text style={styles.sectionTitle}>Class Categories</Text>
                <Text style={styles.viewDetailsButton}>View Details</Text>
              </View>

              {isLoading && !hasData ? (
                <ClassCategoriesContentSkeleton />
              ) : (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.filterTabsContainer}
                  contentContainerStyle={styles.filterTabsContent}
                >
                  {availableCategories.map((filter, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.filterTab,
                        selectedCategory === filter
                          ? styles.filterTabActive
                          : null,
                      ]}
                      onPress={() => setSelectedCategory(filter)}
                    >
                      <Text
                        style={[
                          styles.filterTabText,
                          selectedCategory === filter
                            ? styles.filterTabTextActive
                            : null,
                        ]}
                      >
                        {filter}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>
          </FadeInView>

          {/* Date Selection Section */}
          <FadeInView delay={200}>
            <View style={styles.calendarSection}>
              <Text style={styles.sectionTitle}>Schedule</Text>
              <DateScrollPicker
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
                maxRange={2}
                minRange={0}
                disabled={isLoading && !hasData}
                availableDates={availableDates}
              />
            </View>
          </FadeInView>

          {/* Class List Section */}
          <FadeInView delay={300}>
            <View style={styles.classListSection}>
              <Text style={styles.sectionTitle}>Available Classes</Text>

              {/* Show error banner if there's an error but we have data */}
              {error && hasData && (
                <ErrorDisplay
                  error={error}
                  onRetry={
                    error.code === "RATE_LIMIT"
                      ? () => retryWithDelay(5000)
                      : refreshData
                  }
                  compact={true}
                  style={styles.errorBanner}
                />
              )}

              {/* Show loading skeleton for class list if loading or refreshing */}
              {(isLoading && !hasData) || isRefreshing ? (
                <ClassListContentSkeleton />
              ) : (
                filteredSessions.map((session, index) => (
                  <AnimatedListItem
                    key={session._id}
                    index={index}
                    style={styles.classCard}
                  >
                    <View style={styles.classCardHeader}>
                      <View style={styles.classInfo}>
                        <Text style={styles.className}>
                          {session.class?.name || "Unknown Class"}
                        </Text>
                        <Text style={styles.classInstructor}>
                          {session.brand?.name || "Instructor TBA"}
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={[
                          styles.bookButton,
                          session.availableSpots <= 0
                            ? styles.bookButtonDisabled
                            : null,
                        ]}
                        onPress={() => handleBookClass(session)}
                        disabled={session.availableSpots <= 0}
                      >
                        <Text
                          style={[
                            styles.bookButtonText,
                            session.availableSpots <= 0
                              ? styles.bookButtonTextDisabled
                              : null,
                          ]}
                        >
                          {session.availableSpots <= 0 ? "Full" : "Book"}
                        </Text>
                      </TouchableOpacity>
                    </View>

                    <View style={styles.classDetails}>
                      <View style={styles.classDetailItem}>
                        <Text style={styles.classDetailLabel}>Time</Text>
                        <Text style={styles.classDetailValue}>
                          {formatSessionTime(session)}
                        </Text>
                      </View>

                      <View style={styles.classDetailItem}>
                        <Text style={styles.classDetailLabel}>Duration</Text>
                        <Text style={styles.classDetailValue}>
                          {getSessionDurationText(session)}
                        </Text>
                      </View>

                      <View style={styles.classDetailItem}>
                        <Text style={styles.classDetailLabel}>
                          Available Spots
                        </Text>
                        <Text
                          style={[
                            styles.classDetailValue,
                            hasLowAvailability(session)
                              ? styles.lowSpotsText
                              : null,
                          ]}
                        >
                          {formatAvailableSpots(
                            session.availableSpots,
                            session.capacity
                          )}
                        </Text>
                      </View>
                    </View>
                  </AnimatedListItem>
                ))
              )}

              {!hasAnySessions && !isLoading && !isRefreshing && (
                <View style={styles.noClassesContainer}>
                  <Text style={styles.noClassesText}>
                    No sessions are currently available. Please check back
                    later.
                  </Text>
                  <TouchableOpacity
                    style={styles.refreshButton}
                    onPress={refreshData}
                  >
                    <Text style={styles.refreshButtonText}>Refresh</Text>
                  </TouchableOpacity>
                </View>
              )}

              {hasAnySessions &&
                filteredSessions.length === 0 &&
                !isLoading &&
                !isRefreshing && (
                  <View style={styles.noClassesContainer}>
                    <Text style={styles.noClassesText}>
                      No "{selectedCategory}" classes available on{" "}
                      {selectedDate.toLocaleDateString()}
                    </Text>
                    <Text style={styles.noClassesSubtext}>
                      Try selecting a different category or date.
                    </Text>
                  </View>
                )}
            </View>
          </FadeInView>
        </View>
      </ScrollView>
    </View>
  );
}

const createStyles = (
  layout: ReturnType<typeof useResponsiveLayout>,
  theme: any
) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      paddingTop: spacing.md,
      paddingBottom: spacing.md,
      paddingHorizontal: layout.containerPadding,
      borderRadius: 16,
      marginHorizontal: spacing.sm,
      marginTop: spacing.sm,
      shadowColor: "#6366F1",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 8,
    },
    headerContent: {
      alignItems: "flex-start",
      justifyContent: "center",
    },
    gymName: {
      fontSize: layout.deviceType.isTablet
        ? 22
        : layout.deviceType.isSmallPhone
        ? 18
        : 20,
      fontWeight: "700",
      color: "#FFFFFF",
      marginBottom: spacing.xs,
      letterSpacing: 0.3,
    },
    taglineContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    taglineDot: {
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor: "rgba(255, 255, 255, 0.7)",
      marginRight: spacing.xs,
    },
    gymTagline: {
      fontSize: layout.deviceType.isTablet
        ? 13
        : layout.deviceType.isSmallPhone
        ? 11
        : 12,
      color: "rgba(255, 255, 255, 0.9)",
      fontWeight: "500",
      letterSpacing: 0.2,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
    },
    content: {
      paddingBottom: spacing.xl,
      marginTop: -spacing.md, // Smaller overlap
    },
    filterSection: {
      paddingHorizontal: layout.containerPadding,
      paddingTop: spacing.lg, // Consistent top spacing
      paddingBottom: spacing.md, // Less bottom spacing
      backgroundColor: theme.colors.background,
    },
    filterHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: spacing.sm, // Reduced spacing
    },
    viewDetailsButton: {
      fontSize: layout.deviceType.isTablet ? 16 : 14,
      color: theme.colors.primary,
      fontWeight: "600",
    },
    filterTabsContainer: {
      flexGrow: 0,
    },
    filterTabsContent: {
      paddingRight: layout.containerPadding,
    },
    filterTab: {
      paddingHorizontal: layout.deviceType.isTablet ? spacing.xl : spacing.lg,
      paddingVertical: layout.deviceType.isTablet ? spacing.lg : spacing.md,
      marginRight: spacing.md, // More space between tabs
      borderRadius: layout.deviceType.isTablet ? 25 : 22, // More rounded
      backgroundColor: theme.colors.surface,
      borderWidth: 0, // Remove border for cleaner look
      minHeight: layout.buttonHeight * 0.8,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    filterTabActive: {
      backgroundColor: theme.colors.primary,
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 6,
    },
    filterTabText: {
      fontSize: layout.deviceType.isTablet
        ? 16
        : layout.deviceType.isSmallPhone
        ? 13
        : 14,
      fontWeight: "500",
      color: theme.colors.text.primary,
    },
    filterTabTextActive: {
      color: "#FFFFFF",
    },
    calendarSection: {
      paddingHorizontal: layout.containerPadding,
      paddingTop: spacing.md, // Reduced from layout.sectionSpacing
      paddingBottom: spacing.sm, // Less bottom spacing
    },
    classListSection: {
      paddingHorizontal: layout.containerPadding,
      paddingTop: spacing.md, // Reduced from layout.sectionSpacing
      paddingBottom: spacing.lg, // Consistent bottom spacing
    },
    classCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: layout.deviceType.isTablet ? 20 : 16, // More rounded for modern look
      padding: layout.deviceType.isTablet ? spacing.xl : spacing.lg,
      marginBottom: spacing.lg, // More space between cards
      marginHorizontal: 2, // Slight margin for shadow
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 }, // Deeper shadow
      shadowOpacity: 0.08, // Softer shadow
      shadowRadius: 12, // More blur
      elevation: 4,
    },
    classCardHeader: {
      flexDirection: layout.deviceType.isSmallPhone ? "column" : "row",
      justifyContent: "space-between",
      alignItems: layout.deviceType.isSmallPhone ? "stretch" : "flex-start",
      marginBottom: spacing.md,
    },
    classInfo: {
      flex: 1,
      marginRight: layout.deviceType.isSmallPhone ? 0 : spacing.md,
      marginBottom: layout.deviceType.isSmallPhone ? spacing.sm : 0,
    },
    className: {
      fontSize: layout.deviceType.isTablet
        ? 20
        : layout.deviceType.isSmallPhone
        ? 16
        : 18,
      fontWeight: "600",
      color: theme.colors.text.primary,
      marginBottom: spacing.xs,
    },
    classInstructor: {
      fontSize: layout.deviceType.isTablet
        ? 16
        : layout.deviceType.isSmallPhone
        ? 13
        : 14,
      color: theme.colors.text.secondary,
    },
    bookButton: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: layout.deviceType.isTablet ? spacing.xl : spacing.lg,
      paddingVertical: layout.deviceType.isTablet ? spacing.md : spacing.sm,
      borderRadius: layout.deviceType.isTablet ? 10 : 8,
      minHeight: Math.max(36, layout.buttonHeight * 0.75), // Ensure proper touch target
      justifyContent: "center",
      alignItems: "center",
    },
    bookButtonText: {
      fontSize: layout.deviceType.isTablet ? 16 : 14,
      fontWeight: "600",
      color: "#FFFFFF",
    },
    classDetails: {
      flexDirection: layout.deviceType.isSmallPhone ? "column" : "row",
      justifyContent: "space-between",
      gap: layout.deviceType.isSmallPhone ? spacing.sm : 0,
    },
    classDetailItem: {
      flex: layout.deviceType.isSmallPhone ? 0 : 1,
      flexDirection: layout.deviceType.isSmallPhone ? "row" : "column",
      justifyContent: layout.deviceType.isSmallPhone
        ? "space-between"
        : "flex-start",
    },
    classDetailLabel: {
      fontSize: layout.deviceType.isTablet
        ? 14
        : layout.deviceType.isSmallPhone
        ? 13
        : 12,
      color: theme.colors.text.secondary,
      marginBottom: layout.deviceType.isSmallPhone ? 0 : spacing.xs,
    },
    classDetailValue: {
      fontSize: layout.deviceType.isTablet ? 16 : 14,
      fontWeight: "500",
      color: theme.colors.text.primary,
    },
    lowSpotsText: {
      color: theme.colors.status.pending,
    },
    noClassesContainer: {
      alignItems: "center",
      paddingVertical: layout.sectionSpacing,
    },
    noClassesText: {
      fontSize: layout.deviceType.isTablet ? 18 : 16,
      color: theme.colors.text.secondary,
      textAlign: "center",
      marginBottom: spacing.md,
    },
    noClassesSubtext: {
      fontSize: layout.deviceType.isTablet ? 14 : 12,
      color: theme.colors.text.muted,
      textAlign: "center",
      marginBottom: spacing.md,
    },
    refreshButton: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      borderRadius: 8,
      alignSelf: "center",
    },
    refreshButtonText: {
      color: "#FFFFFF",
      fontSize: 14,
      fontWeight: "600",
    },
    sectionTitle: {
      fontSize: layout.deviceType.isTablet
        ? 22
        : layout.deviceType.isSmallPhone
        ? 17
        : 19, // Slightly smaller
      fontWeight: "600",
      color: theme.colors.text.primary,
      marginBottom: spacing.sm, // Reduced from spacing.md
    },
    errorContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: layout.containerPadding,
    },
    errorBanner: {
      marginBottom: spacing.md,
    },

    bookButtonDisabled: {
      backgroundColor: theme.colors.surface,
    },
    bookButtonTextDisabled: {
      color: theme.colors.text.muted,
    },
  });
