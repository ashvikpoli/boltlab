import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Animated,
  Easing,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useHaptics } from '../../hooks/useHaptics';
import { FloatingAction, BouncyScale, Pulse } from './AnimatedComponents';

interface FloatingActionButtonProps {
  children: React.ReactNode;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'accent';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  style?: ViewStyle;
  pulse?: boolean;
  float?: boolean;
  ripple?: boolean;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  children,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  style,
  pulse = true,
  float = true,
  ripple = true,
}) => {
  const { triggerHaptic } = useHaptics();
  const [isPressed, setIsPressed] = useState(false);
  const [showRipple, setShowRipple] = useState(false);

  // Ripple animation
  const rippleScale = useRef(new Animated.Value(0)).current;
  const rippleOpacity = useRef(new Animated.Value(0.6)).current;

  // Handle ripple effect
  useEffect(() => {
    if (showRipple && ripple) {
      rippleScale.setValue(0);
      rippleOpacity.setValue(0.6);

      Animated.parallel([
        Animated.timing(rippleScale, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(rippleOpacity, {
          toValue: 0,
          duration: 600,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShowRipple(false);
      });
    }
  }, [showRipple, ripple]);

  const handlePress = () => {
    if (disabled) return;

    triggerHaptic('medium');

    if (ripple) {
      setShowRipple(true);
    }

    onPress();
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          gradient: ['#6B46C1', '#8B5CF6', '#A78BFA'],
          shadowColor: '#6B46C1',
          rippleColor: '#FFFFFF',
        };
      case 'secondary':
        return {
          gradient: ['#1E293B', '#334155', '#475569'],
          shadowColor: '#334155',
          rippleColor: '#6B46C1',
        };
      case 'accent':
        return {
          gradient: ['#F59E0B', '#F97316', '#FB923C'],
          shadowColor: '#F59E0B',
          rippleColor: '#FFFFFF',
        };
      default:
        return {
          gradient: ['#6B46C1', '#8B5CF6'],
          shadowColor: '#6B46C1',
          rippleColor: '#FFFFFF',
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          width: 48,
          height: 48,
          borderRadius: 24,
        };
      case 'large':
        return {
          width: 72,
          height: 72,
          borderRadius: 36,
        };
      default: // medium
        return {
          width: 56,
          height: 56,
          borderRadius: 28,
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  const ButtonContent = (
    <View style={styles.container}>
      <Pressable
        onPress={handlePress}
        onPressIn={() => setIsPressed(true)}
        onPressOut={() => setIsPressed(false)}
        disabled={disabled}
        style={[
          styles.button,
          sizeStyles,
          {
            shadowColor: variantStyles.shadowColor,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: disabled ? 0.1 : 0.3,
            shadowRadius: 8,
            elevation: disabled ? 2 : 8,
            opacity: disabled ? 0.6 : 1,
          },
          style,
        ]}
      >
        <LinearGradient
          colors={variantStyles.gradient as readonly [string, string, ...string[]]}
          style={[styles.gradient, sizeStyles]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Button Content */}
          <View style={styles.content}>{children}</View>

          {/* Ripple Effect */}
          {showRipple && ripple && (
            <Animated.View
              style={[
                styles.ripple,
                sizeStyles,
                {
                  backgroundColor: variantStyles.rippleColor,
                  transform: [{ scale: rippleScale }],
                  opacity: rippleOpacity,
                },
              ]}
            />
          )}
        </LinearGradient>
      </Pressable>
    </View>
  );

  // Wrap with bouncy scale animation
  const BouncyButton = (
    <BouncyScale pressed={isPressed && !disabled} scale={0.92}>
      {ButtonContent}
    </BouncyScale>
  );

  // Wrap with pulse animation if enabled
  const PulsyButton =
    pulse && !disabled ? (
      <Pulse enabled={true} scale={1.05} duration={2500}>
        {BouncyButton}
      </Pulse>
    ) : (
      BouncyButton
    );

  // Wrap with floating animation if enabled
  return float ? (
    <FloatingAction offset={3} duration={3000}>
      {PulsyButton}
    </FloatingAction>
  ) : (
    PulsyButton
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradient: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  ripple: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 1,
  },
});

export default FloatingActionButton;
