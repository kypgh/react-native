import React, { useState } from "react";
import { StyleSheet, View, ScrollView, TouchableOpacity } from "react-native";
import { Text } from "react-native-elements";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { HomeScreenProps } from "../types";
import { HomeScreenData, ClassItem } from "../types/api";
import { spacing, useResponsiveLayout, useTheme } from "../theme";
import { AnimatedListItem, FadeInView } from "../components";
import { 
  formatWeekRange, 
  generateWeekDays, 
  isSameDay, 
  formatClassTime 
} from "../utils/dateUtils";
import { formatAvailableSpots } from "../utils/formatUtils";
import { mockHomeData } from "../data/mockHomeData";

// Helper function for filtering classes
const getFilteredClasses = (
  classes: ClassItem[],
  filter: string
): ClassItem[] => {
  if (filter === "All Classes") {
    return classes;
  }
  return classes.filter((classItem) => classItem.category === filter);
};

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const [homeData] = useState<HomeScreenData>(mockHomeData);
  const [selectedFilter, setSelectedFilter] = useState<string>("All Classes");
  const layout = useResponsiveLayout();
  const { theme } = useTheme();
  const styles = createStyles(layout, theme);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Purple Gradient Header */}
      <LinearGradient
        colors={["#8B5CF6", "#7C3AED", "#6D28D9"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.gymName}>{homeData.gymInfo.name}</Text>
          <Text style={styles.gymTagline}>{homeData.gymInfo.tagline}</Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Class Filter Tabs Section */}
          <FadeInView delay={100}>
            <View style={styles.filterSection}>
              <View style={styles.filterHeader}>
                <Text style={styles.sectionTitle}>Class Categories</Text>
                <Text style={styles.viewDetailsButton}>View Details</Text>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.filterTabsContainer}
                contentContainerStyle={styles.filterTabsContent}
              >
                {homeData.classFilters.map((filter, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.filterTab,
                      selectedFilter === filter && styles.filterTabActive,
                    ]}
                    onPress={() => setSelectedFilter(filter)}
                  >
                    <Text
                      style={StyleSheet.flatten([
                        styles.filterTabText,
                        selectedFilter === filter && styles.filterTabTextActive,
                      ])}
                    >
                      {filter}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </FadeInView>

          {/* Weekly Calendar Section */}
          <FadeInView delay={200}>
            <View style={styles.calendarSection}>
              <Text style={styles.sectionTitle}>Schedule</Text>

              {/* Week Navigation */}
              <View style={styles.weekNavigation}>
                <TouchableOpacity style={styles.navArrow}>
                  <Text style={styles.navArrowText}>‹</Text>
                </TouchableOpacity>

                <Text style={styles.weekRange}>
                  {formatWeekRange(
                    homeData.selectedWeek.start,
                    homeData.selectedWeek.end
                  )}
                </Text>

                <TouchableOpacity style={styles.navArrow}>
                  <Text style={styles.navArrowText}>›</Text>
                </TouchableOpacity>
              </View>

              {/* Days of Week Grid */}
              <View style={styles.daysGrid}>
                {generateWeekDays(homeData.selectedWeek.start).map(
                  (day, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.dayCard,
                        isSameDay(day.date, homeData.selectedDate) &&
                          styles.dayCardActive,
                      ]}
                      onPress={() => {
                        // In a real app, this would update the selected date
                        // For now, we'll just show the visual feedback
                      }}
                    >
                      <Text
                        style={StyleSheet.flatten([
                          styles.dayName,
                          isSameDay(day.date, homeData.selectedDate) &&
                            styles.dayNameActive,
                        ])}
                      >
                        {day.name}
                      </Text>
                      <Text
                        style={StyleSheet.flatten([
                          styles.dayNumber,
                          isSameDay(day.date, homeData.selectedDate) &&
                            styles.dayNumberActive,
                        ])}
                      >
                        {day.number}
                      </Text>
                    </TouchableOpacity>
                  )
                )}
              </View>
            </View>
          </FadeInView>

          {/* Class List Section */}
          <FadeInView delay={300}>
            <View style={styles.classListSection}>
              <Text style={styles.sectionTitle}>Available Classes</Text>

              {getFilteredClasses(homeData.classes, selectedFilter).map(
                (classItem, index) => (
                  <AnimatedListItem
                    key={classItem.id}
                    index={index}
                    style={styles.classCard}
                  >
                    <View style={styles.classCardHeader}>
                      <View style={styles.classInfo}>
                        <Text style={styles.className}>{classItem.name}</Text>
                        <Text style={styles.classInstructor}>
                          {classItem.instructor
                            ? `with ${classItem.instructor}`
                            : "Instructor TBA"}
                        </Text>
                      </View>
                      <TouchableOpacity style={styles.bookButton}>
                        <Text style={styles.bookButtonText}>Book</Text>
                      </TouchableOpacity>
                    </View>

                    <View style={styles.classDetails}>
                      <View style={styles.classDetailItem}>
                        <Text style={styles.classDetailLabel}>Time</Text>
                        <Text style={styles.classDetailValue}>
                          {formatClassTime(classItem.date)}
                        </Text>
                      </View>

                      <View style={styles.classDetailItem}>
                        <Text style={styles.classDetailLabel}>Duration</Text>
                        <Text style={styles.classDetailValue}>
                          {classItem.duration} min
                        </Text>
                      </View>

                      <View style={styles.classDetailItem}>
                        <Text style={styles.classDetailLabel}>
                          Available Spots
                        </Text>
                        <Text
                          style={StyleSheet.flatten([
                            styles.classDetailValue,
                            classItem.availableSpots <= 5 &&
                              styles.lowSpotsText,
                          ])}
                        >
                          {formatAvailableSpots(classItem.availableSpots, classItem.totalSpots)}
                        </Text>
                      </View>
                    </View>
                  </AnimatedListItem>
                )
              )}

              {getFilteredClasses(homeData.classes, selectedFilter).length ===
                0 && (
                <View style={styles.noClassesContainer}>
                  <Text style={styles.noClassesText}>
                    No classes available for "{selectedFilter}"
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
      paddingTop: layout.deviceType.isTablet ? 60 : 50, // Account for status bar and device size
      paddingBottom: layout.sectionSpacing,
      paddingHorizontal: layout.containerPadding,
    },
    headerContent: {
      alignItems: "center",
    },
    gymName: {
      fontSize: layout.deviceType.isTablet
        ? 32
        : layout.deviceType.isSmallPhone
        ? 24
        : 28,
      fontWeight: "bold",
      color: "#FFFFFF",
      marginBottom: spacing.xs,
      textAlign: "center",
    },
    gymTagline: {
      fontSize: layout.deviceType.isTablet
        ? 18
        : layout.deviceType.isSmallPhone
        ? 14
        : 16,
      color: "#E5E7EB",
      textAlign: "center",
      lineHeight: layout.deviceType.isTablet
        ? 26
        : layout.deviceType.isSmallPhone
        ? 20
        : 22,
    },
    scrollView: {
      flex: 1,
    },
    content: {
      paddingBottom: layout.sectionSpacing,
    },
    filterSection: {
      paddingHorizontal: layout.containerPadding,
      paddingVertical: layout.sectionSpacing,
    },
    filterHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: spacing.md,
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
      marginRight: spacing.sm,
      borderRadius: layout.deviceType.isTablet ? 24 : 20,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.text.muted,
      minHeight: layout.buttonHeight * 0.8, // Ensure proper touch target
    },
    filterTabActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
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
      paddingVertical: layout.sectionSpacing,
    },
    weekNavigation: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: spacing.lg,
    },
    navArrow: {
      width: Math.max(44, layout.deviceType.isTablet ? 48 : 40), // Ensure proper touch target
      height: Math.max(44, layout.deviceType.isTablet ? 48 : 40),
      borderRadius: Math.max(22, layout.deviceType.isTablet ? 24 : 20),
      backgroundColor: theme.colors.surface,
      justifyContent: "center",
      alignItems: "center",
    },
    navArrowText: {
      fontSize: layout.deviceType.isTablet ? 22 : 18,
      fontWeight: "bold",
      color: theme.colors.text.primary,
    },
    weekRange: {
      fontSize: layout.deviceType.isTablet
        ? 18
        : layout.deviceType.isSmallPhone
        ? 14
        : 16,
      fontWeight: "600",
      color: theme.colors.text.primary,
    },
    daysGrid: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: layout.cardSpacing / 2,
    },
    dayCard: {
      flex: 1,
      alignItems: "center",
      paddingVertical: layout.deviceType.isTablet ? spacing.lg : spacing.md,
      marginHorizontal: layout.deviceType.isSmallPhone ? 1 : 2,
      borderRadius: layout.deviceType.isTablet ? 16 : 12,
      backgroundColor: theme.colors.surface,
      minHeight: Math.max(44, layout.deviceType.isTablet ? 60 : 50), // Ensure proper touch target
    },
    dayCardActive: {
      backgroundColor: theme.colors.primary,
    },
    dayName: {
      fontSize: layout.deviceType.isTablet
        ? 14
        : layout.deviceType.isSmallPhone
        ? 10
        : 12,
      fontWeight: "500",
      color: theme.colors.text.secondary,
      marginBottom: spacing.xs,
    },
    dayNameActive: {
      color: "#E5E7EB",
    },
    dayNumber: {
      fontSize: layout.deviceType.isTablet
        ? 18
        : layout.deviceType.isSmallPhone
        ? 14
        : 16,
      fontWeight: "bold",
      color: theme.colors.text.primary,
    },
    dayNumberActive: {
      color: "#FFFFFF",
    },
    classListSection: {
      paddingHorizontal: layout.containerPadding,
      paddingVertical: layout.sectionSpacing,
    },
    classCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: layout.deviceType.isTablet ? 16 : 12,
      padding: layout.deviceType.isTablet ? spacing.xl : spacing.lg,
      marginBottom: spacing.md,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
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
    },
    sectionTitle: {
      fontSize: layout.deviceType.isTablet
        ? 24
        : layout.deviceType.isSmallPhone
        ? 18
        : 20,
      fontWeight: "600",
      color: theme.colors.text.primary,
      marginBottom: spacing.md,
    },
  });
