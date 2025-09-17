import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme';
import { 
  HomeScreen, 
  BookingsScreen, 
  PaymentPlansScreen, 
  ProfileScreen 
} from '../screens';


// Define the navigation tab parameter list
export type RootTabParamList = {
  Home: undefined;
  Plans: undefined;
  Bookings: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

export default function AppNavigator() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  
  return (
    <Tab.Navigator
        initialRouteName="Home"
        screenOptions={({ route }) => ({
          // Add smooth transitions between tabs
          animationEnabled: true,
          tabBarIcon: ({ focused, color }) => {
            let iconName: keyof typeof Ionicons.glyphMap;

            if (route.name === 'Home') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Plans') {
              iconName = focused ? 'card' : 'card-outline';
            } else if (route.name === 'Bookings') {
              iconName = focused ? 'calendar' : 'calendar-outline';
            } else if (route.name === 'Profile') {
              iconName = focused ? 'person' : 'person-outline';
            } else {
              iconName = 'help-outline';
            }

            return <Ionicons name={iconName} size={24} color={color} />;
          },
          tabBarActiveTintColor: theme.navigation.tabBarActiveTintColor,
          tabBarInactiveTintColor: theme.navigation.tabBarInactiveTintColor,
          tabBarStyle: {
            backgroundColor: theme.navigation.tabBarStyle.backgroundColor,
            borderTopWidth: 1,
            borderTopColor: theme.navigation.tabBarStyle.borderTopColor,
            paddingBottom: Math.max(insets.bottom, 8),
            paddingTop: 8,
            height: 65 + Math.max(insets.bottom, 0), // Slightly taller for better touch targets
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
            marginTop: 4,
          },
          tabBarIconStyle: {
            marginBottom: 2,
          },
          headerStyle: {
            backgroundColor: theme.navigation.headerStyle.backgroundColor,
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 1,
            borderBottomColor: theme.navigation.headerStyle.borderBottomColor,
          },
          headerTintColor: theme.navigation.headerTintColor,
          headerTitleStyle: {
            fontWeight: '600',
            fontSize: 18,
            color: theme.navigation.headerTintColor,
          },
        })}
      >
        <Tab.Screen 
          name="Home" 
          component={HomeScreen}
          options={{ 
            title: 'Home',
            headerTitle: 'FitLife Gym'
          }}
        />
        <Tab.Screen 
          name="Plans" 
          component={PaymentPlansScreen}
          options={{ 
            title: 'Plans',
            headerTitle: 'Payment Plans'
          }}
        />
        <Tab.Screen 
          name="Bookings" 
          component={BookingsScreen}
          options={{ 
            title: 'Bookings',
            headerTitle: 'My Bookings'
          }}
        />
        <Tab.Screen 
          name="Profile" 
          component={ProfileScreen}
          options={{ 
            title: 'Profile',
            headerTitle: 'My Profile'
          }}
        />
      </Tab.Navigator>
  );
}