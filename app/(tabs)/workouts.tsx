import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Zap,
  Plus,
  Play,
  Settings,
  Sparkles,
  Target,
  User,
  Dumbbell,
  MoreHorizontal,
  Activity,
  Flame,
  Heart,
  ShieldCheck,
  Zap as Lightning,
  MessageCircle,
  X,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
  useMuscleFatigue,
  type MuscleGroup as MuscleGroupType,
} from '@/hooks/useMuscleFatigue';
import { geminiWorkoutGenerator, GeneratedWorkout } from '@/lib/gemini';
import BoltChat from '@/components/BoltChat';
import ExerciseInstructions from '@/components/ExerciseInstructions';
import ExerciseCard from '@/components/ExerciseCard';
import { exerciseLibrary } from '@/data/exercises';

interface MuscleGroupDisplay {
  id: string;
  name: string;
  emoji: string;
  icon: any;
  percentage: number;
  color: string;
  description: string;
  imageUrl: any;
}

export default function WorkoutsScreen() {
  const router = useRouter();
  const { profile, loadOnboardingData, user } = useAuth();
  const { getMuscleFatiguePercentage, recoverMuscleFatigue } =
    useMuscleFatigue();
  const [selectedMuscles, setSelectedMuscles] = useState<string[]>([]);
  const [generatedWorkout, setGeneratedWorkout] =
    useState<GeneratedWorkout | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [onboardingData, setOnboardingData] = useState<any>(null);
  const [isLoadingOnboarding, setIsLoadingOnboarding] = useState(true);
  const [onboardingError, setOnboardingError] = useState<string | null>(null);
  const [showBoltChat, setShowBoltChat] = useState(false);
  const loadingRef = useRef(false);

  // New state for exercise instructions modal
  const [showExerciseInstructions, setShowExerciseInstructions] =
    useState(false);
  const [selectedExercise, setSelectedExercise] = useState<any>(null);
  const [showMuscleSelectionModal, setShowMuscleSelectionModal] =
    useState(false);

  // Create muscle groups with real-time fatigue percentages
  const getMuscleGroups = (): MuscleGroupDisplay[] => [
    {
      id: 'chest',
      name: 'Chest',
      emoji: '🏋️‍♂️',
      icon: Heart,
      percentage: getMuscleFatiguePercentage('chest'),
      color: '#6B46C1',
      description: 'Pectorals',
      imageUrl: require('@/assets/images/muscle-groups/abs.png'), // Using abs for chest temporarily
    },
    {
      id: 'back',
      name: 'Back',
      emoji: '🏋️‍♀️',
      icon: ShieldCheck,
      percentage: getMuscleFatiguePercentage('back'),
      color: '#8B5CF6',
      description: 'Lats & Rhomboids',
      imageUrl: require('@/assets/images/muscle-groups/lower-back.png'), // Using lower-back for back
    },
    {
      id: 'biceps',
      name: 'Biceps',
      emoji: '💪',
      icon: Lightning,
      percentage: getMuscleFatiguePercentage('biceps'),
      color: '#A78BFA',
      description: 'Biceps Brachii',
      imageUrl: require('@/assets/images/muscle-groups/biceps.png'),
    },
    {
      id: 'triceps',
      name: 'Triceps',
      emoji: '🔥',
      icon: Zap,
      percentage: getMuscleFatiguePercentage('triceps'),
      color: '#7C3AED',
      description: 'Triceps Brachii',
      imageUrl: require('@/assets/images/muscle-groups/triceps.png'),
    },
    {
      id: 'shoulders',
      name: 'Shoulders',
      emoji: '🤸‍♀️',
      icon: Activity,
      percentage: getMuscleFatiguePercentage('shoulders'),
      color: '#7E22CE',
      description: 'Deltoids',
      imageUrl: require('@/assets/images/muscle-groups/traps.png'), // Using traps for shoulders temporarily
    },
    {
      id: 'traps',
      name: 'Traps',
      emoji: '⛰️',
      icon: Target,
      percentage: getMuscleFatiguePercentage('traps'),
      color: '#9333EA',
      description: 'Trapezius',
      imageUrl: require('@/assets/images/muscle-groups/traps.png'),
    },
    {
      id: 'forearms',
      name: 'Forearms',
      emoji: '🤲',
      icon: Activity,
      percentage: getMuscleFatiguePercentage('forearms'),
      color: '#C084FC',
      description: 'Forearm Muscles',
      imageUrl: require('@/assets/images/muscle-groups/forearms.png'),
    },
    {
      id: 'abs',
      name: 'Abs',
      emoji: '🔥',
      icon: Flame,
      percentage: getMuscleFatiguePercentage('abs'),
      color: '#F59E0B',
      description: 'Abdominals',
      imageUrl: require('@/assets/images/muscle-groups/abs.png'),
    },
    {
      id: 'lower-back',
      name: 'Lower Back',
      emoji: '🏋️',
      icon: ShieldCheck,
      percentage: getMuscleFatiguePercentage('lower-back'),
      color: '#EF4444',
      description: 'Erector Spinae',
      imageUrl: require('@/assets/images/muscle-groups/lower-back.png'),
    },
    {
      id: 'quads',
      name: 'Quads',
      emoji: '🦵',
      icon: Zap,
      percentage: getMuscleFatiguePercentage('quads'),
      color: '#3B82F6',
      description: 'Quadriceps',
      imageUrl: require('@/assets/images/muscle-groups/quads.png'),
    },
    {
      id: 'hamstrings',
      name: 'Hamstrings',
      emoji: '🦵',
      icon: Activity,
      percentage: getMuscleFatiguePercentage('hamstrings'),
      color: '#2563EB',
      description: 'Hamstring Muscles',
      imageUrl: require('@/assets/images/muscle-groups/hamstrings.png'),
    },
    {
      id: 'glutes',
      name: 'Glutes',
      emoji: '🍑',
      icon: Target,
      percentage: getMuscleFatiguePercentage('glutes'),
      color: '#1D4ED8',
      description: 'Glute Max & Med',
      imageUrl: require('@/assets/images/muscle-groups/glutes.png'),
    },
    {
      id: 'calves',
      name: 'Calves',
      emoji: '🦵',
      icon: Lightning,
      percentage: getMuscleFatiguePercentage('calves'),
      color: '#1E40AF',
      description: 'Calf Muscles',
      imageUrl: require('@/assets/images/muscle-groups/calves.png'),
    },
    {
      id: 'abductors',
      name: 'Abductors',
      emoji: '🦵',
      icon: Activity,
      percentage: getMuscleFatiguePercentage('abductors'),
      color: '#10B981',
      description: 'Hip Abductors',
      imageUrl: require('@/assets/images/muscle-groups/abductors.png'),
    },
    {
      id: 'adductors',
      name: 'Adductors',
      emoji: '🦵',
      icon: Target,
      percentage: getMuscleFatiguePercentage('adductors'),
      color: '#059669',
      description: 'Hip Adductors',
      imageUrl: require('@/assets/images/muscle-groups/adductors.png'),
    },
  ];

  const muscleGroups = getMuscleGroups();

  // Mock exercises for demo (matching the Exercise interface)
  const mockExercises = [
    {
      id: 'barbell-bench-press',
      name: 'Barbell Bench Press',
      muscleGroup: 'Chest',
      equipment: 'Barbell',
      description: 'Classic chest exercise using barbell',
      category: 'strength' as const,
      difficulty: 'intermediate' as const,
      targetMuscles: ['Pectorals', 'Triceps', 'Anterior Deltoids'],
      images: {
        demonstration: '/assets/images/exercises/bench-press-demo.jpg',
        thumbnail: '/assets/images/exercises/bench-press-thumb.jpg',
        startPosition: '/assets/images/exercises/bench-press-start.jpg',
        endPosition: '/assets/images/exercises/bench-press-end.jpg',
      },
      instructions: {
        setup: [
          'Lie flat on the bench with your eyes under the barbell',
          'Grip the bar with hands slightly wider than shoulder-width',
        ],
        execution: [
          'Lower the bar slowly to your chest',
          'Press the bar back up to starting position',
        ],
        tips: ['Keep your core tight throughout the movement'],
        commonMistakes: ['Flaring elbows too wide'],
      },
      sets: 3,
      reps: 5,
      weight: 125,
    },
    {
      id: 'dumbbell-bent-over-row',
      name: 'Dumbbell Bent Over Row',
      muscleGroup: 'Back',
      equipment: 'Dumbbell',
      description: 'Effective back exercise using dumbbells',
      category: 'strength' as const,
      difficulty: 'intermediate' as const,
      targetMuscles: ['Latissimus Dorsi', 'Rhomboids', 'Rear Deltoids'],
      images: {
        demonstration: '/assets/images/exercises/bent-over-row-demo.jpg',
        thumbnail: '/assets/images/exercises/bent-over-row-thumb.jpg',
      },
      instructions: {
        setup: [
          'Hold dumbbells with feet shoulder-width apart',
          'Hinge at hips and bend forward',
        ],
        execution: ['Pull dumbbells to your sides', 'Lower with control'],
        tips: ['Keep your back straight'],
        commonMistakes: ['Using too much momentum'],
      },
      sets: 3,
      reps: 10,
      weight: 45,
    },
    {
      id: 'barbell-curl',
      name: 'Barbell Curl',
      muscleGroup: 'Arms',
      equipment: 'Barbell',
      description: 'Classic bicep exercise',
      category: 'strength' as const,
      difficulty: 'beginner' as const,
      targetMuscles: ['Biceps', 'Brachialis'],
      images: {
        demonstration: '/assets/images/exercises/barbell-curl-demo.jpg',
        thumbnail: '/assets/images/exercises/barbell-curl-thumb.jpg',
      },
      instructions: {
        setup: [
          'Stand with feet shoulder-width apart',
          'Hold barbell with underhand grip',
        ],
        execution: [
          'Curl the weight up toward your chest',
          'Lower slowly to starting position',
        ],
        tips: ['Keep your elbows at your sides'],
        commonMistakes: ['Swinging the weight'],
      },
      sets: 4,
      reps: 12,
      weight: 25,
    },
    {
      id: 'dumbbell-fly',
      name: 'Dumbbell Fly',
      muscleGroup: 'Chest',
      equipment: 'Dumbbell',
      description: 'Isolation exercise for chest muscles',
      category: 'strength' as const,
      difficulty: 'intermediate' as const,
      targetMuscles: ['Pectorals', 'Anterior Deltoids'],
      images: {
        demonstration: '/assets/images/exercises/dumbbell-fly-demo.jpg',
        thumbnail: '/assets/images/exercises/dumbbell-fly-thumb.jpg',
      },
      instructions: {
        setup: [
          'Lie on bench with dumbbells in each hand',
          'Extend arms above chest',
        ],
        execution: [
          'Lower weights in an arc motion',
          'Squeeze chest muscles to bring weights back up',
        ],
        tips: ['Maintain slight bend in elbows'],
        commonMistakes: ['Going too heavy'],
      },
      sets: 3,
      reps: 12,
      weight: 20,
    },
  ];

  useEffect(() => {
    if (user) {
      loadUserData();
    } else {
      setIsLoadingOnboarding(false);
      setOnboardingData(null);
    }
  }, [user, loadUserData]);

  useEffect(() => {
    // Recover muscle fatigue over time
    recoverMuscleFatigue();
    // Set some default selected muscles and mock workout for demo
    setSelectedMuscles(['chest', 'back', 'biceps', 'shoulders']);
    setGeneratedWorkout({
      id: 'demo-workout',
      name: 'Upper Body Strength',
      exercises: mockExercises,
      estimatedDuration: 45,
      difficulty: 'intermediate',
      targetMuscles: ['chest', 'back', 'biceps', 'shoulders'],
      notes: 'Focus on form and controlled movements',
    });
  }, []); // Run once on mount

  const loadUserData = useCallback(async () => {
    if (!user) {
      console.log('No user found, skipping onboarding data load');
      setIsLoadingOnboarding(false);
      return;
    }

    // Prevent multiple simultaneous loads
    if (loadingRef.current) {
      console.log('Already loading onboarding data, skipping...');
      return;
    }

    loadingRef.current = true;
    setIsLoadingOnboarding(true);
    setOnboardingError(null);

    try {
      console.log('Loading onboarding data for user:', user.id);
      const { data, error } = await loadOnboardingData();

      if (error) {
        console.error('Error loading onboarding data:', error);
        setOnboardingError(error.message || 'Failed to load user preferences');
        setOnboardingData(null);
      } else if (data) {
        console.log('Onboarding data loaded successfully:', data);
        setOnboardingData(data);
        setOnboardingError(null);
      } else {
        console.log(
          'No onboarding data found for user - user may not have completed onboarding'
        );
        setOnboardingData(null);
        setOnboardingError(
          'No user preferences found. Please complete onboarding.'
        );
      }
    } catch (error) {
      console.error('Exception while loading onboarding data:', error);
      setOnboardingError('Failed to load user preferences');
      setOnboardingData(null);
    } finally {
      setIsLoadingOnboarding(false);
      loadingRef.current = false;
    }
  }, [user, loadOnboardingData]);

  const toggleMuscleSelection = (muscleId: string) => {
    setSelectedMuscles((prev) => {
      const isRemoving = prev.includes(muscleId);
      const newSelection = isRemoving
        ? prev.filter((id) => id !== muscleId)
        : [...prev, muscleId];

      return newSelection;
    });
  };

  const generateWorkoutWithGemini = async () => {
    if (selectedMuscles.length === 0) {
      Alert.alert(
        'Select Muscles',
        'Please select at least one muscle group to target.'
      );
      return;
    }

    setIsGenerating(true);

    try {
      // Check if we're still loading onboarding data
      if (isLoadingOnboarding) {
        console.log('Still loading onboarding data, waiting...');
        // Wait a moment for onboarding data to load
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      // Log the current state of onboarding data
      console.log('=== ONBOARDING DATA DEBUG ===');
      console.log('User:', user?.id);
      console.log('Onboarding data:', onboardingData);
      console.log('Loading state:', isLoadingOnboarding);
      console.log('Error state:', onboardingError);
      console.log('==============================');

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

      // Enhanced user context with all onboarding data for highly personalized workouts
      const userContext = {
        // Basic info
        fitnessGoals: onboardingData?.fitness_goals || ['general-fitness'],
        experienceLevel: onboardingData?.experience_level || 'beginner',
        equipment: onboardingData?.equipment || ['none'],
        targetMuscles: selectedMuscles,
        workoutFrequency: onboardingData?.workout_frequency || '2-3',

        // Enhanced personalization data
        timeAvailability: onboardingData?.time_availability || 'flexible',
        limitations: onboardingData?.limitations || [],
        limitationsOther: onboardingData?.limitations_other,
        motivationStyle: onboardingData?.motivation_style || [],
        workoutStyle: onboardingData?.workout_style || [],

        // Workout duration
        estimatedDuration: getWorkoutDuration(),
      };

      console.log(
        'Generating personalized workout with complete user profile:',
        userContext
      );

      // Show user if we're using defaults vs their actual preferences
      if (!onboardingData) {
        console.log(
          '⚠️ Using default preferences - no onboarding data available'
        );
        Alert.alert(
          'Using Default Settings',
          "We're using default workout settings. Complete your profile setup for more personalized workouts.",
          [{ text: 'OK' }]
        );
      } else {
        console.log('✅ Using personalized preferences from onboarding data');
      }

      const generatedWorkout = await geminiWorkoutGenerator.generateWorkout(
        userContext
      );

      const workoutWithMuscles = {
        ...generatedWorkout,
        targetMuscles: selectedMuscles.map((muscleId) => {
          const muscle = muscleGroups.find((m) => m.id === muscleId);
          return (
            muscle || {
              id: muscleId,
              name: muscleId,
              percentage: 100,
              color: '#6B46C1',
            }
          );
        }),
      };

      setGeneratedWorkout(workoutWithMuscles);
    } catch (error) {
      console.error('Error generating workout:', error);
      Alert.alert('Error', 'Failed to generate workout. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const startWorkout = (workout: GeneratedWorkout) => {
    router.push({
      pathname: '/workout/active',
      params: {
        workoutData: JSON.stringify(workout),
      },
    });
  };

  const createCustomWorkout = () => {
    router.push('/workout/custom');
  };

  const handleWorkoutModified = (modifiedWorkout: GeneratedWorkout) => {
    setGeneratedWorkout(modifiedWorkout);
    console.log('Workout modified by Bolt:', modifiedWorkout);
  };

  const findAlternativeExercises = (
    targetMuscleGroup: string,
    currentExerciseId: string
  ) => {
    return exerciseLibrary.filter(
      (exercise) =>
        exercise.muscleGroup.toLowerCase() ===
          targetMuscleGroup.toLowerCase() && exercise.id !== currentExerciseId
    );
  };

  const replaceExerciseWithAlternative = (
    exerciseToReplace: any,
    newExercise: any
  ) => {
    if (!generatedWorkout) return;

    const updatedExercises = generatedWorkout.exercises.map((exercise) =>
      exercise.id === exerciseToReplace.id ? newExercise : exercise
    );

    const updatedWorkout = {
      ...generatedWorkout,
      exercises: updatedExercises,
    };

    setGeneratedWorkout(updatedWorkout);
  };

  const handleShowExerciseDetails = (exercise: any) => {
    setSelectedExercise(exercise);
    setShowExerciseInstructions(true);
  };

  const handleReplaceExercise = (exercise: any) => {
    const alternatives = findAlternativeExercises(
      exercise.muscleGroup,
      exercise.id
    );

    if (alternatives.length === 0) {
      Alert.alert(
        'No Alternatives',
        `No alternative exercises found for ${exercise.muscleGroup}.`,
        [{ text: 'OK' }]
      );
      return;
    }

    const alternativeOptions = alternatives.slice(0, 5).map((alt, index) => ({
      text: alt.name,
      onPress: () => {
        replaceExerciseWithAlternative(exercise, alt);
        Alert.alert(
          'Exercise Replaced',
          `${exercise.name} has been replaced with ${alt.name}`,
          [{ text: 'Great!' }]
        );
      },
    }));

    alternativeOptions.push({ text: 'Cancel', style: 'cancel' });

    Alert.alert(
      `Replace ${exercise.name}`,
      `Choose an alternative exercise for ${exercise.muscleGroup}:`,
      alternativeOptions
    );
  };

  const handleStartExerciseFromInstructions = (exercise: any) => {
    // Convert to the format expected by the active workout screen
    const workoutWithSingleExercise = {
      id: `single-${exercise.id}`,
      name: `${exercise.name} Workout`,
      exercises: [exercise],
      estimatedDuration: 15,
      difficulty: exercise.difficulty || 'intermediate',
      targetMuscles: [exercise.muscleGroup],
      notes: `Single exercise workout: ${exercise.name}`,
    };

    router.push({
      pathname: '/workout/active',
      params: {
        workoutData: JSON.stringify(workoutWithSingleExercise),
      },
    });
  };

  const renderMuscleGroup = (muscle: MuscleGroupDisplay, index: number) => (
    <TouchableOpacity
      key={muscle.id}
      style={[
        styles.muscleCard,
        selectedMuscles.includes(muscle.id) && styles.selectedMuscle,
      ]}
      onPress={() => toggleMuscleSelection(muscle.id)}
    >
      <LinearGradient
        colors={
          selectedMuscles.includes(muscle.id)
            ? [muscle.color, muscle.color + 'DD']
            : ['#2A2A3E', '#1F1F2E']
        }
        style={styles.muscleCardGradient}
      >
        {/* Body part visualization */}
        <View style={styles.muscleImageContainer}>
          <Image
            source={muscle.imageUrl}
            style={styles.muscleImage}
            resizeMode="contain"
          />
          <View style={styles.muscleOverlay}>
            <View
              style={[
                styles.muscleHighlight,
                { backgroundColor: muscle.color },
              ]}
            />
          </View>
        </View>

        {/* Muscle name */}
        <Text style={styles.muscleName}>{muscle.name}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderTargetMuscle = (muscle: MuscleGroupDisplay, index: number) => (
    <View key={muscle.id} style={styles.targetMuscleItem}>
      <View style={styles.targetMuscleContainer}>
        <View style={styles.targetMuscleImageContainer}>
          <Image
            source={muscle.imageUrl}
            style={styles.targetMuscleImage}
            resizeMode="contain"
          />
          <View style={styles.targetMuscleOverlay}>
            <View
              style={[
                styles.targetMuscleHighlight,
                { backgroundColor: muscle.color },
              ]}
            />
          </View>
          <View style={styles.targetMusclePercentage}>
            <Text style={styles.targetMusclePercentageText}>
              {muscle.percentage}%
            </Text>
          </View>
        </View>
        <Text style={styles.targetMuscleName}>{muscle.name}</Text>
      </View>
    </View>
  );

  const renderExerciseCard = (exercise: any, index: number) => {
    // Find the full exercise data from the library to get images and instructions
    const fullExerciseData =
      exerciseLibrary.find((ex) => ex.id === exercise.id) || exercise;

    return (
      <ExerciseCard
        key={exercise.id}
        exercise={fullExerciseData}
        onStart={(ex) => handleStartExerciseFromInstructions(ex)}
        onShowDetails={handleShowExerciseDetails}
        showFullDetails={true}
      />
    );
  };

  return (
    <>
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#0F0F23', '#1A1A2E', '#0F0F23']}
          style={styles.background}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Workouts</Text>
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollViewContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Target Muscles Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Target muscles</Text>
                <TouchableOpacity
                  style={styles.addMuscleButton}
                  onPress={() => setShowMuscleSelectionModal(true)}
                >
                  <Plus size={20} color="#6B46C1" />
                </TouchableOpacity>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.targetMuscleScroll}
                contentContainerStyle={styles.targetMuscleScrollContent}
              >
                {selectedMuscles.length > 0
                  ? muscleGroups
                      .filter((muscle) => selectedMuscles.includes(muscle.id))
                      .map(renderTargetMuscle)
                  : muscleGroups.slice(0, 6).map(renderTargetMuscle)}
              </ScrollView>
            </View>

            {/* Exercises Section */}
            {generatedWorkout && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>
                    {generatedWorkout.exercises.length} exercises
                  </Text>
                  <TouchableOpacity
                    style={styles.startWorkoutButton}
                    onPress={() => startWorkout(generatedWorkout)}
                  >
                    <LinearGradient
                      colors={['#6B46C1', '#8B5CF6']}
                      style={styles.startWorkoutGradient}
                    >
                      <Play size={16} color="#FFFFFF" />
                      <Text style={styles.startWorkoutText}>Start Workout</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>

                {generatedWorkout.exercises.map(renderExerciseCard)}
              </View>
            )}
          </ScrollView>

          {/* Loading Overlay */}
          {isGenerating && (
            <View style={styles.loadingOverlay}>
              <LinearGradient
                colors={['#0F0F23', '#1A1A2E']}
                style={styles.loadingBackground}
              >
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#6B46C1" />
                  <Text style={styles.loadingTitle}>
                    Generating Your Workout
                  </Text>
                  <Text style={styles.loadingSubtitle}>
                    Bolt is creating a personalized workout for your selected
                    muscle groups...
                  </Text>
                  <View style={styles.loadingSteps}>
                    <Text style={styles.loadingStep}>
                      ⚡ Analyzing your preferences
                    </Text>
                    <Text style={styles.loadingStep}>
                      🎯 Selecting optimal exercises
                    </Text>
                    <Text style={styles.loadingStep}>
                      🔥 Customizing sets and reps
                    </Text>
                  </View>
                </View>
              </LinearGradient>
            </View>
          )}

          {/* Muscle Selection Modal */}
          <Modal
            visible={showMuscleSelectionModal}
            animationType="slide"
            presentationStyle="pageSheet"
          >
            <SafeAreaView style={styles.modalContainer}>
              <LinearGradient
                colors={['#0F0F23', '#1A1A2E']}
                style={styles.modalBackground}
              >
                {/* Modal Header */}
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Select Target Muscles</Text>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setShowMuscleSelectionModal(false)}
                  >
                    <X size={24} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>

                {/* Muscle Grid */}
                <ScrollView
                  style={styles.modalScrollView}
                  showsVerticalScrollIndicator={false}
                >
                  <View style={styles.modalMuscleGrid}>
                    {muscleGroups.map((muscle, index) => (
                      <TouchableOpacity
                        key={muscle.id}
                        style={[
                          styles.modalMuscleItem,
                          selectedMuscles.includes(muscle.id) &&
                            styles.selectedModalMuscle,
                        ]}
                        onPress={() => toggleMuscleSelection(muscle.id)}
                      >
                        <View style={styles.targetMuscleContainer}>
                          <View
                            style={[
                              styles.targetMuscleImageContainer,
                              selectedMuscles.includes(muscle.id) && {
                                backgroundColor: muscle.color + '40',
                                borderColor: muscle.color,
                                borderWidth: 2,
                              },
                            ]}
                          >
                            <Image
                              source={muscle.imageUrl}
                              style={styles.targetMuscleImage}
                              resizeMode="contain"
                            />
                            <View style={styles.targetMuscleOverlay}>
                              <View
                                style={[
                                  styles.targetMuscleHighlight,
                                  {
                                    backgroundColor: muscle.color,
                                    opacity: selectedMuscles.includes(muscle.id)
                                      ? 0.5
                                      : 0.3,
                                  },
                                ]}
                              />
                            </View>
                            <View style={styles.targetMusclePercentage}>
                              <Text style={styles.targetMusclePercentageText}>
                                {muscle.percentage}%
                              </Text>
                            </View>
                            {selectedMuscles.includes(muscle.id) && (
                              <View style={styles.selectedCheckmark}>
                                <Text style={styles.checkmarkText}>✓</Text>
                              </View>
                            )}
                          </View>
                          <Text style={styles.targetMuscleName}>
                            {muscle.name}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>

                {/* Generate Workout Button */}
                <View style={styles.modalFooter}>
                  <TouchableOpacity
                    style={styles.generateWorkoutButton}
                    onPress={() => {
                      setShowMuscleSelectionModal(false);
                      generateWorkoutWithGemini();
                    }}
                    disabled={selectedMuscles.length === 0}
                  >
                    <LinearGradient
                      colors={
                        selectedMuscles.length > 0
                          ? ['#6B46C1', '#8B5CF6']
                          : ['#374151', '#4B5563']
                      }
                      style={styles.generateWorkoutGradient}
                    >
                      <Sparkles size={20} color="#FFFFFF" />
                      <Text style={styles.generateWorkoutText}>
                        {selectedMuscles.length > 0
                          ? `Generate Workout (${selectedMuscles.length} muscles)`
                          : 'Select muscles first'}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </SafeAreaView>
          </Modal>

          {/* Bolt Chat Modal */}
          <BoltChat
            visible={showBoltChat}
            onClose={() => setShowBoltChat(false)}
            currentWorkout={generatedWorkout}
            onWorkoutModified={handleWorkoutModified}
          />

          {/* Exercise Instructions Modal */}
          {selectedExercise && (
            <ExerciseInstructions
              exercise={selectedExercise}
              visible={showExerciseInstructions}
              onClose={() => {
                setShowExerciseInstructions(false);
                setSelectedExercise(null);
              }}
              onStartExercise={handleStartExerciseFromInstructions}
              onReplace={handleReplaceExercise}
            />
          )}
        </LinearGradient>
      </SafeAreaView>

      {/* Floating Chat with Bolt Button - Outside SafeAreaView */}
      <TouchableOpacity
        style={styles.floatingChatButton}
        onPress={() => setShowBoltChat(true)}
      >
        <LinearGradient
          colors={['#6B46C1', '#8B5CF6']}
          style={styles.floatingChatGradient}
        >
          <MessageCircle size={24} color="#FFFFFF" />
        </LinearGradient>
      </TouchableOpacity>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F23',
  },
  background: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A2E',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1A1A2E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 100,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  addIconButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#1A1A2E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  showAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#6B46C1',
  },
  showAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  addMuscleButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1A1A2E',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#6B46C1',
  },
  muscleScroll: {
    marginRight: -20,
  },
  muscleScrollContent: {
    paddingRight: 20,
  },
  muscleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  saveMusclesButton: {
    borderRadius: 12,
    marginTop: 10,
  },
  saveMusclesGradient: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveMusclesText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  saveSelectionButton: {
    borderRadius: 8,
  },
  saveSelectionGradient: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveSelectionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  muscleCard: {
    width: 100,
    height: 120,
    marginRight: 16,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  selectedMuscle: {
    transform: [{ scale: 1.02 }],
  },
  muscleCardGradient: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  muscleImageContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    backgroundColor: '#FFFFFF15',
    overflow: 'hidden',
  },
  muscleImage: {
    width: 40,
    height: 40,
  },
  muscleOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 25,
    overflow: 'hidden',
  },
  muscleHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.3,
    borderRadius: 25,
  },

  muscleName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  exerciseCard: {
    marginBottom: 16,
  },
  exerciseGradient: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2A2A3E',
  },
  exerciseContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exerciseImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#FFFFFF10',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    position: 'relative',
  },
  exerciseImage: {
    fontSize: 24,
  },
  muscleGroupIndicator: {
    position: 'absolute',
    bottom: 4,
    right: 4,
  },
  muscleGroupDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  exerciseDetails: {
    fontSize: 14,
    color: '#94A3B8',
  },
  exerciseOptions: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1A1A2E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  generateButton: {
    borderRadius: 16,
    marginTop: 20,
  },
  generateGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
  },
  generateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  floatingChatButton: {
    position: 'absolute',
    bottom: 5,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    elevation: 10,
    shadowColor: '#6B46C1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    zIndex: 1000,
  },
  floatingChatGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noMusclesSelected: {
    width: 200,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#374151',
  },
  noMusclesText: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    fontWeight: '500',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  loadingBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 15, 35, 0.95)',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
    backgroundColor: '#1A1A2E',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#6B46C1',
    shadowColor: '#6B46C1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  loadingTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 20,
    marginBottom: 12,
    textAlign: 'center',
  },
  loadingSubtitle: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  loadingSteps: {
    alignItems: 'flex-start',
    gap: 8,
  },
  loadingStep: {
    fontSize: 14,
    color: '#E2E8F0',
    fontWeight: '500',
  },
  targetMuscleScroll: {
    marginRight: -20,
  },
  targetMuscleScrollContent: {
    paddingRight: 20,
  },
  targetMuscleItem: {
    marginRight: 16,
    alignItems: 'center',
  },
  targetMuscleContainer: {
    alignItems: 'center',
  },
  targetMuscleImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    backgroundColor: '#2A2A3E',
    marginBottom: 8,
  },
  targetMuscleImage: {
    width: 60,
    height: 60,
  },
  targetMuscleOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 12,
    overflow: 'hidden',
  },
  targetMuscleHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.3,
    borderRadius: 12,
  },
  targetMusclePercentage: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  targetMusclePercentageText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  targetMuscleName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    maxWidth: 80,
  },
  expandedMuscleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  expandedMuscleItem: {
    width: '22%', // 4 items per row with spacing
    alignItems: 'center',
    marginBottom: 16,
  },
  selectedExpandedMuscle: {
    transform: [{ scale: 1.05 }],
  },
  selectedCheckmark: {
    position: 'absolute',
    top: 4,
    left: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#0F0F23',
  },
  modalBackground: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A2E',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1A1A2E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalScrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  modalMuscleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingVertical: 20,
    gap: 16,
  },
  modalMuscleItem: {
    width: '22%', // 4 items per row
    alignItems: 'center',
    marginBottom: 20,
  },
  selectedModalMuscle: {
    transform: [{ scale: 1.05 }],
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#1A1A2E',
  },
  generateWorkoutButton: {
    borderRadius: 16,
  },
  generateWorkoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    gap: 12,
  },
  generateWorkoutText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  startWorkoutButton: {
    borderRadius: 12,
  },
  startWorkoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  startWorkoutText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
