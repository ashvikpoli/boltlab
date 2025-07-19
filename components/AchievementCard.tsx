import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BoltCard } from './design-system/BoltCard';
import { ProgressRing } from './design-system/ProgressRing';
import {
  CelebrationBurst,
  Pulse,
  Sparkle,
} from './design-system/AnimatedComponents';

interface Achievement {
  id: string;
  title: string;
  description: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  isUnlocked: boolean;
  progress: number;
  target: number;
  icon: string;
  xpReward: number;
  dateUnlocked?: string;
}

interface AchievementCardProps {
  achievement: Achievement;
  onPress?: () => void;
  animated?: boolean;
  showProgress?: boolean;
}

export const AchievementCard: React.FC<AchievementCardProps> = ({
  achievement,
  onPress,
  animated = true,
  showProgress = true,
}) => {
  const [wasJustUnlocked, setWasJustUnlocked] = useState(false);
  const [showSparkles, setShowSparkles] = useState(false);

  // Detect if achievement was just unlocked
  useEffect(() => {
    if (achievement.isUnlocked && !wasJustUnlocked) {
      setWasJustUnlocked(true);
      setShowSparkles(true);

      // Reset sparkle state after celebration
      setTimeout(() => {
        setShowSparkles(false);
      }, 3000);
    }
  }, [achievement.isUnlocked, wasJustUnlocked]);

  const getRarityColors = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return {
          primary: '#10B981',
          secondary: '#059669',
          glow: 'rgba(16, 185, 129, 0.3)',
          sparkles: ['#10B981', '#34D399', '#6EE7B7'],
        };
      case 'rare':
        return {
          primary: '#3B82F6',
          secondary: '#2563EB',
          glow: 'rgba(59, 130, 246, 0.3)',
          sparkles: ['#3B82F6', '#60A5FA', '#93C5FD'],
        };
      case 'epic':
        return {
          primary: '#8B5CF6',
          secondary: '#7C3AED',
          glow: 'rgba(139, 92, 246, 0.3)',
          sparkles: ['#8B5CF6', '#A78BFA', '#C4B5FD'],
        };
      case 'legendary':
        return {
          primary: '#F59E0B',
          secondary: '#D97706',
          glow: 'rgba(245, 158, 11, 0.3)',
          sparkles: ['#F59E0B', '#FBBF24', '#FDE68A', '#FFD700'],
        };
      default:
        return {
          primary: '#6B7280',
          secondary: '#4B5563',
          glow: 'rgba(107, 114, 128, 0.3)',
          sparkles: ['#6B7280', '#9CA3AF'],
        };
    }
  };

  const colors = getRarityColors(achievement.rarity);
  const progressPercentage = Math.min(
    (achievement.progress / achievement.target) * 100,
    100
  );
  const isCompleted = achievement.isUnlocked;

  const CardContent = (
    <View style={styles.cardContent}>
      {/* Rarity Indicator */}
      <View style={[styles.rarityBadge, { backgroundColor: colors.primary }]}>
        <Text style={styles.rarityText}>
          {achievement.rarity.toUpperCase()}
        </Text>
      </View>

      {/* Achievement Icon */}
      <View style={styles.iconContainer}>
        <View
          style={[
            styles.iconBackground,
            {
              backgroundColor: colors.glow,
              borderColor: colors.primary,
            },
          ]}
        >
          <Text style={styles.iconText}>{achievement.icon}</Text>
        </View>

        {/* Sparkle effects for legendary achievements */}
        {achievement.rarity === 'legendary' && isCompleted && showSparkles && (
          <>
            <Sparkle
              style={{ top: -5, right: -5 }}
              color={colors.sparkles[0]}
              size={8}
              duration={1500}
            />
            <Sparkle
              style={{ bottom: -3, left: -3 }}
              color={colors.sparkles[1]}
              size={6}
              duration={1800}
            />
            <Sparkle
              style={{ top: 10, left: -8 }}
              color={colors.sparkles[2]}
              size={7}
              duration={1200}
            />
          </>
        )}
      </View>

      {/* Achievement Info */}
      <View style={styles.achievementInfo}>
        <Text
          style={[
            styles.title,
            isCompleted ? styles.completedTitle : styles.lockedTitle,
          ]}
        >
          {achievement.title}
        </Text>

        <Text
          style={[
            styles.description,
            isCompleted
              ? styles.completedDescription
              : styles.lockedDescription,
          ]}
        >
          {achievement.description}
        </Text>

        {/* Progress Section */}
        {showProgress && !isCompleted && (
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressText}>
                {achievement.progress} / {achievement.target}
              </Text>
              <Text style={styles.progressPercentage}>
                {Math.round(progressPercentage)}%
              </Text>
            </View>

            <ProgressRing
              progress={progressPercentage / 100}
              size="lg"
              strokeWidth={3}
              colors={[colors.primary, colors.secondary]}
              backgroundColor="rgba(107, 114, 128, 0.2)"
              animated={animated}
            />
          </View>
        )}

        {/* XP Reward */}
        <View style={styles.rewardSection}>
          <Text
            style={[
              styles.xpReward,
              { color: isCompleted ? colors.primary : '#6B7280' },
            ]}
          >
            +{achievement.xpReward} XP
          </Text>

          {isCompleted && achievement.dateUnlocked && (
            <Text style={styles.dateUnlocked}>
              Unlocked {new Date(achievement.dateUnlocked).toLocaleDateString()}
            </Text>
          )}
        </View>
      </View>

      {/* Completion Celebration */}
      <CelebrationBurst
        trigger={wasJustUnlocked && showSparkles}
        onComplete={() => setShowSparkles(false)}
        sparkleCount={achievement.rarity === 'legendary' ? 20 : 12}
        colors={colors.sparkles}
      />
    </View>
  );

  const WrapperCard = (
    <BoltCard
      variant={isCompleted ? 'energy' : 'glass'}
      onPress={onPress}
      style={[
        styles.achievementCard,
        isCompleted && styles.completedCard,
        {
          borderColor: isCompleted
            ? colors.primary
            : 'rgba(107, 114, 128, 0.3)',
        },
      ]}
      animated={animated}
      pulseOnHover={achievement.rarity === 'legendary' && isCompleted}
      morphOnPress={true}
    >
      {CardContent}
    </BoltCard>
  );

  // Add pulse effect for epic and legendary achievements
  if (
    (achievement.rarity === 'epic' || achievement.rarity === 'legendary') &&
    isCompleted &&
    animated
  ) {
    return (
      <Pulse enabled={true} scale={1.02} duration={3000}>
        {WrapperCard}
      </Pulse>
    );
  }

  return WrapperCard;
};

const styles = StyleSheet.create({
  achievementCard: {
    marginVertical: 8,
  },
  completedCard: {
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  cardContent: {
    position: 'relative',
  },
  rarityBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 10,
  },
  rarityText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 12,
    position: 'relative',
  },
  iconBackground: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  iconText: {
    fontSize: 24,
  },
  achievementInfo: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  completedTitle: {
    color: '#FFFFFF',
  },
  lockedTitle: {
    color: '#9CA3AF',
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 20,
  },
  completedDescription: {
    color: '#E5E7EB',
  },
  lockedDescription: {
    color: '#6B7280',
  },
  progressSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  progressHeader: {
    flex: 1,
  },
  progressText: {
    color: '#D1D5DB',
    fontSize: 12,
    fontWeight: '500',
  },
  progressPercentage: {
    color: '#9CA3AF',
    fontSize: 10,
    marginTop: 2,
  },
  rewardSection: {
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(107, 114, 128, 0.2)',
    paddingTop: 12,
  },
  xpReward: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  dateUnlocked: {
    color: '#6B7280',
    fontSize: 11,
    marginTop: 4,
  },
});

export default AchievementCard;
