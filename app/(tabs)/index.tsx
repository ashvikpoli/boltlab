import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Zap,
  Flame,
  Play,
  RefreshCw,
  Calendar,
  Target,
  Sparkles,
  Clock,
  ArrowRight,
  TrendingUp,
  Trophy,
} from 'lucide-react-native';
import {
  BoltCard,
  LightningButton,
  ProgressRing,
  BoltColors,
  BoltSpacing,
} from '@/components/design-system';
import SwipeCard from '@/components/SwipeCard';
import EmojiMoodTracker from '@/components/EmojiMoodTracker';
import { useAuth } from '@/hooks/useAuth';
import {
  useSupabaseGamification,
  getLevelProgress,
} from '@/hooks/useSupabaseGamification';
import { useDailyWorkout } from '@/hooks/useDailyWorkout';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import XPProgressBar from '@/components/XPProgressBar';

import { useChallenges } from '@/hooks/useChallenges';

// Define weekly workout split
const WEEKLY_SPLIT = {
  0: ['chest', 'triceps'], // Sunday
  1: ['back', 'biceps'], // Monday
  2: ['legs', 'glutes'], // Tuesday
  3: ['shoulders', 'abs'], // Wednesday
  4: ['chest', 'triceps'], // Thursday
  5: ['back', 'biceps'], // Friday
  6: ['legs', 'glutes'], // Saturday
};

// Muscle group names mapping
const MUSCLE_NAMES = {
  chest: 'Chest',
  back: 'Back',
  biceps: 'Biceps',
  triceps: 'Triceps',
  shoulders: 'Shoulders',
  legs: 'Legs',
  glutes: 'Glutes',
  abs: 'Abs',
};

export default function HomeScreen() {
  const router = useRouter();
  const { profile, loadProfile, user } = useAuth();
  const { completeWorkout } = useSupabaseGamification();
  const {
    dailyWorkout,
    selectedMuscleNames,
    isGeneratingDaily,
    loading: dailyLoading,
    regenerateDailyWorkout,
  } = useDailyWorkout();
  const { challenges, publicChallenges, loadChallenges, loadPublicChallenges } =
    useChallenges();
  const [showMoodTracker, setShowMoodTracker] = useState(false);

  // Get current level progress using the new system
  const levelProgress = profile?.total_xp
    ? getLevelProgress(profile.total_xp)
    : { currentXP: 0, maxXP: 100, level: 1 };

  // Refresh profile data when screen comes into focus (after workouts)
  useFocusEffect(
    useCallback(() => {
      const refreshProfile = async () => {
        if (user && loadProfile) {
          await loadProfile(user.id);
        }
      };
      refreshProfile();
    }, [user, loadProfile])
  );

  // Load challenges data
  useEffect(() => {
    if (user) {
      loadChallenges();
      loadPublicChallenges();
    }
  }, [user]);

  // Get today's split based on day of week
  const getTodaysSplit = () => {
    const today = new Date().getDay();
    const todaysMuscles = WEEKLY_SPLIT[today as keyof typeof WEEKLY_SPLIT];
    return todaysMuscles.map(
      (muscle) => MUSCLE_NAMES[muscle as keyof typeof MUSCLE_NAMES]
    );
  };

  const todaysSplit = getTodaysSplit();

  // Removed handleStartWorkout function as it's no longer needed

  const startDailyWorkout = () => {
    if (dailyWorkout) {
      router.push({
        pathname: '/workout/active',
        params: {
          workoutData: JSON.stringify(dailyWorkout),
        },
      });
    }
  };

  const renderLightningBolts = (count: number) => {
    return (
      <View style={styles.difficultyContainer}>
        {[...Array(count)].map((_, index) => (
          <Zap key={index} size={16} color="#F59E0B" fill="#F59E0B" />
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <View style={styles.logoContainer}>
                <Zap size={24} color="#6B46C1" />
                <Text style={styles.logoText}>BoltLab</Text>
              </View>
              <Text style={styles.levelText}>
                Level {profile?.level || 1} Warrior
              </Text>
            </View>
            <View style={styles.pointsContainer}>
              <Text style={styles.pointsValue}>
                {(profile?.total_xp || 0).toLocaleString()}
              </Text>
              <Text style={styles.pointsLabel}>XP</Text>
            </View>
          </View>
        </View>

        {/* Goals and Streak Section */}
        <View style={styles.statsSection}>
          <SwipeCard
            style={styles.splitCard}
            rightAction={{
              icon: <ArrowRight size={20} color="#10B981" />,
              label: 'Start Workout',
              color: '#10B981',
            }}
            onSwipeRight={() => router.push('/workout/custom')}
          >
            <BoltCard variant="glass">
              <View style={styles.goalCardContent}>
                <Text style={styles.goalTitle}>Today's Split</Text>
                <View style={styles.splitContainer}>
                  <View style={styles.splitContent}>
                    {todaysSplit.map((muscle, index) => (
                      <Text key={muscle} style={styles.splitText}>
                        {muscle}
                        {index < todaysSplit.length - 1 && (
                          <Text style={styles.splitSeparator}> & </Text>
                        )}
                      </Text>
                    ))}
                  </View>
                </View>
                <Text style={styles.swipeHint}>Swipe right to start →</Text>
              </View>
            </BoltCard>
          </SwipeCard>

          <SwipeCard
            style={styles.streakCard}
            rightAction={{
              icon: <Trophy size={20} color="#F59E0B" />,
              label: 'View Achievements',
              color: '#F59E0B',
            }}
            onSwipeRight={() => router.push('/settings/profile')}
          >
            <BoltCard variant="glass">
              <View style={styles.streakCardContent}>
                <Text style={styles.streakTitle}>Streak</Text>
                <View style={styles.streakContent}>
                  <Flame size={24} color="#F59E0B" />
                  <Text style={styles.streakValue}>
                    {profile?.current_streak || 0} days
                  </Text>
                </View>
                <Text style={styles.swipeHint}>Swipe for achievements →</Text>
              </View>
            </BoltCard>
          </SwipeCard>
        </View>

        {/* Daily Workout Section */}
        <View style={styles.dailyWorkoutSection}>
          <View style={styles.dailyWorkoutHeader}>
            <View style={styles.dailyWorkoutTitleContainer}>
              <Calendar size={20} color="#6B46C1" />
              <Text style={styles.dailyWorkoutTitle}>
                Today's Lightning Workout
              </Text>
            </View>
          </View>

          {dailyLoading || isGeneratingDaily ? (
            <BoltCard variant="glass" style={styles.loadingCard}>
              <View style={styles.dailyWorkoutLoading}>
                <ActivityIndicator size="large" color="#6B46C1" />
                <Text style={styles.loadingText}>
                  {isGeneratingDaily
                    ? 'Generating your workout...'
                    : 'Loading...'}
                </Text>
                <Text style={styles.loadingSubtext}>
                  Selecting optimal muscles based on your recovery
                </Text>
              </View>
            </BoltCard>
          ) : dailyWorkout ? (
            <SwipeCard
              rightAction={{
                icon: <Play size={20} color="#10B981" />,
                label: 'Start Workout',
                color: '#10B981',
              }}
              leftAction={{
                icon: <RefreshCw size={20} color="#F59E0B" />,
                label: 'Regenerate',
                color: '#F59E0B',
              }}
              onSwipeRight={startDailyWorkout}
              onSwipeLeft={regenerateDailyWorkout}
            >
              <BoltCard variant="glass">
                <View style={styles.dailyWorkoutContent}>
                  <View style={styles.dailyWorkoutInfo}>
                    <Text style={styles.workoutName}>Today's AI Workout</Text>
                    <View style={styles.workoutDetails}>
                      <View style={styles.workoutDetailItem}>
                        <Target size={14} color="#94A3B8" />
                        <Text style={styles.workoutDetailText}>
                          {selectedMuscleNames.join(', ')}
                        </Text>
                      </View>
                      <View style={styles.workoutDetailItem}>
                        <Clock size={14} color="#94A3B8" />
                        <Text style={styles.workoutDetailText}>
                          {dailyWorkout.estimatedDuration} min
                        </Text>
                      </View>
                      <View style={styles.workoutDetailItem}>
                        <Sparkles size={14} color="#94A3B8" />
                        <Text style={styles.workoutDetailText}>
                          {dailyWorkout.exercises?.length || 0} exercises
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.swipeInstructions}>
                    <Text style={styles.swipeHint}>← Regenerate • Start →</Text>
                  </View>
                </View>
              </BoltCard>
            </SwipeCard>
          ) : (
            <BoltCard variant="glass" style={styles.errorCard}>
              <View style={styles.dailyWorkoutError}>
                <Text style={styles.errorText}>Unable to generate workout</Text>
                <LightningButton
                  variant="secondary"
                  size="medium"
                  onPress={regenerateDailyWorkout}
                >
                  Try Again
                </LightningButton>
              </View>
            </BoltCard>
          )}
        </View>

        {/* Lightning HIIT Workout Card */}
        <View style={styles.workoutCard}>
          <LinearGradient
            colors={['#6B46C1', '#8B5CF6']}
            style={styles.workoutGradient}
          >
            <View style={styles.workoutHeader}>
              <View style={styles.workoutTitleContainer}>
                <Text style={styles.workoutTitle}>Today's</Text>
                <Text style={styles.workoutTitle}>Workout</Text>
              </View>
              <View style={styles.workoutDuration}>
                <Text style={styles.durationText}>
                  {dailyWorkout?.estimatedDuration || 35}
                </Text>
                <Text style={styles.durationUnit}>min</Text>
              </View>
            </View>

            <Text style={styles.workoutDescription}>
              {dailyWorkout
                ? `${selectedMuscleNames.join(', ')} • ${
                    dailyWorkout.exercises?.length || 0
                  } exercises`
                : 'AI-powered personalized workout'}
            </Text>

            <View style={styles.workoutFooter}>
              <View style={styles.difficultySection}>
                <Text style={styles.difficultyLabel}>Difficulty:</Text>
                {renderLightningBolts(
                  dailyWorkout?.difficultyLevel === 'beginner'
                    ? 1
                    : dailyWorkout?.difficultyLevel === 'intermediate'
                    ? 2
                    : 3
                )}
              </View>
              <LightningButton
                variant="primary"
                size="large"
                fullWidth
                loading={dailyLoading}
                disabled={!dailyWorkout}
                onPress={startDailyWorkout}
              >
                Start Workout
              </LightningButton>
            </View>
          </LinearGradient>
        </View>

        {/* Mood Check-in - Epic 5 Feature */}
        <View style={styles.moodSection}>
          <SwipeCard
            style={styles.moodCard}
            rightAction={{
              icon: <ArrowRight size={20} color="#A855F7" />,
              label: 'Check-in',
              color: '#A855F7',
            }}
            onSwipeRight={() => setShowMoodTracker(true)}
          >
            <BoltCard variant="glass" onPress={() => setShowMoodTracker(true)}>
              <View style={styles.moodCardContent}>
                <View style={styles.moodHeader}>
                  <Text style={styles.moodEmoji}>🌟</Text>
                  <View>
                    <Text style={styles.moodTitle}>Daily Mood Check-in</Text>
                    <Text style={styles.moodSubtitle}>
                      How are you feeling today?
                    </Text>
                  </View>
                </View>
                <View style={styles.moodButtonContainer}>
                  <LightningButton
                    variant="primary"
                    size="small"
                    onPress={() => setShowMoodTracker(true)}
                  >
                    Check In
                  </LightningButton>
                  <Text style={styles.swipeHint}>
                    or swipe to track wellness →
                  </Text>
                </View>
              </View>
            </BoltCard>
          </SwipeCard>
        </View>

        {/* Quick Challenges Preview - Epic 2 Feature */}
        {(challenges.length > 0 || publicChallenges.length > 0) && (
          <View style={styles.challengesPreview}>
            <View style={styles.challengesHeader}>
              <Text style={styles.challengesTitle}>Active Challenges</Text>
              <LightningButton
                variant="ghost"
                size="small"
                onPress={() => router.push('/challenges')}
              >
                View All
              </LightningButton>
            </View>

            {challenges.length > 0 ? (
              <View style={styles.challengePreviewCard}>
                <Text style={styles.challengePreviewTitle}>
                  {challenges[0].title}
                </Text>
                <Text style={styles.challengePreviewProgress}>
                  {challenges[0].user_participation?.progress || 0} /{' '}
                  {challenges[0].target_value}
                  {challenges[0].challenge_type === 'streak'
                    ? ' days'
                    : challenges[0].challenge_type === 'workout_count'
                    ? ' workouts'
                    : ''}
                </Text>
                <View style={styles.challengeProgressBar}>
                  <View
                    style={[
                      styles.challengeProgressFill,
                      {
                        width: `${Math.min(
                          100,
                          ((challenges[0].user_participation?.progress || 0) /
                            challenges[0].target_value) *
                            100
                        )}%`,
                      },
                    ]}
                  />
                </View>
              </View>
            ) : (
              <View style={styles.challengePreviewCard}>
                <Text style={styles.challengePreviewTitle}>
                  Join a Challenge!
                </Text>
                <Text style={styles.challengePreviewSubtitle}>
                  {publicChallenges.length} public challenges available
                </Text>
                <LightningButton
                  variant="secondary"
                  size="medium"
                  fullWidth
                  onPress={() => router.push('/challenges')}
                >
                  Browse Challenges
                </LightningButton>
              </View>
            )}
          </View>
        )}

        {/* Bottom padding for tab bar */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Emoji Mood Tracker Modal */}
      {showMoodTracker && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <TouchableOpacity
              style={styles.modalClose}
              onPress={() => setShowMoodTracker(false)}
            >
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
            <EmojiMoodTracker
              onSave={(data) => {
                console.log('Mood data saved:', data);
                setShowMoodTracker(false);
              }}
            />
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F23',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 30,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  logoText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  levelText: {
    fontSize: 16,
    color: '#94A3B8',
    fontWeight: '400',
  },
  pointsContainer: {
    alignItems: 'flex-end',
  },
  pointsValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#F59E0B',
    marginBottom: 2,
  },
  pointsLabel: {
    fontSize: 14,
    color: '#94A3B8',
  },
  statsSection: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 30,
    gap: 16,
  },
  splitCard: {
    flex: 1,
    marginRight: 8,
  },
  goalCardContent: {
    padding: 16,
  },
  goalTitle: {
    fontSize: 16,
    color: '#94A3B8',
    marginBottom: 16,
    fontWeight: '500',
  },
  splitContainer: {
    alignItems: 'center',
  },
  splitContent: {
    alignItems: 'center',
  },
  splitText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
  },
  splitSeparator: {
    color: '#94A3B8',
    fontWeight: '400',
  },
  streakCard: {
    flex: 1,
    marginLeft: 8,
  },
  streakCardContent: {
    padding: 16,
  },
  streakTitle: {
    fontSize: 16,
    color: '#94A3B8',
    marginBottom: 16,
    fontWeight: '500',
  },
  streakContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  streakValue: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '700',
    marginLeft: 8,
  },
  workoutCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 24,
    overflow: 'hidden',
  },
  workoutGradient: {
    padding: 24,
    borderWidth: 1,
    borderColor: '#2D2D44',
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  workoutTitleContainer: {
    flex: 1,
  },
  workoutTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 36,
  },
  workoutDuration: {
    alignItems: 'center',
  },
  durationText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#F59E0B',
    lineHeight: 36,
  },
  durationUnit: {
    fontSize: 14,
    color: '#F59E0B',
    fontWeight: '500',
  },
  workoutDescription: {
    fontSize: 16,
    color: '#E2E8F0',
    marginBottom: 24,
  },
  workoutFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  difficultySection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  difficultyLabel: {
    fontSize: 14,
    color: '#94A3B8',
    marginRight: 8,
  },
  difficultyContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  startButton: {
    backgroundColor: '#6B46C1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // Daily Workout Styles
  dailyWorkoutSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  dailyWorkoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dailyWorkoutTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dailyWorkoutTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  regenerateButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1A1A2E',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#6B46C1',
  },
  dailyWorkoutCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  dailyWorkoutGradient: {
    padding: 20,
    borderWidth: 1,
    borderColor: '#1A1A2E',
  },
  dailyWorkoutLoading: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 12,
    marginBottom: 4,
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
  },
  dailyWorkoutContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dailyWorkoutInfo: {
    flex: 1,
    paddingRight: 16,
  },
  workoutName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  workoutDetails: {
    gap: 4,
  },
  workoutDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  workoutDetailText: {
    fontSize: 12,
    color: '#94A3B8',
    flex: 1,
  },
  startWorkoutButton: {
    borderRadius: 12,
  },
  startWorkoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  startWorkoutText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  dailyWorkoutError: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  errorText: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 12,
  },
  retryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#6B46C1',
  },
  retryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  // Challenge preview styles
  challengesPreview: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  challengesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  challengesTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  viewAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#A855F7',
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  challengePreviewCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333333',
  },
  challengePreviewTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  challengePreviewProgress: {
    fontSize: 14,
    color: '#A855F7',
    marginBottom: 8,
  },
  challengePreviewSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 12,
  },
  challengeProgressBar: {
    height: 6,
    backgroundColor: '#374151',
    borderRadius: 3,
    overflow: 'hidden',
  },
  challengeProgressFill: {
    height: '100%',
    backgroundColor: '#A855F7',
    borderRadius: 3,
  },
  joinChallengeButton: {
    backgroundColor: '#A855F7',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  joinChallengeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  swipeHint: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  swipeInstructions: {
    marginTop: 12,
    alignItems: 'center',
  },
  loadingCard: {
    padding: 20,
  },
  errorCard: {
    padding: 20,
  },
  moodSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  moodCard: {
    marginBottom: 8,
  },
  moodCardContent: {
    padding: 16,
  },
  moodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  moodEmoji: {
    fontSize: 32,
    marginRight: 16,
  },
  moodTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  moodSubtitle: {
    fontSize: 14,
    color: '#94A3B8',
  },
  moodButtonContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContainer: {
    width: '95%',
    maxWidth: 400,
    backgroundColor: '#0F0F23',
    borderRadius: 20,
    position: 'relative',
    maxHeight: '90%',
  },
  modalClose: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1001,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
