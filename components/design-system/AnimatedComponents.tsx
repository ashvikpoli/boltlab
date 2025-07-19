import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  View,
  ViewStyle,
  StyleSheet,
  Dimensions,
} from 'react-native';
// Import Easing from Animated for better compatibility
import { Easing } from 'react-native-reanimated';
import { useHaptics } from '../../hooks/useHaptics';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Advanced Spring Animation Hook
export const useSpringAnimation = (
  initialValue: number = 0,
  finalValue: number = 1,
  tension: number = 100,
  friction: number = 8
) => {
  const animation = useRef(new Animated.Value(initialValue)).current;

  const start = (callback?: () => void) => {
    Animated.spring(animation, {
      toValue: finalValue,
      tension,
      friction,
      useNativeDriver: true,
    }).start(callback);
  };

  const reset = () => {
    animation.setValue(initialValue);
  };

  return { animation, start, reset };
};

// Celebration Sparkle Component
interface SparkleProps {
  style?: ViewStyle;
  size?: number;
  color?: string;
  duration?: number;
}

export const Sparkle: React.FC<SparkleProps> = ({
  style,
  size = 8,
  color = '#FFD700',
  duration = 1000,
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const sparkleAnimation = Animated.parallel([
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: duration * 0.3,
          easing: Easing.elastic(2),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: duration * 0.7,
          easing: Easing.out(Easing.exp),
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: duration,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: duration,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ]);

    sparkleAnimation.start();
  }, []);

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={[
        {
          width: size,
          height: size,
          backgroundColor: color,
          borderRadius: size / 2,
          position: 'absolute',
          transform: [{ scale: scaleAnim }, { rotate: rotateInterpolate }],
          opacity: opacityAnim,
        },
        style,
      ]}
    />
  );
};

// Celebration Burst Component
interface CelebrationBurstProps {
  trigger: boolean;
  onComplete?: () => void;
  sparkleCount?: number;
  colors?: string[];
}

export const CelebrationBurst: React.FC<CelebrationBurstProps> = ({
  trigger,
  onComplete,
  sparkleCount = 12,
  colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'],
}) => {
  const [sparkles, setSparkles] = useState<
    Array<{
      id: number;
      x: number;
      y: number;
      color: string;
      size: number;
    }>
  >([]);

  useEffect(() => {
    if (trigger) {
      const newSparkles = Array.from({ length: sparkleCount }, (_, i) => ({
        id: i,
        x: Math.random() * 200 - 100,
        y: Math.random() * 200 - 100,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 4,
      }));

      setSparkles(newSparkles);

      setTimeout(() => {
        setSparkles([]);
        onComplete?.();
      }, 1500);
    }
  }, [trigger]);

  return (
    <View style={styles.celebrationContainer}>
      {sparkles.map((sparkle) => (
        <Sparkle
          key={sparkle.id}
          style={{
            left: sparkle.x,
            top: sparkle.y,
          }}
          size={sparkle.size}
          color={sparkle.color}
          duration={1200}
        />
      ))}
    </View>
  );
};

// Pulse Animation Component
interface PulseProps {
  children: React.ReactNode;
  enabled?: boolean;
  scale?: number;
  duration?: number;
}

export const Pulse: React.FC<PulseProps> = ({
  children,
  enabled = true,
  scale = 1.05,
  duration = 1000,
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (enabled) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: scale,
            duration: duration / 2,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: duration / 2,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      );

      pulse.start();

      return () => pulse.stop();
    }
  }, [enabled]);

  return (
    <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
      {children}
    </Animated.View>
  );
};

// Shake Animation Component
interface ShakeProps {
  children: React.ReactNode;
  trigger: boolean;
  intensity?: number;
}

export const Shake: React.FC<ShakeProps> = ({
  children,
  trigger,
  intensity = 10,
}) => {
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (trigger) {
      Animated.sequence([
        Animated.timing(shakeAnim, {
          toValue: intensity,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: -intensity,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: intensity * 0.7,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: -intensity * 0.7,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 0,
          duration: 50,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [trigger]);

  return (
    <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
      {children}
    </Animated.View>
  );
};

// Bouncy Scale Animation
interface BouncyScaleProps {
  children: React.ReactNode;
  pressed: boolean;
  scale?: number;
}

export const BouncyScale: React.FC<BouncyScaleProps> = ({
  children,
  pressed,
  scale = 0.95,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: pressed ? scale : 1,
      tension: 300,
      friction: 10,
      useNativeDriver: true,
    }).start();
  }, [pressed]);

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      {children}
    </Animated.View>
  );
};

// Progress Ring Animation
interface AnimatedProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  duration?: number;
}

export const AnimatedProgressRing: React.FC<AnimatedProgressRingProps> = ({
  progress,
  size = 100,
  strokeWidth = 8,
  color = '#6B46C1',
  backgroundColor = '#1A1A2E',
  duration = 1000,
}) => {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const strokeDashoffset = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  return (
    <View style={{ width: size, height: size }}>
      <Animated.View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: strokeWidth,
          borderColor: backgroundColor,
          position: 'absolute',
        }}
      />
      <Animated.View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: strokeWidth,
          borderColor: color,
          borderTopColor: 'transparent',
          borderRightColor: 'transparent',
          borderBottomColor: 'transparent',
          transform: [{ rotate: '-90deg' }],
          position: 'absolute',
        }}
      />
    </View>
  );
};

// Floating Action Animation
interface FloatingActionProps {
  children: React.ReactNode;
  offset?: number;
  duration?: number;
}

export const FloatingAction: React.FC<FloatingActionProps> = ({
  children,
  offset = 5,
  duration = 2000,
}) => {
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const float = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: duration / 2,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: duration / 2,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    float.start();
    return () => float.stop();
  }, []);

  const translateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -offset],
  });

  return (
    <Animated.View style={{ transform: [{ translateY }] }}>
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  celebrationContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 200,
    height: 200,
    marginTop: -100,
    marginLeft: -100,
    pointerEvents: 'none',
  },
});

export default {
  useSpringAnimation,
  Sparkle,
  CelebrationBurst,
  Pulse,
  Shake,
  BouncyScale,
  AnimatedProgressRing,
  FloatingAction,
};
