# BoltFit → Phantom-Level Premium Experience

## Complete Transformation Guide

### 🚀 **Mission Statement**

Transform BoltFit from a functional fitness app into a premium, sophisticated experience that rivals Phantom Wallet's buttery-smooth animations, confident interactions, and aspirational aesthetic.

---

## 📋 **Phase 1: Clean Slate Setup (Day 1)**

### **Step 1.1: Remove Existing Styling Conflicts**

**Files to Clean/Replace:**

```bash
# Remove existing style files that may conflict
rm styles.css
rm script.js

# Clean component styling in these files:
# - components/design-system/AnimatedComponents.tsx (keep logic, remove styles)
# - components/design-system/BoltCard.tsx (rebuild styling)
# - components/design-system/LightningButton.tsx (rebuild styling)
# - All app/(tabs)/*.tsx files (remove inline styles)
# - app/onboarding/index.tsx (complete style overhaul)
```

**Create New Foundation Files:**

```typescript
// lib/phantom-design-system.ts
// components/design-system/PhantomAnimations.tsx
// components/design-system/PhantomComponents.tsx
// styles/phantom-theme.ts
// hooks/usePhantomAnimations.ts
```

### **Step 1.2: Install Required Dependencies**

```bash
npm install --save \
  react-native-reanimated@3.6.0 \
  react-native-gesture-handler@2.14.0 \
  react-native-haptic-feedback@2.2.0 \
  @react-native-async-storage/async-storage@1.19.5 \
  react-native-svg@14.1.0

# For premium animations
npm install --save \
  lottie-react-native@6.4.1 \
  react-native-linear-gradient@2.8.3
```

---

## 🎨 **Phase 2: Premium Design Foundation (Day 2-3)**

### **Step 2.1: Create Phantom-Inspired Theme System**

**File: `styles/phantom-theme.ts`**

```typescript
export const PhantomTheme = {
  // Premium Color Palette (Phantom-inspired)
  colors: {
    // Dark Foundation
    background: {
      primary: '#0a0a0f', // Deeper than current
      secondary: '#141419', // Card backgrounds
      tertiary: '#1c1c23', // Elevated surfaces
      overlay: 'rgba(20, 20, 25, 0.95)',
    },

    // Purple Energy System
    primary: {
      50: '#f4f0ff',
      100: '#ebe4ff',
      200: '#d9ceff',
      300: '#bfa8ff',
      400: '#9f75ff',
      500: '#7c3aed', // Main brand
      600: '#6d28d9', // Interactions
      700: '#5b21b6', // Pressed states
      800: '#4c1d95',
      900: '#3b0764',
    },

    // Sophisticated Neutrals
    neutral: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
    },

    // Semantic Colors (Premium)
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  },

  // Phantom-Quality Typography
  typography: {
    fontFamily: {
      primary: 'SF Pro Display', // iOS
      secondary: 'Inter', // Fallback
      mono: 'SF Mono',
    },

    scale: {
      xs: { size: 12, weight: 500, lineHeight: 1.4 },
      sm: { size: 14, weight: 400, lineHeight: 1.5 },
      base: { size: 16, weight: 400, lineHeight: 1.5 },
      lg: { size: 18, weight: 500, lineHeight: 1.4 },
      xl: { size: 20, weight: 600, lineHeight: 1.3 },
      '2xl': { size: 24, weight: 600, lineHeight: 1.25 },
      '3xl': { size: 30, weight: 700, lineHeight: 1.2 },
      '4xl': { size: 36, weight: 700, lineHeight: 1.1 },
    },
  },

  // Precise Spacing (8px grid)
  spacing: {
    0: 0,
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    8: 32,
    10: 40,
    12: 48,
    16: 64,
    20: 80,
    24: 96,
    32: 128,
  },

  // Premium Elevation
  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.1)',
    md: '0 4px 6px rgba(0, 0, 0, 0.15)',
    lg: '0 8px 16px rgba(0, 0, 0, 0.25)',
    xl: '0 16px 32px rgba(0, 0, 0, 0.35)',
    '2xl': '0 24px 48px rgba(0, 0, 0, 0.45)',

    // Colored shadows for premium feel
    primary: '0 8px 32px rgba(124, 58, 237, 0.3)',
    success: '0 8px 32px rgba(16, 185, 129, 0.3)',
    glow: '0 0 24px rgba(124, 58, 237, 0.4)',
  },

  // Border Radius System
  borderRadius: {
    sm: 6,
    md: 10,
    lg: 14,
    xl: 18,
    '2xl': 24,
    '3xl': 32,
    full: 9999,
  },

  // Phantom Animation Timings
  animations: {
    // Micro-interactions (Phantom signature)
    micro: { duration: 150, easing: 'easeOutQuart' },

    // Standard transitions
    fast: { duration: 200, easing: 'easeOutCubic' },
    standard: { duration: 300, easing: 'spring(300, 30)' },
    slow: { duration: 500, easing: 'easeOutExpo' },

    // Celebrations and feedback
    celebration: { duration: 800, easing: 'easeOutBack' },
    bounce: { duration: 600, easing: 'spring(100, 8)' },
  },
};
```

### **Step 2.2: Premium Animation System**

**File: `hooks/usePhantomAnimations.ts`**

```typescript
import { useRef } from 'react';
import {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  withDelay,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import HapticFeedback from 'react-native-haptic-feedback';

export const usePhantomAnimations = () => {
  // Premium animation presets
  const createMicroInteraction = (initialValue = 0) => {
    const value = useSharedValue(initialValue);

    const trigger = (hapticType: 'light' | 'medium' | 'heavy' = 'light') => {
      // Phantom-quality haptic feedback
      HapticFeedback.trigger(hapticType, {
        enableVibrateFallback: true,
        ignoreAndroidSystemSettings: false,
      });

      // Confident scale animation
      value.value = withSequence(
        withTiming(1.05, { duration: 100 }),
        withTiming(1, { duration: 150 })
      );
    };

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: value.value }],
    }));

    return { trigger, animatedStyle };
  };

  const createCardEntrance = () => {
    const opacity = useSharedValue(0);
    const translateY = useSharedValue(20);
    const scale = useSharedValue(0.95);

    const enter = (delay = 0) => {
      opacity.value = withDelay(delay, withTiming(1, { duration: 400 }));
      translateY.value = withDelay(
        delay,
        withSpring(0, { damping: 15, stiffness: 300 })
      );
      scale.value = withDelay(
        delay,
        withSpring(1, { damping: 15, stiffness: 300 })
      );
    };

    const exit = () => {
      opacity.value = withTiming(0, { duration: 200 });
      translateY.value = withTiming(-10, { duration: 200 });
      scale.value = withTiming(0.95, { duration: 200 });
    };

    const animatedStyle = useAnimatedStyle(() => ({
      opacity: opacity.value,
      transform: [{ translateY: translateY.value }, { scale: scale.value }],
    }));

    return { enter, exit, animatedStyle };
  };

  const createProgressAnimation = (progress: number) => {
    const progressValue = useSharedValue(0);

    const animateToProgress = () => {
      progressValue.value = withTiming(progress, { duration: 800 });
    };

    const animatedStyle = useAnimatedStyle(() => ({
      width: `${progressValue.value * 100}%`,
    }));

    return { animateToProgress, animatedStyle };
  };

  const createPhantomGlow = () => {
    const glowOpacity = useSharedValue(0);

    const startGlow = () => {
      glowOpacity.value = withSequence(
        withTiming(0.6, { duration: 300 }),
        withTiming(0.3, { duration: 1000 })
      );
    };

    const stopGlow = () => {
      glowOpacity.value = withTiming(0, { duration: 300 });
    };

    const animatedStyle = useAnimatedStyle(() => ({
      shadowOpacity: glowOpacity.value,
      elevation: interpolate(glowOpacity.value, [0, 0.6], [0, 8]),
    }));

    return { startGlow, stopGlow, animatedStyle };
  };

  return {
    createMicroInteraction,
    createCardEntrance,
    createProgressAnimation,
    createPhantomGlow,
  };
};
```

---

## 🧩 **Phase 3: Premium Component System (Day 4-5)**

### **Step 3.1: Phantom-Quality Card Component**

**File: `components/design-system/PhantomCard.tsx`**

```typescript
import React, { useEffect } from 'react';
import { View, Pressable, ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { usePhantomAnimations } from '@/hooks/usePhantomAnimations';
import { PhantomTheme } from '@/styles/phantom-theme';

interface PhantomCardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'interactive' | 'glow';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  onPress?: () => void;
  selected?: boolean;
  disabled?: boolean;
  entranceDelay?: number;
  style?: ViewStyle;
}

export const PhantomCard: React.FC<PhantomCardProps> = ({
  children,
  variant = 'default',
  size = 'md',
  onPress,
  selected = false,
  disabled = false,
  entranceDelay = 0,
  style,
}) => {
  const { createMicroInteraction, createCardEntrance, createPhantomGlow } =
    usePhantomAnimations();

  // Animation setup
  const microAnimation = createMicroInteraction(1);
  const entranceAnimation = createCardEntrance();
  const glowAnimation = createPhantomGlow();

  // Enter animation on mount
  useEffect(() => {
    entranceAnimation.enter(entranceDelay);
  }, [entranceDelay]);

  // Handle interactions
  const handlePressIn = () => {
    if (disabled) return;
    microAnimation.trigger('light');
    glowAnimation.startGlow();
  };

  const handlePressOut = () => {
    glowAnimation.stopGlow();
  };

  // Dynamic styling based on variant
  const getVariantStyles = () => {
    const base = {
      backgroundColor: PhantomTheme.colors.background.secondary,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.1)',
    };

    switch (variant) {
      case 'elevated':
        return {
          ...base,
          backgroundColor: PhantomTheme.colors.background.tertiary,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.25,
          shadowRadius: 8,
          elevation: 8,
        };

      case 'interactive':
        return {
          ...base,
          borderColor: selected
            ? PhantomTheme.colors.primary[500]
            : 'rgba(255, 255, 255, 0.1)',
          backgroundColor: selected
            ? PhantomTheme.colors.primary[500] + '20'
            : base.backgroundColor,
        };

      case 'glow':
        return {
          ...base,
          shadowColor: PhantomTheme.colors.primary[500],
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.4,
          shadowRadius: 16,
          elevation: 12,
        };

      default:
        return base;
    }
  };

  const getSizeStyles = () => {
    const sizes = {
      sm: {
        padding: PhantomTheme.spacing[3],
        borderRadius: PhantomTheme.borderRadius.md,
      },
      md: {
        padding: PhantomTheme.spacing[4],
        borderRadius: PhantomTheme.borderRadius.lg,
      },
      lg: {
        padding: PhantomTheme.spacing[6],
        borderRadius: PhantomTheme.borderRadius.xl,
      },
      xl: {
        padding: PhantomTheme.spacing[8],
        borderRadius: PhantomTheme.borderRadius['2xl'],
      },
    };
    return sizes[size];
  };

  const combinedStyles = {
    ...getVariantStyles(),
    ...getSizeStyles(),
    ...style,
  };

  const CardContent = (
    <Animated.View
      style={[
        combinedStyles,
        entranceAnimation.animatedStyle,
        microAnimation.animatedStyle,
        glowAnimation.animatedStyle,
      ]}
    >
      {children}
    </Animated.View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        style={{ opacity: disabled ? 0.6 : 1 }}
      >
        {CardContent}
      </Pressable>
    );
  }

  return CardContent;
};
```

### **Step 3.2: Premium Button Component**

**File: `components/design-system/PhantomButton.tsx`**

```typescript
import React from 'react';
import { Text, Pressable, ViewStyle, TextStyle } from 'react-native';
import Animated from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { usePhantomAnimations } from '@/hooks/usePhantomAnimations';
import { PhantomTheme } from '@/styles/phantom-theme';

interface PhantomButtonProps {
  children: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const PhantomButton: React.FC<PhantomButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  onPress,
  disabled = false,
  loading = false,
  leftIcon,
  rightIcon,
  style,
  textStyle,
}) => {
  const { createMicroInteraction, createPhantomGlow } = usePhantomAnimations();

  const microAnimation = createMicroInteraction(1);
  const glowAnimation = createPhantomGlow();

  const handlePressIn = () => {
    if (disabled || loading) return;

    // Haptic feedback based on variant
    const hapticType = variant === 'primary' ? 'medium' : 'light';
    microAnimation.trigger(hapticType);
    glowAnimation.startGlow();
  };

  const handlePressOut = () => {
    glowAnimation.stopGlow();
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: PhantomTheme.colors.primary[500],
          borderColor: PhantomTheme.colors.primary[600],
          textColor: '#ffffff',
          gradientColors: [
            PhantomTheme.colors.primary[400],
            PhantomTheme.colors.primary[600],
          ] as const,
        };

      case 'secondary':
        return {
          backgroundColor: 'transparent',
          borderColor: PhantomTheme.colors.primary[500],
          textColor: PhantomTheme.colors.primary[400],
          gradientColors: ['transparent', 'transparent'] as const,
        };

      case 'ghost':
        return {
          backgroundColor: 'transparent',
          borderColor: 'transparent',
          textColor: PhantomTheme.colors.neutral[400],
          gradientColors: ['transparent', 'transparent'] as const,
        };

      case 'danger':
        return {
          backgroundColor: PhantomTheme.colors.error,
          borderColor: PhantomTheme.colors.error,
          textColor: '#ffffff',
          gradientColors: ['#ef4444', '#dc2626'] as const,
        };

      default:
        return getVariantStyles.call(this, 'primary' as any);
    }
  };

  const getSizeStyles = () => {
    const sizes = {
      sm: {
        paddingVertical: PhantomTheme.spacing[2],
        paddingHorizontal: PhantomTheme.spacing[3],
        borderRadius: PhantomTheme.borderRadius.md,
        fontSize: PhantomTheme.typography.scale.sm.size,
      },
      md: {
        paddingVertical: PhantomTheme.spacing[3],
        paddingHorizontal: PhantomTheme.spacing[4],
        borderRadius: PhantomTheme.borderRadius.lg,
        fontSize: PhantomTheme.typography.scale.base.size,
      },
      lg: {
        paddingVertical: PhantomTheme.spacing[4],
        paddingHorizontal: PhantomTheme.spacing[6],
        borderRadius: PhantomTheme.borderRadius.xl,
        fontSize: PhantomTheme.typography.scale.lg.size,
      },
      xl: {
        paddingVertical: PhantomTheme.spacing[5],
        paddingHorizontal: PhantomTheme.spacing[8],
        borderRadius: PhantomTheme.borderRadius['2xl'],
        fontSize: PhantomTheme.typography.scale.xl.size,
      },
    };
    return sizes[size];
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      style={{ opacity: disabled ? 0.6 : 1 }}
    >
      <Animated.View
        style={[
          {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            ...sizeStyles,
            borderColor: variantStyles.borderColor,
          },
          microAnimation.animatedStyle,
          glowAnimation.animatedStyle,
          style,
        ]}
      >
        <LinearGradient
          colors={variantStyles.gradientColors}
          style={{
            ...sizeStyles,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: sizeStyles.borderRadius,
          }}
        >
          {leftIcon && (
            <View style={{ marginRight: PhantomTheme.spacing[2] }}>
              {leftIcon}
            </View>
          )}

          <Text
            style={[
              {
                color: variantStyles.textColor,
                fontSize: sizeStyles.fontSize,
                fontWeight: '600',
                fontFamily: PhantomTheme.typography.fontFamily.primary,
              },
              textStyle,
            ]}
          >
            {loading ? 'Loading...' : children}
          </Text>

          {rightIcon && (
            <View style={{ marginLeft: PhantomTheme.spacing[2] }}>
              {rightIcon}
            </View>
          )}
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
};
```

---

## 🚀 **Phase 4: Phantom-Inspired Onboarding Flow (Day 6-7)**

### **Step 4.1: New Onboarding Structure**

**Key Changes from Current Onboarding:**

1. **Phantom's Card-Stack Pattern**: Swipe through cards instead of linear progression
2. **Confident Animations**: Each step feels deliberate and premium
3. **Progressive Disclosure**: Information appears when needed, not all at once
4. **Celebration Moments**: Each completion feels rewarding

**File: `app/onboarding/phantom-onboarding.tsx`**

```typescript
import React, { useState, useEffect } from 'react';
import { View, Text, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import {
  PanGestureHandler,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import { PhantomCard } from '@/components/design-system/PhantomCard';
import { PhantomButton } from '@/components/design-system/PhantomButton';
import { PhantomTheme } from '@/styles/phantom-theme';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const CARD_WIDTH = screenWidth * 0.85;
const CARD_HEIGHT = screenHeight * 0.6;
const SWIPE_THRESHOLD = screenWidth * 0.25;

interface OnboardingStep {
  id: string;
  title: string;
  subtitle: string;
  component: React.ReactNode;
  validation?: () => boolean;
}

export default function PhantomOnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userData, setUserData] = useState({});

  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to BoltFit',
      subtitle: 'Your lightning-fast fitness journey starts here',
      component: <WelcomeStep />,
    },
    {
      id: 'goals',
      title: 'What drives you?',
      subtitle: 'Select your primary fitness goal',
      component: <GoalsStep userData={userData} onUpdate={setUserData} />,
      validation: () => userData.goals?.length > 0,
    },
    // ... more steps
  ];

  // Phantom-quality card stack animation
  const getCardStyle = (index: number) => {
    const isActive = index === currentIndex;
    const isPrevious = index < currentIndex;
    const isNext = index > currentIndex;

    return useAnimatedStyle(() => {
      const baseTranslateX = (index - currentIndex) * CARD_WIDTH * 1.1;
      const finalTranslateX = baseTranslateX + translateX.value;

      const scaleValue = interpolate(
        Math.abs(finalTranslateX),
        [0, CARD_WIDTH],
        [1, 0.85]
      );

      const opacityValue = interpolate(
        Math.abs(finalTranslateX),
        [0, CARD_WIDTH * 1.5],
        [1, 0]
      );

      return {
        transform: [{ translateX: finalTranslateX }, { scale: scaleValue }],
        opacity: opacityValue,
        zIndex: steps.length - Math.abs(index - currentIndex),
      };
    });
  };

  const goToNext = () => {
    if (currentIndex < steps.length - 1) {
      translateX.value = withSpring(0);
      setCurrentIndex(currentIndex + 1);
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      translateX.value = withSpring(0);
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: PhantomTheme.colors.background.primary,
        }}
      >
        {/* Card Stack */}
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {steps.map((step, index) => (
            <Animated.View
              key={step.id}
              style={[
                {
                  position: 'absolute',
                  width: CARD_WIDTH,
                  height: CARD_HEIGHT,
                },
                getCardStyle(index),
              ]}
            >
              <PhantomCard
                variant="elevated"
                size="lg"
                style={{
                  flex: 1,
                  justifyContent: 'space-between',
                  padding: PhantomTheme.spacing[6],
                }}
              >
                <View>
                  <Text
                    style={{
                      fontSize: PhantomTheme.typography.scale['2xl'].size,
                      fontWeight: '700',
                      color: '#ffffff',
                      marginBottom: PhantomTheme.spacing[3],
                      textAlign: 'center',
                    }}
                  >
                    {step.title}
                  </Text>

                  <Text
                    style={{
                      fontSize: PhantomTheme.typography.scale.lg.size,
                      color: PhantomTheme.colors.neutral[400],
                      marginBottom: PhantomTheme.spacing[6],
                      textAlign: 'center',
                    }}
                  >
                    {step.subtitle}
                  </Text>
                </View>

                <View style={{ flex: 1 }}>{step.component}</View>
              </PhantomCard>
            </Animated.View>
          ))}
        </View>

        {/* Navigation */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingHorizontal: PhantomTheme.spacing[6],
            paddingBottom: PhantomTheme.spacing[6],
          }}
        >
          <PhantomButton
            variant="ghost"
            onPress={goToPrevious}
            disabled={currentIndex === 0}
          >
            Back
          </PhantomButton>

          <PhantomButton
            variant="primary"
            onPress={goToNext}
            disabled={
              steps[currentIndex].validation &&
              !steps[currentIndex].validation()
            }
          >
            {currentIndex === steps.length - 1 ? 'Get Started' : 'Continue'}
          </PhantomButton>
        </View>

        {/* Progress Indicator */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            paddingBottom: PhantomTheme.spacing[4],
            gap: PhantomTheme.spacing[2],
          }}
        >
          {steps.map((_, index) => (
            <View
              key={index}
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor:
                  index <= currentIndex
                    ? PhantomTheme.colors.primary[500]
                    : PhantomTheme.colors.neutral[700],
              }}
            />
          ))}
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}
```

---

## 🎯 **Phase 5: App-Wide Navigation Transformation (Day 8-9)**

### **Step 5.1: Premium Tab Bar**

**File: `app/(tabs)/_layout.tsx` - Complete Replacement**

```typescript
import React from 'react';
import { View } from 'react-native';
import { Tabs } from 'expo-router';
import Animated, {
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Home,
  Dumbbell,
  TrendingUp,
  Trophy,
  Users,
  User,
} from 'lucide-react-native';
import { PhantomTheme } from '@/styles/phantom-theme';

const PhantomTabBar = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: PhantomTheme.colors.background.secondary,
        paddingBottom: insets.bottom,
        paddingTop: PhantomTheme.spacing[4],
        paddingHorizontal: PhantomTheme.spacing[4],
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.1)',
      }}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const animatedStyle = useAnimatedStyle(() => ({
          transform: [
            {
              scale: withSpring(isFocused ? 1.1 : 1, {
                damping: 15,
                stiffness: 300,
              }),
            },
          ],
        }));

        const getIcon = () => {
          const iconProps = {
            size: 24,
            color: isFocused
              ? PhantomTheme.colors.primary[400]
              : PhantomTheme.colors.neutral[500],
          };

          switch (route.name) {
            case 'index':
              return <Home {...iconProps} />;
            case 'workouts':
              return <Dumbbell {...iconProps} />;
            case 'progress':
              return <TrendingUp {...iconProps} />;
            case 'challenges':
              return <Trophy {...iconProps} />;
            case 'social':
              return <Users {...iconProps} />;
            case 'profile':
              return <User {...iconProps} />;
            default:
              return <Home {...iconProps} />;
          }
        };

        return (
          <Animated.View
            key={route.name}
            style={[
              {
                flex: 1,
                alignItems: 'center',
                paddingVertical: PhantomTheme.spacing[3],
              },
              animatedStyle,
            ]}
          >
            <Pressable onPress={onPress} style={{ alignItems: 'center' }}>
              {getIcon()}
              {isFocused && (
                <View
                  style={{
                    width: 4,
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: PhantomTheme.colors.primary[400],
                    marginTop: PhantomTheme.spacing[1],
                  }}
                />
              )}
            </Pressable>
          </Animated.View>
        );
      })}
    </View>
  );
};

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <PhantomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      {/* ... tab screens ... */}
    </Tabs>
  );
}
```

### **Step 5.2: Screen Transition System**

**File: `components/design-system/PhantomScreenTransition.tsx`**

```typescript
import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
} from 'react-native-reanimated';

interface PhantomScreenTransitionProps {
  children: React.ReactNode;
  type?: 'slide' | 'fade' | 'scale' | 'stack';
  direction?: 'up' | 'down' | 'left' | 'right';
  duration?: number;
}

export const PhantomScreenTransition: React.FC<
  PhantomScreenTransitionProps
> = ({ children, type = 'slide', direction = 'up', duration = 400 }) => {
  const opacity = useSharedValue(0);
  const translateX = useSharedValue(
    direction === 'left' ? -100 : direction === 'right' ? 100 : 0
  );
  const translateY = useSharedValue(
    direction === 'up' ? 50 : direction === 'down' ? -50 : 0
  );
  const scale = useSharedValue(0.95);

  useEffect(() => {
    // Phantom-quality entrance animation
    opacity.value = withTiming(1, { duration });
    translateX.value = withSpring(0, { damping: 15, stiffness: 300 });
    translateY.value = withSpring(0, { damping: 15, stiffness: 300 });
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    switch (type) {
      case 'fade':
        return { opacity: opacity.value };

      case 'scale':
        return {
          opacity: opacity.value,
          transform: [{ scale: scale.value }],
        };

      case 'slide':
        return {
          opacity: opacity.value,
          transform: [
            { translateX: translateX.value },
            { translateY: translateY.value },
          ],
        };

      case 'stack':
        return {
          opacity: opacity.value,
          transform: [{ translateY: translateY.value }, { scale: scale.value }],
        };

      default:
        return { opacity: opacity.value };
    }
  });

  return (
    <Animated.View style={[{ flex: 1 }, animatedStyle]}>
      {children}
    </Animated.View>
  );
};
```

---

## 📱 **Phase 6: Implementation Timeline & Checklist**

### **Week 1: Foundation**

- [ ] **Day 1**: Remove old styling, install dependencies
- [ ] **Day 2**: Implement `phantom-theme.ts` and `usePhantomAnimations.ts`
- [ ] **Day 3**: Create `PhantomCard` and `PhantomButton` components
- [ ] **Day 4**: Build remaining core components (inputs, progress, etc.)
- [ ] **Day 5**: Test component system, fix issues

### **Week 2: Application**

- [ ] **Day 6**: Transform onboarding flow to card-stack pattern
- [ ] **Day 7**: Implement premium navigation and tab bar
- [ ] **Day 8**: Update all major screens with new components
- [ ] **Day 9**: Add screen transitions and micro-interactions
- [ ] **Day 10**: Polish, test, and optimize performance

### **Success Metrics:**

- [ ] **60fps animations** across all interactions
- [ ] **Phantom-quality feel** - buttery smooth, confident movements
- [ ] **Reduced cognitive load** - information appears when needed
- [ ] **Premium aesthetic** - users feel they're using a high-end app
- [ ] **Consistent interactions** - every tap, swipe, and gesture feels intentional

---

## 🚀 **Next Steps**

1. **Start with Phase 1** - Clean existing styles completely
2. **Build incrementally** - Test each component before moving forward
3. **Focus on feel over features** - Every animation should feel deliberate
4. **Test on devices** - Ensure 60fps performance on mid-range phones
5. **Iterate based on feel** - If it doesn't feel like Phantom, refine it

This transformation will elevate BoltFit from a functional fitness app to a premium experience that users genuinely enjoy interacting with. The key is in the details - every micro-interaction should feel intentional and confident, just like Phantom Wallet.

Ready to begin the transformation? 🚀
