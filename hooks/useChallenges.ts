import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';
import { useSupabaseGamification } from './useSupabaseGamification';

export interface Challenge {
  id: string;
  creator_id: string;
  title: string;
  description: string;
  challenge_type:
    | 'streak'
    | 'workout_count'
    | 'exercise_variety'
    | 'duration'
    | 'collaborative';
  target_value: number;
  start_date: string;
  end_date: string;
  is_public: boolean;
  max_participants?: number;
  badge_reward?: string;
  xp_reward: number;
  created_at: string;
  // Joined data
  creator?: {
    username: string;
    avatar_color: string;
  };
  participants_count?: number;
  user_participation?: ChallengeParticipant;
}

export interface ChallengeParticipant {
  id: string;
  challenge_id: string;
  user_id: string;
  joined_at: string;
  progress: number;
  completed: boolean;
  completed_at?: string;
  // Joined data
  user?: {
    username: string;
    avatar_color: string;
  };
}

export interface ChallengeProgress {
  id: string;
  participant_id: string;
  progress_value: number;
  recorded_at: string;
}

export interface CreateChallengeRequest {
  title: string;
  description: string;
  challenge_type:
    | 'streak'
    | 'workout_count'
    | 'exercise_variety'
    | 'duration'
    | 'collaborative';
  target_value: number;
  duration_days: number;
  is_public: boolean;
  max_participants?: number;
  xp_reward?: number;
}

export function useChallenges() {
  const { user } = useAuth();
  const { addXP } = useSupabaseGamification();
  const [loading, setLoading] = useState(false);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [myChallenges, setMyChallenges] = useState<Challenge[]>([]);
  const [publicChallenges, setPublicChallenges] = useState<Challenge[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadChallenges();
      loadMyChallenges();
      loadPublicChallenges();
    }
  }, [user]);

  // Load all challenges user is participating in
  const loadChallenges = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('challenge_participants')
        .select(
          `
          *,
          challenge:challenges (
            *,
            creator:profiles!challenges_creator_id_fkey (username, avatar_color)
          )
        `
        )
        .eq('user_id', user.id)
        .order('joined_at', { ascending: false });

      if (error) {
        console.error('Error loading challenges:', error);
        setError('Failed to load challenges');
      } else {
        const formattedChallenges =
          data?.map((participation: any) => ({
            ...participation.challenge,
            user_participation: participation,
          })) || [];
        setChallenges(formattedChallenges);
      }
    } catch (error) {
      console.error('Error loading challenges:', error);
      setError('Failed to load challenges');
    } finally {
      setLoading(false);
    }
  };

  // Load challenges created by the user
  const loadMyChallenges = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('challenges')
        .select(
          `
          *,
          creator:profiles!challenges_creator_id_fkey (username, avatar_color)
        `
        )
        .eq('creator_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading my challenges:', error);
      } else {
        // Get participant counts for each challenge
        const challengesWithCounts = await Promise.all(
          (data || []).map(async (challenge) => {
            const { count } = await supabase
              .from('challenge_participants')
              .select('*', { count: 'exact', head: true })
              .eq('challenge_id', challenge.id);

            return {
              ...challenge,
              participants_count: count || 0,
            };
          })
        );

        setMyChallenges(challengesWithCounts);
      }
    } catch (error) {
      console.error('Error loading my challenges:', error);
    }
  };

  // Load public challenges available to join
  const loadPublicChallenges = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('challenges')
        .select(
          `
          *,
          creator:profiles!challenges_creator_id_fkey (username, avatar_color)
        `
        )
        .eq('is_public', true)
        .neq('creator_id', user.id)
        .gte('end_date', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error loading public challenges:', error);
      } else {
        // Filter out challenges user is already participating in
        const userChallengeIds = challenges.map((c) => c.id);
        const availableChallenges = (data || []).filter(
          (challenge) => !userChallengeIds.includes(challenge.id)
        );

        // Get participant counts
        const challengesWithCounts = await Promise.all(
          availableChallenges.map(async (challenge) => {
            const { count } = await supabase
              .from('challenge_participants')
              .select('*', { count: 'exact', head: true })
              .eq('challenge_id', challenge.id);

            return {
              ...challenge,
              participants_count: count || 0,
            };
          })
        );

        setPublicChallenges(challengesWithCounts);
      }
    } catch (error) {
      console.error('Error loading public challenges:', error);
    }
  };

  // Create a new challenge
  const createChallenge = async (
    challengeData: CreateChallengeRequest
  ): Promise<boolean> => {
    if (!user) return false;

    setLoading(true);
    try {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(startDate.getDate() + challengeData.duration_days);

      const { data, error } = await supabase
        .from('challenges')
        .insert({
          creator_id: user.id,
          title: challengeData.title,
          description: challengeData.description,
          challenge_type: challengeData.challenge_type,
          target_value: challengeData.target_value,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          is_public: challengeData.is_public,
          max_participants: challengeData.max_participants,
          xp_reward: challengeData.xp_reward || 100,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating challenge:', error);
        setError('Failed to create challenge');
        return false;
      } else {
        // Auto-join the creator to their own challenge
        await joinChallenge(data.id);
        await loadMyChallenges();
        return true;
      }
    } catch (error) {
      console.error('Error creating challenge:', error);
      setError('Failed to create challenge');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Join a challenge
  const joinChallenge = async (challengeId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase.from('challenge_participants').insert({
        challenge_id: challengeId,
        user_id: user.id,
        progress: 0,
        completed: false,
      });

      if (error) {
        console.error('Error joining challenge:', error);
        setError('Failed to join challenge');
        return false;
      } else {
        await loadChallenges();
        await loadPublicChallenges();
        return true;
      }
    } catch (error) {
      console.error('Error joining challenge:', error);
      setError('Failed to join challenge');
      return false;
    }
  };

  // Leave a challenge
  const leaveChallenge = async (challengeId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('challenge_participants')
        .delete()
        .eq('challenge_id', challengeId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error leaving challenge:', error);
        setError('Failed to leave challenge');
        return false;
      } else {
        await loadChallenges();
        await loadPublicChallenges();
        return true;
      }
    } catch (error) {
      console.error('Error leaving challenge:', error);
      setError('Failed to leave challenge');
      return false;
    }
  };

  // Update challenge progress
  const updateChallengeProgress = async (
    challengeId: string,
    progressValue: number
  ): Promise<boolean> => {
    if (!user) return false;

    try {
      // Get current participation
      const { data: participation, error: fetchError } = await supabase
        .from('challenge_participants')
        .select('*')
        .eq('challenge_id', challengeId)
        .eq('user_id', user.id)
        .single();

      if (fetchError || !participation) {
        console.error('Error fetching participation:', fetchError);
        return false;
      }

      // Get challenge details to check target
      const { data: challenge, error: challengeError } = await supabase
        .from('challenges')
        .select('target_value, xp_reward')
        .eq('id', challengeId)
        .single();

      if (challengeError || !challenge) {
        console.error('Error fetching challenge:', challengeError);
        return false;
      }

      const newProgress = Math.max(participation.progress, progressValue);
      const isCompleted = newProgress >= challenge.target_value;

      // Update participation
      const { error: updateError } = await supabase
        .from('challenge_participants')
        .update({
          progress: newProgress,
          completed: isCompleted,
          completed_at: isCompleted ? new Date().toISOString() : null,
        })
        .eq('id', participation.id);

      if (updateError) {
        console.error('Error updating progress:', updateError);
        return false;
      }

      // Record progress entry
      await supabase.from('challenge_progress').insert({
        participant_id: participation.id,
        progress_value: progressValue,
      });

      // Award XP if challenge completed
      if (isCompleted && !participation.completed) {
        await addXP(challenge.xp_reward);
      }

      await loadChallenges();
      return true;
    } catch (error) {
      console.error('Error updating challenge progress:', error);
      setError('Failed to update progress');
      return false;
    }
  };

  // Get challenge leaderboard
  const getChallengeLeaderboard = async (
    challengeId: string
  ): Promise<ChallengeParticipant[]> => {
    try {
      const { data, error } = await supabase
        .from('challenge_participants')
        .select(
          `
          *,
          user:profiles!challenge_participants_user_id_fkey (username, avatar_color)
        `
        )
        .eq('challenge_id', challengeId)
        .order('progress', { ascending: false })
        .order('joined_at', { ascending: true });

      if (error) {
        console.error('Error loading leaderboard:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error loading leaderboard:', error);
      return [];
    }
  };

  // Check and update challenge progress based on user activity
  const checkChallengeProgress = async (
    activityType: string,
    value: number = 1
  ) => {
    if (!user || challenges.length === 0) return;

    const activeChallenges = challenges.filter((c) => {
      const endDate = new Date(c.end_date);
      return endDate > new Date() && !c.user_participation?.completed;
    });

    for (const challenge of activeChallenges) {
      let shouldUpdate = false;
      let progressValue = 0;

      switch (challenge.challenge_type) {
        case 'workout_count':
          if (activityType === 'workout') {
            shouldUpdate = true;
            progressValue = (challenge.user_participation?.progress || 0) + 1;
          }
          break;
        case 'streak':
          if (activityType === 'streak_update') {
            shouldUpdate = true;
            progressValue = value;
          }
          break;
        case 'duration':
          if (activityType === 'workout_duration') {
            shouldUpdate = true;
            progressValue =
              (challenge.user_participation?.progress || 0) + value;
          }
          break;
        case 'exercise_variety':
          if (activityType === 'new_exercise') {
            shouldUpdate = true;
            progressValue = (challenge.user_participation?.progress || 0) + 1;
          }
          break;
      }

      if (shouldUpdate) {
        await updateChallengeProgress(challenge.id, progressValue);
      }
    }
  };

  // Delete a challenge (creator only)
  const deleteChallenge = async (challengeId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('challenges')
        .delete()
        .eq('id', challengeId)
        .eq('creator_id', user.id);

      if (error) {
        console.error('Error deleting challenge:', error);
        setError('Failed to delete challenge');
        return false;
      } else {
        await loadMyChallenges();
        await loadChallenges();
        return true;
      }
    } catch (error) {
      console.error('Error deleting challenge:', error);
      setError('Failed to delete challenge');
      return false;
    }
  };

  // Get challenge suggestions based on user activity
  const getChallengeSuggestions = (): CreateChallengeRequest[] => {
    const suggestions: CreateChallengeRequest[] = [
      {
        title: '7-Day Consistency Challenge',
        description: 'Complete a workout every day for 7 days straight',
        challenge_type: 'streak',
        target_value: 7,
        duration_days: 7,
        is_public: true,
        xp_reward: 150,
      },
      {
        title: '20 Workouts in 30 Days',
        description: 'Complete 20 workouts within 30 days',
        challenge_type: 'workout_count',
        target_value: 20,
        duration_days: 30,
        is_public: true,
        xp_reward: 200,
      },
      {
        title: 'Exercise Explorer',
        description: 'Try 15 different exercises this week',
        challenge_type: 'exercise_variety',
        target_value: 15,
        duration_days: 7,
        is_public: true,
        xp_reward: 100,
      },
      {
        title: '10 Hours of Activity',
        description: 'Complete 10 hours of workouts this month',
        challenge_type: 'duration',
        target_value: 600, // 10 hours in minutes
        duration_days: 30,
        is_public: true,
        xp_reward: 250,
      },
    ];

    return suggestions;
  };

  return {
    // State
    loading,
    error,
    challenges,
    myChallenges,
    publicChallenges,

    // Actions
    createChallenge,
    joinChallenge,
    leaveChallenge,
    deleteChallenge,
    updateChallengeProgress,
    checkChallengeProgress,

    // Data loading
    loadChallenges,
    loadMyChallenges,
    loadPublicChallenges,
    getChallengeLeaderboard,

    // Utilities
    getChallengeSuggestions,
    setError: (error: string | null) => setError(error),
    clearError: () => setError(null),
  };
}
