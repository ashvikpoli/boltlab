import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';
import { useSupabaseGamification } from './useSupabaseGamification';
import { geminiService } from '@/lib/gemini';

export interface RestDayActivity {
  id: string;
  activity_name: string;
  category: 'yoga' | 'stretching' | 'mobility' | 'meditation' | 'breathing';
  duration_minutes: number;
  difficulty_level: 'gentle' | 'moderate' | 'intensive';
  description: string;
  instructions: string[];
  video_url?: string;
  muscle_groups_targeted: string[];
  equipment_needed: string[];
  is_premium: boolean;
  created_at: string;
}

export interface RecoverySession {
  id: string;
  user_id: string;
  activity_id: string;
  date: string;
  duration_completed: number;
  completion_percentage: number;
  maintains_streak: boolean;
  mood_before?: string;
  mood_after?: string;
  notes?: string;
  created_at: string;
  // Joined data
  activity?: RestDayActivity;
}

export interface RestDayPlan {
  recommended_activities: RestDayActivity[];
  rationale: string;
  estimated_duration: number;
  benefits: string[];
  tips: string[];
}

export const RECOVERY_CATEGORIES = [
  {
    id: 'yoga',
    label: 'Yoga',
    icon: '🧘',
    description: 'Gentle yoga flows and poses',
  },
  {
    id: 'stretching',
    label: 'Stretching',
    icon: '🤸',
    description: 'Static and dynamic stretches',
  },
  {
    id: 'mobility',
    label: 'Mobility',
    icon: '🔄',
    description: 'Joint mobility and movement patterns',
  },
  {
    id: 'meditation',
    label: 'Meditation',
    icon: '🕯️',
    description: 'Mindfulness and breathing exercises',
  },
  {
    id: 'breathing',
    label: 'Breathing',
    icon: '💨',
    description: 'Breathwork and relaxation techniques',
  },
];

export const DIFFICULTY_LEVELS = [
  {
    id: 'gentle',
    label: 'Gentle',
    color: '#10B981',
    description: 'Light, restorative activities',
  },
  {
    id: 'moderate',
    label: 'Moderate',
    color: '#F59E0B',
    description: 'Balanced recovery work',
  },
  {
    id: 'intensive',
    label: 'Intensive',
    color: '#EF4444',
    description: 'More active recovery',
  },
];

export function useRestDayActivities() {
  const { user, profile } = useAuth();
  const { updateStreak, addXP } = useSupabaseGamification();
  const [loading, setLoading] = useState(false);
  const [activities, setActivities] = useState<RestDayActivity[]>([]);
  const [todaySession, setTodaySession] = useState<RecoverySession | null>(
    null
  );
  const [sessionHistory, setSessionHistory] = useState<RecoverySession[]>([]);
  const [aiPlan, setAiPlan] = useState<RestDayPlan | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadActivities();
    if (user) {
      loadTodaySession();
      loadSessionHistory();
    }
  }, [user]);

  // Load available rest day activities
  const loadActivities = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('rest_day_activities')
        .select('*')
        .order('category')
        .order('duration_minutes');

      if (error) {
        console.error('Error loading activities:', error);
        setError('Failed to load activities');
      } else {
        setActivities(data || []);
      }
    } catch (error) {
      console.error('Error loading activities:', error);
      setError('Failed to load activities');
    } finally {
      setLoading(false);
    }
  };

  // Load today's recovery session
  const loadTodaySession = async () => {
    if (!user) return;

    try {
      const today = new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('recovery_sessions')
        .select(
          `
          *,
          activity:rest_day_activities(*)
        `
        )
        .eq('user_id', user.id)
        .eq('date', today)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows found
        console.error('Error loading today session:', error);
      } else {
        setTodaySession(data);
      }
    } catch (error) {
      console.error('Error loading today session:', error);
    }
  };

  // Load recovery session history
  const loadSessionHistory = async (days: number = 30) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('recovery_sessions')
        .select(
          `
          *,
          activity:rest_day_activities(*)
        `
        )
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(days);

      if (error) {
        console.error('Error loading session history:', error);
      } else {
        setSessionHistory(data || []);
      }
    } catch (error) {
      console.error('Error loading session history:', error);
    }
  };

  // Generate AI-powered rest day plan
  const generateRestDayPlan = async (
    targetAreas?: string[],
    duration: number = 15,
    intensity: 'gentle' | 'moderate' | 'active' = 'gentle'
  ): Promise<RestDayPlan | null> => {
    setLoading(true);
    try {
      // Use Gemini to generate a personalized recovery plan
      const aiWorkout = await geminiService.generateRecoveryPlan(
        intensity,
        duration,
        targetAreas
      );

      // Map AI exercises to our rest day activities
      const recommendedActivities: RestDayActivity[] = aiWorkout.exercises.map(
        (exercise, index) => ({
          id: `ai_${Date.now()}_${index}`,
          activity_name: exercise.name.replace(/_/g, ' '),
          category: 'stretching' as const, // Default category
          duration_minutes: Math.ceil(duration / aiWorkout.exercises.length),
          difficulty_level: intensity,
          description: exercise.description,
          instructions: exercise.instructions,
          video_url: undefined,
          muscle_groups_targeted: [exercise.muscleGroup],
          equipment_needed: [exercise.equipment],
          is_premium: false,
          created_at: new Date().toISOString(),
        })
      );

      const plan: RestDayPlan = {
        recommended_activities: recommendedActivities,
        rationale: aiWorkout.rationale,
        estimated_duration: duration,
        benefits: [
          'Maintains workout streak without overexertion',
          'Promotes muscle recovery and flexibility',
          'Reduces stress and improves mood',
          'Prepares body for next workout session',
        ],
        tips: aiWorkout.tips,
      };

      setAiPlan(plan);
      return plan;
    } catch (error) {
      console.error('Error generating rest day plan:', error);
      setError('Failed to generate rest day plan');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Start a recovery session
  const startRecoverySession = async (
    activityId: string,
    moodBefore?: string
  ): Promise<RecoverySession | null> => {
    if (!user) return null;

    try {
      const today = new Date().toISOString().split('T')[0];

      // Check if session already exists for today
      const { data: existingSession } = await supabase
        .from('recovery_sessions')
        .select('id')
        .eq('user_id', user.id)
        .eq('date', today)
        .single();

      if (existingSession) {
        setError('Recovery session already completed today');
        return null;
      }

      const { data, error } = await supabase
        .from('recovery_sessions')
        .insert({
          user_id: user.id,
          activity_id: activityId,
          date: today,
          duration_completed: 0,
          completion_percentage: 0,
          maintains_streak: true,
          mood_before: moodBefore,
        })
        .select(
          `
          *,
          activity:rest_day_activities(*)
        `
        )
        .single();

      if (error) {
        console.error('Error starting recovery session:', error);
        setError('Failed to start recovery session');
        return null;
      } else {
        setTodaySession(data);
        return data;
      }
    } catch (error) {
      console.error('Error starting recovery session:', error);
      setError('Failed to start recovery session');
      return null;
    }
  };

  // Complete a recovery session
  const completeRecoverySession = async (
    sessionId: string,
    durationCompleted: number,
    moodAfter?: string,
    notes?: string
  ): Promise<boolean> => {
    if (!user || !todaySession) return false;

    setLoading(true);
    try {
      const completionPercentage = Math.min(
        100,
        (durationCompleted / (todaySession.activity?.duration_minutes || 15)) *
          100
      );

      const { error } = await supabase
        .from('recovery_sessions')
        .update({
          duration_completed: durationCompleted,
          completion_percentage: completionPercentage,
          mood_after: moodAfter,
          notes: notes,
        })
        .eq('id', sessionId);

      if (error) {
        console.error('Error completing recovery session:', error);
        setError('Failed to complete recovery session');
        return false;
      } else {
        // Award XP for completing recovery session
        const xpGained = Math.floor(completionPercentage * 0.5); // Half XP compared to regular workout
        await addXP(xpGained);

        // Update streak if session maintains it
        if (todaySession.maintains_streak) {
          await updateStreak();
        }

        await loadTodaySession();
        await loadSessionHistory();
        return true;
      }
    } catch (error) {
      console.error('Error completing recovery session:', error);
      setError('Failed to complete recovery session');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Get activities by category
  const getActivitiesByCategory = (category: string): RestDayActivity[] => {
    return activities.filter((activity) => activity.category === category);
  };

  // Get activities by duration
  const getActivitiesByDuration = (maxDuration: number): RestDayActivity[] => {
    return activities.filter(
      (activity) => activity.duration_minutes <= maxDuration
    );
  };

  // Get activities by difficulty
  const getActivitiesByDifficulty = (difficulty: string): RestDayActivity[] => {
    return activities.filter(
      (activity) => activity.difficulty_level === difficulty
    );
  };

  // Get recovery statistics
  const getRecoveryStats = () => {
    if (sessionHistory.length === 0) {
      return {
        totalSessions: 0,
        totalDuration: 0,
        averageCompletion: 0,
        streakDays: 0,
        favoriteCategory: 'stretching',
      };
    }

    const totalSessions = sessionHistory.length;
    const totalDuration = sessionHistory.reduce(
      (sum, session) => sum + session.duration_completed,
      0
    );
    const averageCompletion =
      sessionHistory.reduce(
        (sum, session) => sum + session.completion_percentage,
        0
      ) / totalSessions;

    // Calculate streak of recovery days
    const sortedSessions = sessionHistory.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    let streakDays = 0;
    let currentDate = new Date();

    for (const session of sortedSessions) {
      const sessionDate = new Date(session.date);
      const daysDiff = Math.floor(
        (currentDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysDiff === streakDays) {
        streakDays++;
        currentDate = sessionDate;
      } else {
        break;
      }
    }

    // Find favorite category
    const categoryCounts: { [key: string]: number } = {};
    sessionHistory.forEach((session) => {
      const category = session.activity?.category || 'stretching';
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });

    const favoriteCategory =
      Object.entries(categoryCounts).sort(([, a], [, b]) => b - a)[0]?.[0] ||
      'stretching';

    return {
      totalSessions,
      totalDuration,
      averageCompletion: Math.round(averageCompletion),
      streakDays,
      favoriteCategory,
    };
  };

  // Get recovery insights
  const getRecoveryInsights = (): string[] => {
    const stats = getRecoveryStats();
    const insights: string[] = [];

    if (stats.totalSessions === 0) {
      insights.push(
        '🌱 Start with gentle recovery activities to maintain your streak on rest days'
      );
      insights.push('🧘 Even 5 minutes of stretching can help with recovery');
      return insights;
    }

    if (stats.averageCompletion >= 80) {
      insights.push(
        '⭐ Excellent commitment to recovery! Your consistency is impressive.'
      );
    } else if (stats.averageCompletion >= 60) {
      insights.push(
        '💪 Good recovery habits! Try to complete sessions fully for maximum benefit.'
      );
    } else {
      insights.push(
        '🎯 Focus on shorter activities to build consistent recovery habits.'
      );
    }

    if (stats.streakDays >= 7) {
      insights.push('🔥 Amazing recovery streak! Your body is thanking you.');
    } else if (stats.streakDays >= 3) {
      insights.push('📈 Building a good recovery routine! Keep it up.');
    }

    if (stats.totalDuration >= 300) {
      // 5+ hours
      insights.push(
        "⏰ You've invested significant time in recovery. That's smart training!"
      );
    }

    return insights;
  };

  // Check if rest day activity can maintain streak
  const canMaintainStreak = (): boolean => {
    if (!profile) return false;

    // Check if user has done a workout today
    const today = new Date().toISOString().split('T')[0];
    const lastWorkoutDate = profile.last_workout_date;

    if (lastWorkoutDate === today) {
      return false; // Already worked out today, no need for recovery
    }

    return !todaySession; // Can maintain streak if no recovery session done today
  };

  return {
    // State
    loading,
    error,
    activities,
    todaySession,
    sessionHistory,
    aiPlan,

    // Actions
    startRecoverySession,
    completeRecoverySession,
    generateRestDayPlan,

    // Data loading
    loadActivities,
    loadTodaySession,
    loadSessionHistory,

    // Data filtering
    getActivitiesByCategory,
    getActivitiesByDuration,
    getActivitiesByDifficulty,

    // Analytics
    getRecoveryStats,
    getRecoveryInsights,
    canMaintainStreak,

    // Constants
    RECOVERY_CATEGORIES,
    DIFFICULTY_LEVELS,

    // Utilities
    setError: (error: string | null) => setError(error),
    clearError: () => setError(null),
  };
}
