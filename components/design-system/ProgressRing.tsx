import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import Svg, { Circle, LinearGradient, Defs, Stop } from 'react-native-svg';
import Animated, {
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
  withSequence,
  interpolate,
  useDerivedValue,
} from 'react-native-reanimated';

export interface ProgressRingProps {
  progress: number; // 0-100
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'gradient' | 'segmented';
  showPercentage?: boolean;
  animated?: boolean;
  color?: 'primary' | 'success' | 'warning';
  strokeWidth?: number;
  children?: React.ReactNode;
  style?: ViewStyle;
  testID?: string;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedView = Animated.createAnimatedComponent(View);

export const ProgressRing: React.FC<ProgressRingProps> = ({
  progress,
  size = 'md',
  variant = 'default',
  showPercentage = false,
  animated = true,
  color = 'primary',
  strokeWidth,
  children,
  style,
  testID,
}) => {
  const animatedProgress = useSharedValue(0);
  const completionScale = useSharedValue(1);
  const completionOpacity = useSharedValue(0);

  // Size configurations
  const sizeConfig = getSizeConfig(size);
  const radius =
    (sizeConfig.diameter - (strokeWidth || sizeConfig.strokeWidth)) / 2;
  const circumference = 2 * Math.PI * radius;

  // Color configurations
  const colorConfig = getColorConfig(color);

  // Animated properties for the progress circle
  const animatedProps = useAnimatedProps(() => {
    const strokeDashoffset =
      circumference - (animatedProgress.value / 100) * circumference;

    return {
      strokeDashoffset,
    };
  });

  // Completion celebration animation style
  const animatedCompletionStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: completionScale.value }],
      opacity: completionOpacity.value,
    };
  });

  // Progress text animation
  const animatedPercentage = useDerivedValue(() => {
    return Math.round(animatedProgress.value);
  });

  // Update progress animation
  useEffect(() => {
    if (animated) {
      animatedProgress.value = withTiming(progress, {
        duration: 800,
      });

      // Completion celebration
      if (progress >= 100 && animatedProgress.value < 100) {
        setTimeout(() => {
          completionScale.value = withSequence(
            withSpring(1.1, { damping: 10, stiffness: 300 }),
            withSpring(1, { damping: 15, stiffness: 300 })
          );

          completionOpacity.value = withSequence(
            withTiming(1, { duration: 200 }),
            withTiming(0, { duration: 1000 })
          );
        }, 600);
      }
    } else {
      animatedProgress.value = progress;
    }
  }, [
    progress,
    animated,
    animatedProgress,
    completionScale,
    completionOpacity,
  ]);

  const renderProgressCircle = () => {
    if (variant === 'gradient') {
      return (
        <Svg
          width={sizeConfig.diameter}
          height={sizeConfig.diameter}
          style={styles.svg}
        >
          <Defs>
            <LinearGradient
              id="progressGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <Stop offset="0%" stopColor={colorConfig.start} />
              <Stop offset="100%" stopColor={colorConfig.end} />
            </LinearGradient>
          </Defs>

          {/* Background Circle */}
          <Circle
            cx={sizeConfig.diameter / 2}
            cy={sizeConfig.diameter / 2}
            r={radius}
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth={strokeWidth || sizeConfig.strokeWidth}
            fill="transparent"
          />

          {/* Progress Circle */}
          <AnimatedCircle
            cx={sizeConfig.diameter / 2}
            cy={sizeConfig.diameter / 2}
            r={radius}
            stroke="url(#progressGradient)"
            strokeWidth={strokeWidth || sizeConfig.strokeWidth}
            fill="transparent"
            strokeLinecap="round"
            strokeDasharray={circumference}
            animatedProps={animatedProps}
            transform={`rotate(-90 ${sizeConfig.diameter / 2} ${
              sizeConfig.diameter / 2
            })`}
          />
        </Svg>
      );
    }

    if (variant === 'segmented') {
      const segments = 12;
      const segmentAngle = 360 / segments;
      const completedSegments = Math.floor((progress / 100) * segments);

      return (
        <View style={styles.segmentedContainer}>
          {Array.from({ length: segments }).map((_, index) => (
            <View
              key={index}
              style={[
                styles.segment,
                {
                  transform: [{ rotate: `${index * segmentAngle}deg` }],
                  backgroundColor:
                    index < completedSegments
                      ? colorConfig.solid
                      : 'rgba(255, 255, 255, 0.1)',
                },
              ]}
            />
          ))}
        </View>
      );
    }

    // Default variant
    return (
      <Svg
        width={sizeConfig.diameter}
        height={sizeConfig.diameter}
        style={styles.svg}
      >
        {/* Background Circle */}
        <Circle
          cx={sizeConfig.diameter / 2}
          cy={sizeConfig.diameter / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth={strokeWidth || sizeConfig.strokeWidth}
          fill="transparent"
        />

        {/* Progress Circle */}
        <AnimatedCircle
          cx={sizeConfig.diameter / 2}
          cy={sizeConfig.diameter / 2}
          r={radius}
          stroke={colorConfig.solid}
          strokeWidth={strokeWidth || sizeConfig.strokeWidth}
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          transform={`rotate(-90 ${sizeConfig.diameter / 2} ${
            sizeConfig.diameter / 2
          })`}
        />
      </Svg>
    );
  };

  return (
    <AnimatedView
      style={[
        styles.container,
        { width: sizeConfig.diameter, height: sizeConfig.diameter },
        style,
      ]}
      testID={testID}
    >
      {renderProgressCircle()}

      {/* Center Content */}
      <View style={styles.centerContent}>
        {showPercentage && (
          <Animated.View style={animatedCompletionStyle}>
            <Text style={[styles.percentageText, sizeConfig.textStyle]}>
              {Math.round(progress)}%
            </Text>
          </Animated.View>
        )}

        {children && <View style={styles.customContent}>{children}</View>}
      </View>

      {/* Completion Celebration */}
      {progress >= 100 && (
        <Animated.View
          style={[styles.completionOverlay, animatedCompletionStyle]}
        >
          <View
            style={[
              styles.completionPulse,
              { backgroundColor: colorConfig.solid },
            ]}
          />
        </Animated.View>
      )}
    </AnimatedView>
  );
};

// Helper functions
function getSizeConfig(size: string) {
  switch (size) {
    case 'sm':
      return {
        diameter: 40,
        strokeWidth: 3,
        textStyle: { fontSize: 10, fontWeight: '600' as const },
      };
    case 'md':
      return {
        diameter: 60,
        strokeWidth: 4,
        textStyle: { fontSize: 12, fontWeight: '600' as const },
      };
    case 'lg':
      return {
        diameter: 80,
        strokeWidth: 5,
        textStyle: { fontSize: 14, fontWeight: '700' as const },
      };
    case 'xl':
      return {
        diameter: 120,
        strokeWidth: 6,
        textStyle: { fontSize: 18, fontWeight: '700' as const },
      };
    default:
      return {
        diameter: 60,
        strokeWidth: 4,
        textStyle: { fontSize: 12, fontWeight: '600' as const },
      };
  }
}

function getColorConfig(color: string) {
  switch (color) {
    case 'primary':
      return {
        solid: '#6B46C1',
        start: '#6B46C1',
        end: '#8B5CF6',
      };
    case 'success':
      return {
        solid: '#10B981',
        start: '#10B981',
        end: '#34D399',
      };
    case 'warning':
      return {
        solid: '#F59E0B',
        start: '#F59E0B',
        end: '#FCD34D',
      };
    default:
      return {
        solid: '#6B46C1',
        start: '#6B46C1',
        end: '#8B5CF6',
      };
  }
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },

  svg: {
    position: 'absolute',
  },

  centerContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },

  percentageText: {
    color: '#E2E8F0',
    fontFamily: 'Inter',
    textAlign: 'center',
  },

  customContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  segmentedContainer: {
    position: 'relative',
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },

  segment: {
    position: 'absolute',
    width: 4,
    height: 12,
    borderRadius: 2,
    top: 4,
  },

  completionOverlay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },

  completionPulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
    opacity: 0.6,
  },
});
