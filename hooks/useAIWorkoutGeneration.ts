import { useState } from 'react';
import {
  geminiService,
  WorkoutGenerationParams,
  GeneratedWorkout,
  PerformanceAnalysis,
  EquipmentRecommendation,
} from '@/lib/gemini';
import { useAuth } from './useAuth';
import { supabase } from '@/lib/supabase';

export interface AIWorkoutRequest {
  goals: string[];
  workoutDuration: number;
  workoutType: 'strength' | 'cardio' | 'flexibility' | 'hybrid';
  targetMuscleGroups?: string[];
  intensity?: 'low' | 'moderate' | 'high';
  location?: 'home' | 'gym' | 'travel';
}

export interface EquipmentProfile {
  id: string;
  location_name: string;
  available_equipment: string[];
  is_default: boolean;
}

export function useAIWorkoutGeneration() {
  const { user, profile, loadOnboardingData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [equipmentProfiles, setEquipmentProfiles] = useState<
    EquipmentProfile[]
  >([]);
  const [generatedWorkout, setGeneratedWorkout] =
    useState<GeneratedWorkout | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Epic 3.1: Generate AI Workout
  const generateWorkout = async (
    request: AIWorkoutRequest
  ): Promise<GeneratedWorkout | null> => {
    if (!user || !profile) {
      setError('User not authenticated');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      // Load user onboarding data for context
      const { data: onboardingData } = await loadOnboardingData();

      // Get recent workout history to avoid repetition
      const { data: recentWorkouts } = await supabase
        .from('workouts')
        .select('exercises')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      const previousExercises =
        recentWorkouts?.flatMap(
          (workout: any) =>
            (workout.exercises as any[])?.map((ex: any) => ex.name) || []
        ) || [];

      // Get equipment for location
      const equipment = await getEquipmentForLocation(
        request.location || 'home'
      );

      // Build generation parameters
      const params: WorkoutGenerationParams = {
        goals: request.goals,
        availableEquipment: equipment,
        workoutDuration: request.workoutDuration,
        fitnessLevel:
          (onboardingData?.experience_level as
            | 'beginner'
            | 'intermediate'
            | 'advanced') || 'intermediate',
        targetMuscleGroups: request.targetMuscleGroups,
        workoutType: request.workoutType,
        previousWorkouts: previousExercises,
        limitations: onboardingData?.limitations || [],
        preferences: {
          intensity: request.intensity || 'moderate',
          restTime: 'medium',
          varietyLevel: 'mixed',
        },
      };

      console.log('Generating workout with params:', params);

      // Generate workout using Gemini
      const workout = await geminiService.generateWorkout(params);

      // Save the generated workout plan to database
      await saveWorkoutPlan(workout, params);

      setGeneratedWorkout(workout);
      return workout;
    } catch (error) {
      console.error('Error generating workout:', error);
      setError(
        error instanceof Error ? error.message : 'Failed to generate workout'
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Epic 3.2: Equipment Management
  const loadEquipmentProfiles = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('equipment_profiles')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading equipment profiles:', error);
      } else {
        setEquipmentProfiles(data || []);
      }
    } catch (error) {
      console.error('Error loading equipment profiles:', error);
    }
  };

  const createEquipmentProfile = async (
    locationName: string,
    equipment: string[],
    isDefault = false
  ): Promise<boolean> => {
    if (!user) return false;

    try {
      // If setting as default, unset other defaults first
      if (isDefault) {
        await supabase
          .from('equipment_profiles')
          .update({ is_default: false })
          .eq('user_id', user.id);
      }

      const { error } = await supabase.from('equipment_profiles').insert({
        user_id: user.id,
        location_name: locationName,
        available_equipment: equipment,
        is_default: isDefault,
      });

      if (!error) {
        await loadEquipmentProfiles();
        return true;
      } else {
        console.error('Error creating equipment profile:', error);
        return false;
      }
    } catch (error) {
      console.error('Error creating equipment profile:', error);
      return false;
    }
  };

  const getEquipmentForLocation = async (
    location: string
  ): Promise<string[]> => {
    if (!user) return ['bodyweight'];

    try {
      const { data } = await supabase
        .from('equipment_profiles')
        .select('available_equipment')
        .eq('user_id', user.id)
        .eq('location_name', location)
        .single();

      return data?.available_equipment || ['bodyweight'];
    } catch (error) {
      console.error('Error getting equipment for location:', error);
      // Return default equipment based on location
      switch (location) {
        case 'gym':
          return [
            'barbell',
            'dumbbells',
            'cable_machine',
            'leg_press',
            'pull_up_bar',
            'bench',
          ];
        case 'home':
          return ['bodyweight', 'resistance_bands', 'yoga_mat'];
        case 'travel':
          return ['bodyweight'];
        default:
          return ['bodyweight'];
      }
    }
  };

  // Epic 3.2: Adapt Workout for Different Equipment
  const adaptWorkoutForEquipment = async (
    workout: GeneratedWorkout,
    location: string
  ): Promise<EquipmentRecommendation | null> => {
    setLoading(true);
    try {
      const availableEquipment = await getEquipmentForLocation(location);
      const recommendation = await geminiService.adaptWorkoutForEquipment(
        workout,
        availableEquipment
      );
      return recommendation;
    } catch (error) {
      console.error('Error adapting workout:', error);
      setError('Failed to adapt workout for available equipment');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Epic 3.4: Performance Analysis
  const analyzePerformance = async (): Promise<PerformanceAnalysis | null> => {
    if (!user) return null;

    setLoading(true);
    try {
      // Get recent performance data
      const { data: workouts } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      const { data: personalRecords } = await supabase
        .from('personal_records')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(50);

      // Format performance data for analysis
      const performanceData = [
        ...(workouts || []).map((workout) => ({
          type: 'workout',
          date: workout.date,
          duration: workout.duration,
          exercises: workout.exercises,
          xp_gained: workout.xp_gained,
        })),
        ...(personalRecords || []).map((record) => ({
          type: 'personal_record',
          exercise: record.exercise_name,
          weight: record.weight,
          reps: record.reps,
          date: record.date,
        })),
      ];

      const analysis = await geminiService.analyzePerformance(performanceData);

      // Store analysis results
      await supabase.from('performance_analytics').insert({
        user_id: user.id,
        metric_type: 'comprehensive_analysis',
        metric_value: 1,
        trend_direction: analysis.progressTrend,
        plateau_detected: analysis.plateauDetected,
      });

      return analysis;
    } catch (error) {
      console.error('Error analyzing performance:', error);
      setError('Failed to analyze performance data');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Epic 3.5: Optimize Workout Timing
  const optimizeWorkoutTiming = async (): Promise<string[]> => {
    if (!user) return [];

    try {
      // Get workout history with timestamps
      const { data: workouts } = await supabase
        .from('workouts')
        .select('date, duration, xp_gained')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(30);

      // Simulate user schedule (in real app, this would come from calendar integration)
      const mockSchedule = {
        workDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        workHours: { start: 9, end: 17 },
        preferences: {
          morningPerson: true,
          availableSlots: ['6:00-8:00', '12:00-13:00', '18:00-20:00'],
        },
      };

      const recommendations = await geminiService.optimizeWorkoutTiming(
        mockSchedule,
        workouts || []
      );

      return recommendations;
    } catch (error) {
      console.error('Error optimizing workout timing:', error);
      return ['Consider morning workouts for consistent energy levels'];
    }
  };

  // Generate Recovery Plan
  const generateRecoveryPlan = async (
    intensity: 'gentle' | 'moderate' | 'active' = 'gentle',
    duration: number = 15,
    targetAreas?: string[]
  ): Promise<GeneratedWorkout | null> => {
    setLoading(true);
    try {
      const recoveryWorkout = await geminiService.generateRecoveryPlan(
        intensity,
        duration,
        targetAreas
      );

      return recoveryWorkout;
    } catch (error) {
      console.error('Error generating recovery plan:', error);
      setError('Failed to generate recovery plan');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Save workout plan to database
  const saveWorkoutPlan = async (
    workout: GeneratedWorkout,
    params: WorkoutGenerationParams
  ) => {
    if (!user) return;

    try {
      await supabase.from('workout_plans').insert({
        user_id: user.id,
        plan_name: `AI ${params.workoutType} workout`,
        generated_by: 'gemini',
        difficulty_level: params.fitnessLevel,
        estimated_duration: workout.estimatedDuration,
        target_muscle_groups: params.targetMuscleGroups || [],
        equipment_required: params.availableEquipment,
        exercises: workout.exercises,
        ai_rationale: workout.rationale,
      });
    } catch (error) {
      console.error('Error saving workout plan:', error);
    }
  };

  // Get saved workout plans
  const getSavedWorkoutPlans = async () => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('workout_plans')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading workout plans:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error loading workout plans:', error);
      return [];
    }
  };

  return {
    // State
    loading,
    error,
    generatedWorkout,
    equipmentProfiles,

    // Epic 3.1: Workout Generation
    generateWorkout,
    getSavedWorkoutPlans,

    // Epic 3.2: Equipment Management
    loadEquipmentProfiles,
    createEquipmentProfile,
    getEquipmentForLocation,
    adaptWorkoutForEquipment,

    // Epic 3.4: Performance Analysis
    analyzePerformance,

    // Epic 3.5: Timing Optimization
    optimizeWorkoutTiming,

    // Recovery Planning
    generateRecoveryPlan,

    // Utility
    setError: (error: string | null) => setError(error),
    clearError: () => setError(null),
  };
}
