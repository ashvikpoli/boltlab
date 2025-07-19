import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Check,
  X,
  ArrowRight,
  ArrowLeft,
  Zap,
  ChevronUp,
  ChevronDown,
} from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;

interface SwipeCardProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  leftAction?: {
    icon: React.ReactNode;
    label: string;
    color: string;
  };
  rightAction?: {
    icon: React.ReactNode;
    label: string;
    color: string;
  };
  upAction?: {
    icon: React.ReactNode;
    label: string;
    color: string;
  };
  downAction?: {
    icon: React.ReactNode;
    label: string;
    color: string;
  };
  disabled?: boolean;
  style?: any;
  accessible?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export default function SwipeCard({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  leftAction,
  rightAction,
  upAction,
  downAction,
  disabled = false,
  style,
  accessible = true,
  accessibilityLabel,
  accessibilityHint,
}: SwipeCardProps) {
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const [swipeDirection, setSwipeDirection] = useState<string | null>(null);

    const onGestureEvent = (event: any) => {
    if (disabled) return;

    const { translationX, translationY } = event.nativeEvent;
    
    // Determine primary direction
    if (Math.abs(translationX) > Math.abs(translationY)) {
      // Horizontal swipe
      translateX.setValue(translationX);
      translateY.setValue(0);
      
      if (translationX > 0 && rightAction) {
        setSwipeDirection('right');
      } else if (translationX < 0 && leftAction) {
        setSwipeDirection('left');
      } else {
        setSwipeDirection(null);
      }
    } else {
      // Vertical swipe
      translateY.setValue(translationY);
      translateX.setValue(0);
      
      if (translationY > 0 && downAction) {
        setSwipeDirection('down');
      } else if (translationY < 0 && upAction) {
        setSwipeDirection('up');
      } else {
        setSwipeDirection(null);
      }
    }

    // Scale effect for feedback
    const distance = Math.sqrt(translationX * translationX + translationY * translationY);
    const scaleValue = 1 - (distance / 1000) * 0.1;
    scale.setValue(Math.max(scaleValue, 0.9));
  };

  const onHandlerStateChange = (event: any) => {
    if (disabled) return;

    const { state, translationX, translationY } = event.nativeEvent;
    
    if (state === State.END) {
      let shouldTriggerAction = false;
      
      if (Math.abs(translationX) > Math.abs(translationY)) {
        // Horizontal swipe
        if (translationX > SWIPE_THRESHOLD && rightAction) {
          shouldTriggerAction = true;
          onSwipeRight?.();
        } else if (translationX < -SWIPE_THRESHOLD && leftAction) {
          shouldTriggerAction = true;
          onSwipeLeft?.();
        }
      } else {
        // Vertical swipe
        if (translationY > SWIPE_THRESHOLD && downAction) {
          shouldTriggerAction = true;
          onSwipeDown?.();
        } else if (translationY < -SWIPE_THRESHOLD && upAction) {
          shouldTriggerAction = true;
          onSwipeUp?.();
        }
      }

      // Reset position with animation
      Animated.parallel([
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
          bounciness: 8,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          bounciness: 8,
        }),
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          bounciness: 8,
        }),
      ]).start();

      setSwipeDirection(null);
    }
  };

  const getBackgroundColor = () => {
    switch (swipeDirection) {
      case 'left':
        return leftAction?.color || '#EF4444';
      case 'right':
        return rightAction?.color || '#10B981';
      case 'up':
        return upAction?.color || '#3B82F6';
      case 'down':
        return downAction?.color || '#F59E0B';
      default:
        return 'transparent';
    }
  };

  const renderActionIndicator = (direction: string, action: any) => {
    if (!action || swipeDirection !== direction) return null;

    return (
      <Animated.View
        style={[
          styles.actionIndicator,
          {
            backgroundColor: action.color + '20',
            borderColor: action.color,
            opacity: swipeDirection === direction ? 1 : 0,
          },
        ]}
      >
        {action.icon}
        <Text style={[styles.actionLabel, { color: action.color }]}>
          {action.label}
        </Text>
      </Animated.View>
    );
  };

  // Generate accessibility description
  const getAccessibilityDescription = () => {
    const actions = [];
    if (leftAction) actions.push(`Swipe left to ${leftAction.label}`);
    if (rightAction) actions.push(`Swipe right to ${rightAction.label}`);
    if (upAction) actions.push(`Swipe up to ${upAction.label}`);
    if (downAction) actions.push(`Swipe down to ${downAction.label}`);
    return actions.join(', ');
  };

  return (
    <View
      style={[styles.container, style]}
      accessible={accessible}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint || getAccessibilityDescription()}
      accessibilityRole="button"
    >
      {/* Background indicators */}
      <Animated.View
        style={[
          styles.backgroundIndicator,
          {
            backgroundColor: getBackgroundColor(),
            opacity: swipeDirection ? 0.1 : 0,
          },
        ]}
      />

      {/* Action indicators */}
      {renderActionIndicator('left', leftAction)}
      {renderActionIndicator('right', rightAction)}
      {renderActionIndicator('up', upAction)}
      {renderActionIndicator('down', downAction)}

      {/* Main card */}
      <PanGestureHandler
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}
      >
        <Animated.View
          style={[
            styles.card,
            {
              transform: [{ translateX }, { translateY }, { scale }],
            },
          ]}
        >
          <LinearGradient
            colors={['rgba(26, 26, 46, 0.8)', 'rgba(15, 15, 35, 0.9)']}
            style={styles.cardGradient}
          >
            {children}
          </LinearGradient>

          {/* Swipe hints */}
          <View style={styles.swipeHints}>
            {leftAction && (
              <View style={[styles.hint, styles.leftHint]}>
                <ArrowLeft size={16} color="#64748B" />
              </View>
            )}
            {rightAction && (
              <View style={[styles.hint, styles.rightHint]}>
                <ArrowRight size={16} color="#64748B" />
              </View>
            )}
            {upAction && (
              <View style={[styles.hint, styles.upHint]}>
                <ChevronUp size={16} color="#64748B" />
              </View>
            )}
            {downAction && (
              <View style={[styles.hint, styles.downHint]}>
                <ChevronDown size={16} color="#64748B" />
              </View>
            )}
          </View>
        </Animated.View>
      </PanGestureHandler>

      {/* Crypto wallet-style transaction indicators */}
      {swipeDirection && (
        <Animated.View style={styles.transactionIndicator}>
          <LinearGradient
            colors={['rgba(107, 70, 193, 0.9)', 'rgba(139, 92, 246, 0.7)']}
            style={styles.transactionGradient}
          >
            <Zap size={20} color="#FFFFFF" />
            <Text style={styles.transactionText}>
              {swipeDirection === 'right' && rightAction?.label}
              {swipeDirection === 'left' && leftAction?.label}
              {swipeDirection === 'up' && upAction?.label}
              {swipeDirection === 'down' && downAction?.label}
            </Text>
          </LinearGradient>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    marginVertical: 8,
  },
  backgroundIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 16,
  },
  actionIndicator: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -50 }, { translateY: -50 }],
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    zIndex: 10,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  cardGradient: {
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(107, 70, 193, 0.3)',
  },
  swipeHints: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  hint: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(100, 116, 139, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  leftHint: {
    left: 12,
    top: '50%',
    transform: [{ translateY: -16 }],
  },
  rightHint: {
    right: 12,
    top: '50%',
    transform: [{ translateY: -16 }],
  },
  upHint: {
    top: 12,
    left: '50%',
    transform: [{ translateX: -16 }],
  },
  downHint: {
    bottom: 12,
    left: '50%',
    transform: [{ translateX: -16 }],
  },
  transactionIndicator: {
    position: 'absolute',
    top: -10,
    left: '50%',
    transform: [{ translateX: -75 }],
    zIndex: 20,
    width: 150,
  },
  transactionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  transactionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
});
