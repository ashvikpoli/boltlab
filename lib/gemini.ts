import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';

if (!API_KEY) {
  console.warn('Gemini API key not found in environment variables');
}

const genAI = new GoogleGenerativeAI(API_KEY);

// Exercise database for AI to reference
const EXERCISE_DATABASE = [
  // Strength exercises
  {
    name: 'Push_ups',
    category: 'strength',
    equipment: ['bodyweight'],
    muscleGroups: ['chest', 'triceps', 'shoulders'],
  },
  {
    name: 'Squats',
    category: 'strength',
    equipment: ['bodyweight'],
    muscleGroups: ['quadriceps', 'glutes', 'calves'],
  },
  {
    name: 'Lunges',
    category: 'strength',
    equipment: ['bodyweight'],
    muscleGroups: ['quadriceps', 'glutes', 'hamstrings'],
  },
  {
    name: 'Plank',
    category: 'strength',
    equipment: ['bodyweight'],
    muscleGroups: ['core', 'shoulders'],
  },
  {
    name: 'Burpees',
    category: 'cardio',
    equipment: ['bodyweight'],
    muscleGroups: ['full_body'],
  },
  {
    name: 'Mountain_climbers',
    category: 'cardio',
    equipment: ['bodyweight'],
    muscleGroups: ['core', 'legs', 'shoulders'],
  },
  {
    name: 'Jumping_jacks',
    category: 'cardio',
    equipment: ['bodyweight'],
    muscleGroups: ['full_body'],
  },
  {
    name: 'Barbell_bench_press',
    category: 'strength',
    equipment: ['barbell', 'bench'],
    muscleGroups: ['chest', 'triceps', 'shoulders'],
  },
  {
    name: 'Barbell_squat',
    category: 'strength',
    equipment: ['barbell', 'squat_rack'],
    muscleGroups: ['quadriceps', 'glutes', 'hamstrings'],
  },
  {
    name: 'Deadlift',
    category: 'strength',
    equipment: ['barbell'],
    muscleGroups: ['hamstrings', 'glutes', 'back', 'traps'],
  },
  {
    name: 'Pull_ups',
    category: 'strength',
    equipment: ['pull_up_bar'],
    muscleGroups: ['lats', 'biceps', 'shoulders'],
  },
  {
    name: 'Dumbbell_rows',
    category: 'strength',
    equipment: ['dumbbells'],
    muscleGroups: ['lats', 'rhomboids', 'biceps'],
  },
  {
    name: 'Overhead_press',
    category: 'strength',
    equipment: ['dumbbells'],
    muscleGroups: ['shoulders', 'triceps', 'core'],
  },
  // Flexibility exercises
  {
    name: 'Child_pose',
    category: 'flexibility',
    equipment: ['yoga_mat'],
    muscleGroups: ['back', 'hips'],
  },
  {
    name: 'Downward_dog',
    category: 'flexibility',
    equipment: ['yoga_mat'],
    muscleGroups: ['hamstrings', 'calves', 'shoulders'],
  },
  {
    name: 'Pigeon_pose',
    category: 'flexibility',
    equipment: ['yoga_mat'],
    muscleGroups: ['hips', 'glutes'],
  },
  {
    name: 'Cat_cow_stretch',
    category: 'flexibility',
    equipment: ['yoga_mat'],
    muscleGroups: ['spine', 'core'],
  },
  {
    name: 'Seated_forward_fold',
    category: 'flexibility',
    equipment: ['bodyweight'],
    muscleGroups: ['hamstrings', 'back'],
  },
];

// Equipment substitution mapping
const EQUIPMENT_ALTERNATIVES = {
  barbell: ['dumbbells', 'resistance_bands', 'bodyweight'],
  dumbbells: ['resistance_bands', 'water_bottles', 'bodyweight'],
  pull_up_bar: ['resistance_bands', 'bodyweight'],
  bench: ['chair', 'couch', 'floor'],
  squat_rack: ['bodyweight', 'wall'],
  yoga_mat: ['towel', 'carpet', 'floor'],
  resistance_bands: ['bodyweight', 'towels'],
};

export interface WorkoutGenerationParams {
  goals: string[];
  availableEquipment: string[];
  workoutDuration: number; // minutes
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced';
  targetMuscleGroups?: string[];
  workoutType: 'strength' | 'cardio' | 'flexibility' | 'hybrid';
  previousWorkouts?: string[]; // exercise names from recent workouts
  limitations?: string[];
  preferences?: {
    intensity: 'low' | 'moderate' | 'high';
    restTime: 'short' | 'medium' | 'long';
    varietyLevel: 'routine' | 'mixed' | 'diverse';
  };
}

export interface GeneratedExercise {
  id: string;
  name: string;
  sets: number;
  reps: number | string; // "8-12" for ranges, "30 seconds" for time-based
  weight?: number;
  restTime: number; // seconds
  description: string;
  instructions: string[];
  muscleGroup: string;
  equipment: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  alternatives?: string[]; // alternative exercises if equipment unavailable
}

export interface GeneratedWorkout {
  exercises: GeneratedExercise[];
  estimatedDuration: number;
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
  rationale: string;
  warmupExercises: GeneratedExercise[];
  cooldownExercises: GeneratedExercise[];
  tips: string[];
}

export interface PerformanceAnalysis {
  plateauDetected: boolean;
  recommendations: string[];
  progressTrend: 'improving' | 'stable' | 'declining';
  strengthAreas: string[];
  improvementAreas: string[];
  nextWorkoutSuggestions: string[];
}

export interface EquipmentRecommendation {
  currentLocation: string;
  availableEquipment: string[];
  missingEquipment: string[];
  alternatives: { [key: string]: string[] };
  adaptedWorkout?: GeneratedWorkout;
}

class GeminiService {
  private model;

  constructor() {
    this.model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  // Epic 3.1: Workout Generation Engine
  async generateWorkout(
    params: WorkoutGenerationParams
  ): Promise<GeneratedWorkout> {
    try {
      const prompt = this.buildWorkoutPrompt(params);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return this.parseWorkoutResponse(text, params);
    } catch (error) {
      console.error('Error generating workout:', error);
      throw new Error('Failed to generate workout. Please try again.');
    }
  }

  // Epic 3.2: Equipment Detection and Adaptive Planning
  async adaptWorkoutForEquipment(
    workout: GeneratedWorkout,
    availableEquipment: string[]
  ): Promise<EquipmentRecommendation> {
    try {
      const prompt = `
        Given this workout and available equipment, provide adaptations:
        
        WORKOUT: ${JSON.stringify(workout.exercises)}
        AVAILABLE EQUIPMENT: ${availableEquipment.join(', ')}
        
        For each exercise that requires unavailable equipment, suggest:
        1. Direct substitutions using available equipment
        2. Bodyweight alternatives
        3. Creative household item replacements
        
        Respond with JSON containing adapted exercises and explanations.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return this.parseEquipmentRecommendation(text, availableEquipment);
    } catch (error) {
      console.error('Error adapting workout for equipment:', error);
      throw new Error('Failed to adapt workout for available equipment.');
    }
  }

  // Epic 3.4: Performance Analysis and Plateau Detection
  async analyzePerformance(
    performanceData: any[]
  ): Promise<PerformanceAnalysis> {
    try {
      const prompt = `
        Analyze this fitness performance data for plateaus and provide recommendations:
        
        PERFORMANCE DATA: ${JSON.stringify(performanceData)}
        
        Look for:
        1. Plateau patterns (flat progress for 2+ weeks)
        2. Declining performance trends
        3. Imbalances between muscle groups
        4. Overtraining indicators
        
        Provide specific, actionable recommendations for:
        - Breaking through plateaus
        - Addressing weak areas
        - Optimizing recovery
        - Progressive overload strategies
        
        Respond with structured analysis in JSON format.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return this.parsePerformanceAnalysis(text);
    } catch (error) {
      console.error('Error analyzing performance:', error);
      throw new Error('Failed to analyze performance data.');
    }
  }

  // Epic 3.5: Intelligent Workout Timing
  async optimizeWorkoutTiming(
    userSchedule: any,
    performanceHistory: any[]
  ): Promise<string[]> {
    try {
      const prompt = `
        Analyze this user's schedule and performance to recommend optimal workout timing:
        
        SCHEDULE: ${JSON.stringify(userSchedule)}
        PERFORMANCE HISTORY: ${JSON.stringify(performanceHistory)}
        
        Consider:
        1. Energy levels at different times
        2. Recovery patterns
        3. Schedule constraints
        4. Performance correlation with timing
        
        Provide 3-5 specific time slot recommendations with rationale.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return this.parseTimingRecommendations(text);
    } catch (error) {
      console.error('Error optimizing workout timing:', error);
      return ['Morning workouts often provide consistent energy levels'];
    }
  }

  // Generate recovery day activities
  async generateRecoveryPlan(
    intensity: 'gentle' | 'moderate' | 'active',
    duration: number,
    targetAreas?: string[]
  ): Promise<GeneratedWorkout> {
    try {
      const prompt = `
        Create a ${intensity} recovery workout for ${duration} minutes.
        ${targetAreas ? `Focus on: ${targetAreas.join(', ')}` : ''}
        
        Include:
        - Gentle mobility exercises
        - Stretching sequences
        - Breathing exercises
        - Light yoga poses
        
        Ensure exercises maintain streaks without causing fatigue.
        Provide step-by-step instructions and benefits for each exercise.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return this.parseRecoveryResponse(text, duration);
    } catch (error) {
      console.error('Error generating recovery plan:', error);
      throw new Error('Failed to generate recovery plan.');
    }
  }

  private buildWorkoutPrompt(params: WorkoutGenerationParams): string {
    const {
      goals,
      availableEquipment,
      workoutDuration,
      fitnessLevel,
      targetMuscleGroups,
      workoutType,
      previousWorkouts,
      limitations,
      preferences,
    } = params;

    return `
      Generate a personalized ${workoutDuration}-minute ${workoutType} workout for a ${fitnessLevel} level user.
      
      USER PROFILE:
      - Goals: ${goals.join(', ')}
      - Available Equipment: ${availableEquipment.join(', ')}
      - Target Muscle Groups: ${targetMuscleGroups?.join(', ') || 'Full body'}
      - Limitations: ${limitations?.join(', ') || 'None'}
      - Preferences: ${JSON.stringify(preferences || {})}
      
      WORKOUT HISTORY (avoid repeating):
      ${previousWorkouts?.join(', ') || 'None'}
      
      REQUIREMENTS:
      1. Choose exercises from this database: ${JSON.stringify(
        EXERCISE_DATABASE
      )}
      2. Provide specific sets, reps, and rest times
      3. Include warm-up and cool-down
      4. Consider progression for ${fitnessLevel} level
      5. Use only available equipment: ${availableEquipment.join(', ')}
      6. Provide exercise alternatives if equipment is missing
      
      RESPONSE FORMAT (JSON):
      {
        "warmupExercises": [{"name": "...", "duration": "...", "instructions": ["..."]}],
        "exercises": [
          {
            "name": "exercise_name",
            "sets": 3,
            "reps": "8-12",
            "weight": 0,
            "restTime": 60,
            "description": "Brief description",
            "instructions": ["Step 1", "Step 2"],
            "muscleGroup": "target_muscle",
            "equipment": "required_equipment",
            "alternatives": ["alternative_exercise"]
          }
        ],
        "cooldownExercises": [{"name": "...", "duration": "...", "instructions": ["..."]}],
        "rationale": "Explanation of exercise selection and progression",
        "tips": ["Tip 1", "Tip 2"]
      }
    `;
  }

  private parseWorkoutResponse(
    text: string,
    params: WorkoutGenerationParams
  ): GeneratedWorkout {
    try {
      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      // Process exercises with unique IDs and defaults
      const exercises: GeneratedExercise[] = parsed.exercises.map(
        (ex: any, index: number) => ({
          id: `generated_${Date.now()}_${index}`,
          name: ex.name.replace(/\s+/g, '_'), // Convert to underscore format [[memory:3409389]]
          sets: ex.sets || 3,
          reps: ex.reps || '8-12',
          weight: ex.weight || 0,
          restTime: ex.restTime || 60,
          description: ex.description || '',
          instructions: ex.instructions || [],
          muscleGroup: ex.muscleGroup || 'unknown',
          equipment: ex.equipment || 'bodyweight',
          difficulty: params.fitnessLevel,
          alternatives: ex.alternatives || [],
        })
      );

      return {
        exercises,
        estimatedDuration: params.workoutDuration,
        difficultyLevel: params.fitnessLevel,
        rationale: parsed.rationale || 'AI-generated workout plan',
        warmupExercises: this.processWarmupCooldown(
          parsed.warmupExercises || []
        ),
        cooldownExercises: this.processWarmupCooldown(
          parsed.cooldownExercises || []
        ),
        tips: parsed.tips || [],
      };
    } catch (error) {
      console.error('Error parsing workout response:', error);
      // Return fallback workout
      return this.getFallbackWorkout(params);
    }
  }

  private parseEquipmentRecommendation(
    text: string,
    availableEquipment: string[]
  ): EquipmentRecommendation {
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

      return {
        currentLocation: 'current',
        availableEquipment,
        missingEquipment: parsed.missingEquipment || [],
        alternatives: parsed.alternatives || {},
        adaptedWorkout: parsed.adaptedWorkout,
      };
    } catch (error) {
      console.error('Error parsing equipment recommendation:', error);
      return {
        currentLocation: 'current',
        availableEquipment,
        missingEquipment: [],
        alternatives: EQUIPMENT_ALTERNATIVES,
      };
    }
  }

  private parsePerformanceAnalysis(text: string): PerformanceAnalysis {
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

      return {
        plateauDetected: parsed.plateauDetected || false,
        recommendations: parsed.recommendations || [
          'Continue with current routine',
        ],
        progressTrend: parsed.progressTrend || 'stable',
        strengthAreas: parsed.strengthAreas || ['General fitness'],
        improvementAreas: parsed.improvementAreas || ['Consistency'],
        nextWorkoutSuggestions: parsed.nextWorkoutSuggestions || [
          'Maintain current intensity',
        ],
      };
    } catch (error) {
      console.error('Error parsing performance analysis:', error);
      return {
        plateauDetected: false,
        recommendations: ['Continue with regular workouts'],
        progressTrend: 'stable',
        strengthAreas: ['Building foundation'],
        improvementAreas: ['Consistency'],
        nextWorkoutSuggestions: ['Focus on form and consistency'],
      };
    }
  }

  private parseTimingRecommendations(text: string): string[] {
    try {
      const lines = text.split('\n').filter((line) => line.trim());
      return lines
        .slice(0, 5)
        .map((line) => line.replace(/^\d+\.\s*/, '').trim());
    } catch (error) {
      console.error('Error parsing timing recommendations:', error);
      return [
        'Morning workouts for consistent energy',
        'Afternoon sessions for peak performance',
        'Evening workouts for stress relief',
      ];
    }
  }

  private parseRecoveryResponse(
    text: string,
    duration: number
  ): GeneratedWorkout {
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

      const exercises: GeneratedExercise[] = (parsed.exercises || []).map(
        (ex: any, index: number) => ({
          id: `recovery_${Date.now()}_${index}`,
          name:
            ex.name?.replace(/\s+/g, '_') || `Recovery_Exercise_${index + 1}`, // Use underscores [[memory:3409389]]
          sets: ex.sets || 1,
          reps: ex.reps || '30 seconds',
          restTime: ex.restTime || 30,
          description: ex.description || 'Recovery exercise',
          instructions: ex.instructions || [],
          muscleGroup: ex.muscleGroup || 'recovery',
          equipment: ex.equipment || 'bodyweight',
          difficulty: 'beginner' as const,
        })
      );

      return {
        exercises,
        estimatedDuration: duration,
        difficultyLevel: 'beginner',
        rationale: parsed.rationale || 'Active recovery to maintain streaks',
        warmupExercises: [],
        cooldownExercises: [],
        tips: parsed.tips || [
          'Focus on gentle movements',
          'Breathe deeply',
          "Don't push too hard",
        ],
      };
    } catch (error) {
      console.error('Error parsing recovery response:', error);
      return this.getFallbackRecoveryWorkout(duration);
    }
  }

  private processWarmupCooldown(exercises: any[]): GeneratedExercise[] {
    return exercises.map((ex: any, index: number) => ({
      id: `warmup_cooldown_${Date.now()}_${index}`,
      name: ex.name?.replace(/\s+/g, '_') || `Warmup_Exercise_${index + 1}`, // Use underscores [[memory:3409389]]
      sets: 1,
      reps: ex.duration || '30 seconds',
      restTime: 0,
      description: ex.description || '',
      instructions: ex.instructions || [],
      muscleGroup: 'warmup',
      equipment: 'bodyweight',
      difficulty: 'beginner' as const,
    }));
  }

  private getFallbackWorkout(
    params: WorkoutGenerationParams
  ): GeneratedWorkout {
    const exercises: GeneratedExercise[] = [
      {
        id: 'fallback_1',
        name: 'Bodyweight_Squats', // Use underscores [[memory:3409389]]
        sets: 3,
        reps: '12-15',
        restTime: 60,
        description: 'Basic squat movement',
        instructions: [
          'Stand with feet shoulder-width apart',
          'Lower into squat',
          'Return to standing',
        ],
        muscleGroup: 'legs',
        equipment: 'bodyweight',
        difficulty: params.fitnessLevel,
      },
      {
        id: 'fallback_2',
        name: 'Push_Ups', // Use underscores [[memory:3409389]]
        sets: 3,
        reps: '8-12',
        restTime: 60,
        description: 'Upper body strength exercise',
        instructions: [
          'Start in plank position',
          'Lower chest to ground',
          'Push back up',
        ],
        muscleGroup: 'chest',
        equipment: 'bodyweight',
        difficulty: params.fitnessLevel,
      },
    ];

    return {
      exercises,
      estimatedDuration: params.workoutDuration,
      difficultyLevel: params.fitnessLevel,
      rationale: 'Fallback workout with bodyweight exercises',
      warmupExercises: [],
      cooldownExercises: [],
      tips: ['Focus on proper form', 'Take rest as needed'],
    };
  }

  private getFallbackRecoveryWorkout(duration: number): GeneratedWorkout {
    const exercises: GeneratedExercise[] = [
      {
        id: 'recovery_fallback_1',
        name: 'Deep_Breathing', // Use underscores [[memory:3409389]]
        sets: 1,
        reps: '2 minutes',
        restTime: 0,
        description: 'Relaxing breath work',
        instructions: [
          'Sit comfortably',
          'Breathe in for 4 counts',
          'Hold for 4',
          'Exhale for 6',
        ],
        muscleGroup: 'recovery',
        equipment: 'bodyweight',
        difficulty: 'beginner' as const,
      },
      {
        id: 'recovery_fallback_2',
        name: 'Gentle_Stretching', // Use underscores [[memory:3409389]]
        sets: 1,
        reps: '5 minutes',
        restTime: 0,
        description: 'Light stretching routine',
        instructions: [
          'Gentle neck rolls',
          'Shoulder shrugs',
          'Arm circles',
          'Light spinal twists',
        ],
        muscleGroup: 'recovery',
        equipment: 'bodyweight',
        difficulty: 'beginner' as const,
      },
    ];

    return {
      exercises,
      estimatedDuration: duration,
      difficultyLevel: 'beginner',
      rationale: 'Simple recovery activities to maintain streaks',
      warmupExercises: [],
      cooldownExercises: [],
      tips: ['Move slowly and mindfully', 'Focus on relaxation'],
    };
  }
}

export const geminiService = new GeminiService();
