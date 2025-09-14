import React, { useEffect, useRef } from 'react';
import { Animated, TouchableOpacity, View, ViewStyle } from 'react-native';
import { 
  ANIMATION_PRESETS, 
  animateButtonPress, 
  createLoadingAnimation,
  ANIMATION_DURATION 
} from '../../theme/animations';

// Animated Card Component
interface AnimatedCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  delay?: number;
  onPress?: () => void;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({ 
  children, 
  style, 
  delay = 0,
  onPress,
  accessibilityLabel,
  accessibilityHint
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const fadeIn = ANIMATION_PRESETS.fadeIn(fadeAnim, delay);
    const slideIn = ANIMATION_PRESETS.slideInFromBottom(slideAnim, delay);
    
    Animated.parallel([fadeIn, slideIn]).start();
  }, [fadeAnim, slideAnim, delay]);

  const animatedStyle = {
    ...ANIMATION_PRESETS.cardEntrance(fadeAnim, slideAnim),
    transform: [
      { translateY: slideAnim },
      { scale: scaleAnim }
    ]
  };

  const buttonProps = onPress ? animateButtonPress(scaleAnim, onPress) : {};
  const Component = onPress ? TouchableOpacity : Animated.View;

  const accessibilityProps = onPress ? {
    accessibilityRole: 'button' as const,
    accessibilityLabel: accessibilityLabel || 'Interactive card',
    accessibilityHint: accessibilityHint || 'Double tap to activate',
  } : {};

  return (
    <Component
      style={[animatedStyle, style]}
      activeOpacity={onPress ? 0.8 : 1}
      {...buttonProps}
      {...accessibilityProps}
    >
      {children}
    </Component>
  );
};

// Animated Button Component
interface AnimatedButtonProps {
  children: React.ReactNode;
  onPress: () => void;
  style?: ViewStyle;
  disabled?: boolean;
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({ 
  children, 
  onPress, 
  style,
  disabled = false 
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const buttonProps = animateButtonPress(scaleAnim, disabled ? undefined : onPress);

  return (
    <TouchableOpacity
      style={[
        {
          transform: [{ scale: scaleAnim }],
          opacity: disabled ? 0.6 : 1,
        },
        style
      ]}
      activeOpacity={0.8}
      disabled={disabled}
      {...buttonProps}
    >
      {children}
    </TouchableOpacity>
  );
};

// Animated List Item Component
interface AnimatedListItemProps {
  children: React.ReactNode;
  index: number;
  style?: ViewStyle;
  onPress?: () => void;
  accessibilityLabel?: string;
}

export const AnimatedListItem: React.FC<AnimatedListItemProps> = ({ 
  children, 
  index, 
  style,
  onPress,
  accessibilityLabel
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const delay = index * 100; // Stagger animation
    const fadeIn = ANIMATION_PRESETS.fadeIn(fadeAnim, delay);
    const slideIn = ANIMATION_PRESETS.slideInFromBottom(slideAnim, delay);
    
    Animated.parallel([fadeIn, slideIn]).start();
  }, [fadeAnim, slideAnim, index]);

  const animatedStyle = {
    opacity: fadeAnim,
    transform: [
      { translateY: slideAnim },
      { scale: scaleAnim }
    ]
  };

  const buttonProps = onPress ? animateButtonPress(scaleAnim, onPress) : {};
  const Component = onPress ? TouchableOpacity : Animated.View;

  const accessibilityProps = onPress ? {
    accessibilityRole: 'button' as const,
    accessibilityLabel: accessibilityLabel || `List item ${index + 1}`,
  } : {};

  return (
    <Component
      style={[animatedStyle, style]}
      activeOpacity={onPress ? 0.9 : 1}
      {...buttonProps}
      {...accessibilityProps}
    >
      {children}
    </Component>
  );
};

// Loading Spinner Component
interface AnimatedLoadingProps {
  size?: number;
  color?: string;
}

export const AnimatedLoading: React.FC<AnimatedLoadingProps> = ({ 
  size = 40, 
  color = '#8B5CF6' 
}) => {
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loadingAnimation = createLoadingAnimation(fadeAnim);
    const rotateAnimation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    );

    loadingAnimation.start();
    rotateAnimation.start();

    return () => {
      loadingAnimation.stop();
      rotateAnimation.stop();
    };
  }, [fadeAnim, rotateAnim]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: 3,
        borderColor: color,
        borderTopColor: 'transparent',
        opacity: fadeAnim,
        transform: [{ rotate }],
      }}
    />
  );
};

// Fade In View Component
interface FadeInViewProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  style?: ViewStyle;
}

export const FadeInView: React.FC<FadeInViewProps> = ({ 
  children, 
  delay = 0, 
  duration = ANIMATION_DURATION.normal,
  style 
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const fadeIn = ANIMATION_PRESETS.fadeIn(fadeAnim, delay);
    fadeIn.start();
  }, [fadeAnim, delay]);

  return (
    <Animated.View style={[{ opacity: fadeAnim }, style]}>
      {children}
    </Animated.View>
  );
};

// Scale In View Component
interface ScaleInViewProps {
  children: React.ReactNode;
  delay?: number;
  style?: ViewStyle;
}

export const ScaleInView: React.FC<ScaleInViewProps> = ({ 
  children, 
  delay = 0, 
  style 
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const scaleIn = ANIMATION_PRESETS.scaleIn(scaleAnim, delay);
    scaleIn.start();
  }, [scaleAnim, delay]);

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
      {children}
    </Animated.View>
  );
};

// Pulse View Component (for highlighting)
interface PulseViewProps {
  children: React.ReactNode;
  style?: ViewStyle;
  pulseColor?: string;
}

export const PulseView: React.FC<PulseViewProps> = ({ 
  children, 
  style,
  pulseColor = '#8B5CF6' 
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    pulse.start();

    return () => pulse.stop();
  }, [pulseAnim]);

  return (
    <Animated.View 
      style={[
        {
          transform: [{ scale: pulseAnim }],
        }, 
        style
      ]}
    >
      {children}
    </Animated.View>
  );
};