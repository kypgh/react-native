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
import { theme } from '../theme';

// Define the navigation tab parameter list
export type RootTabParamList = {
  Home: undefined;
  Bookings: undefined;
  PaymentPlans: undefined;
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
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap;

            if (route.name === 'Home') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Bookings') {
              iconName = focused ? 'calendar' : 'calendar-outline';
            } else if (route.name === 'PaymentPlans') {
              iconName = focused ? 'card' : 'card-outline';
            } else if (route.name === 'Profile') {
              iconName = focused ? 'person' : 'person-outline';
            } else {
              iconName = 'help-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: theme.colors.tabBarActive,
          tabBarInactiveTintColor: theme.colors.tabBarInactive,
          tabBarStyle: {
            backgroundColor: theme.colors.tabBarBackground,
            borderTopWidth: 1,
            borderTopColor: theme.colors.greyOutline,
            paddingBottom: Math.max(insets.bottom, 5),
            paddingTop: 5,
            height: 60 + Math.max(insets.bottom, 0),
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
          },
          headerStyle: {
            backgroundColor: theme.colors.primary,
            elevation: 4,
            shadowOpacity: 0.1,
            shadowRadius: 4,
            shadowOffset: { width: 0, height: 2 },
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            fontWeight: '600',
            fontSize: 18,
          },
        })}
      >
        <Tab.Screen 
          name="Home" 
          component={HomeScreen}
          options={{ 
            title: 'Home',
            headerTitle: 'Booking App'
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
          name="PaymentPlans" 
          component={PaymentPlansScreen}
          options={{ 
            title: 'Plans',
            headerTitle: 'Payment Plans'
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