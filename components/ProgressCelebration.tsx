import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Check,
  Star,
  Zap,
  Trophy,
  Target,
  TrendingUp,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ProgressCelebrationProps {
  visible: boolean;
  type:
    | 'set_complete'
    | 'workout_complete'
    | 'streak_milestone'
    | 'achievement_unlocked';
  title: string;
  subtitle: string;
  xpGained?: number;
  onComplete: () => void;
  onContinue?: () => void;
  progress?: {
    current: number;
    total: number;
  };
}

export default function ProgressCelebration({
  visible,
  type,
  title,
  subtitle,
  xpGained,
  onComplete,
  onContinue,
  progress,
}: ProgressCelebrationProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const sparkleAnims = useRef(
    Array.from({ length: 6 }, () => new Animated.Value(0))
  ).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const xpCountAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Haptic feedback based on celebration type
      const hapticType = {
        set_complete: Haptics.ImpactFeedbackStyle.Light,
        workout_complete: Haptics.ImpactFeedbackStyle.Heavy,
        streak_milestone: Haptics.ImpactFeedbackStyle.Heavy,
        achievement_unlocked: Haptics.ImpactFeedbackStyle.Heavy,
      };
      Haptics.impactAsync(hapticType[type]);

      // Main entrance animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();

      // Bounce animation for icons
      Animated.sequence([
        Animated.delay(200),
        Animated.loop(
          Animated.sequence([
            Animated.timing(bounceAnim, {
              toValue: 1,
              duration: 600,
              useNativeDriver: true,
            }),
            Animated.timing(bounceAnim, {
              toValue: 0,
              duration: 600,
              useNativeDriver: true,
            }),
          ]),
          { iterations: 3 }
        ),
      ]).start();

      // Sparkle animations
      sparkleAnims.forEach((anim, index) => {
        Animated.sequence([
          Animated.delay(300 + index * 100),
          Animated.timing(anim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ]).start();
      });

      // Progress bar animation
      if (progress) {
        Animated.timing(progressAnim, {
          toValue: progress.current / progress.total,
          duration: 1000,
          useNativeDriver: false,
        }).start();
      }

      // XP count animation
      if (xpGained) {
        Animated.timing(xpCountAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: false,
        }).start();
      }
    } else {
      // Reset animations
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.5);
      bounceAnim.setValue(0);
      progressAnim.setValue(0);
      xpCountAnim.setValue(0);
      sparkleAnims.forEach((anim) => anim.setValue(0));
    }
  }, [visible]);

  const getIcon = () => {
    switch (type) {
      case 'set_complete':
        return <Check size={40} color="#FFFFFF" />;
      case 'workout_complete':
        return <Trophy size={40} color="#FFFFFF" />;
      case 'streak_milestone':
        return <Target size={40} color="#FFFFFF" />;
      case 'achievement_unlocked':
        return <Star size={40} color="#FFFFFF" />;
      default:
        return <Zap size={40} color="#FFFFFF" />;
    }
  };

  const getColors = (): [string, string] => {
    switch (type) {
      case 'set_complete':
        return ['#10B981', '#059669'];
      case 'workout_complete':
        return ['#6B46C1', '#553C9A'];
      case 'streak_milestone':
        return ['#F59E0B', '#D97706'];
      case 'achievement_unlocked':
        return ['#8B5CF6', '#7C3AED'];
      default:
        return ['#6B46C1', '#553C9A'];
    }
  };

  const [displayXP, setDisplayXP] = useState(0);

  useEffect(() => {
    if (visible && xpGained) {
      const listener = xpCountAnim.addListener(({ value }) => {
        setDisplayXP(Math.round(value * xpGained));
      });

      return () => {
        xpCountAnim.removeListener(listener);
      };
    }
  }, [visible, xpGained, xpCountAnim]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.overlay,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <LinearGradient
        colors={['rgba(15, 15, 35, 0.95)', 'rgba(26, 26, 46, 0.9)']}
        style={styles.container}
      >
        {/* Sparkle Effects */}
        {sparkleAnims.map((anim, index) => (
          <Animated.View
            key={index}
            style={[
              styles.sparkle,
              {
                opacity: anim,
                transform: [
                  {
                    scale: anim.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [0, 1.2, 0],
                    }),
                  },
                ],
                left: `${15 + index * 15}%`,
                top: `${20 + (index % 2) * 40}%`,
              },
            ]}
          >
            <Text style={styles.sparkleText}>✨</Text>
          </Animated.View>
        ))}

        {/* Main Content */}
        <View style={styles.content}>
          {/* Icon */}
          <Animated.View
            style={[
              styles.iconContainer,
              {
                transform: [
                  {
                    translateY: bounceAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -10],
                    }),
                  },
                ],
              },
            ]}
          >
            <LinearGradient colors={getColors()} style={styles.iconGradient}>
              {getIcon()}
            </LinearGradient>
          </Animated.View>

          {/* Title */}
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>

          {/* XP Counter */}
          {xpGained && (
            <View style={styles.xpContainer}>
              <Zap size={20} color="#F59E0B" />
              <Text style={styles.xpText}>+{displayXP} XP</Text>
            </View>
          )}

          {/* Progress Bar */}
          {progress && (
            <View style={styles.progressContainer}>
              <Text style={styles.progressLabel}>
                Progress: {progress.current}/{progress.total}
              </Text>
              <View style={styles.progressBar}>
                <Animated.View
                  style={[
                    styles.progressFill,
                    {
                      width: progressAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', '100%'],
                      }),
                    },
                  ]}
                />
              </View>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actions}>
            {onContinue && (
              <TouchableOpacity
                style={styles.continueButton}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  onContinue();
                }}
              >
                <LinearGradient
                  colors={getColors()}
                  style={styles.buttonGradient}
                >
                  <Text style={styles.continueButtonText}>Continue</Text>
                  <TrendingUp size={16} color="#FFFFFF" />
                </LinearGradient>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[
                styles.completeButton,
                !onContinue && styles.completeButtonFull,
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                onComplete();
              }}
            >
              <Text style={styles.completeButtonText}>
                {onContinue ? 'Finish' : 'Awesome!'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  container: {
    width: SCREEN_WIDTH * 0.85,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(107, 70, 193, 0.3)',
  },
  sparkle: {
    position: 'absolute',
  },
  sparkleText: {
    fontSize: 16,
  },
  content: {
    alignItems: 'center',
    width: '100%',
  },
  iconContainer: {
    marginBottom: 24,
  },
  iconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 24,
  },
  xpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 24,
  },
  xpText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F59E0B',
    marginLeft: 8,
  },
  progressContainer: {
    width: '100%',
    marginBottom: 24,
  },
  progressLabel: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 8,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(26, 26, 46, 0.6)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6B46C1',
    borderRadius: 4,
  },
  actions: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  continueButton: {
    flex: 1,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  completeButton: {
    flex: 1,
    backgroundColor: 'rgba(26, 26, 46, 0.6)',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  completeButtonFull: {
    backgroundColor: 'rgba(107, 70, 193, 0.2)',
    borderColor: '#6B46C1',
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
