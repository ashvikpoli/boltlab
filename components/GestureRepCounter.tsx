import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
  Vibration,
  TouchableWithoutFeedback,
} from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Plus,
  Minus,
  Check,
  Zap,
  Target,
  TrendingUp,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface GestureRepCounterProps {
  currentReps: number;
  targetReps: number;
  onRepsChange: (reps: number) => void;
  onComplete: () => void;
  exerciseName: string;
  showAIFeedback?: boolean;
  disabled?: boolean;
}

export default function GestureRepCounter({
  currentReps,
  targetReps,
  onRepsChange,
  onComplete,
  exerciseName,
  showAIFeedback = true,
  disabled = false,
}: GestureRepCounterProps) {
  const [isGestureActive, setIsGestureActive] = useState(false);
  const [tapCount, setTapCount] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<'up' | 'down' | null>(
    null
  );
  const [showCompletionFeedback, setShowCompletionFeedback] = useState(false);

  // Animations
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const completionAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Update progress animation when reps change
  useEffect(() => {
    const progress = Math.min(currentReps / targetReps, 1);
    Animated.spring(progressAnim, {
      toValue: progress,
      useNativeDriver: false,
      tension: 50,
      friction: 8,
    }).start();

    // Check if completed
    if (currentReps >= targetReps && currentReps > 0) {
      setShowCompletionFeedback(true);
      Animated.sequence([
        Animated.timing(completionAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(1500),
        Animated.timing(completionAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => setShowCompletionFeedback(false));
    }
  }, [currentReps, targetReps]);

  // Pulse animation for active state
  useEffect(() => {
    if (isGestureActive) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [isGestureActive]);

  const handleTap = () => {
    if (disabled) return;

    // Haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Add rep with animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.2,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    const newReps = Math.min(currentReps + 1, 999);
    onRepsChange(newReps);

    setTapCount((prev) => prev + 1);
  };

  const handleDoubleTap = () => {
    if (disabled) return;

    // Stronger haptic for double tap
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Complete the set if at target or beyond
    if (currentReps >= targetReps) {
      onComplete();
    }
  };

  const handleLongPress = () => {
    if (disabled) return;

    // Subtract rep
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newReps = Math.max(currentReps - 1, 0);
    onRepsChange(newReps);
  };

  const onPanGestureEvent = Animated.event(
    [{ nativeEvent: { translationY: new Animated.Value(0) } }],
    { useNativeDriver: false }
  );

  const onPanHandlerStateChange = (event: any) => {
    if (disabled) return;

    const { state, translationY } = event.nativeEvent;

    if (state === State.BEGAN) {
      setIsGestureActive(true);
    } else if (state === State.END) {
      setIsGestureActive(false);

      if (Math.abs(translationY) > 50) {
        if (translationY < 0) {
          // Swipe up - add rep
          setSwipeDirection('up');
          handleTap();
        } else {
          // Swipe down - subtract rep
          setSwipeDirection('down');
          handleLongPress();
        }

        // Reset swipe direction after animation
        setTimeout(() => setSwipeDirection(null), 300);
      }
    }
  };

  const getProgressColor = () => {
    const progress = currentReps / targetReps;
    if (progress >= 1) return '#10B981'; // Green when complete
    if (progress >= 0.8) return '#F59E0B'; // Orange when close
    return '#6B46C1'; // Purple default
  };

  const getFeedbackText = () => {
    const progress = currentReps / targetReps;
    if (progress >= 1) return 'Set Complete! 🎉';
    if (progress >= 0.8) return 'Almost there! 💪';
    if (progress >= 0.5) return 'Keep going! ⚡';
    if (progress >= 0.2) return 'Great start! 🔥';
    return 'Tap to count reps';
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.exerciseLabel}>{exerciseName}</Text>
        <Text style={styles.instructionText}>
          Tap to count • Double tap when done • Long press to undo
        </Text>
      </View>

      {/* Main Counter */}
      <PanGestureHandler
        onGestureEvent={onPanGestureEvent}
        onHandlerStateChange={onPanHandlerStateChange}
      >
        <Animated.View
          style={[
            styles.counterContainer,
            {
              transform: [{ scale: scaleAnim }, { scale: pulseAnim }],
            },
          ]}
        >
          <TouchableWithoutFeedback
            onPress={handleTap}
            onLongPress={handleLongPress}
            delayLongPress={300}
          >
            <View style={styles.counter}>
              <LinearGradient
                colors={['rgba(26, 26, 46, 0.9)', 'rgba(15, 15, 35, 0.95)']}
                style={styles.counterGradient}
              >
                {/* Progress Ring */}
                <View style={styles.progressRing}>
                  <Animated.View
                    style={[
                      styles.progressFill,
                      {
                        borderColor: getProgressColor(),
                        borderWidth: progressAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, 8],
                        }),
                      },
                    ]}
                  />

                  {/* Rep Count */}
                  <View style={styles.repCountContainer}>
                    <Text
                      style={[styles.repCount, { color: getProgressColor() }]}
                    >
                      {currentReps}
                    </Text>
                    <Text style={styles.targetReps}>/ {targetReps}</Text>
                  </View>
                </View>

                {/* Swipe Direction Indicator */}
                {swipeDirection && (
                  <Animated.View
                    style={[
                      styles.swipeIndicator,
                      swipeDirection === 'up'
                        ? styles.swipeUp
                        : styles.swipeDown,
                    ]}
                  >
                    {swipeDirection === 'up' ? (
                      <Plus size={20} color="#10B981" />
                    ) : (
                      <Minus size={20} color="#EF4444" />
                    )}
                  </Animated.View>
                )}
              </LinearGradient>
            </View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </PanGestureHandler>

      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarBackground}>
          <Animated.View
            style={[
              styles.progressBarFill,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
                backgroundColor: getProgressColor(),
              },
            ]}
          />
        </View>
      </View>

      {/* AI Feedback */}
      {showAIFeedback && (
        <View style={styles.feedbackContainer}>
          <LinearGradient
            colors={['rgba(107, 70, 193, 0.2)', 'rgba(139, 92, 246, 0.1)']}
            style={styles.feedbackGradient}
          >
            <Zap size={16} color="#6B46C1" />
            <Text style={styles.feedbackText}>{getFeedbackText()}</Text>
          </LinearGradient>
        </View>
      )}

      {/* Manual Controls */}
      <View style={styles.manualControls}>
        <TouchableOpacity
          style={[styles.controlButton, styles.decreaseButton]}
          onPress={() => onRepsChange(Math.max(currentReps - 1, 0))}
          disabled={disabled || currentReps === 0}
        >
          <LinearGradient
            colors={['rgba(239, 68, 68, 0.2)', 'rgba(239, 68, 68, 0.1)']}
            style={styles.controlButtonGradient}
          >
            <Minus size={20} color="#EF4444" />
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, styles.increaseButton]}
          onPress={() => onRepsChange(Math.min(currentReps + 1, 999))}
          disabled={disabled}
        >
          <LinearGradient
            colors={['rgba(16, 185, 129, 0.2)', 'rgba(16, 185, 129, 0.1)']}
            style={styles.controlButtonGradient}
          >
            <Plus size={20} color="#10B981" />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Completion Celebration */}
      {showCompletionFeedback && (
        <Animated.View
          style={[
            styles.completionOverlay,
            {
              opacity: completionAnim,
              transform: [
                {
                  scale: completionAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.5, 1],
                  }),
                },
              ],
            },
          ]}
        >
          <LinearGradient
            colors={['rgba(16, 185, 129, 0.9)', 'rgba(5, 150, 105, 0.8)']}
            style={styles.completionGradient}
          >
            <Check size={40} color="#FFFFFF" />
            <Text style={styles.completionText}>Set Complete!</Text>
            <Text style={styles.completionSubtext}>
              {currentReps} reps • Great job! 🎉
            </Text>
          </LinearGradient>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  exerciseLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
  },
  counterContainer: {
    marginBottom: 20,
  },
  counter: {
    width: 200,
    height: 200,
    borderRadius: 100,
    overflow: 'hidden',
  },
  counterGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(107, 70, 193, 0.3)',
  },
  progressRing: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  progressFill: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderColor: 'transparent',
  },
  repCountContainer: {
    alignItems: 'center',
  },
  repCount: {
    fontSize: 48,
    fontWeight: '800',
    marginBottom: 4,
  },
  targetReps: {
    fontSize: 16,
    color: '#94A3B8',
    fontWeight: '500',
  },
  swipeIndicator: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  swipeUp: {
    top: 20,
  },
  swipeDown: {
    bottom: 20,
  },
  progressBarContainer: {
    width: SCREEN_WIDTH - 40,
    marginBottom: 20,
  },
  progressBarBackground: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(26, 26, 46, 0.6)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  feedbackContainer: {
    marginBottom: 20,
  },
  feedbackGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(107, 70, 193, 0.3)',
  },
  feedbackText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
    marginLeft: 8,
  },
  manualControls: {
    flexDirection: 'row',
    gap: 20,
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
  },
  controlButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  decreaseButton: {},
  increaseButton: {},
  completionOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -100 }, { translateY: -50 }],
    width: 200,
    zIndex: 10,
  },
  completionGradient: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  completionText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 8,
    marginBottom: 4,
  },
  completionSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
});
