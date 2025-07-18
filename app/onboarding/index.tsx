import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
} from 'react-native';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Zap,
  Target,
  Users,
  TrendingUp,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { useLocalSearchParams } from 'expo-router';
import { feetInchesToCm, poundsToKg } from '@/lib/unitConversions';

export default function OnboardingScreen() {
  const router = useRouter();
  const { updateProfile, signUp, user } = useAuth();
  const params = useLocalSearchParams();

  // Parse signup data from params
  const signupData = params.signupData
    ? JSON.parse(params.signupData as string)
    : null;

  const [currentStep, setCurrentStep] = useState(0);
  const [onboardingData, setOnboardingData] = useState({
    gender: '',
    preferredUnits: 'imperial' as 'metric' | 'imperial',
    heightFeet: 0,
    heightInches: 0,
    heightCm: 0,
    weightPounds: 0,
    weightKg: 0,
    fitnessGoals: [] as string[],
    experienceLevel: '',
    workoutFrequency: '',
    equipment: [] as string[],
    preferredTime: '',
    workoutDuration: '',
  });

  const steps = [
    {
      title: 'Welcome to BoltLab!',
      subtitle: 'Your lightning-fast fitness journey starts here',
      component: 'welcome',
    },
    {
      title: 'What is your gender?',
      subtitle: 'Help us personalize your experience',
      component: 'gender',
    },
    {
      title: 'Choose your preferred units',
      subtitle: 'Select metric or imperial measurements',
      component: 'units',
    },
    {
      title: 'What is your height?',
      subtitle: 'Enter your height',
      component: 'height',
    },
    {
      title: 'What is your height?',
      subtitle: 'Enter your current weight',
      component: 'weight',
    },
    {
      title: "What's your experience level?",
      subtitle: 'Choose your current fitness level',
      component: 'experience',
    },
    {
      title: 'What are your fitness goals?',
      subtitle: 'Select all that apply',
      component: 'goals',
    },
    {
      title: 'What equipment do you have access to?',
      subtitle: 'Select all that apply',
      component: 'equipment',
    },
    {
      title: 'How often do you want to work out?',
      subtitle: 'Set your workout frequency',
      component: 'frequency',
    },
    {
      title: 'How long should your workouts be?',
      subtitle: 'Choose your preferred workout duration',
      component: 'duration',
    },
    {
      title: "You're all set!",
      subtitle: 'Ready to start your fitness journey?',
      component: 'complete',
    },
  ];

  const fitnessGoals = [
    { id: 'weight-loss', label: 'Weight Loss', icon: Target },
    { id: 'muscle-gain', label: 'Muscle Gain', icon: Zap },
    { id: 'endurance', label: 'Endurance', icon: TrendingUp },
    { id: 'strength', label: 'Strength', icon: Users },
  ];

  const experienceLevels = [
    { id: 'beginner', label: 'Beginner', description: 'New to fitness' },
    {
      id: 'intermediate',
      label: 'Intermediate',
      description: 'Some experience',
    },
    { id: 'advanced', label: 'Advanced', description: 'Experienced athlete' },
  ];

  const workoutFrequencies = [
    { id: '2-3', label: '2-3 times per week', description: 'Light activity' },
    {
      id: '4-5',
      label: '4-5 times per week',
      description: 'Moderate activity',
    },
    { id: '6-7', label: '6-7 times per week', description: 'High activity' },
  ];

  const equipmentOptions = [
    { id: 'none', label: 'No Equipment', description: 'Bodyweight only' },
    { id: 'dumbbells', label: 'Dumbbells', description: 'Free weights' },
    {
      id: 'resistance-bands',
      label: 'Resistance Bands',
      description: 'Elastic bands',
    },
    { id: 'kettlebells', label: 'Kettlebells', description: 'Weighted balls' },
    { id: 'barbell', label: 'Barbell', description: 'Olympic barbell' },
    { id: 'pull-up-bar', label: 'Pull-up Bar', description: 'For upper body' },
    { id: 'bench', label: 'Bench', description: 'Weight bench' },
    {
      id: 'gym-access',
      label: 'Full Gym Access',
      description: 'All equipment',
    },
  ];

  const workoutDurations = [
    { id: '15-20', label: '15-20 minutes', description: 'Quick and efficient' },
    { id: '20-30', label: '20-30 minutes', description: 'Moderate length' },
    { id: '30-45', label: '30-45 minutes', description: 'Standard workout' },
    { id: '45-60', label: '45-60 minutes', description: 'Extended session' },
    { id: '60+', label: '60+ minutes', description: 'Long workout' },
  ];

  const genderOptions = [
    { id: 'male', label: 'Male' },
    { id: 'female', label: 'Female' },
    { id: 'other', label: 'Other' },
    { id: 'prefer-not-to-say', label: 'Prefer not to say' },
  ];

  const unitOptions = [
    { id: 'imperial', label: 'Imperial', description: 'Feet/inches & pounds' },
    { id: 'metric', label: 'Metric', description: 'Centimeters & kilograms' },
  ];

  const heightFeetOptions = [4, 5, 6, 7];
  const heightInchesOptions = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding
      await completeOnboarding();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeOnboarding = async () => {
    try {
      if (!signupData) {
        throw new Error('No signup data available');
      }

      console.log('Completing onboarding...');

      let userId: string;

      if (signupData.isGoogleUser) {
        // For Google users, we already have an account
        if (!user) {
          Alert.alert('Error', 'Authentication failed - please try again');
          return;
        }
        userId = user.id;
        console.log('Using existing Google account, user ID:', userId);
      } else {
        // For email/password users, create the account first
        console.log('Creating account and completing onboarding...');

        const { data: authData, error: authError } = await signUp(
          signupData.email,
          signupData.password,
          signupData.name
        );

        if (authError) {
          console.error('Error creating account:', authError);
          Alert.alert('Error', authError.message || 'Failed to create account');
          return;
        }

        if (!authData?.user) {
          Alert.alert('Error', 'Account creation failed - please try again');
          return;
        }

        userId = authData.user.id;
        console.log('Account created, user ID:', userId);
      }

      // Convert units if needed and prepare data for database
      let heightData = {};
      let weightData = {};

      if (onboardingData.preferredUnits === 'metric') {
        heightData = {
          height_cm: onboardingData.heightCm,
          height_feet: null,
          height_inches: null,
        };
        weightData = {
          weight_kg: onboardingData.weightKg,
          weight_pounds: null,
        };
      } else {
        // Convert imperial to metric for storage
        const heightCm = feetInchesToCm(
          onboardingData.heightFeet,
          onboardingData.heightInches
        );
        const weightKg = poundsToKg(onboardingData.weightPounds);

        heightData = {
          height_feet: onboardingData.heightFeet,
          height_inches: onboardingData.heightInches,
          height_cm: heightCm,
        };
        weightData = {
          weight_pounds: onboardingData.weightPounds,
          weight_kg: weightKg,
        };
      }

      // Save onboarding data to database using UPSERT to avoid duplicates
      const { error: onboardingError } = await supabase
        .from('onboarding_data')
        .upsert(
          {
            user_id: userId,
            gender: onboardingData.gender,
            preferred_units: onboardingData.preferredUnits,
            ...heightData,
            ...weightData,
            fitness_goals: onboardingData.fitnessGoals,
            experience_level: onboardingData.experienceLevel,
            workout_frequency: onboardingData.workoutFrequency,
            equipment: onboardingData.equipment,
            time_availability: onboardingData.preferredTime || 'flexible',
            workout_duration: onboardingData.workoutDuration,
            limitations: [], // Could add limitations selection in future
            motivation_style: [], // Could add motivation preferences in future
            workout_style: [], // Could add workout style preferences in future
          },
          {
            onConflict: 'user_id',
          }
        );

      if (onboardingError) {
        console.error('Error saving onboarding data:', onboardingError);
        // Don't block the flow if onboarding data fails to save
      } else {
        console.log('Onboarding data saved successfully');
      }

      console.log('Onboarding completed, navigating to email verification...');

      // Navigate to email verification screen
      router.push({
        pathname: '/auth/verify-email',
        params: { email: signupData.email },
      } as any);
    } catch (error) {
      console.error('Error completing onboarding:', error);
      Alert.alert('Error', 'Failed to complete setup - please try again');
    }
  };

  const toggleGoal = (goalId: string) => {
    setOnboardingData((prev) => ({
      ...prev,
      fitnessGoals: prev.fitnessGoals.includes(goalId)
        ? prev.fitnessGoals.filter((id) => id !== goalId)
        : [...prev.fitnessGoals, goalId],
    }));
  };

  const selectExperience = (level: string) => {
    setOnboardingData((prev) => ({ ...prev, experienceLevel: level }));
  };

  const selectFrequency = (frequency: string) => {
    setOnboardingData((prev) => ({ ...prev, workoutFrequency: frequency }));
  };

  const selectDuration = (duration: string) => {
    setOnboardingData((prev) => ({ ...prev, workoutDuration: duration }));
  };

  const selectGender = (gender: string) => {
    setOnboardingData((prev) => ({ ...prev, gender }));
  };

  const selectUnits = (units: 'metric' | 'imperial') => {
    setOnboardingData((prev) => ({ ...prev, preferredUnits: units }));
  };

  const updateHeight = (feet: number, inches: number) => {
    setOnboardingData((prev) => ({
      ...prev,
      heightFeet: feet,
      heightInches: inches,
    }));
  };

  const updateHeightCm = (cm: number) => {
    setOnboardingData((prev) => ({ ...prev, heightCm: cm }));
  };

  const updateWeight = (weight: number) => {
    setOnboardingData((prev) => ({ ...prev, weightPounds: weight }));
  };

  const updateWeightKg = (weight: number) => {
    setOnboardingData((prev) => ({ ...prev, weightKg: weight }));
  };

  const toggleEquipment = (equipmentId: string) => {
    setOnboardingData((prev) => ({
      ...prev,
      equipment: prev.equipment.includes(equipmentId)
        ? prev.equipment.filter((id) => id !== equipmentId)
        : [...prev.equipment, equipmentId],
    }));
  };

  const renderWelcome = () => (
    <View style={styles.stepContent}>
      <View style={styles.logoContainer}>
        <View style={styles.logoBackground}>
          <Zap size={40} color="#6B46C1" />
        </View>
        <Text style={styles.logoText}>BoltLab</Text>
      </View>
      <Text style={styles.welcomeText}>
        Transform your fitness journey with lightning-fast workouts, gamified
        progress tracking, and an electrifying community!
      </Text>
      <View style={styles.featuresList}>
        <View style={styles.featureItem}>
          <CheckCircle size={20} color="#10B981" />
          <Text style={styles.featureText}>Personalized workout plans</Text>
        </View>
        <View style={styles.featureItem}>
          <CheckCircle size={20} color="#10B981" />
          <Text style={styles.featureText}>XP and level system</Text>
        </View>
        <View style={styles.featureItem}>
          <CheckCircle size={20} color="#10B981" />
          <Text style={styles.featureText}>Achievement tracking</Text>
        </View>
        <View style={styles.featureItem}>
          <CheckCircle size={20} color="#10B981" />
          <Text style={styles.featureText}>Social challenges</Text>
        </View>
      </View>
    </View>
  );

  const renderGoals = () => (
    <View style={styles.stepContent}>
      <View style={styles.optionsGrid}>
        {fitnessGoals.map((goal) => (
          <TouchableOpacity
            key={goal.id}
            style={[
              styles.optionCard,
              onboardingData.fitnessGoals.includes(goal.id) &&
                styles.selectedOption,
            ]}
            onPress={() => toggleGoal(goal.id)}
          >
            <View style={styles.optionIcon}>
              <goal.icon
                size={24}
                color={
                  onboardingData.fitnessGoals.includes(goal.id)
                    ? '#FFFFFF'
                    : '#6B46C1'
                }
              />
            </View>
            <Text
              style={[
                styles.optionText,
                onboardingData.fitnessGoals.includes(goal.id) &&
                  styles.selectedOptionText,
              ]}
            >
              {goal.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderExperience = () => (
    <View style={styles.stepContent}>
      <View style={styles.optionsColumn}>
        {experienceLevels.map((level) => (
          <TouchableOpacity
            key={level.id}
            style={[
              styles.levelCard,
              onboardingData.experienceLevel === level.id &&
                styles.selectedLevel,
            ]}
            onPress={() => selectExperience(level.id)}
          >
            <Text
              style={[
                styles.levelTitle,
                onboardingData.experienceLevel === level.id &&
                  styles.selectedLevelText,
              ]}
            >
              {level.label}
            </Text>
            <Text
              style={[
                styles.levelDescription,
                onboardingData.experienceLevel === level.id &&
                  styles.selectedLevelDescription,
              ]}
            >
              {level.description}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderFrequency = () => (
    <View style={styles.stepContent}>
      <View style={styles.optionsColumn}>
        {workoutFrequencies.map((freq) => (
          <TouchableOpacity
            key={freq.id}
            style={[
              styles.levelCard,
              onboardingData.workoutFrequency === freq.id &&
                styles.selectedLevel,
            ]}
            onPress={() => selectFrequency(freq.id)}
          >
            <Text
              style={[
                styles.levelTitle,
                onboardingData.workoutFrequency === freq.id &&
                  styles.selectedLevelText,
              ]}
            >
              {freq.label}
            </Text>
            <Text
              style={[
                styles.levelDescription,
                onboardingData.workoutFrequency === freq.id &&
                  styles.selectedLevelDescription,
              ]}
            >
              {freq.description}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderEquipment = () => (
    <View style={styles.stepContent}>
      <View style={styles.optionsGrid}>
        {equipmentOptions.map((equipment) => (
          <TouchableOpacity
            key={equipment.id}
            style={[
              styles.equipmentCard,
              onboardingData.equipment.includes(equipment.id) &&
                styles.selectedEquipment,
            ]}
            onPress={() => toggleEquipment(equipment.id)}
          >
            <View style={styles.equipmentContent}>
              <Text
                style={[
                  styles.equipmentLabel,
                  onboardingData.equipment.includes(equipment.id) &&
                    styles.selectedEquipmentText,
                ]}
              >
                {equipment.label}
              </Text>
              <Text
                style={[
                  styles.equipmentDescription,
                  onboardingData.equipment.includes(equipment.id) &&
                    styles.selectedEquipmentDescription,
                ]}
              >
                {equipment.description}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderDuration = () => (
    <View style={styles.stepContent}>
      <View style={styles.optionsColumn}>
        {workoutDurations.map((duration) => (
          <TouchableOpacity
            key={duration.id}
            style={[
              styles.levelCard,
              onboardingData.workoutDuration === duration.id &&
                styles.selectedLevel,
            ]}
            onPress={() => selectDuration(duration.id)}
          >
            <Text
              style={[
                styles.levelTitle,
                onboardingData.workoutDuration === duration.id &&
                  styles.selectedLevelText,
              ]}
            >
              {duration.label}
            </Text>
            <Text
              style={[
                styles.levelDescription,
                onboardingData.workoutDuration === duration.id &&
                  styles.selectedLevelDescription,
              ]}
            >
              {duration.description}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderGender = () => (
    <View style={styles.stepContent}>
      <View style={styles.optionsColumn}>
        {genderOptions.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.levelCard,
              onboardingData.gender === option.id && styles.selectedLevel,
            ]}
            onPress={() => selectGender(option.id)}
          >
            <Text
              style={[
                styles.levelTitle,
                onboardingData.gender === option.id && styles.selectedLevelText,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderUnits = () => (
    <View style={styles.stepContent}>
      <View style={styles.optionsColumn}>
        {unitOptions.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.levelCard,
              onboardingData.preferredUnits === option.id &&
                styles.selectedLevel,
            ]}
            onPress={() => selectUnits(option.id as 'metric' | 'imperial')}
          >
            <Text
              style={[
                styles.levelTitle,
                onboardingData.preferredUnits === option.id &&
                  styles.selectedLevelText,
              ]}
            >
              {option.label}
            </Text>
            <Text
              style={[
                styles.levelDescription,
                onboardingData.preferredUnits === option.id &&
                  styles.selectedLevelDescription,
              ]}
            >
              {option.description}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderHeight = () => {
    if (onboardingData.preferredUnits === 'metric') {
      return (
        <View style={styles.stepContent}>
          <View style={styles.weightContainer}>
            <Text style={styles.weightLabel}>Height (cm)</Text>
            <TextInput
              style={styles.weightInput}
              value={
                onboardingData.heightCm > 0
                  ? onboardingData.heightCm.toString()
                  : ''
              }
              onChangeText={(text) => {
                const height = parseInt(text) || 0;
                updateHeightCm(height);
              }}
              keyboardType="numeric"
              placeholder="Enter your height in cm"
              placeholderTextColor="#94A3B8"
            />
          </View>
        </View>
      );
    }

    return (
      <View style={styles.stepContent}>
        <View style={styles.heightContainer}>
          <View style={styles.heightSection}>
            <Text style={styles.heightLabel}>Feet</Text>
            <View style={styles.heightOptions}>
              {heightFeetOptions.map((feet) => (
                <TouchableOpacity
                  key={feet}
                  style={[
                    styles.heightOption,
                    onboardingData.heightFeet === feet &&
                      styles.selectedHeightOption,
                  ]}
                  onPress={() =>
                    updateHeight(feet, onboardingData.heightInches)
                  }
                >
                  <Text
                    style={[
                      styles.heightOptionText,
                      onboardingData.heightFeet === feet &&
                        styles.selectedHeightOptionText,
                    ]}
                  >
                    {feet}'
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={styles.heightSection}>
            <Text style={styles.heightLabel}>Inches</Text>
            <View style={styles.heightOptions}>
              {heightInchesOptions.map((inches) => (
                <TouchableOpacity
                  key={inches}
                  style={[
                    styles.heightOption,
                    onboardingData.heightInches === inches &&
                      styles.selectedHeightOption,
                  ]}
                  onPress={() =>
                    updateHeight(onboardingData.heightFeet, inches)
                  }
                >
                  <Text
                    style={[
                      styles.heightOptionText,
                      onboardingData.heightInches === inches &&
                        styles.selectedHeightOptionText,
                    ]}
                  >
                    {inches}"
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderWeight = () => {
    const isMetric = onboardingData.preferredUnits === 'metric';
    const weightValue = isMetric
      ? onboardingData.weightKg
      : onboardingData.weightPounds;
    const unit = isMetric ? 'kg' : 'pounds';
    const placeholder = `Enter your weight in ${unit}`;

    return (
      <View style={styles.stepContent}>
        <View style={styles.weightContainer}>
          <Text style={styles.weightLabel}>Weight ({unit})</Text>
          <TextInput
            style={styles.weightInput}
            value={weightValue > 0 ? weightValue.toString() : ''}
            onChangeText={(text) => {
              const weight = isMetric
                ? parseFloat(text) || 0
                : parseInt(text) || 0;
              if (isMetric) {
                updateWeightKg(weight);
              } else {
                updateWeight(weight);
              }
            }}
            keyboardType="numeric"
            placeholder={placeholder}
            placeholderTextColor="#94A3B8"
          />
        </View>
      </View>
    );
  };

  const renderComplete = () => (
    <View style={styles.stepContent}>
      <View style={styles.completeContainer}>
        <View style={styles.completeIcon}>
          <CheckCircle size={60} color="#10B981" />
        </View>
        <Text style={styles.completeTitle}>You're Ready to Go!</Text>
        <Text style={styles.completeText}>
          Your personalized fitness journey is about to begin. Let's start
          earning some XP!
        </Text>
      </View>
    </View>
  );

  const renderStepContent = () => {
    switch (steps[currentStep].component) {
      case 'welcome':
        return renderWelcome();
      case 'gender':
        return renderGender();
      case 'units':
        return renderUnits();
      case 'height':
        return renderHeight();
      case 'weight':
        return renderWeight();
      case 'experience':
        return renderExperience();
      case 'goals':
        return renderGoals();
      case 'equipment':
        return renderEquipment();
      case 'frequency':
        return renderFrequency();
      case 'duration':
        return renderDuration();
      case 'complete':
        return renderComplete();
      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return true; // Welcome
      case 1:
        return onboardingData.gender !== ''; // Gender
      case 2:
        return onboardingData.preferredUnits !== ''; // Units
      case 3:
        // Height validation based on selected units
        if (onboardingData.preferredUnits === 'metric') {
          return onboardingData.heightCm > 0;
        } else {
          return onboardingData.heightFeet > 0;
        }
      case 4:
        // Weight validation based on selected units
        if (onboardingData.preferredUnits === 'metric') {
          return onboardingData.weightKg > 0;
        } else {
          return onboardingData.weightPounds > 0;
        }
      case 5:
        return onboardingData.experienceLevel !== ''; // Experience
      case 6:
        return onboardingData.fitnessGoals.length > 0; // Goals
      case 7:
        return onboardingData.equipment.length > 0; // Equipment
      case 8:
        return onboardingData.workoutFrequency !== ''; // Frequency
      case 9:
        return onboardingData.workoutDuration !== ''; // Duration
      case 10:
        return true; // Complete
      default:
        return false;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#0F0F23', '#1A1A2E', '#0F0F23']}
        style={styles.background}
      >
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${((currentStep + 1) / steps.length) * 100}%` },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {currentStep + 1} of {steps.length}
          </Text>
        </View>

        {/* Content */}
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <Text style={styles.stepTitle}>{steps[currentStep].title}</Text>
            <Text style={styles.stepSubtitle}>
              {steps[currentStep].subtitle}
            </Text>
            {renderStepContent()}
          </View>
        </ScrollView>

        {/* Navigation */}
        <View style={styles.navigation}>
          {currentStep > 0 ? (
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <View style={styles.backButtonContent}>
                <ChevronLeft size={20} color="#94A3B8" />
                <Text style={styles.backButtonText}>Back</Text>
              </View>
            </TouchableOpacity>
          ) : (
            <View style={styles.backButtonPlaceholder} />
          )}
          <TouchableOpacity
            style={[styles.nextButton, !canProceed() && styles.disabledButton]}
            onPress={handleNext}
            disabled={!canProceed()}
          >
            <LinearGradient
              colors={
                canProceed() ? ['#6B46C1', '#8B5CF6'] : ['#374151', '#4B5563']
              }
              style={styles.nextButtonGradient}
            >
              <Text style={styles.nextButtonText}>
                {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
              </Text>
              <ChevronRight size={20} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </SafeAreaView>
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
  progressContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#1A1A2E',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6B46C1',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  stepSubtitle: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 40,
  },
  stepContent: {
    flex: 1,
    justifyContent: 'center',
    minHeight: 300,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoBackground: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#6B46C1' + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  welcomeText: {
    fontSize: 16,
    color: '#E2E8F0',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  featuresList: {
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  featureText: {
    fontSize: 16,
    color: '#E2E8F0',
    marginLeft: 12,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'center',
  },
  optionCard: {
    width: '45%',
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1A1A2E',
  },
  selectedOption: {
    backgroundColor: '#6B46C1',
    borderColor: '#6B46C1',
  },
  optionIcon: {
    marginBottom: 12,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  selectedOptionText: {
    color: '#FFFFFF',
  },
  optionsColumn: {
    gap: 16,
  },
  levelCard: {
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#1A1A2E',
  },
  selectedLevel: {
    backgroundColor: '#6B46C1',
    borderColor: '#6B46C1',
  },
  levelTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  selectedLevelText: {
    color: '#FFFFFF',
  },
  levelDescription: {
    fontSize: 14,
    color: '#94A3B8',
  },
  selectedLevelDescription: {
    color: '#E2E8F0',
  },
  completeContainer: {
    alignItems: 'center',
  },
  completeIcon: {
    marginBottom: 24,
  },
  completeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  completeText: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 24,
  },
  navigation: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  backButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    color: '#94A3B8',
    marginLeft: 8,
  },
  backButtonPlaceholder: {
    width: 80, // Approximate width of back button
    height: 40,
  },
  nextButton: {
    borderRadius: 16,
    flex: 1,
    marginLeft: 20,
  },
  disabledButton: {
    opacity: 0.6,
  },
  nextButtonGradient: {
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 8,
  },
  equipmentCard: {
    width: '48%',
    marginBottom: 12,
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#1A1A2E',
  },
  selectedEquipment: {
    backgroundColor: '#6B46C1',
    borderColor: '#6B46C1',
  },
  equipmentContent: {
    alignItems: 'center',
  },
  equipmentLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
    textAlign: 'center',
  },
  selectedEquipmentText: {
    color: '#FFFFFF',
  },
  equipmentDescription: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
  },
  selectedEquipmentDescription: {
    color: '#E2E8F0',
  },
  heightContainer: {
    gap: 24,
  },
  heightSection: {
    alignItems: 'center',
  },
  heightLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  heightOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  heightOption: {
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#1A1A2E',
    minWidth: 60,
    alignItems: 'center',
  },
  selectedHeightOption: {
    backgroundColor: '#6B46C1',
    borderColor: '#6B46C1',
  },
  heightOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  selectedHeightOptionText: {
    color: '#FFFFFF',
  },
  weightContainer: {
    alignItems: 'center',
    gap: 24,
  },
  weightLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  weightInput: {
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    padding: 20,
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    minWidth: 200,
    borderWidth: 2,
    borderColor: '#1A1A2E',
  },
});
