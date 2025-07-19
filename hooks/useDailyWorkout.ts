import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { useMuscleFatigue, type MuscleGroup } from './useMuscleFatigue';
import { geminiService, GeneratedWorkout } from '@/lib/gemini';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define muscle groups for workout selection
const MUSCLE_GROUPS: MuscleGroup[] = [
  'chest',
  'back',
  'biceps',
  'triceps',
  'shoulders',
  'legs',
  'abs',
  'glutes',
];

interface DailyWorkoutData {
  workout: GeneratedWorkout;
  date: string;
  selectedMuscles: string[];
}

const DAILY_WORKOUT_KEY = 'daily_workout';

export function useDailyWorkout() {
  const { user, loadOnboardingData } = useAuth();
  const { getMuscleFatiguePercentage } = useMuscleFatigue();
  const [dailyWorkout, setDailyWorkout] = useState<DailyWorkoutData | null>(
    null
  );
  const [isGeneratingDaily, setIsGeneratingDaily] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      checkAndGenerateDailyWorkout();
    }
  }, [user]);

  const getTodayString = () => {
    return new Date().toDateString();
  };

  const isNewDay = (lastDate: string) => {
    return lastDate !== getTodayString();
  };

  const selectOptimalMuscles = (): string[] => {
    // Get all muscles with their fatigue percentages
    const muscleScores = MUSCLE_GROUPS.map((muscle) => ({
      muscle,
      fatiguePercentage: getMuscleFatiguePercentage(muscle),
    }));

    // Sort by highest fatigue percentage (most recovered muscles first)
    muscleScores.sort((a, b) => b.fatiguePercentage - a.fatiguePercentage);

    // Take top 2-3 most recovered muscles
    const selectedCount = Math.floor(Math.random() * 2) + 2; // 2 or 3 muscles
    const selectedMuscles = muscleScores
      .slice(0, selectedCount)
      .map((item) => item.muscle);

    // Ensure we have good muscle combinations
    return balanceMuscleSelection(selectedMuscles);
  };

  const balanceMuscleSelection = (muscles: string[]): string[] => {
    // Define muscle group relationships for better workout balance
    const pushMuscles = ['chest', 'shoulders', 'triceps'];
    const pullMuscles = ['back', 'biceps'];
    const legMuscles = ['quads', 'hamstrings', 'glutes', 'calves'];
    const coreMuscles = ['abs', 'lower-back'];

    // If we have only push or only pull, try to balance
    const hasPush = muscles.some((m) => pushMuscles.includes(m));
    const hasPull = muscles.some((m) => pullMuscles.includes(m));
    const hasLegs = muscles.some((m) => legMuscles.includes(m));

    // Try to create balanced workouts
    if (muscles.length === 2) {
      if (hasPush && !hasPull) {
        // Add a pull muscle if available and recovered enough
        const availablePull = pullMuscles.find(
          (m) => getMuscleFatiguePercentage(m) > 70
        );
        if (availablePull) {
          return [muscles[0], availablePull];
        }
      } else if (hasPull && !hasPush) {
        // Add a push muscle if available and recovered enough
        const availablePush = pushMuscles.find(
          (m) => getMuscleFatiguePercentage(m) > 70
        );
        if (availablePush) {
          return [muscles[0], availablePush];
        }
      }
    }

    return muscles;
  };

  const generateDailyWorkout = async (
    forceRegenerate = false
  ): Promise<DailyWorkoutData | null> => {
    if (!user) return null;

    setIsGeneratingDaily(true);

    try {
      // Load user onboarding data
      const { data: onboardingData } = await loadOnboardingData();

      // Select optimal muscles based on fatigue
      const selectedMuscles = selectOptimalMuscles();

      console.log('Selected muscles for daily workout:', selectedMuscles);

      // Determine workout duration based on user preferences
      const getWorkoutDuration = () => {
        const workoutDuration = onboardingData?.workout_duration;
        switch (workoutDuration) {
          case '15-20':
            return 20;
          case '20-30':
            return 30;
          case '30-45':
            return 45;
          case '45-60':
            return 60;
          case '60+':
            return 75;
          default:
            return 35; // Default to 35 minutes
        }
      };

      // Enhanced user context for daily workout generation
      const userContext = {
        fitnessGoals: onboardingData?.fitness_goals || ['general-fitness'],
        experienceLevel: onboardingData?.experience_level || 'beginner',
        equipment: onboardingData?.equipment || ['none'],
        targetMuscles: selectedMuscles,
        workoutFrequency: onboardingData?.workout_frequency || '2-3',
        timeAvailability: onboardingData?.time_availability || 'flexible',
        limitations: onboardingData?.limitations || [],
        limitationsOther: onboardingData?.limitations_other,
        motivationStyle: onboardingData?.motivation_style || [],
        workoutStyle: onboardingData?.workout_style || [],
        // Add context that this is a daily auto-generated workout
        isDailyWorkout: true,
        estimatedDuration: getWorkoutDuration(),
      };

      console.log('Generating daily workout with context:', userContext);

      // Generate workout using Gemini
      const generatedWorkout = await geminiService.generateWorkout(
        userContext
      );

      // Add daily workout specific properties
      const dailyWorkoutData: DailyWorkoutData = {
        workout: {
          ...generatedWorkout,
          name: `Today's ${generatedWorkout.name}`,
          targetMuscles: selectedMuscles,
          estimatedDuration: getWorkoutDuration(),
        },
        date: getTodayString(),
        selectedMuscles,
      };

      // Save to AsyncStorage
      await AsyncStorage.setItem(
        DAILY_WORKOUT_KEY,
        JSON.stringify(dailyWorkoutData)
      );

      setDailyWorkout(dailyWorkoutData);
      return dailyWorkoutData;
    } catch (error) {
      console.error('Error generating daily workout:', error);
      return null;
    } finally {
      setIsGeneratingDaily(false);
    }
  };

  const checkAndGenerateDailyWorkout = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      // Check if we have a daily workout stored
      const storedData = await AsyncStorage.getItem(DAILY_WORKOUT_KEY);

      if (storedData) {
        const parsedData: DailyWorkoutData = JSON.parse(storedData);

        // Check if it's from today
        if (!isNewDay(parsedData.date)) {
          // Use existing daily workout
          setDailyWorkout(parsedData);
          setLoading(false);
          return;
        }
      }

      // Generate new daily workout for today
      console.log('Generating new daily workout for', getTodayString());
      await generateDailyWorkout();
    } catch (error) {
      console.error('Error checking daily workout:', error);
    } finally {
      setLoading(false);
    }
  };

  const regenerateDailyWorkout = async () => {
    return await generateDailyWorkout(true);
  };

  const clearDailyWorkout = async () => {
    try {
      await AsyncStorage.removeItem(DAILY_WORKOUT_KEY);
      setDailyWorkout(null);
    } catch (error) {
      console.error('Error clearing daily workout:', error);
    }
  };

  const getSelectedMuscleNames = () => {
    if (!dailyWorkout) return [];

    return dailyWorkout.selectedMuscles.map((muscleId) => {
      const muscle = MUSCLE_GROUPS.find((m) => m === muscleId);
      return muscle
        ? muscle.charAt(0).toUpperCase() + muscle.slice(1)
        : muscleId;
    });
  };

  return {
    dailyWorkout: dailyWorkout?.workout || null,
    selectedMuscles: dailyWorkout?.selectedMuscles || [],
    selectedMuscleNames: getSelectedMuscleNames(),
    isGeneratingDaily,
    loading,
    generateDailyWorkout,
    regenerateDailyWorkout,
    clearDailyWorkout,
    checkAndGenerateDailyWorkout,
  };
}
