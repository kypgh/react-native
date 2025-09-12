import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { RouteProp } from '@react-navigation/native';
import type { RootTabParamList } from '../navigation/AppNavigator';

// Re-export the main navigation type from AppNavigator
export type { RootTabParamList };

// Navigation prop types for each screen
export type HomeScreenNavigationProp = BottomTabNavigationProp<
  RootTabParamList,
  'Home'
>;

export type BookingsScreenNavigationProp = BottomTabNavigationProp<
  RootTabParamList,
  'Bookings'
>;

export type PaymentPlansScreenNavigationProp = BottomTabNavigationProp<
  RootTabParamList,
  'PaymentPlans'
>;

export type ProfileScreenNavigationProp = BottomTabNavigationProp<
  RootTabParamList,
  'Profile'
>;

// Route prop types for each screen
export type HomeScreenRouteProp = RouteProp<RootTabParamList, 'Home'>;
export type BookingsScreenRouteProp = RouteProp<RootTabParamList, 'Bookings'>;
export type PaymentPlansScreenRouteProp = RouteProp<RootTabParamList, 'PaymentPlans'>;
export type ProfileScreenRouteProp = RouteProp<RootTabParamList, 'Profile'>;

// Combined navigation and route props for each screen
export interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
  route: HomeScreenRouteProp;
}

export interface BookingsScreenProps {
  navigation: BookingsScreenNavigationProp;
  route: BookingsScreenRouteProp;
}

export interface PaymentPlansScreenProps {
  navigation: PaymentPlansScreenNavigationProp;
  route: PaymentPlansScreenRouteProp;
}

export interface ProfileScreenProps {
  navigation: ProfileScreenNavigationProp;
  route: ProfileScreenRouteProp;
}

// Base screen props interface
export interface BaseScreenProps {
  navigation: BottomTabNavigationProp<RootTabParamList>;
  route: RouteProp<RootTabParamList, keyof RootTabParamList>;
}