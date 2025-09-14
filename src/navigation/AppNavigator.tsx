import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  
  return (
    <NavigationContainer>
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
          tabBarActiveTintColor: '#8B5CF6', // Purple accent color
          tabBarInactiveTintColor: '#64748B', // Muted gray for inactive
          tabBarStyle: {
            backgroundColor: '#334155', // Dark surface color
            borderTopWidth: 1,
            borderTopColor: '#475569', // Subtle border
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
            backgroundColor: '#1E293B', // Dark background
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 1,
            borderBottomColor: '#475569',
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            fontWeight: '600',
            fontSize: 18,
            color: '#FFFFFF',
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
    </NavigationContainer>
  );
}