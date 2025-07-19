import React, { useState, useRef, useEffect } from 'react';
import {
  TouchableOpacity,
  View,
  StyleSheet,
  ViewStyle,
  Animated,
  Pressable,
} from 'react-native';
import { Easing } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useHaptics } from '../../hooks/useHaptics';
import { BouncyScale, Pulse } from './AnimatedComponents';

export interface BoltCardProps {
  children: React.ReactNode;
  variant?: 'glass' | 'energy' | 'solid' | 'outline';
  onPress?: () => void;
  style?: ViewStyle;
  disabled?: boolean;
  animated?: boolean;
  pulseOnHover?: boolean;
  morphOnPress?: boolean;
}

export const BoltCard: React.FC<BoltCardProps> = ({
  children,
  variant = 'glass',
  onPress,
  style,
  disabled = false,
  animated = true,
  pulseOnHover = false,
  morphOnPress = true,
}) => {
  const { triggerHaptic } = useHaptics();
  const [isPressed, setIsPressed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Animation values
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const borderAnim = useRef(new Animated.Value(0)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  // Shimmer effect for energy variant
  useEffect(() => {
    if (variant === 'energy' && animated) {
      const shimmer = Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerAnim, {
            toValue: 1,
            duration: 2000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(shimmerAnim, {
            toValue: 0,
            duration: 2000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      );

      shimmer.start();
      return () => shimmer.stop();
    }
  }, [variant, animated]);

  // Glow animation for hover/press states
  useEffect(() => {
    if (isHovered || isPressed) {
      Animated.parallel([
        Animated.spring(glowAnim, {
          toValue: isPressed ? 0.8 : 0.4,
          tension: 300,
          friction: 10,
          useNativeDriver: false,
        }),
        Animated.spring(borderAnim, {
          toValue: 1,
          tension: 200,
          friction: 12,
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(glowAnim, {
          toValue: 0,
          tension: 300,
          friction: 15,
          useNativeDriver: false,
        }),
        Animated.spring(borderAnim, {
          toValue: 0,
          tension: 200,
          friction: 12,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [isHovered, isPressed]);

  const handlePress = () => {
    if (disabled || !onPress) return;

    triggerHaptic('light');
    onPress();
  };

  const handlePressIn = () => {
    if (disabled) return;
    setIsPressed(true);
  };

  const handlePressOut = () => {
    setIsPressed(false);
  };

  const getVariantStyles = () => {
    const glowOpacity = glowAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 0.6],
    });

    const borderWidth = borderAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    });

    const shimmerTranslate = shimmerAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [-200, 200],
    });

    switch (variant) {
      case 'glass':
        return {
          backgroundColor: 'rgba(26, 26, 46, 0.6)',
          borderColor: 'rgba(107, 70, 193, 0.3)',
          borderWidth: 1,
          shadowColor: '#6B46C1',
          shadowOpacity: 0.2,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 4 },
          glowColor: '#6B46C1',
          gradient: ['rgba(26, 26, 46, 0.8)', 'rgba(15, 15, 35, 0.9)'],
          animatedBorderWidth: borderWidth,
          animatedGlow: glowOpacity,
        };

      case 'energy':
        return {
          backgroundColor: 'rgba(107, 70, 193, 0.2)',
          borderColor: '#6B46C1',
          borderWidth: 1,
          shadowColor: '#6B46C1',
          shadowOpacity: 0.4,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 6 },
          glowColor: '#6B46C1',
          gradient: ['rgba(107, 70, 193, 0.3)', 'rgba(139, 92, 246, 0.2)'],
          animatedBorderWidth: borderWidth,
          animatedGlow: glowOpacity,
          shimmerTranslate,
        };

      case 'solid':
        return {
          backgroundColor: '#1A1A2E',
          borderColor: '#374151',
          borderWidth: 1,
          shadowColor: '#000000',
          shadowOpacity: 0.3,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 4 },
          glowColor: '#6B46C1',
          gradient: ['#1A1A2E', '#0F0F23'],
          animatedBorderWidth: borderWidth,
          animatedGlow: glowOpacity,
        };

      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderColor: '#6B46C1',
          borderWidth: 1,
          shadowColor: 'transparent',
          shadowOpacity: 0,
          shadowRadius: 0,
          shadowOffset: { width: 0, height: 0 },
          glowColor: '#6B46C1',
          gradient: ['transparent', 'transparent'],
          animatedBorderWidth: borderWidth,
          animatedGlow: glowOpacity,
        };

      default:
        return {
          backgroundColor: 'rgba(26, 26, 46, 0.6)',
          borderColor: 'rgba(107, 70, 193, 0.3)',
          borderWidth: 1,
          shadowColor: '#6B46C1',
          shadowOpacity: 0.2,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 4 },
          glowColor: '#6B46C1',
          gradient: ['rgba(26, 26, 46, 0.8)', 'rgba(15, 15, 35, 0.9)'],
          animatedBorderWidth: borderWidth,
          animatedGlow: glowOpacity,
        };
    }
  };

  const variantStyles = getVariantStyles();
  const isInteractive = !!onPress && !disabled;

  const cardContent = (
    <View style={styles.container}>
      {/* Animated Glow Effect */}
      {animated && (
        <Animated.View
          style={[
            styles.glowLayer,
            {
              opacity: variantStyles.animatedGlow,
              shadowColor: variantStyles.glowColor,
              shadowOpacity: variantStyles.animatedGlow,
              shadowRadius: 16,
              shadowOffset: { width: 0, height: 0 },
            },
          ]}
        />
      )}

      {/* Shimmer Effect for Energy Variant */}
      {variant === 'energy' && animated && (
        <Animated.View
          style={[
            styles.shimmerOverlay,
            {
              transform: [{ translateX: variantStyles.shimmerTranslate }],
            },
          ]}
        >
          <LinearGradient
            colors={[
              'transparent',
              'rgba(255, 255, 255, 0.1)',
              'rgba(255, 255, 255, 0.2)',
              'rgba(255, 255, 255, 0.1)',
              'transparent',
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.shimmerGradient}
          />
        </Animated.View>
      )}

      {/* Main Card Background */}
      <LinearGradient
        colors={variantStyles.gradient as readonly [string, string, ...string[]]}
        style={[
          styles.cardBackground,
          {
            backgroundColor: variantStyles.backgroundColor,
            borderColor: variantStyles.borderColor,
            borderWidth: variantStyles.borderWidth,
            shadowColor: variantStyles.shadowColor,
            shadowOpacity: variantStyles.shadowOpacity,
            shadowRadius: variantStyles.shadowRadius,
            shadowOffset: variantStyles.shadowOffset,
            elevation: variantStyles.shadowRadius,
          },
        ]}
      >
        {/* Animated Border */}
        {animated && (
          <Animated.View
            style={[
              styles.animatedBorder,
              {
                borderWidth: variantStyles.animatedBorderWidth,
                borderColor: variantStyles.glowColor,
              },
            ]}
          />
        )}

        {/* Content */}
        <View style={styles.content}>{children}</View>
      </LinearGradient>
    </View>
  );

  if (!isInteractive) {
    return (
      <View style={style}>
        {pulseOnHover && animated ? (
          <Pulse enabled={true} scale={1.01} duration={3000}>
            {cardContent}
          </Pulse>
        ) : (
          cardContent
        )}
      </View>
    );
  }

  const InteractiveCard = (
    <Pressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onHoverIn={() => setIsHovered(true)}
      onHoverOut={() => setIsHovered(false)}
      disabled={disabled}
      style={[{ opacity: disabled ? 0.6 : 1 }, style]}
    >
      {cardContent}
    </Pressable>
  );

  return morphOnPress && animated ? (
    <BouncyScale pressed={isPressed} scale={0.98}>
      {InteractiveCard}
    </BouncyScale>
  ) : (
    InteractiveCard
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
  },
  glowLayer: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 16,
    backgroundColor: 'transparent',
  },
  shimmerOverlay: {
    position: 'absolute',
    top: 0,
    left: -100,
    right: -100,
    bottom: 0,
    zIndex: 1,
    borderRadius: 12,
  },
  shimmerGradient: {
    flex: 1,
    width: '100%',
  },
  cardBackground: {
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  animatedBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 12,
  },
  content: {
    padding: 16,
    position: 'relative',
    zIndex: 2,
  },
});

export default BoltCard;
