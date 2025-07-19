import React, { useState, useRef, useEffect } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Pressable,
  Animated,
  View,
} from 'react-native';
import { Easing } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useHaptics } from '../../hooks/useHaptics';
import { BouncyScale, CelebrationBurst, Pulse } from './AnimatedComponents';

export interface LightningButtonProps {
  children?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'disabled';
  size?: 'small' | 'medium' | 'large';
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  celebrateOnPress?: boolean;
  pulseWhenActive?: boolean;
}

export const LightningButton: React.FC<LightningButtonProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  onPress,
  disabled = false,
  loading = false,
  icon,
  style,
  textStyle,
  celebrateOnPress = false,
  pulseWhenActive = false,
}) => {
  const { triggerHaptic } = useHaptics();
  const [isPressed, setIsPressed] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  // Advanced Loading Animation
  const loadingRotation = useRef(new Animated.Value(0)).current;
  const loadingPulse = useRef(new Animated.Value(1)).current;

  // Success Animation
  const successScale = useRef(new Animated.Value(1)).current;
  const successOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (loading) {
      // Start loading animations
      const rotation = Animated.loop(
        Animated.timing(loadingRotation, {
          toValue: 1,
          duration: 1200,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );

      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(loadingPulse, {
            toValue: 1.1,
            duration: 800,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(loadingPulse, {
            toValue: 1,
            duration: 800,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      );

      rotation.start();
      pulse.start();

      return () => {
        rotation.stop();
        pulse.stop();
      };
    }
  }, [loading]);

  const handlePress = () => {
    if (disabled || loading) return;

    // Haptic feedback based on variant
    switch (variant) {
      case 'primary':
      case 'secondary':
        triggerHaptic('medium');
        break;
      case 'danger':
        triggerHaptic('heavy');
        break;
      default:
        triggerHaptic('light');
    }

    // Celebration effect
    if (celebrateOnPress) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 100);
    }

    // Success animation for primary actions
    if (variant === 'primary') {
      Animated.sequence([
        Animated.timing(successScale, {
          toValue: 1.05,
          duration: 100,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.spring(successScale, {
          toValue: 1,
          tension: 300,
          friction: 10,
          useNativeDriver: true,
        }),
      ]).start();
    }

    onPress?.();
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          gradient: ['#6B46C1', '#8B5CF6', '#A78BFA'],
          textColor: '#FFFFFF',
          shadowColor: '#6B46C1',
        };
      case 'secondary':
        return {
          gradient: ['#1E293B', '#334155', '#475569'],
          textColor: '#E2E8F0',
          shadowColor: '#334155',
        };
      case 'ghost':
        return {
          gradient: ['transparent', 'transparent'],
          textColor: '#6B46C1',
          shadowColor: 'transparent',
        };
      case 'danger':
        return {
          gradient: ['#EF4444', '#DC2626', '#B91C1C'],
          textColor: '#FFFFFF',
          shadowColor: '#EF4444',
        };
      case 'disabled':
        return {
          gradient: ['#374151', '#4B5563'],
          textColor: '#9CA3AF',
          shadowColor: 'transparent',
        };
      default:
        return {
          gradient: ['#6B46C1', '#8B5CF6'],
          textColor: '#FFFFFF',
          shadowColor: '#6B46C1',
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: 8,
          paddingHorizontal: 16,
          fontSize: 14,
          iconSize: 16,
          borderRadius: 8,
        };
      case 'large':
        return {
          paddingVertical: 16,
          paddingHorizontal: 24,
          fontSize: 18,
          iconSize: 20,
          borderRadius: 12,
        };
      default: // medium
        return {
          paddingVertical: 12,
          paddingHorizontal: 20,
          fontSize: 16,
          iconSize: 18,
          borderRadius: 10,
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();
  const isDisabled = disabled || loading;

  const rotateInterpolate = loadingRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const buttonContent = (
    <View style={styles.contentContainer}>
      {loading ? (
        <Animated.View
          style={[
            styles.loadingIcon,
            {
              transform: [
                { rotate: rotateInterpolate },
                { scale: loadingPulse },
              ],
            },
          ]}
        >
          <View
            style={[
              styles.loadingSpinner,
              { borderTopColor: variantStyles.textColor },
            ]}
          />
        </Animated.View>
      ) : (
        <>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Text
            style={[
              styles.text,
              {
                color: variantStyles.textColor,
                fontSize: sizeStyles.fontSize,
              },
              textStyle,
            ]}
          >
            {children}
          </Text>
        </>
      )}
    </View>
  );

  const AnimatedButton = (
    <BouncyScale pressed={isPressed && !isDisabled}>
      <Animated.View
        style={[
          {
            transform: [{ scale: successScale }],
            opacity: successOpacity,
          },
        ]}
      >
        <Pressable
          onPressIn={() => setIsPressed(true)}
          onPressOut={() => setIsPressed(false)}
          onPress={handlePress}
          disabled={isDisabled}
          style={({ pressed }) => [
            styles.button,
            {
              paddingVertical: sizeStyles.paddingVertical,
              paddingHorizontal: sizeStyles.paddingHorizontal,
              borderRadius: sizeStyles.borderRadius,
              shadowColor: variantStyles.shadowColor,
              shadowOffset:
                variant === 'ghost'
                  ? { width: 0, height: 0 }
                  : { width: 0, height: 4 },
              shadowOpacity: variant === 'ghost' ? 0 : pressed ? 0.4 : 0.3,
              shadowRadius: variant === 'ghost' ? 0 : pressed ? 8 : 6,
              elevation: variant === 'ghost' ? 0 : pressed ? 8 : 6,
              opacity: isDisabled ? 0.6 : 1,
            },
            style,
          ]}
        >
          {variant === 'ghost' ? (
            <View
              style={[
                styles.ghostButton,
                { borderRadius: sizeStyles.borderRadius },
              ]}
            >
              {buttonContent}
            </View>
          ) : (
            <LinearGradient
              colors={variantStyles.gradient as readonly [string, string, ...string[]]}
              style={[
                styles.gradient,
                { borderRadius: sizeStyles.borderRadius },
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {buttonContent}
            </LinearGradient>
          )}
        </Pressable>
      </Animated.View>
    </BouncyScale>
  );

  return (
    <View style={styles.container}>
      {pulseWhenActive && !isDisabled ? (
        <Pulse enabled={true} scale={1.02} duration={2000}>
          {AnimatedButton}
        </Pulse>
      ) : (
        AnimatedButton
      )}

      <CelebrationBurst
        trigger={showCelebration}
        onComplete={() => setShowCelebration(false)}
        sparkleCount={8}
        colors={['#6B46C1', '#8B5CF6', '#A78BFA', '#FFD700']}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  button: {
    alignSelf: 'flex-start',
  },
  gradient: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#6B46C1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: 8,
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  loadingIcon: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingSpinner: {
    width: 16,
    height: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    borderRadius: 8,
  },
});

export default LightningButton;
