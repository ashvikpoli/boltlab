import React, { forwardRef, useState, useRef, useEffect } from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TextInputProps,
  Pressable,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
  interpolate,
  interpolateColor,
  withSequence,
} from 'react-native-reanimated';
import {
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Info,
} from 'lucide-react-native';

export interface SmartInputProps extends Omit<TextInputProps, 'style'> {
  label: string;
  error?: string;
  success?: boolean;
  helperText?: string;
  variant?: 'default' | 'outlined' | 'filled';
  size?: 'sm' | 'md' | 'lg';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  validation?: (value: string) => string | null;
  clearable?: boolean;
  containerStyle?: ViewStyle;
  style?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
  testID?: string;
}

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

export const SmartInput = forwardRef<TextInput, SmartInputProps>(
  (
    {
      label,
      error,
      success = false,
      helperText,
      variant = 'default',
      size = 'md',
      leftIcon,
      rightIcon,
      validation,
      clearable = false,
      value = '',
      onChangeText,
      onFocus,
      onBlur,
      secureTextEntry,
      containerStyle,
      style,
      inputStyle,
      labelStyle,
      testID,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [internalValue, setInternalValue] = useState(value);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [validationError, setValidationError] = useState<string | null>(null);

    const inputRef = useRef<TextInput>(null);
    const focusAnimation = useSharedValue(0);
    const errorShake = useSharedValue(0);
    const successPulse = useSharedValue(0);

    // Combine refs
    React.useImperativeHandle(ref, () => inputRef.current!);

    const sizeConfig = getSizeConfig(size);
    const hasValue = internalValue.length > 0;
    const showError = error || validationError;
    const isPasswordField = secureTextEntry;

    // Focus/blur animations
    const animatedLabelStyle = useAnimatedStyle(() => {
      const shouldFloat = isFocused || hasValue;

      return {
        transform: [
          {
            translateY: interpolate(
              focusAnimation.value,
              [0, 1],
              [
                shouldFloat ? sizeConfig.labelFloat.translateY : 0,
                shouldFloat ? sizeConfig.labelFloat.translateY : 0,
              ]
            ),
          },
          {
            scale: interpolate(
              focusAnimation.value,
              [0, 1],
              [
                shouldFloat ? sizeConfig.labelFloat.scale : 1,
                shouldFloat ? sizeConfig.labelFloat.scale : 1,
              ]
            ),
          },
        ],
        color: interpolateColor(
          focusAnimation.value,
          [0, 1],
          showError
            ? ['#EF4444', '#EF4444']
            : success
            ? ['#10B981', '#10B981']
            : ['#94A3B8', '#A78BFA']
        ),
      };
    });

    const animatedContainerStyle = useAnimatedStyle(() => {
      return {
        borderColor: interpolateColor(
          focusAnimation.value,
          [0, 1],
          showError
            ? ['#EF4444', '#EF4444']
            : success
            ? ['#10B981', '#10B981']
            : ['rgba(255, 255, 255, 0.1)', 'rgba(107, 70, 193, 0.6)']
        ),
        shadowOpacity: interpolate(focusAnimation.value, [0, 1], [0, 0.3]),
        transform: [
          { translateX: errorShake.value },
          { scale: successPulse.value },
        ],
      };
    });

    // Handle focus state changes
    useEffect(() => {
      focusAnimation.value = withTiming(isFocused || hasValue ? 1 : 0, {
        duration: 200,
      });
    }, [isFocused, hasValue, focusAnimation]);

    // Handle success animation
    useEffect(() => {
      if (success) {
        successPulse.value = withSequence(
          withSpring(1.02, { damping: 15, stiffness: 300 }),
          withSpring(1, { damping: 15, stiffness: 300 })
        );
      }
    }, [success, successPulse]);

    // Handle error shake animation
    useEffect(() => {
      if (showError) {
        errorShake.value = withSequence(
          withTiming(-4, { duration: 50 }),
          withTiming(4, { duration: 50 }),
          withTiming(-4, { duration: 50 }),
          withTiming(0, { duration: 50 })
        );
      }
    }, [showError, errorShake]);

    const handleFocus = (e: any) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: any) => {
      setIsFocused(false);

      // Run validation on blur
      if (validation && internalValue) {
        const validationResult = validation(internalValue);
        setValidationError(validationResult);
      }

      onBlur?.(e);
    };

    const handleChangeText = (text: string) => {
      setInternalValue(text);

      // Clear validation error when user types
      if (validationError) {
        setValidationError(null);
      }

      onChangeText?.(text);
    };

    const handleLabelPress = () => {
      inputRef.current?.focus();
    };

    const togglePasswordVisibility = () => {
      setIsPasswordVisible(!isPasswordVisible);
    };

    const clearInput = () => {
      setInternalValue('');
      onChangeText?.('');
      inputRef.current?.focus();
    };

    const renderRightIcon = () => {
      const icons = [];

      // Password toggle
      if (isPasswordField) {
        icons.push(
          <Pressable
            key="password-toggle"
            onPress={togglePasswordVisibility}
            style={styles.iconButton}
          >
            {isPasswordVisible ? (
              <EyeOff size={sizeConfig.iconSize} color="#94A3B8" />
            ) : (
              <Eye size={sizeConfig.iconSize} color="#94A3B8" />
            )}
          </Pressable>
        );
      }

      // Clear button
      if (clearable && hasValue && isFocused) {
        icons.push(
          <Pressable key="clear" onPress={clearInput} style={styles.iconButton}>
            <Text
              style={[styles.clearButton, { fontSize: sizeConfig.iconSize }]}
            >
              ×
            </Text>
          </Pressable>
        );
      }

      // Success/Error indicators
      if (success) {
        icons.push(
          <CheckCircle
            key="success"
            size={sizeConfig.iconSize}
            color="#10B981"
          />
        );
      } else if (showError) {
        icons.push(
          <AlertCircle key="error" size={sizeConfig.iconSize} color="#EF4444" />
        );
      }

      // Custom right icon
      if (rightIcon && !success && !showError) {
        icons.push(
          <View key="custom" style={styles.iconContainer}>
            {rightIcon}
          </View>
        );
      }

      return icons.length > 0 ? (
        <View style={styles.rightIconContainer}>{icons}</View>
      ) : null;
    };

    return (
      <View style={[styles.container, containerStyle, style]} testID={testID}>
        <Animated.View
          style={[
            styles.inputContainer,
            styles[variant],
            styles[size],
            animatedContainerStyle,
          ]}
        >
          {/* Left Icon */}
          {leftIcon && <View style={styles.leftIconContainer}>{leftIcon}</View>}

          {/* Input Field */}
          <View style={styles.inputWrapper}>
            <AnimatedTextInput
              ref={inputRef}
              style={[
                styles.input,
                sizeConfig.inputStyle,
                leftIcon && styles.inputWithLeftIcon,
                inputStyle,
              ]}
              value={internalValue}
              onChangeText={handleChangeText}
              onFocus={handleFocus}
              onBlur={handleBlur}
              secureTextEntry={isPasswordField && !isPasswordVisible}
              placeholderTextColor="transparent"
              selectionColor="#A78BFA"
              {...props}
            />

            {/* Floating Label */}
            <Pressable
              onPress={handleLabelPress}
              style={[
                styles.labelContainer,
                leftIcon && styles.labelWithLeftIcon,
              ]}
              pointerEvents={isFocused || hasValue ? 'none' : 'auto'}
            >
              <Animated.Text
                style={[
                  styles.label,
                  sizeConfig.labelStyle,
                  animatedLabelStyle,
                  labelStyle,
                ]}
              >
                {label}
              </Animated.Text>
            </Pressable>
          </View>

          {/* Right Icons */}
          {renderRightIcon()}
        </Animated.View>

        {/* Helper Text / Error Message */}
        {(helperText || showError) && (
          <View style={styles.helperContainer}>
            {showError && (
              <Info size={12} color="#EF4444" style={styles.helperIcon} />
            )}
            <Text
              style={[
                styles.helperText,
                showError ? styles.errorText : styles.normalHelperText,
              ]}
            >
              {showError || helperText}
            </Text>
          </View>
        )}
      </View>
    );
  }
);

SmartInput.displayName = 'SmartInput';

// Helper functions
function getSizeConfig(size: string) {
  switch (size) {
    case 'sm':
      return {
        inputStyle: { fontSize: 14, lineHeight: 20, paddingVertical: 8 },
        labelStyle: { fontSize: 14 },
        labelFloat: { translateY: -10, scale: 0.85 },
        iconSize: 16,
      };
    case 'md':
      return {
        inputStyle: { fontSize: 16, lineHeight: 24, paddingVertical: 12 },
        labelStyle: { fontSize: 16 },
        labelFloat: { translateY: -12, scale: 0.85 },
        iconSize: 18,
      };
    case 'lg':
      return {
        inputStyle: { fontSize: 18, lineHeight: 28, paddingVertical: 16 },
        labelStyle: { fontSize: 18 },
        labelFloat: { translateY: -14, scale: 0.85 },
        iconSize: 20,
      };
    default:
      return {
        inputStyle: { fontSize: 16, lineHeight: 24, paddingVertical: 12 },
        labelStyle: { fontSize: 16 },
        labelFloat: { translateY: -12, scale: 0.85 },
        iconSize: 18,
      };
  }
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#1A1A2E',
    position: 'relative',
    shadowColor: 'rgba(107, 70, 193, 0.3)',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },

  // Variants
  default: {
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },

  outlined: {
    backgroundColor: 'transparent',
    borderWidth: 2,
  },

  filled: {
    backgroundColor: '#252540',
    borderColor: 'transparent',
  },

  // Sizes
  sm: {
    paddingHorizontal: 12,
    minHeight: 40,
  },

  md: {
    paddingHorizontal: 16,
    minHeight: 48,
  },

  lg: {
    paddingHorizontal: 20,
    minHeight: 56,
  },

  inputWrapper: {
    flex: 1,
    position: 'relative',
  },

  input: {
    color: '#E2E8F0',
    fontFamily: 'Inter',
    paddingHorizontal: 0,
    paddingTop: 16,
    paddingBottom: 4,
    margin: 0,
    textAlignVertical: 'center',
  },

  inputWithLeftIcon: {
    paddingLeft: 8,
  },

  labelContainer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    pointerEvents: 'none',
  },

  labelWithLeftIcon: {
    left: 8,
  },

  label: {
    color: '#94A3B8',
    fontFamily: 'Inter',
    transformOrigin: 'left center',
  },

  leftIconContainer: {
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  rightIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 8,
  },

  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  iconButton: {
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },

  clearButton: {
    color: '#94A3B8',
    fontWeight: 'bold',
    textAlign: 'center',
  },

  helperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    marginLeft: 16,
  },

  helperIcon: {
    marginRight: 4,
  },

  helperText: {
    fontSize: 12,
    fontFamily: 'Inter',
    lineHeight: 16,
  },

  normalHelperText: {
    color: '#94A3B8',
  },

  errorText: {
    color: '#EF4444',
  },
});
