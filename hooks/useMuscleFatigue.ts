import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define muscle group type
export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'biceps'
  | 'triceps'
  | 'shoulders'
  | 'traps'
  | 'forearms'
  | 'abs'
  | 'lower-back'
  | 'quads'
  | 'hamstrings'
  | 'glutes'
  | 'calves'
  | 'abductors'
  | 'adductors'
  | 'legs';

interface MuscleFatigueData {
  [key: string]: {
    fatiguePercentage: number;
    lastWorkedDate: string;
  };
}

const MUSCLE_FATIGUE_KEY = 'muscle_fatigue_data';
const RECOVERY_RATE_PER_DAY = 15; // Muscles recover 15% per day
const MAX_FATIGUE = 100;
const MIN_FATIGUE = 0;

// Initialize default fatigue data (0% fatigue = fully recovered)
const getDefaultFatigueData = (): MuscleFatigueData => {
  const muscleGroups: MuscleGroup[] = [
    'chest',
    'back',
    'biceps',
    'triceps',
    'shoulders',
    'traps',
    'forearms',
    'abs',
    'lower-back',
    'quads',
    'hamstrings',
    'glutes',
    'calves',
    'abductors',
    'adductors',
    'legs',
  ];

  const data: MuscleFatigueData = {};
  muscleGroups.forEach((muscle) => {
    data[muscle] = {
      fatiguePercentage: 0,
      lastWorkedDate: new Date().toISOString(),
    };
  });
  return data;
};

export function useMuscleFatigue() {
  const [fatigueData, setFatigueData] = useState<MuscleFatigueData>(
    getDefaultFatigueData()
  );
  const [isLoaded, setIsLoaded] = useState(false);

  // Load fatigue data from storage on mount
  useEffect(() => {
    loadFatigueData();
  }, []);

  // Auto-recovery effect - runs when component mounts and daily
  useEffect(() => {
    if (isLoaded) {
      processNaturalRecovery();
    }
  }, [isLoaded]);

  const loadFatigueData = async () => {
    try {
      const stored = await AsyncStorage.getItem(MUSCLE_FATIGUE_KEY);
      if (stored) {
        const parsedData = JSON.parse(stored);
        setFatigueData(parsedData);
      } else {
        const defaultData = getDefaultFatigueData();
        setFatigueData(defaultData);
        await AsyncStorage.setItem(
          MUSCLE_FATIGUE_KEY,
          JSON.stringify(defaultData)
        );
      }
    } catch (error) {
      console.error('Failed to load muscle fatigue data:', error);
      setFatigueData(getDefaultFatigueData());
    } finally {
      setIsLoaded(true);
    }
  };

  const saveFatigueData = async (data: MuscleFatigueData) => {
    try {
      await AsyncStorage.setItem(MUSCLE_FATIGUE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save muscle fatigue data:', error);
    }
  };

  const processNaturalRecovery = () => {
    const now = new Date();
    const updatedData = { ...fatigueData };
    let hasChanges = false;

    Object.keys(updatedData).forEach((muscle) => {
      const muscleData = updatedData[muscle];
      const lastWorkedDate = new Date(muscleData.lastWorkedDate);
      const daysSinceLastWorkout = Math.floor(
        (now.getTime() - lastWorkedDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (
        daysSinceLastWorkout > 0 &&
        muscleData.fatiguePercentage > MIN_FATIGUE
      ) {
        const recoveryAmount = daysSinceLastWorkout * RECOVERY_RATE_PER_DAY;
        const newFatigue = Math.max(
          MIN_FATIGUE,
          muscleData.fatiguePercentage - recoveryAmount
        );

        if (newFatigue !== muscleData.fatiguePercentage) {
          updatedData[muscle] = {
            ...muscleData,
            fatiguePercentage: newFatigue,
          };
          hasChanges = true;
        }
      }
    });

    if (hasChanges) {
      setFatigueData(updatedData);
      saveFatigueData(updatedData);
    }
  };

  const getMuscleFatiguePercentage = (muscleGroup: string): number => {
    const muscle = fatigueData[muscleGroup];
    if (!muscle) {
      return 0; // Default to no fatigue if muscle not found
    }

    // Return inverse of fatigue (0% fatigue = 100% recovered)
    return Math.max(0, 100 - muscle.fatiguePercentage);
  };

  const addMuscleFatigue = (
    muscleGroups: string[],
    fatigueAmount: number = 30
  ) => {
    const now = new Date().toISOString();
    const updatedData = { ...fatigueData };

    muscleGroups.forEach((muscle) => {
      if (updatedData[muscle]) {
        updatedData[muscle] = {
          fatiguePercentage: Math.min(
            MAX_FATIGUE,
            updatedData[muscle].fatiguePercentage + fatigueAmount
          ),
          lastWorkedDate: now,
        };
      } else {
        // Create new entry if muscle doesn't exist
        updatedData[muscle] = {
          fatiguePercentage: Math.min(MAX_FATIGUE, fatigueAmount),
          lastWorkedDate: now,
        };
      }
    });

    setFatigueData(updatedData);
    saveFatigueData(updatedData);
  };

  const recoverMuscleFatigue = (
    muscleGroups?: string[],
    recoveryAmount: number = 20
  ) => {
    const updatedData = { ...fatigueData };
    const musclesToRecover = muscleGroups || Object.keys(updatedData);

    musclesToRecover.forEach((muscle) => {
      if (updatedData[muscle]) {
        updatedData[muscle] = {
          ...updatedData[muscle],
          fatiguePercentage: Math.max(
            MIN_FATIGUE,
            updatedData[muscle].fatiguePercentage - recoveryAmount
          ),
        };
      }
    });

    setFatigueData(updatedData);
    saveFatigueData(updatedData);
  };

  const resetAllMuscles = () => {
    const defaultData = getDefaultFatigueData();
    setFatigueData(defaultData);
    saveFatigueData(defaultData);
  };

  const getAllMuscleStates = () => {
    return Object.entries(fatigueData).map(([muscle, data]) => ({
      muscle,
      fatiguePercentage: data.fatiguePercentage,
      recoveryPercentage: getMuscleFatiguePercentage(muscle),
      lastWorkedDate: data.lastWorkedDate,
    }));
  };

  const processWorkoutFatigue = async (
    exerciseIds: string[],
    exerciseNames: string[],
    totalSets: number,
    duration: number
  ) => {
    // Map exercises to muscle groups
    const muscleGroupsWorked = new Set<string>();

    exerciseNames.forEach((exerciseName) => {
      // Convert exercise names to muscle groups based on common patterns
      const name = exerciseName.toLowerCase();

      if (
        name.includes('chest') ||
        name.includes('bench') ||
        name.includes('push') ||
        name.includes('pec')
      ) {
        muscleGroupsWorked.add('chest');
      }
      if (
        name.includes('back') ||
        name.includes('row') ||
        name.includes('pull') ||
        name.includes('lat')
      ) {
        muscleGroupsWorked.add('back');
      }
      if (
        name.includes('bicep') ||
        (name.includes('curl') && !name.includes('leg'))
      ) {
        muscleGroupsWorked.add('biceps');
      }
      if (
        name.includes('tricep') ||
        name.includes('press') ||
        name.includes('dip')
      ) {
        muscleGroupsWorked.add('triceps');
      }
      if (
        name.includes('shoulder') ||
        name.includes('delt') ||
        (name.includes('press') && !name.includes('bench'))
      ) {
        muscleGroupsWorked.add('shoulders');
      }
      if (name.includes('trap') || name.includes('shrug')) {
        muscleGroupsWorked.add('traps');
      }
      if (name.includes('forearm') || name.includes('wrist')) {
        muscleGroupsWorked.add('forearms');
      }
      if (
        name.includes('ab') ||
        name.includes('crunch') ||
        name.includes('plank') ||
        name.includes('core')
      ) {
        muscleGroupsWorked.add('abs');
      }
      if (
        name.includes('lower back') ||
        name.includes('deadlift') ||
        name.includes('hyperextension')
      ) {
        muscleGroupsWorked.add('lower-back');
      }
      if (
        name.includes('quad') ||
        name.includes('squat') ||
        name.includes('lunge') ||
        name.includes('leg press')
      ) {
        muscleGroupsWorked.add('quads');
        muscleGroupsWorked.add('legs');
      }
      if (
        name.includes('hamstring') ||
        name.includes('leg curl') ||
        name.includes('deadlift')
      ) {
        muscleGroupsWorked.add('hamstrings');
        muscleGroupsWorked.add('legs');
      }
      if (
        name.includes('glute') ||
        name.includes('hip') ||
        name.includes('squat')
      ) {
        muscleGroupsWorked.add('glutes');
      }
      if (name.includes('calf') || name.includes('heel')) {
        muscleGroupsWorked.add('calves');
        muscleGroupsWorked.add('legs');
      }
      if (name.includes('adductor') || name.includes('inner thigh')) {
        muscleGroupsWorked.add('adductors');
        muscleGroupsWorked.add('legs');
      }
      if (name.includes('abductor') || name.includes('outer thigh')) {
        muscleGroupsWorked.add('abductors');
        muscleGroupsWorked.add('legs');
      }
    });

    // Calculate fatigue amount based on workout intensity
    // Base fatigue on sets and duration
    const baseFatigue = Math.min(50, totalSets * 3 + Math.floor(duration / 2));
    const fatigueAmount = Math.max(20, baseFatigue); // Minimum 20%, maximum based on workout

    // Add fatigue to all worked muscle groups
    if (muscleGroupsWorked.size > 0) {
      addMuscleFatigue(Array.from(muscleGroupsWorked), fatigueAmount);
    }

    console.log('Processed workout fatigue:', {
      muscleGroupsWorked: Array.from(muscleGroupsWorked),
      fatigueAmount,
      totalSets,
      duration,
    });
  };

  return {
    getMuscleFatiguePercentage,
    addMuscleFatigue,
    recoverMuscleFatigue,
    resetAllMuscles,
    getAllMuscleStates,
    processWorkoutFatigue,
    isLoaded,
  };
}
