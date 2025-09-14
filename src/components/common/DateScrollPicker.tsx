import React, { useMemo, useRef, useEffect } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Text } from 'react-native-elements';
import { useTheme, useResponsiveLayout, spacing } from '../../theme';
import { isSameDay } from '../../utils/dateUtils';

export interface DateItem {
  date: Date;
  dayName: string;
  dayNumber: number;
  monthName: string;
  isSelected: boolean;
  isToday: boolean;
}

export interface DateScrollPickerProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  maxRange?: number; // months from current date (default: 2)
  minRange?: number; // months before current date (default: 0)
}

const { width: screenWidth } = Dimensions.get('window');

export const DateScrollPicker: React.FC<DateScrollPickerProps> = ({
  selectedDate,
  onDateSelect,
  maxRange = 2,
  minRange = 0,
}) => {
  const { theme } = useTheme();
  const layout = useResponsiveLayout();
  const scrollViewRef = useRef<ScrollView>(null);
  const styles = createStyles(layout, theme);

  // Generate date items within the specified range
  const dateItems = useMemo(() => {
    const items: DateItem[] = [];
    const today = new Date();
    const startDate = new Date(today);
    startDate.setMonth(today.getMonth() - minRange);
    startDate.setDate(1); // Start from first day of the month
    
    const endDate = new Date(today);
    endDate.setMonth(today.getMonth() + maxRange);
    endDate.setDate(0); // Last day of the previous month (which is the target month)
    
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const monthNames = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ];
      
      items.push({
        date: new Date(currentDate),
        dayName: dayNames[currentDate.getDay()],
        dayNumber: currentDate.getDate(),
        monthName: monthNames[currentDate.getMonth()],
        isSelected: isSameDay(currentDate, selectedDate),
        isToday: isSameDay(currentDate, today),
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return items;
  }, [selectedDate, maxRange, minRange]);



  // Calculate item width based on screen size
  const itemWidth = useMemo(() => {
    const baseWidth = layout.deviceType.isTablet ? 80 : 70;
    const minItemsVisible = layout.deviceType.isTablet ? 5 : 4;
    const maxItemWidth = (screenWidth - layout.containerPadding * 2) / minItemsVisible;
    return Math.min(baseWidth, maxItemWidth);
  }, [layout]);

  // Scroll to selected date when it changes
  useEffect(() => {
    const selectedIndex = dateItems.findIndex(item => item.isSelected);
    if (selectedIndex !== -1 && scrollViewRef.current) {
      const scrollPosition = selectedIndex * itemWidth - screenWidth / 2 + itemWidth / 2;
      scrollViewRef.current.scrollTo({
        x: Math.max(0, scrollPosition),
        animated: true,
      });
    }
  }, [selectedDate, dateItems, itemWidth]);

  const handleDatePress = (date: Date) => {
    onDateSelect(date);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        decelerationRate="fast"
        snapToInterval={itemWidth}
        snapToAlignment="start"
      >
        {dateItems.map((item, index) => (
          <TouchableOpacity
            key={`${item.date.getTime()}`}
            style={[
              styles.dateItem,
              { width: itemWidth },
              item.isSelected && styles.dateItemSelected,
              item.isToday && !item.isSelected && styles.dateItemToday,
            ]}
            onPress={() => handleDatePress(item.date)}
            activeOpacity={0.7}
          >
            <Text
              style={StyleSheet.flatten([
                styles.dayName,
                item.isSelected && styles.dayNameSelected,
                item.isToday && !item.isSelected && styles.dayNameToday,
              ])}
            >
              {item.dayName}
            </Text>
            <Text
              style={StyleSheet.flatten([
                styles.dayNumber,
                item.isSelected && styles.dayNumberSelected,
                item.isToday && !item.isSelected && styles.dayNumberToday,
              ])}
            >
              {item.dayNumber}
            </Text>
            <Text
              style={StyleSheet.flatten([
                styles.monthName,
                item.isSelected && styles.monthNameSelected,
                item.isToday && !item.isSelected && styles.monthNameToday,
              ])}
            >
              {item.monthName}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const createStyles = (
  layout: ReturnType<typeof useResponsiveLayout>,
  theme: any
) =>
  StyleSheet.create({
    container: {
      marginVertical: spacing.md,
    },
    scrollContent: {
      paddingHorizontal: layout.containerPadding,
    },
    dateItem: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: layout.deviceType.isTablet ? spacing.lg : spacing.md,
      paddingHorizontal: spacing.xs,
      marginHorizontal: spacing.xs / 2,
      borderRadius: layout.deviceType.isTablet ? 16 : 12,
      backgroundColor: theme.colors.surface,
      minHeight: layout.deviceType.isTablet ? 90 : 80,
      borderWidth: 1,
      borderColor: 'transparent',
    },
    dateItemSelected: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 4,
    },
    dateItemToday: {
      borderColor: theme.colors.primary,
      borderWidth: 1,
    },
    dayName: {
      fontSize: layout.deviceType.isTablet ? 12 : 10,
      fontWeight: '500',
      color: theme.colors.text.secondary,
      marginBottom: spacing.xs / 2,
    },
    dayNameSelected: {
      color: '#FFFFFF',
    },
    dayNameToday: {
      color: theme.colors.primary,
      fontWeight: '600',
    },
    dayNumber: {
      fontSize: layout.deviceType.isTablet ? 20 : 18,
      fontWeight: 'bold',
      color: theme.colors.text.primary,
      marginBottom: spacing.xs / 2,
    },
    dayNumberSelected: {
      color: '#FFFFFF',
    },
    dayNumberToday: {
      color: theme.colors.primary,
    },
    monthName: {
      fontSize: layout.deviceType.isTablet ? 11 : 9,
      fontWeight: '500',
      color: theme.colors.text.secondary,
    },
    monthNameSelected: {
      color: '#E5E7EB',
    },
    monthNameToday: {
      color: theme.colors.primary,
      fontWeight: '600',
    },
  });