import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Play, Pause, RotateCcw, Clock } from 'lucide-react-native';
import { useNotifications } from '@/hooks/useNotifications';
import { useSettings } from '@/hooks/useSettings';

interface RestTimerProps {
  duration?: number; // in seconds, optional - will use settings default
  onComplete: () => void;
  onSkip: () => void;
  isActive: boolean;
}

export default function RestTimer({
  duration,
  onComplete,
  onSkip,
  isActive,
}: RestTimerProps) {
  const { settings } = useSettings();
  const {
    scheduleRestEndNotification,
    scheduleRestCompleteNotification,
    cancelRestNotifications,
  } = useNotifications();

  const restDuration = duration || settings.defaultRestTime;
  const [timeRemaining, setTimeRemaining] = useState(restDuration);
  const [isRunning, setIsRunning] = useState(isActive);

  useEffect(() => {
    setTimeRemaining(restDuration);
    setIsRunning(isActive);
  }, [restDuration, isActive]);

  // Schedule notifications when timer starts
  useEffect(() => {
    if (isRunning && timeRemaining > 0) {
      scheduleRestEndNotification(timeRemaining);
      scheduleRestCompleteNotification(timeRemaining);
    } else {
      cancelRestNotifications();
    }
  }, [isRunning, timeRemaining]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            cancelRestNotifications();
            onComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRunning, timeRemaining, onComplete]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    return ((restDuration - timeRemaining) / restDuration) * 100;
  };

  const handlePlayPause = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setTimeRemaining(restDuration);
    setIsRunning(false);
    cancelRestNotifications();
  };

  const getTimerColor = () => {
    const percentage = (timeRemaining / restDuration) * 100;
    if (percentage > 50) return '#10B981'; // Green
    if (percentage > 25) return '#F59E0B'; // Orange
    return '#EF4444'; // Red
  };

  return (
    <Modal
      visible={isActive}
      transparent={true}
      animationType="fade"
      statusBarTranslucent={true}
    >
      <BlurView intensity={15} style={styles.blurContainer}>
        <View style={styles.overlay}>
    <View style={styles.container}>
      <LinearGradient colors={['#1A1A2E', '#0F0F23']} style={styles.gradient}>
        <View style={styles.header}>
                <Clock size={24} color="#6B46C1" />
          <Text style={styles.title}>Rest Timer</Text>
        </View>

        {/* Circular Progress */}
        <View style={styles.timerContainer}>
          <View style={styles.circularProgress}>
            <View
              style={[
                styles.progressRing,
                {
                  borderColor: getTimerColor(),
                  transform: [
                    { rotate: `${getProgressPercentage() * 3.6}deg` },
                  ],
                },
              ]}
            />
            <View style={styles.timerContent}>
              <Text style={[styles.timeText, { color: getTimerColor() }]}>
                {formatTime(timeRemaining)}
              </Text>
              <Text style={styles.timeLabel}>remaining</Text>
            </View>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${getProgressPercentage()}%`,
                  backgroundColor: getTimerColor(),
                },
              ]}
            />
          </View>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity style={styles.controlButton} onPress={handleReset}>
            <View style={styles.controlButtonContent}>
              <RotateCcw size={20} color="#64748B" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.playButton} onPress={handlePlayPause}>
            <LinearGradient
              colors={['#6B46C1', '#8B5CF6']}
              style={styles.playButtonGradient}
            >
              {isRunning ? (
                <Pause size={24} color="#FFFFFF" />
              ) : (
                <Play size={24} color="#FFFFFF" />
              )}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlButton} onPress={onSkip}>
            <View style={styles.controlButtonContent}>
              <Text style={styles.skipText}>Skip</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Quick Time Adjustments */}
        <View style={styles.quickTimes}>
          <Text style={styles.quickTimesLabel}>Quick adjust:</Text>
          <View style={styles.quickTimeButtons}>
            {[30, 60, 90, 120].map((time) => (
              <TouchableOpacity
                key={time}
                style={[
                  styles.quickTimeButton,
                  restDuration === time && styles.activeQuickTime,
                ]}
                onPress={() => {
                  setTimeRemaining(time);
                  setIsRunning(false);
                  cancelRestNotifications();
                }}
              >
                <Text
                  style={[
                    styles.quickTimeText,
                    restDuration === time && styles.activeQuickTimeText,
                  ]}
                >
                  {time < 60 ? `${time}s` : `${time / 60}m`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </LinearGradient>
    </View>
        </View>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  blurContainer: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  container: {
    width: '90%',
    maxWidth: 400,
  },
  gradient: {
    borderRadius: 24,
    padding: 32,
    borderWidth: 1,
    borderColor: '#1A1A2E',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 15,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 12,
  },
  timerContainer: {
    marginBottom: 32,
  },
  circularProgress: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#0F0F23',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    borderWidth: 4,
    borderColor: '#1A1A2E',
  },
  progressRing: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 6,
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  timerContent: {
    alignItems: 'center',
  },
  timeText: {
    fontSize: 36,
    fontWeight: '800',
    marginBottom: 4,
  },
  timeLabel: {
    fontSize: 14,
    color: '#94A3B8',
  },
  progressBarContainer: {
    width: '100%',
    marginBottom: 24,
  },
  progressBar: {
    width: '100%',
    height: 6,
    backgroundColor: '#1A1A2E',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  controlButton: {
    marginHorizontal: 16,
  },
  controlButtonContent: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#1A1A2E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    marginHorizontal: 16,
  },
  playButtonGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  quickTimes: {
    alignItems: 'center',
  },
  quickTimesLabel: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 12,
  },
  quickTimeButtons: {
    flexDirection: 'row',
  },
  quickTimeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#1A1A2E',
    marginHorizontal: 4,
  },
  activeQuickTime: {
    backgroundColor: '#6B46C1',
  },
  quickTimeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
  },
  activeQuickTimeText: {
    color: '#FFFFFF',
  },
});
