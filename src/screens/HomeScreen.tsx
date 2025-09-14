import React, { useState } from "react";
import { StyleSheet, View, ScrollView, TouchableOpacity } from "react-native";
import { Text } from "react-native-elements";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { HomeScreenProps } from "../types";
import { HomeScreenData, ClassItem } from "../types/api";
import { spacing, useResponsiveLayout, useTheme } from "../theme";
import { AnimatedListItem, FadeInView, DateScrollPicker } from "../components";
import { 
  formatClassTime,
  isSameDay
} from "../utils/dateUtils";
import { formatAvailableSpots } from "../utils/formatUtils";
import { mockHomeData } from "../data/mockHomeData";

// Helper function for filtering classes
const getFilteredClasses = (
  classes: ClassItem[],
  filter: string,
  selectedDate: Date
): ClassItem[] => {
  let filteredClasses = classes;
  
  // Filter by date first
  filteredClasses = filteredClasses.filter((classItem) =>
    isSameDay(classItem.date, selectedDate)
  );
  
  // Then filter by category
  if (filter !== "All Classes") {
    filteredClasses = filteredClasses.filter((classItem) => classItem.category === filter);
  }
  
  return filteredClasses;
};

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const [homeData] = useState<HomeScreenData>(mockHomeData);
  const [selectedFilter, setSelectedFilter] = useState<string>("All Classes");
  const [selectedDate, setSelectedDate] = useState<Date>(homeData.selectedDate);
  const layout = useResponsiveLayout();
  const { theme } = useTheme();
  const styles = createStyles(layout, theme);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Minimal Brand Banner with Fade */}
      <LinearGradient
        colors={["#8B5CF6", "#7C3AED", "rgba(124, 58, 237, 0.8)", "rgba(124, 58, 237, 0)"]}
        locations={[0, 0.6, 0.85, 1.0]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
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
        contentContainerStyle={styles.scrollContent}
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

          {/* Date Selection Section */}
          <FadeInView delay={200}>
            <View style={styles.calendarSection}>
              <Text style={styles.sectionTitle}>Schedule</Text>
              <DateScrollPicker
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
                maxRange={2}
                minRange={0}
              />
            </View>
          </FadeInView>

          {/* Class List Section */}
          <FadeInView delay={300}>
            <View style={styles.classListSection}>
              <Text style={styles.sectionTitle}>Available Classes</Text>

              {getFilteredClasses(homeData.classes, selectedFilter, selectedDate).map(
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

              {getFilteredClasses(homeData.classes, selectedFilter, selectedDate).length ===
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
      paddingTop: layout.deviceType.isTablet ? 35 : 25, // Much less status bar padding
      paddingBottom: spacing.lg, // Reduced bottom padding
      paddingHorizontal: layout.containerPadding,
      minHeight: layout.deviceType.isTablet ? 85 : 70, // Very compact
    },
    headerContent: {
      alignItems: "center",
      justifyContent: "center", // Center content
      flex: 1, // Take available space
    },
    gymName: {
      fontSize: layout.deviceType.isTablet
        ? 26
        : layout.deviceType.isSmallPhone
        ? 20
        : 24, // Smaller to fit in minimal height
      fontWeight: "700", // Bold but not too heavy
      color: "#FFFFFF",
      marginBottom: 2, // Minimal margin between title and tagline
      textAlign: "center",
      letterSpacing: 0.2, // Normal spacing
    },
    gymTagline: {
      fontSize: layout.deviceType.isTablet
        ? 15
        : layout.deviceType.isSmallPhone
        ? 12
        : 14, // Smaller for compact design
      color: "rgba(255, 255, 255, 0.85)", // Subtle but readable
      textAlign: "center",
      lineHeight: layout.deviceType.isTablet
        ? 22
        : layout.deviceType.isSmallPhone
        ? 16
        : 20,
      fontWeight: "400", // Normal weight
      letterSpacing: 0.1,
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
  });
