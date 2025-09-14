import { Animated, Easing } from 'react-native';

// Animation duration constants
export const ANIMATION_DURATION = {
  fast: 150,
  normal: 250,
  slow: 350,
  slower: 500,
};

// Easing presets
export const EASING = {
  easeInOut: Easing.inOut(Easing.ease),
  easeOut: Easing.out(Easing.ease),
  easeIn: Easing.in(Easing.ease),
  spring: Easing.elastic(1.3),
  bounce: Easing.bounce,
};

/**
 * Fade animation utility
 */
export const createFadeAnimation = (
  animatedValue: Animated.Value,
  toValue: number,
  duration: number = ANIMATION_DURATION.normal,
  easing: any = EASING.easeInOut
) => {
  return Animated.timing(animatedValue, {
    toValue,
    duration,
    easing,
    useNativeDriver: true,
  });
};

/**
 * Scale animation utility
 */
export const createScaleAnimation = (
  animatedValue: Animated.Value,
  toValue: number,
  duration: number = ANIMATION_DURATION.fast,
  easing: any = EASING.easeOut
) => {
  return Animated.timing(animatedValue, {
    toValue,
    duration,
    easing,
    useNativeDriver: true,
  });
};

/**
 * Slide animation utility
 */
export const createSlideAnimation = (
  animatedValue: Animated.Value,
  toValue: number,
  duration: number = ANIMATION_DURATION.normal,
  easing: any = EASING.easeInOut
) => {
  return Animated.timing(animatedValue, {
    toValue,
    duration,
    easing,
    useNativeDriver: true,
  });
};

/**
 * Spring animation utility
 */
export const createSpringAnimation = (
  animatedValue: Animated.Value,
  toValue: number,
  tension: number = 100,
  friction: number = 8
) => {
  return Animated.spring(animatedValue, {
    toValue,
    tension,
    friction,
    useNativeDriver: true,
  });
};

/**
 * Stagger animation utility for multiple elements
 */
export const createStaggerAnimation = (
  animations: Animated.CompositeAnimation[],
  staggerDelay: number = 100
) => {
  return Animated.stagger(staggerDelay, animations);
};

/**
 * Sequence animation utility
 */
export const createSequenceAnimation = (animations: Animated.CompositeAnimation[]) => {
  return Animated.sequence(animations);
};

/**
 * Parallel animation utility
 */
export const createParallelAnimation = (animations: Animated.CompositeAnimation[]) => {
  return Animated.parallel(animations);
};

/**
 * Button press animation
 */
export const animateButtonPress = (
  scaleValue: Animated.Value,
  onPress?: () => void
) => {
  const pressIn = createScaleAnimation(scaleValue, 0.95, ANIMATION_DURATION.fast);
  const pressOut = createScaleAnimation(scaleValue, 1, ANIMATION_DURATION.fast);
  
  return {
    onPressIn: () => pressIn.start(),
    onPressOut: () => pressOut.start(),
    onPress: () => {
      pressOut.start();
      onPress?.();
    },
  };
};

/**
 * Card entrance animation
 */
export const animateCardEntrance = (
  fadeValue: Animated.Value,
  slideValue: Animated.Value,
  delay: number = 0
) => {
  const fadeIn = createFadeAnimation(fadeValue, 1, ANIMATION_DURATION.normal);
  const slideIn = createSlideAnimation(slideValue, 0, ANIMATION_DURATION.normal);
  
  return Animated.sequence([
    Animated.delay(delay),
    createParallelAnimation([fadeIn, slideIn])
  ]);
};

/**
 * Loading animation
 */
export const createLoadingAnimation = (animatedValue: Animated.Value) => {
  return Animated.loop(
    Animated.sequence([
      createFadeAnimation(animatedValue, 0.3, ANIMATION_DURATION.slow),
      createFadeAnimation(animatedValue, 1, ANIMATION_DURATION.slow),
    ])
  );
};

/**
 * Pulse animation
 */
export const createPulseAnimation = (animatedValue: Animated.Value) => {
  return Animated.loop(
    Animated.sequence([
      createScaleAnimation(animatedValue, 1.05, ANIMATION_DURATION.slow),
      createScaleAnimation(animatedValue, 1, ANIMATION_DURATION.slow),
    ])
  );
};

/**
 * Shake animation for error states
 */
export const createShakeAnimation = (animatedValue: Animated.Value) => {
  return Animated.sequence([
    createSlideAnimation(animatedValue, 10, ANIMATION_DURATION.fast),
    createSlideAnimation(animatedValue, -10, ANIMATION_DURATION.fast),
    createSlideAnimation(animatedValue, 10, ANIMATION_DURATION.fast),
    createSlideAnimation(animatedValue, 0, ANIMATION_DURATION.fast),
  ]);
};

/**
 * Theme transition animation
 */
export const createThemeTransition = (
  fadeValue: Animated.Value,
  callback?: () => void
) => {
  return Animated.sequence([
    createFadeAnimation(fadeValue, 0, ANIMATION_DURATION.fast),
    Animated.timing(fadeValue, {
      toValue: 0,
      duration: 0,
      useNativeDriver: true,
    }),
  ]).start(() => {
    callback?.();
    createFadeAnimation(fadeValue, 1, ANIMATION_DURATION.fast).start();
  });
};

/**
 * Animated value interpolation helpers
 */
export const createInterpolation = (
  animatedValue: Animated.Value,
  inputRange: number[],
  outputRange: number[] | string[]
) => {
  return animatedValue.interpolate({
    inputRange,
    outputRange,
    extrapolate: 'clamp',
  });
};

/**
 * Common animation presets
 */
export const ANIMATION_PRESETS = {
  fadeIn: (animatedValue: Animated.Value, delay: number = 0) => 
    Animated.sequence([
      Animated.delay(delay),
      createFadeAnimation(animatedValue, 1, ANIMATION_DURATION.normal)
    ]),
    
  slideInFromBottom: (animatedValue: Animated.Value, delay: number = 0) =>
    Animated.sequence([
      Animated.delay(delay),
      createSlideAnimation(animatedValue, 0, ANIMATION_DURATION.normal)
    ]),
    
  scaleIn: (animatedValue: Animated.Value, delay: number = 0) =>
    Animated.sequence([
      Animated.delay(delay),
      createSpringAnimation(animatedValue, 1)
    ]),
    
  buttonPress: (scaleValue: Animated.Value) => ({
    transform: [{ scale: scaleValue }]
  }),
  
  cardEntrance: (fadeValue: Animated.Value, slideValue: Animated.Value) => ({
    opacity: fadeValue,
    transform: [{ translateY: slideValue }]
  }),
  
  loading: (fadeValue: Animated.Value) => ({
    opacity: fadeValue
  }),
};