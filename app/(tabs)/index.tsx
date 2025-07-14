import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Zap,
  Calendar,
  Target,
  Trophy,
  Activity,
  ChevronRight,
  Star,
  Flame,
} from 'lucide-react-native';
import LightningAvatar from '@/components/LightningAvatar';
import XPProgressBar from '@/components/XPProgressBar';
import AchievementCard from '@/components/AchievementCard';
import LevelUpCelebration from '@/components/LevelUpCelebration';
import { useAuth } from '@/hooks/useAuth';
import {
  useSupabaseGamification,
  getLevelProgress,
} from '@/hooks/useSupabaseGamification';
import { useSupabaseWorkouts } from '@/hooks/useSupabaseWorkouts';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

export default function HomeScreen() {
  const router = useRouter();
  const { profile, loadOnboardingData, loadProfile, user } = useAuth();
  const [isLevelingUpState, setIsLevelingUpState] = useState(false);
  const [onboardingData, setOnboardingData] = useState<any>(null);
  const [isQuickWorkoutLoading, setIsQuickWorkoutLoading] = useState(false);
  const { completeWorkout, getUnlockedAchievements } =
    useSupabaseGamification();
  const { getWorkoutStats } = useSupabaseWorkouts();

  // Get current level progress using the new system
  const levelProgress = profile?.total_xp
    ? getLevelProgress(profile.total_xp)
    : { currentXP: 0, maxXP: 100, level: 1 };

  // Load onboarding data for personalization
  useEffect(() => {
    const loadUserPreferences = async () => {
      const { data } = await loadOnboardingData();
      if (data) {
        setOnboardingData(data);
      }
    };
    loadUserPreferences();
  }, []);

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

  // Helper function to format fitness goals
  const formatFitnessGoals = (goals: string[]) => {
    const goalLabels: { [key: string]: string } = {
      'weight-loss': 'weight loss',
      'muscle-gain': 'muscle gain',
      endurance: 'endurance',
      strength: 'strength',
    };

    return goals.map((goal) => goalLabels[goal] || goal).join(' and ');
  };

  const workoutStats = getWorkoutStats();
  const unlockedAchievements = getUnlockedAchievements();

  const handleQuickWorkout = async () => {
    if (isQuickWorkoutLoading) return; // Prevent multiple taps

    setIsQuickWorkoutLoading(true);
    try {
      console.log('Starting quick workout simulation...');

      // Simulate completing a quick workout with realistic data
      const workoutDuration = 15; // 15 minutes
      const totalSets = 6; // 3 exercises x 2 sets each
      const exerciseIds = ['push-ups', 'squats', 'burpees']; // Simulated exercise IDs

      // Save the workout to database and award XP
      const result = await completeWorkout(
        exerciseIds,
        workoutDuration,
        totalSets
      );

      console.log('Quick workout completed:', result);

      // Refresh profile to show updated XP
      if (user && loadProfile) {
        await loadProfile(user.id);
      }

      // Show level up celebration if user leveled up
      if (result.leveledUp) {
        setIsLevelingUpState(true);
      }
    } catch (error) {
      console.error('Error completing quick workout:', error);
    } finally {
      setIsQuickWorkoutLoading(false);
    }
  };

  const recentAchievements = unlockedAchievements.slice(0, 3);

  const quickActions = [
    {
      title: isQuickWorkoutLoading
        ? 'Starting Workout...'
        : 'Start Quick Workout',
      subtitle: '15 min HIIT',
      icon: Zap,
      action: handleQuickWorkout,
    },
    {
      title: 'Track Progress',
      subtitle: 'Log your stats',
      icon: Target,
      action: () => router.push('/(tabs)/progress'),
    },
    {
      title: 'View Achievements',
      subtitle: 'See your wins',
      icon: Trophy,
      action: () => router.push('/(tabs)/profile'),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <LightningAvatar
                level="bolt"
                xp={levelProgress.currentXP}
                maxXp={levelProgress.maxXP}
                color="purple"
                size="medium"
                showStats={false}
              />
              <View style={styles.logoContainer}>
                <Text style={styles.logoText}>BoltLab</Text>
                <Text style={styles.levelText}>
                  Level {profile?.level || 1}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.profileButton}
              onPress={() => router.push('/(tabs)/profile')}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>J</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>
            Welcome back, {profile?.username || 'Lightning Warrior'}!
          </Text>
          <Text style={styles.welcomeSubtitle}>
            {onboardingData?.fitness_goals?.length > 0
              ? `Ready to work on ${formatFitnessGoals(
                  onboardingData.fitness_goals
                )}?`
              : 'Ready to charge up your fitness journey?'}
          </Text>

          {/* XP Progress */}
          <View style={styles.progressContainer}>
            <LinearGradient
              colors={['#1A1A2E', '#0F0F23']}
              style={styles.progressGradient}
            >
              <XPProgressBar
                currentXP={levelProgress.currentXP}
                maxXP={levelProgress.maxXP}
                level={levelProgress.level}
                size="large"
                animated={true}
              />
            </LinearGradient>
          </View>
        </View>

        {/* Stats and Streak */}
        <View style={styles.statsGrid}>
          {/* Streak Card - Now consistent with other stat cards */}
          <TouchableOpacity
            style={styles.statCard}
            onPress={() => router.push('/(tabs)/progress')}
          >
            <LinearGradient
              colors={['#1A1A2E', '#0F0F23']}
              style={styles.statCardGradient}
            >
              <View
                style={[styles.statIcon, { backgroundColor: '#F59E0B' + '20' }]}
              >
                <Flame size={20} color="#F59E0B" />
              </View>
              <Text style={styles.statValue}>
                {profile?.current_streak || 0}
              </Text>
              <Text style={styles.statLabel}>Day Streak</Text>
              <View style={styles.statExtra}>
                {profile?.longest_streak &&
                  profile.longest_streak > (profile?.current_streak || 0) && (
                    <Text style={styles.bestStreak}>
                      Best: {profile.longest_streak}
                    </Text>
                  )}
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Stats Cards */}
          <TouchableOpacity
            style={styles.statCard}
            onPress={() => router.push('/(tabs)/workouts')}
          >
            <LinearGradient
              colors={['#1A1A2E', '#0F0F23']}
              style={styles.statCardGradient}
            >
              <View
                style={[styles.statIcon, { backgroundColor: '#6B46C1' + '20' }]}
              >
                <Activity size={20} color="#6B46C1" />
              </View>
              <Text style={styles.statValue}>{workoutStats.totalWorkouts}</Text>
              <Text style={styles.statLabel}>Workouts</Text>
              <View style={styles.statExtra} />
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.statCard}
            onPress={() => router.push('/(tabs)/profile')}
          >
            <LinearGradient
              colors={['#1A1A2E', '#0F0F23']}
              style={styles.statCardGradient}
            >
              <View
                style={[styles.statIcon, { backgroundColor: '#F59E0B' + '20' }]}
              >
                <Trophy size={20} color="#F59E0B" />
              </View>
              <Text style={styles.statValue}>
                {unlockedAchievements.length}
              </Text>
              <Text style={styles.statLabel}>Achievements</Text>
              <View style={styles.statExtra} />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Recent Achievements */}
        {recentAchievements.length > 0 && (
          <View style={styles.achievementsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Achievements</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/profile')}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
              <Text style={styles.levelText}>Level {profile?.level || 1}</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.achievementsScroll}
            >
              {recentAchievements.map((achievement) => (
                <AchievementCard
                  key={achievement.id}
                  achievement={achievement}
                  size="small"
                  showProgress={false}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          {quickActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={styles.actionCard}
              onPress={action.action}
            >
              <LinearGradient
                colors={['#1A1A2E', '#0F0F23']}
                style={styles.actionCardGradient}
              >
                <View style={styles.actionLeft}>
                  <View style={styles.actionIcon}>
                    <action.icon size={20} color="#6B46C1" />
                  </View>
                  <View style={styles.actionText}>
                    <Text style={styles.actionTitle}>{action.title}</Text>
                    <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
                  </View>
                </View>
                <ChevronRight size={20} color="#64748B" />
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        {/* Today's Challenge */}
        <View style={styles.challengeSection}>
          <Text style={styles.sectionTitle}>Today's Challenge</Text>
          <TouchableOpacity
            style={styles.challengeCard}
            onPress={handleQuickWorkout}
          >
            <LinearGradient
              colors={['#6B46C1', '#8B5CF6']}
              style={styles.challengeGradient}
            >
              <View style={styles.challengeContent}>
                <Zap size={24} color="#FFFFFF" />
                <Text style={styles.challengeTitle}>Lightning Round</Text>
                <Text style={styles.challengeSubtitle}>
                  Complete 3 exercises in 10 minutes
                </Text>
                <View style={styles.challengeProgress}>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: '60%' }]} />
                  </View>
                  <Text style={styles.progressText}>60% Complete</Text>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Level Up Celebration */}
        <LevelUpCelebration
          visible={isLevelingUpState}
          newLevel={profile?.level || 1}
          onComplete={() => setIsLevelingUpState(false)}
        />
      </ScrollView>
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
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoContainer: {
    marginLeft: 12,
  },
  logoText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  levelText: {
    fontSize: 14,
    color: '#6B46C1',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  profileButton: {
    padding: 4,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6B46C1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  welcomeSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#94A3B8',
    marginBottom: 20,
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressGradient: {
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#1A1A2E',
    width: '100%',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    marginBottom: 30,
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    marginBottom: 16,
  },
  statCardGradient: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1A1A2E',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#94A3B8',
  },
  statExtra: {
    height: 20,
    marginTop: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bestStreak: {
    fontSize: 12,
    color: '#94A3B8',
  },
  achievementsSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: 14,
    color: '#6B46C1',
    fontWeight: '600',
  },
  achievementsScroll: {
    paddingVertical: 8,
  },
  quickActionsSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  actionCard: {
    marginBottom: 12,
  },
  actionCardGradient: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1A1A2E',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6B46C1' + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionText: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 14,
    color: '#94A3B8',
  },
  challengeSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  challengeCard: {
    marginBottom: 16,
  },
  challengeGradient: {
    borderRadius: 20,
    padding: 24,
  },
  challengeContent: {
    alignItems: 'center',
  },
  challengeTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 12,
    marginBottom: 8,
  },
  challengeSubtitle: {
    fontSize: 16,
    color: '#E2E8F0',
    textAlign: 'center',
    marginBottom: 20,
  },
  challengeProgress: {
    width: '100%',
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#FFFFFF' + '20',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#E2E8F0',
    fontWeight: '600',
  },
});
