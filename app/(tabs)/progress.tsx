import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  TrendingUp,
  Target,
  Zap,
  Calendar,
  Award,
  Activity,
  ChartBar as BarChart3,
  Trophy,
  Flame,
  Star,
} from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { useSupabaseWorkouts } from '@/hooks/useSupabaseWorkouts';
import { getLevelProgress } from '@/hooks/useSupabaseGamification';
import XPProgressBar from '@/components/XPProgressBar';

export default function ProgressScreen() {
  const { profile } = useAuth();
  const { getWorkoutStats, getRecentWorkouts, personalRecords } =
    useSupabaseWorkouts();

  const workoutStats = getWorkoutStats();
  const recentWorkouts = getRecentWorkouts(7);

  // Get current level progress using the new system
  const levelProgress = profile?.total_xp
    ? getLevelProgress(profile.total_xp)
    : { currentXP: 0, maxXP: 100, level: 1 };

  // Mock data for charts (in real app, this would come from workout history)
  const weeklyData = [
    { day: 'Mon', workouts: 1, xp: 75 },
    { day: 'Tue', workouts: 0, xp: 0 },
    { day: 'Wed', workouts: 1, xp: 50 },
    { day: 'Thu', workouts: 2, xp: 125 },
    { day: 'Fri', workouts: 1, xp: 75 },
    { day: 'Sat', workouts: 0, xp: 0 },
    { day: 'Sun', workouts: 1, xp: 100 },
  ];

  // Get top 3 heaviest lifts
  const getTimeAgo = (date: string) => {
    const now = new Date();
    const prDate = new Date(date);
    const diffTime = Math.abs(now.getTime() - prDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 14) return '1 week ago';
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 60) return '1 month ago';
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} year${
      Math.floor(diffDays / 365) > 1 ? 's' : ''
    } ago`;
  };

  const topHeaviestLifts = personalRecords
    .filter((pr) => pr.weight && pr.weight > 0) // Only include records with weight
    .sort((a, b) => (b.weight || 0) - (a.weight || 0)) // Sort by weight (heaviest first)
    .slice(0, 3) // Take top 3
    .map((pr) => ({
    exercise: pr.exercise_name,
    weight: pr.weight || 0,
    date: pr.date,
      timeAgo: getTimeAgo(pr.date),
    isNew: new Date(pr.date).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000, // New if within last week
  }));

  const monthlyGoals = [
    { title: 'Weekly Workouts', current: 5, target: 7, unit: 'workouts' },
    {
      title: 'Monthly XP',
      current: profile?.total_xp || 0,
      target: 2000,
      unit: 'XP',
    },
    {
      title: 'Streak Goal',
      current: profile?.current_streak || 0,
      target: 30,
      unit: 'days',
    },
  ];

  const progressStats = [
    {
      label: 'Total Workouts',
      value: workoutStats.totalWorkouts.toString(),
      icon: Activity,
      color: '#6B46C1',
    },
    {
      label: 'Current Streak',
      value: `${profile?.current_streak || 0} days`,
      icon: Flame,
      color: '#F59E0B',
    },
    {
      label: 'Total XP',
      value: workoutStats.totalXP.toString(),
      icon: Zap,
      color: '#3B82F6',
    },
    { label: 'Achievements', value: '0', icon: Trophy, color: '#10B981' }, // Would need achievement count
  ];

  const renderWeeklyChart = () => {
    const maxWorkouts = Math.max(...weeklyData.map((d) => d.workouts));

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Weekly Activity</Text>
        <View style={styles.barChart}>
          {weeklyData.map((data, index) => (
            <View key={index} style={styles.barContainer}>
              <View style={styles.barWrapper}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: `${(data.workouts / (maxWorkouts || 1)) * 100}%`,
                      backgroundColor:
                        data.workouts > 0 ? '#6B46C1' : '#1A1A2E',
                    },
                  ]}
                />
              </View>
              <Text style={styles.barLabel}>{data.day}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderPersonalRecords = () => (
    <View style={styles.prSection}>
      <Text style={styles.sectionTitle}>Personal Records</Text>
      {topHeaviestLifts.length === 0 ? (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>No personal records yet</Text>
          <Text style={styles.noDataSubtext}>
            Complete workouts with weights to see your heaviest lifts!
          </Text>
        </View>
      ) : (
        topHeaviestLifts.map((pr, index) => (
        <View key={index} style={styles.prCard}>
          <LinearGradient
            colors={['#1A1A2E', '#0F0F23']}
            style={styles.prGradient}
          >
            <View style={styles.prContent}>
              <View style={styles.prLeft}>
                <Text style={styles.prExercise}>{pr.exercise}</Text>
                  <Text style={styles.prDate}>{pr.timeAgo}</Text>
              </View>
              <View style={styles.prRight}>
                <Text style={styles.prWeight}>{pr.weight} lbs</Text>
                {pr.isNew && (
                  <View style={styles.newPrBadge}>
                    <Zap size={12} color="#F59E0B" />
                    <Text style={styles.newPrText}>NEW</Text>
                  </View>
                )}
              </View>
            </View>
          </LinearGradient>
        </View>
        ))
      )}
    </View>
  );

  const renderMonthlyGoals = () => (
    <View style={styles.goalsSection}>
      <Text style={styles.sectionTitle}>Monthly Goals</Text>
      {monthlyGoals.map((goal, index) => (
        <View key={index} style={styles.goalCard}>
          <LinearGradient
            colors={['#1A1A2E', '#0F0F23']}
            style={styles.goalGradient}
          >
            <View style={styles.goalHeader}>
              <Text style={styles.goalTitle}>{goal.title}</Text>
              <Text style={styles.goalProgress}>
                {goal.current}/{goal.target} {goal.unit}
              </Text>
            </View>
            <View style={styles.goalProgressBar}>
              <View style={styles.goalProgressTrack}>
                <View
                  style={[
                    styles.goalProgressFill,
                    {
                      width: `${Math.min(
                        (goal.current / goal.target) * 100,
                        100
                      )}%`,
                    },
                  ]}
                />
              </View>
              <Text style={styles.goalPercentage}>
                {Math.round((goal.current / goal.target) * 100)}%
              </Text>
            </View>
          </LinearGradient>
        </View>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Progress</Text>
          <Text style={styles.headerSubtitle}>Track your fitness journey</Text>
        </View>

        {/* XP Progress */}
        <View style={styles.xpSection}>
          <View style={styles.xpCard}>
            <LinearGradient
              colors={['#1A1A2E', '#0F0F23']}
              style={styles.xpGradient}
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

        {/* Progress Stats */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Your Stats</Text>
          <View style={styles.statsGrid}>
            {progressStats.map((stat, index) => (
              <View key={index} style={styles.statCard}>
                <LinearGradient
                  colors={['#1A1A2E', '#0F0F23']}
                  style={styles.statGradient}
                >
                  <View
                    style={[
                      styles.statIcon,
                      { backgroundColor: stat.color + '20' },
                    ]}
                  >
                    <stat.icon size={20} color={stat.color} />
                  </View>
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </LinearGradient>
              </View>
            ))}
          </View>
        </View>

        {/* Weekly Chart */}
        <View style={styles.chartSection}>
          <View style={styles.chartCard}>
            <LinearGradient
              colors={['#1A1A2E', '#0F0F23']}
              style={styles.chartGradient}
            >
              {renderWeeklyChart()}
            </LinearGradient>
          </View>
        </View>

        {/* Personal Records */}
        {renderPersonalRecords()}

        {/* Monthly Goals */}
        {renderMonthlyGoals()}

        {/* Streak Section */}
        <View style={styles.streakSection}>
          <Text style={styles.sectionTitle}>Workout Streak</Text>
          <View style={styles.streakCard}>
            <LinearGradient
              colors={['#1A1A2E', '#0F0F23']}
              style={styles.streakGradient}
            >
              <View style={styles.streakIcon}>
                <Flame size={24} color="#F59E0B" />
              </View>
              <Text style={styles.streakValue}>
                {profile?.current_streak || 0}
              </Text>
              <Text style={styles.streakLabel}>Day Streak</Text>
              {profile?.longest_streak &&
                profile.longest_streak > (profile?.current_streak || 0) && (
                  <Text style={styles.bestStreak}>
                    Best: {profile.longest_streak}
                  </Text>
                )}
              <Text style={styles.streakDescription}>
                Keep your lightning charged with consistent workouts! Take one
                rest day without breaking your streak.
              </Text>
            </LinearGradient>
          </View>
        </View>
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
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#94A3B8',
  },
  xpSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  xpCard: {
    marginBottom: 16,
  },
  xpGradient: {
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#1A1A2E',
  },
  statsSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  statCard: {
    width: '48%',
    marginBottom: 12,
  },
  statGradient: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1A1A2E',
    alignItems: 'center',
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
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
  },
  chartSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  chartCard: {
    marginBottom: 16,
  },
  chartGradient: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1A1A2E',
  },
  chartContainer: {
    width: '100%',
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  barChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
    paddingHorizontal: 8,
  },
  barContainer: {
    flex: 1,
    alignItems: 'center',
  },
  barWrapper: {
    height: 80,
    width: 20,
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  bar: {
    width: '100%',
    borderRadius: 4,
    minHeight: 4,
  },
  barLabel: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },
  prSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  prCard: {
    marginBottom: 12,
  },
  prGradient: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1A1A2E',
  },
  prContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  prLeft: {
    flex: 1,
  },
  prExercise: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  prDate: {
    fontSize: 12,
    color: '#94A3B8',
  },
  prRight: {
    alignItems: 'flex-end',
  },
  prWeight: {
    fontSize: 18,
    fontWeight: '700',
    color: '#6B46C1',
    marginBottom: 8,
  },
  newPrBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F59E0B' + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  newPrText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F59E0B',
    marginLeft: 4,
  },
  goalsSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  goalCard: {
    marginBottom: 12,
  },
  goalGradient: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1A1A2E',
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  goalProgress: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B46C1',
  },
  goalProgressBar: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalProgressTrack: {
    flex: 1,
    height: 6,
    backgroundColor: '#1A1A2E',
    borderRadius: 3,
    overflow: 'hidden',
    marginRight: 12,
  },
  goalProgressFill: {
    height: '100%',
    backgroundColor: '#6B46C1',
    borderRadius: 3,
  },
  goalPercentage: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    minWidth: 35,
  },
  streakSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  streakCard: {
    marginBottom: 16,
  },
  streakGradient: {
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#1A1A2E',
    alignItems: 'center',
  },
  streakIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F59E0B' + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  streakValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  streakLabel: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 4,
  },
  bestStreak: {
    fontSize: 12,
    color: '#F59E0B',
    marginBottom: 16,
  },
  streakDescription: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 20,
  },
  noDataContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  noDataText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 8,
  },
  noDataSubtext: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
  },
});
