import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';

export interface LeaderboardEntry {
  user_id: string;
  username: string;
  avatar_color: string;
  rank: number;
  score: number;
  change_from_last_period?: number; // Rank change from previous period
  // Profile data
  level: number;
  total_xp: number;
  current_streak: number;
  longest_streak: number;
  // Extended metrics
  total_workouts?: number;
  badges_count?: number;
  consistency_percentage?: number;
}

export interface LeaderboardConfig {
  category:
    | 'streaks'
    | 'total_workouts'
    | 'xp_earned'
    | 'badges_collected'
    | 'consistency'
    | 'level';
  timeframe: 'weekly' | 'monthly' | 'all_time';
  limit: number;
  includeUserRank: boolean;
}

export interface UserRankInfo {
  current_rank: number;
  total_participants: number;
  nearby_users: LeaderboardEntry[];
  percentile: number;
}

export interface CompetitiveInsights {
  users_ahead: number;
  points_to_next_rank: number;
  strength_areas: string[];
  improvement_areas: string[];
  suggested_actions: string[];
}

export const LEADERBOARD_CATEGORIES = [
  {
    id: 'streaks',
    label: 'Current Streaks',
    icon: '🔥',
    description: 'Active workout streaks',
    field: 'current_streak',
  },
  {
    id: 'total_workouts',
    label: 'Total Workouts',
    icon: '💪',
    description: 'Lifetime workout count',
    field: 'total_workouts',
  },
  {
    id: 'xp_earned',
    label: 'Experience Points',
    icon: '⚡',
    description: 'Total XP earned',
    field: 'total_xp',
  },
  {
    id: 'badges_collected',
    label: 'Badge Collection',
    icon: '🏆',
    description: 'Achievement badges earned',
    field: 'badges_count',
  },
  {
    id: 'consistency',
    label: 'Consistency Rate',
    icon: '📈',
    description: 'Workout consistency percentage',
    field: 'consistency_percentage',
  },
  {
    id: 'level',
    label: 'User Level',
    icon: '🌟',
    description: 'Current user level',
    field: 'level',
  },
];

export const TIMEFRAME_OPTIONS = [
  { id: 'weekly', label: 'This Week', icon: '📅' },
  { id: 'monthly', label: 'This Month', icon: '🗓️' },
  { id: 'all_time', label: 'All Time', icon: '🏛️' },
];

export function useAdvancedLeaderboards() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<UserRankInfo | null>(null);
  const [competitiveInsights, setCompetitiveInsights] =
    useState<CompetitiveInsights | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load leaderboard data
  const loadLeaderboard = async (
    config: LeaderboardConfig
  ): Promise<LeaderboardEntry[]> => {
    setLoading(true);
    setError(null);

    try {
      // Build the query based on category and timeframe
      let query = supabase.from('profiles').select(`
          id,
          username,
          avatar_color,
          level,
          total_xp,
          current_streak,
          longest_streak
        `);

      // Apply timeframe filters for time-based metrics
      if (config.timeframe !== 'all_time') {
        const startDate = getTimeframeStartDate(config.timeframe);

        if (
          config.category === 'total_workouts' ||
          config.category === 'xp_earned'
        ) {
          // For time-based metrics, we need to aggregate from workouts table
          return await loadTimeBasedLeaderboard(config, startDate);
        }
      }

      // Order by the appropriate field
      const orderField = getOrderField(config.category);
      query = query.order(orderField, { ascending: false });

      if (config.limit > 0) {
        query = query.limit(config.limit);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error loading leaderboard:', error);
        setError('Failed to load leaderboard');
        return [];
      }

      // Process the data and add additional metrics
      const enrichedData = await enrichLeaderboardData(data || [], config);

      // Add rank numbers
      const rankedData = enrichedData.map((entry, index) => ({
        ...entry,
        rank: index + 1,
      }));

      setLeaderboard(rankedData);

      // Load user's rank if requested
      if (config.includeUserRank && user) {
        await loadUserRank(config, rankedData);
      }

      return rankedData;
    } catch (error) {
      console.error('Error loading leaderboard:', error);
      setError('Failed to load leaderboard');
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Load time-based leaderboard (workouts, XP in specific timeframe)
  const loadTimeBasedLeaderboard = async (
    config: LeaderboardConfig,
    startDate: Date
  ): Promise<LeaderboardEntry[]> => {
    try {
      let aggregateField: string;
      let selectClause: string;

      switch (config.category) {
        case 'total_workouts':
          selectClause = `
            user_id,
            count(*) as score,
            profiles!inner(username, avatar_color, level, total_xp, current_streak, longest_streak)
          `;
          break;
        case 'xp_earned':
          selectClause = `
            user_id,
            sum(xp_gained) as score,
            profiles!inner(username, avatar_color, level, total_xp, current_streak, longest_streak)
          `;
          break;
        default:
          throw new Error('Unsupported time-based category');
      }

      const { data, error } = await supabase
        .from('workouts')
        .select(selectClause)
        .gte('created_at', startDate.toISOString())
        .order('score', { ascending: false })
        .limit(config.limit);

      if (error) {
        console.error('Error loading time-based leaderboard:', error);
        return [];
      }

      return (data || []).map((item: any, index: number) => ({
        user_id: item.user_id,
        username: item.profiles.username,
        avatar_color: item.profiles.avatar_color,
        rank: index + 1,
        score: parseInt(item.score),
        level: item.profiles.level,
        total_xp: item.profiles.total_xp,
        current_streak: item.profiles.current_streak,
        longest_streak: item.profiles.longest_streak,
      }));
    } catch (error) {
      console.error('Error in time-based leaderboard:', error);
      return [];
    }
  };

  // Enrich leaderboard data with additional metrics
  const enrichLeaderboardData = async (
    baseData: any[],
    config: LeaderboardConfig
  ): Promise<LeaderboardEntry[]> => {
    const enrichedEntries: LeaderboardEntry[] = [];

    for (const profile of baseData) {
      // Get additional metrics for each user
      const [workoutCount, badgesCount, consistency] = await Promise.all([
        getUserWorkoutCount(profile.id),
        getUserBadgesCount(profile.id),
        getUserConsistency(profile.id),
      ]);

      const entry: LeaderboardEntry = {
        user_id: profile.id,
        username: profile.username || 'Anonymous',
        avatar_color: profile.avatar_color || 'purple',
        rank: 0, // Will be set later
        score: getScoreFromProfile(profile, config.category),
        level: profile.level,
        total_xp: profile.total_xp,
        current_streak: profile.current_streak,
        longest_streak: profile.longest_streak,
        total_workouts: workoutCount,
        badges_count: badgesCount,
        consistency_percentage: consistency,
      };

      enrichedEntries.push(entry);
    }

    // Sort by the appropriate score
    return enrichedEntries.sort((a, b) => b.score - a.score);
  };

  // Get user's specific rank and nearby competitors
  const loadUserRank = async (
    config: LeaderboardConfig,
    leaderboardData: LeaderboardEntry[]
  ) => {
    if (!user) return;

    try {
      // Find user in current leaderboard
      const userIndex = leaderboardData.findIndex(
        (entry) => entry.user_id === user.id
      );

      if (userIndex !== -1) {
        // User is in top results
        const userEntry = leaderboardData[userIndex];
        const nearby = getNearbyUsers(leaderboardData, userIndex, 3);

        setUserRank({
          current_rank: userEntry.rank,
          total_participants: await getTotalParticipants(config),
          nearby_users: nearby,
          percentile: calculatePercentile(
            userEntry.rank,
            leaderboardData.length
          ),
        });
      } else {
        // User not in top results, need to find their actual rank
        const actualRank = await getUserActualRank(config);
        const totalParticipants = await getTotalParticipants(config);

        setUserRank({
          current_rank: actualRank,
          total_participants: totalParticipants,
          nearby_users: [],
          percentile: calculatePercentile(actualRank, totalParticipants),
        });
      }

      // Load competitive insights
      await loadCompetitiveInsights(config);
    } catch (error) {
      console.error('Error loading user rank:', error);
    }
  };

  // Load competitive insights for the user
  const loadCompetitiveInsights = async (config: LeaderboardConfig) => {
    if (!user) return;

    try {
      // Get users directly ahead of current user
      const usersAhead = await getUsersAheadCount(config);
      const pointsToNext = await getPointsToNextRank(config);

      // Analyze user's strengths and improvement areas
      const userProfile = await getUserExtendedProfile();
      const insights = analyzeCompetitivePosition(userProfile, leaderboard);

      setCompetitiveInsights({
        users_ahead: usersAhead,
        points_to_next_rank: pointsToNext,
        strength_areas: insights.strengths,
        improvement_areas: insights.improvements,
        suggested_actions: insights.actions,
      });
    } catch (error) {
      console.error('Error loading competitive insights:', error);
    }
  };

  // Helper functions
  const getTimeframeStartDate = (timeframe: string): Date => {
    const now = new Date();
    switch (timeframe) {
      case 'weekly':
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        return startOfWeek;
      case 'monthly':
        return new Date(now.getFullYear(), now.getMonth(), 1);
      default:
        return new Date(0); // Beginning of time
    }
  };

  const getOrderField = (category: string): string => {
    switch (category) {
      case 'streaks':
        return 'current_streak';
      case 'xp_earned':
        return 'total_xp';
      case 'level':
        return 'level';
      default:
        return 'total_xp';
    }
  };

  const getScoreFromProfile = (profile: any, category: string): number => {
    switch (category) {
      case 'streaks':
        return profile.current_streak;
      case 'xp_earned':
        return profile.total_xp;
      case 'level':
        return profile.level;
      default:
        return 0;
    }
  };

  const getUserWorkoutCount = async (userId: string): Promise<number> => {
    const { count } = await supabase
      .from('workouts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);
    return count || 0;
  };

  const getUserBadgesCount = async (userId: string): Promise<number> => {
    const { count } = await supabase
      .from('user_achievements')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);
    return count || 0;
  };

  const getUserConsistency = async (userId: string): Promise<number> => {
    // Calculate consistency based on workouts vs expected workouts
    // This is a simplified calculation - in production you'd want more sophisticated logic
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { count } = await supabase
      .from('workouts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', thirtyDaysAgo.toISOString());

    // Assuming target of 4 workouts per week (about 17 in 30 days)
    const expectedWorkouts = 17;
    const actualWorkouts = count || 0;

    return Math.min(100, Math.round((actualWorkouts / expectedWorkouts) * 100));
  };

  const getTotalParticipants = async (
    config: LeaderboardConfig
  ): Promise<number> => {
    const { count } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });
    return count || 0;
  };

  const getUserActualRank = async (
    config: LeaderboardConfig
  ): Promise<number> => {
    if (!user) return 0;

    const orderField = getOrderField(config.category);
    const { data: userProfile } = await supabase
      .from('profiles')
      .select(orderField)
      .eq('id', user.id)
      .single();

    if (!userProfile) return 0;

    const userScore = userProfile[orderField];

    const { count } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gt(orderField, userScore);

    return (count || 0) + 1;
  };

  const getUsersAheadCount = async (
    config: LeaderboardConfig
  ): Promise<number> => {
    const actualRank = await getUserActualRank(config);
    return Math.max(0, actualRank - 1);
  };

  const getPointsToNextRank = async (
    config: LeaderboardConfig
  ): Promise<number> => {
    if (!user) return 0;

    const orderField = getOrderField(config.category);

    // Get user's current score
    const { data: userProfile } = await supabase
      .from('profiles')
      .select(orderField)
      .eq('id', user.id)
      .single();

    if (!userProfile) return 0;

    const userScore = userProfile[orderField];

    // Get the score of the user directly ahead
    const { data: nextUser } = await supabase
      .from('profiles')
      .select(orderField)
      .gt(orderField, userScore)
      .order(orderField, { ascending: true })
      .limit(1)
      .single();

    if (!nextUser) return 0;

    return nextUser[orderField] - userScore;
  };

  const getUserExtendedProfile = async () => {
    if (!user) return null;

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    return data;
  };

  const analyzeCompetitivePosition = (
    userProfile: any,
    competitors: LeaderboardEntry[]
  ) => {
    if (!userProfile) {
      return {
        strengths: ['Building foundation'],
        improvements: ['Consistency'],
        actions: ['Start with regular workouts'],
      };
    }

    const strengths: string[] = [];
    const improvements: string[] = [];
    const actions: string[] = [];

    // Analyze against top performers
    const topPerformers = competitors.slice(0, 10);
    const avgTopStreak =
      topPerformers.reduce((sum, p) => sum + p.current_streak, 0) /
      topPerformers.length;
    const avgTopXP =
      topPerformers.reduce((sum, p) => sum + p.total_xp, 0) /
      topPerformers.length;

    if (userProfile.current_streak >= avgTopStreak * 0.8) {
      strengths.push('Strong streak consistency');
    } else {
      improvements.push('Streak consistency');
      actions.push('Focus on maintaining daily activity');
    }

    if (userProfile.total_xp >= avgTopXP * 0.8) {
      strengths.push('High experience points');
    } else {
      improvements.push('Experience points');
      actions.push('Complete more challenging workouts');
    }

    return { strengths, improvements, actions };
  };

  const getNearbyUsers = (
    data: LeaderboardEntry[],
    userIndex: number,
    range: number
  ): LeaderboardEntry[] => {
    const start = Math.max(0, userIndex - range);
    const end = Math.min(data.length, userIndex + range + 1);
    return data.slice(start, end);
  };

  const calculatePercentile = (rank: number, total: number): number => {
    return Math.round(((total - rank + 1) / total) * 100);
  };

  return {
    // State
    loading,
    error,
    leaderboard,
    userRank,
    competitiveInsights,

    // Actions
    loadLeaderboard,
    loadUserRank,
    loadCompetitiveInsights,

    // Constants
    LEADERBOARD_CATEGORIES,
    TIMEFRAME_OPTIONS,

    // Utilities
    setError: (error: string | null) => setError(error),
    clearError: () => setError(null),
  };
}
