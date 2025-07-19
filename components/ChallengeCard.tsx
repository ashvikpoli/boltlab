import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Challenge } from '@/hooks/useChallenges';
import { BoltCard } from './design-system/BoltCard';
import { LightningButton } from './design-system/LightningButton';

interface ChallengeCardProps {
  challenge: Challenge;
  onJoin?: (challengeId: string) => void;
  onView?: (challenge: Challenge) => void;
  userParticipation?: boolean;
}

export function ChallengeCard({
  challenge,
  onJoin,
  onView,
  userParticipation,
}: ChallengeCardProps) {
  const progress = challenge.user_participation?.progress || 0;
  const progressPercentage = Math.min(
    100,
    (progress / challenge.target_value) * 100
  );
  const isCompleted = challenge.user_participation?.completed || false;
  const endDate = new Date(challenge.end_date);
  const isActive = endDate > new Date();

  const getChallengeIcon = (type: string) => {
    switch (type) {
      case 'streak':
        return '🔥';
      case 'workout_count':
        return '💪';
      case 'exercise_variety':
        return '🎯';
      case 'duration':
        return '⏱️';
      case 'collaborative':
        return '👥';
      default:
        return '🏆';
    }
  };

  const getChallengeTypeLabel = (type: string) => {
    switch (type) {
      case 'streak':
        return 'Streak Challenge';
      case 'workout_count':
        return 'Workout Count';
      case 'exercise_variety':
        return 'Exercise Variety';
      case 'duration':
        return 'Duration Challenge';
      case 'collaborative':
        return 'Team Challenge';
      default:
        return 'Challenge';
    }
  };

  const formatTimeRemaining = () => {
    const now = new Date();
    const diff = endDate.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (days <= 0) return 'Ended';
    if (days === 1) return '1 day left';
    return `${days} days left`;
  };

  return (
    <BoltCard
      variant={isCompleted ? 'energy' : 'glass'}
      style={[
        styles.container,
        isCompleted && styles.completedContainer,
        !isActive && styles.inactiveContainer,
      ]}
      onPress={() => onView?.(challenge)}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.typeContainer}>
          <Text style={styles.icon}>
            {getChallengeIcon(challenge.challenge_type)}
          </Text>
          <Text style={styles.typeLabel}>
            {getChallengeTypeLabel(challenge.challenge_type)}
          </Text>
        </View>
        <Text style={[styles.timeRemaining, !isActive && styles.inactiveText]}>
          {formatTimeRemaining()}
        </Text>
      </View>

      {/* Title and Description */}
      <Text style={styles.title}>{challenge.title}</Text>
      <Text style={styles.description} numberOfLines={2}>
        {challenge.description}
      </Text>

      {/* Progress Section */}
      {userParticipation && (
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Your Progress</Text>
            <Text style={styles.progressText}>
              {progress} / {challenge.target_value}
            </Text>
          </View>

          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarBackground}>
              <View
                style={[
                  styles.progressBarFill,
                  isCompleted && styles.completedProgressBar,
                  { width: `${progressPercentage}%` },
                ]}
              />
            </View>
            <Text style={styles.progressPercentage}>
              {Math.round(progressPercentage)}%
            </Text>
          </View>

          {isCompleted && (
            <View style={styles.completedBadge}>
              <Text style={styles.completedText}>✅ Completed!</Text>
              <Text style={styles.xpReward}>+{challenge.xp_reward} XP</Text>
            </View>
          )}
        </View>
      )}

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.metaInfo}>
          <Text style={styles.creator}>
            By {challenge.creator?.username || 'Anonymous'}
          </Text>
          <Text style={styles.participants}>
            👥 {challenge.participants_count || 0} participants
          </Text>
        </View>

        {!userParticipation && isActive && (
          <LightningButton
            variant="primary"
            size="small"
            onPress={() => onJoin?.(challenge.id)}
            style={styles.joinButton}
          >
            Join Challenge
          </LightningButton>
        )}
      </View>
    </BoltCard>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#333333',
  },
  completedContainer: {
    borderColor: '#10B981',
    backgroundColor: '#0F1A14',
  },
  inactiveContainer: {
    opacity: 0.6,
    borderColor: '#555555',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    fontSize: 16,
    marginRight: 6,
  },
  typeLabel: {
    color: '#A855F7',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  timeRemaining: {
    color: '#F59E0B',
    fontSize: 12,
    fontWeight: '500',
  },
  inactiveText: {
    color: '#6B7280',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  description: {
    color: '#9CA3AF',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  progressSection: {
    backgroundColor: '#262626',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    color: '#E5E7EB',
    fontSize: 14,
    fontWeight: '500',
  },
  progressText: {
    color: '#A855F7',
    fontSize: 14,
    fontWeight: 'bold',
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBarBackground: {
    flex: 1,
    height: 8,
    backgroundColor: '#374151',
    borderRadius: 4,
    marginRight: 8,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#A855F7',
    borderRadius: 4,
  },
  completedProgressBar: {
    backgroundColor: '#10B981',
  },
  progressPercentage: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '500',
    minWidth: 35,
    textAlign: 'right',
  },
  completedBadge: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    padding: 8,
    backgroundColor: '#10B981',
    borderRadius: 8,
  },
  completedText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  xpReward: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  metaInfo: {
    flex: 1,
  },
  creator: {
    color: '#6B7280',
    fontSize: 12,
    marginBottom: 2,
  },
  participants: {
    color: '#6B7280',
    fontSize: 12,
  },
  joinButton: {
    backgroundColor: '#A855F7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
