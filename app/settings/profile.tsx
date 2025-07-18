import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  User,
  Palette,
  Target,
  Save,
  CheckCircle,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import LightningAvatar from '@/components/LightningAvatar';
import { supabase } from '@/lib/supabase';
import {
  feetInchesToCm,
  poundsToKg,
  formatHeight,
  formatWeight,
} from '@/lib/unitConversions';

interface ProfileData {
  username: string;
  email: string;
  avatarColor: string;
  fitnessGoals: string[];
  experienceLevel: string;
  workoutFrequency: string;
  equipment: string[];
  workoutDuration: string;
  preferredUnits: 'metric' | 'imperial';
  gender: string;
  heightFeet: number;
  heightInches: number;
  heightCm: number;
  weightPounds: number;
  weightKg: number;
}

const avatarColors = [
  { name: 'Purple', value: 'purple', color: '#6B46C1' },
  { name: 'Orange', value: 'orange', color: '#F59E0B' },
  { name: 'Blue', value: 'blue', color: '#3B82F6' },
  { name: 'Gold', value: 'gold', color: '#EAB308' },
];

const fitnessGoalOptions = [
  { id: 'weight-loss', label: 'Weight Loss', icon: Target },
  { id: 'muscle-gain', label: 'Muscle Gain', icon: Target },
  { id: 'endurance', label: 'Endurance', icon: Target },
  { id: 'strength', label: 'Strength', icon: Target },
];

const experienceLevels = [
  { id: 'beginner', label: 'Beginner', description: 'New to fitness' },
  { id: 'intermediate', label: 'Intermediate', description: 'Some experience' },
  { id: 'advanced', label: 'Advanced', description: 'Experienced athlete' },
];

const workoutFrequencies = [
  { id: '2-3', label: '2-3 times per week', description: 'Light activity' },
  { id: '4-5', label: '4-5 times per week', description: 'Moderate activity' },
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
  { id: 'gym-access', label: 'Full Gym Access', description: 'All equipment' },
];

const workoutDurationOptions = [
  { id: '15-20', label: '15-20 minutes', description: 'Quick and efficient' },
  { id: '20-30', label: '20-30 minutes', description: 'Moderate length' },
  { id: '30-45', label: '30-45 minutes', description: 'Standard workout' },
  { id: '45-60', label: '45-60 minutes', description: 'Extended session' },
  { id: '60+', label: '60+ minutes', description: 'Long workout' },
];

const unitOptions = [
  { id: 'imperial', label: 'Imperial', description: 'Feet/inches & pounds' },
  { id: 'metric', label: 'Metric', description: 'Centimeters & kilograms' },
];

const genderOptions = [
  { id: 'male', label: 'Male' },
  { id: 'female', label: 'Female' },
  { id: 'other', label: 'Other' },
  { id: 'prefer-not-to-say', label: 'Prefer not to say' },
];

export default function EditProfileScreen() {
  const router = useRouter();
  const { profile, updateProfile, user, loadOnboardingData } = useAuth();

  const [profileData, setProfileData] = useState<ProfileData>({
    username: '',
    email: '',
    avatarColor: 'purple',
    fitnessGoals: [],
    experienceLevel: '',
    workoutFrequency: '',
    equipment: [],
    workoutDuration: '',
    preferredUnits: 'imperial',
    gender: '',
    heightFeet: 0,
    heightInches: 0,
    heightCm: 0,
    weightPounds: 0,
    weightKg: 0,
  });

  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadProfileData();
  }, [profile]);

  const loadProfileData = async () => {
    if (profile) {
      const onboardingData = await loadOnboardingData();

      setProfileData({
        username: profile.username || '',
        email: profile.email || '',
        avatarColor: profile.avatar_color || 'purple',
        fitnessGoals: onboardingData.data?.fitness_goals || [],
        experienceLevel: onboardingData.data?.experience_level || '',
        workoutFrequency: onboardingData.data?.workout_frequency || '',
        equipment: onboardingData.data?.equipment || [],
        workoutDuration: onboardingData.data?.workout_duration || '',
        preferredUnits: onboardingData.data?.preferred_units || 'imperial',
        gender: onboardingData.data?.gender || '',
        heightFeet: onboardingData.data?.height_feet || 0,
        heightInches: onboardingData.data?.height_inches || 0,
        heightCm: onboardingData.data?.height_cm || 0,
        weightPounds: onboardingData.data?.weight_pounds || 0,
        weightKg: onboardingData.data?.weight_kg || 0,
      });
    }
  };

  const handleSave = async () => {
    if (!hasChanges) {
      router.back();
      return;
    }

    setLoading(true);
    try {
      // Update profile
      const { error: profileError } = await updateProfile({
        username: profileData.username,
        avatar_color: profileData.avatarColor,
      });

      if (profileError) throw profileError;

      // Update onboarding data using UPSERT to replace existing data
      if (user) {
        // Convert units if needed and prepare data for database
        let heightData = {};
        let weightData = {};

        if (profileData.preferredUnits === 'metric') {
          heightData = {
            height_cm: profileData.heightCm,
            height_feet: null,
            height_inches: null,
          };
          weightData = {
            weight_kg: profileData.weightKg,
            weight_pounds: null,
          };
        } else {
          // Convert imperial to metric for storage
          const heightCm = feetInchesToCm(
            profileData.heightFeet,
            profileData.heightInches
          );
          const weightKg = poundsToKg(profileData.weightPounds);

          heightData = {
            height_feet: profileData.heightFeet,
            height_inches: profileData.heightInches,
            height_cm: heightCm,
          };
          weightData = {
            weight_pounds: profileData.weightPounds,
            weight_kg: weightKg,
          };
        }

        const { error: onboardingError } = await supabase
          .from('onboarding_data')
          .upsert(
            {
              user_id: user.id,
              gender: profileData.gender,
              preferred_units: profileData.preferredUnits,
              ...heightData,
              ...weightData,
              fitness_goals: profileData.fitnessGoals,
              experience_level: profileData.experienceLevel,
              workout_frequency: profileData.workoutFrequency,
              equipment: profileData.equipment,
              time_availability: 'flexible',
              workout_duration: profileData.workoutDuration,
              limitations: [],
              motivation_style: [],
              workout_style: [],
            },
            {
              onConflict: 'user_id',
            }
          );

        if (onboardingError) {
          console.error('Error updating onboarding data:', onboardingError);
        }
      }

      Alert.alert('Success', 'Profile updated successfully!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: keyof ProfileData, value: any) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const toggleFitnessGoal = (goalId: string) => {
    const newGoals = profileData.fitnessGoals.includes(goalId)
      ? profileData.fitnessGoals.filter((id) => id !== goalId)
      : [...profileData.fitnessGoals, goalId];
    updateField('fitnessGoals', newGoals);
  };

  const toggleEquipment = (equipmentId: string) => {
    const newEquipment = profileData.equipment.includes(equipmentId)
      ? profileData.equipment.filter((id) => id !== equipmentId)
      : [...profileData.equipment, equipmentId];
    updateField('equipment', newEquipment);
  };

  const renderSection = (title: string, children: React.ReactNode) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#0F0F23', '#1A1A2E', '#0F0F23']}
        style={styles.background}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <TouchableOpacity
            style={[styles.saveButton, hasChanges && styles.saveButtonActive]}
            onPress={handleSave}
            disabled={loading}
          >
            <Save size={20} color={hasChanges ? '#FFFFFF' : '#64748B'} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {/* Avatar Preview */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarContainer}>
              <LightningAvatar
                level="bolt"
                xp={profile?.total_xp || 0}
                maxXp={1000}
                color={profileData.avatarColor as any}
                size="large"
                showStats={false}
              />
            </View>
            <Text style={styles.avatarLabel}>
              Level {profile?.level || 1} Lightning Master
            </Text>
          </View>

          {/* Basic Information */}
          {renderSection(
            'Basic Information',
            <View style={styles.inputSection}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Username</Text>
                <View style={styles.inputContainer}>
                  <User size={20} color="#6B46C1" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    value={profileData.username}
                    onChangeText={(text) => updateField('username', text)}
                    placeholder="Enter your username"
                    placeholderTextColor="#64748B"
                    maxLength={20}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email</Text>
                <View style={[styles.inputContainer, styles.disabledInput]}>
                  <User size={20} color="#64748B" style={styles.inputIcon} />
                  <Text style={styles.disabledText}>{profileData.email}</Text>
                </View>
                <Text style={styles.inputNote}>
                  Email cannot be changed here
                </Text>
              </View>
            </View>
          )}

          {/* Avatar Color */}
          {renderSection(
            'Avatar Color',
            <View style={styles.colorSection}>
              {avatarColors.map((color) => (
                <TouchableOpacity
                  key={color.value}
                  style={[
                    styles.colorOption,
                    profileData.avatarColor === color.value &&
                      styles.selectedColor,
                  ]}
                  onPress={() => updateField('avatarColor', color.value)}
                >
                  <View
                    style={[
                      styles.colorCircle,
                      { backgroundColor: color.color },
                    ]}
                  />
                  <Text
                    style={[
                      styles.colorLabel,
                      profileData.avatarColor === color.value &&
                        styles.selectedColorLabel,
                    ]}
                  >
                    {color.name}
                  </Text>
                  {profileData.avatarColor === color.value && (
                    <CheckCircle size={20} color="#6B46C1" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Personal Information */}
          {renderSection(
            'Personal Information',
            <View style={styles.personalSection}>
              {/* Unit Preferences */}
              <View style={styles.subsection}>
                <Text style={styles.subsectionTitle}>Preferred Units</Text>
                {unitOptions.map((unit) => (
                  <TouchableOpacity
                    key={unit.id}
                    style={[
                      styles.unitOption,
                      profileData.preferredUnits === unit.id &&
                        styles.selectedUnit,
                    ]}
                    onPress={() => updateField('preferredUnits', unit.id)}
                  >
                    <View style={styles.unitContent}>
                      <Text
                        style={[
                          styles.unitLabel,
                          profileData.preferredUnits === unit.id &&
                            styles.selectedUnitLabel,
                        ]}
                      >
                        {unit.label}
                      </Text>
                      <Text
                        style={[
                          styles.unitDescription,
                          profileData.preferredUnits === unit.id &&
                            styles.selectedUnitDescription,
                        ]}
                      >
                        {unit.description}
                      </Text>
                    </View>
                    {profileData.preferredUnits === unit.id && (
                      <CheckCircle size={20} color="#6B46C1" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              {/* Gender */}
              <View style={styles.subsection}>
                <Text style={styles.subsectionTitle}>Gender</Text>
                {genderOptions.map((gender) => (
                  <TouchableOpacity
                    key={gender.id}
                    style={[
                      styles.genderOption,
                      profileData.gender === gender.id && styles.selectedGender,
                    ]}
                    onPress={() => updateField('gender', gender.id)}
                  >
                    <Text
                      style={[
                        styles.genderLabel,
                        profileData.gender === gender.id &&
                          styles.selectedGenderLabel,
                      ]}
                    >
                      {gender.label}
                    </Text>
                    {profileData.gender === gender.id && (
                      <CheckCircle size={20} color="#6B46C1" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              {/* Height & Weight Display */}
              <View style={styles.subsection}>
                <Text style={styles.subsectionTitle}>Physical Stats</Text>
                <View style={styles.statsContainer}>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Height</Text>
                    <Text style={styles.statValue}>
                      {formatHeight(
                        profileData.heightFeet,
                        profileData.heightInches,
                        profileData.heightCm,
                        profileData.preferredUnits
                      )}
                    </Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Weight</Text>
                    <Text style={styles.statValue}>
                      {formatWeight(
                        profileData.weightPounds,
                        profileData.weightKg,
                        profileData.preferredUnits
                      )}
                    </Text>
                  </View>
                </View>
                <Text style={styles.statsNote}>
                  Height and weight can be updated during onboarding
                </Text>
              </View>
            </View>
          )}

          {/* Fitness Goals */}
          {renderSection(
            'Fitness Goals',
            <View style={styles.goalsSection}>
              {fitnessGoalOptions.map((goal) => (
                <TouchableOpacity
                  key={goal.id}
                  style={[
                    styles.goalOption,
                    profileData.fitnessGoals.includes(goal.id) &&
                      styles.selectedGoal,
                  ]}
                  onPress={() => toggleFitnessGoal(goal.id)}
                >
                  <View style={styles.goalIcon}>
                    <goal.icon
                      size={20}
                      color={
                        profileData.fitnessGoals.includes(goal.id)
                          ? '#FFFFFF'
                          : '#6B46C1'
                      }
                    />
                  </View>
                  <Text
                    style={[
                      styles.goalLabel,
                      profileData.fitnessGoals.includes(goal.id) &&
                        styles.selectedGoalLabel,
                    ]}
                  >
                    {goal.label}
                  </Text>
                  {profileData.fitnessGoals.includes(goal.id) && (
                    <CheckCircle size={20} color="#FFFFFF" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Experience Level */}
          {renderSection(
            'Experience Level',
            <View style={styles.levelSection}>
              {experienceLevels.map((level) => (
                <TouchableOpacity
                  key={level.id}
                  style={[
                    styles.levelOption,
                    profileData.experienceLevel === level.id &&
                      styles.selectedLevel,
                  ]}
                  onPress={() => updateField('experienceLevel', level.id)}
                >
                  <View style={styles.levelContent}>
                    <Text
                      style={[
                        styles.levelTitle,
                        profileData.experienceLevel === level.id &&
                          styles.selectedLevelTitle,
                      ]}
                    >
                      {level.label}
                    </Text>
                    <Text
                      style={[
                        styles.levelDescription,
                        profileData.experienceLevel === level.id &&
                          styles.selectedLevelDescription,
                      ]}
                    >
                      {level.description}
                    </Text>
                  </View>
                  {profileData.experienceLevel === level.id && (
                    <CheckCircle size={20} color="#FFFFFF" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Workout Frequency */}
          {renderSection(
            'Workout Frequency',
            <View style={styles.frequencySection}>
              {workoutFrequencies.map((freq) => (
                <TouchableOpacity
                  key={freq.id}
                  style={[
                    styles.frequencyOption,
                    profileData.workoutFrequency === freq.id &&
                      styles.selectedFrequency,
                  ]}
                  onPress={() => updateField('workoutFrequency', freq.id)}
                >
                  <View style={styles.frequencyContent}>
                    <Text
                      style={[
                        styles.frequencyTitle,
                        profileData.workoutFrequency === freq.id &&
                          styles.selectedFrequencyTitle,
                      ]}
                    >
                      {freq.label}
                    </Text>
                    <Text
                      style={[
                        styles.frequencyDescription,
                        profileData.workoutFrequency === freq.id &&
                          styles.selectedFrequencyDescription,
                      ]}
                    >
                      {freq.description}
                    </Text>
                  </View>
                  {profileData.workoutFrequency === freq.id && (
                    <CheckCircle size={20} color="#FFFFFF" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Available Equipment */}
          {renderSection(
            'Available Equipment',
            <View style={styles.equipmentSection}>
              <View style={styles.equipmentGrid}>
                {equipmentOptions.map((equipment) => (
                  <TouchableOpacity
                    key={equipment.id}
                    style={[
                      styles.equipmentOption,
                      profileData.equipment.includes(equipment.id) &&
                        styles.selectedEquipmentOption,
                    ]}
                    onPress={() => toggleEquipment(equipment.id)}
                  >
                    <View style={styles.equipmentContent}>
                      <Text
                        style={[
                          styles.equipmentTitle,
                          profileData.equipment.includes(equipment.id) &&
                            styles.selectedEquipmentTitle,
                        ]}
                      >
                        {equipment.label}
                      </Text>
                      <Text
                        style={[
                          styles.equipmentSubtitle,
                          profileData.equipment.includes(equipment.id) &&
                            styles.selectedEquipmentSubtitle,
                        ]}
                      >
                        {equipment.description}
                      </Text>
                    </View>
                    {profileData.equipment.includes(equipment.id) && (
                      <CheckCircle size={16} color="#FFFFFF" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Workout Duration */}
          {renderSection(
            'Workout Duration',
            <View style={styles.frequencySection}>
              {workoutDurationOptions.map((duration) => (
                <TouchableOpacity
                  key={duration.id}
                  style={[
                    styles.frequencyOption,
                    profileData.workoutDuration === duration.id &&
                      styles.selectedFrequency,
                  ]}
                  onPress={() => updateField('workoutDuration', duration.id)}
                >
                  <View style={styles.frequencyContent}>
                    <Text
                      style={[
                        styles.frequencyTitle,
                        profileData.workoutDuration === duration.id &&
                          styles.selectedFrequencyTitle,
                      ]}
                    >
                      {duration.label}
                    </Text>
                    <Text
                      style={[
                        styles.frequencyDescription,
                        profileData.workoutDuration === duration.id &&
                          styles.selectedFrequencyDescription,
                      ]}
                    >
                      {duration.description}
                    </Text>
                  </View>
                  {profileData.workoutDuration === duration.id && (
                    <CheckCircle size={20} color="#FFFFFF" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A2E',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1A1A2E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  saveButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1A1A2E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonActive: {
    backgroundColor: '#6B46C1',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatarLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#94A3B8',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  inputSection: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1A1A2E',
    paddingHorizontal: 16,
    height: 50,
  },
  disabledInput: {
    backgroundColor: '#0F0F23',
    borderColor: '#374151',
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
  },
  disabledText: {
    flex: 1,
    fontSize: 16,
    color: '#64748B',
  },
  inputNote: {
    fontSize: 12,
    color: '#64748B',
  },
  colorSection: {
    gap: 12,
  },
  colorOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#1A1A2E',
  },
  selectedColor: {
    backgroundColor: '#6B46C1' + '20',
    borderColor: '#6B46C1',
  },
  colorCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  colorLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  selectedColorLabel: {
    color: '#FFFFFF',
  },
  goalsSection: {
    gap: 12,
  },
  goalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#1A1A2E',
  },
  selectedGoal: {
    backgroundColor: '#6B46C1',
    borderColor: '#6B46C1',
  },
  goalIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6B46C1' + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  goalLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  selectedGoalLabel: {
    color: '#FFFFFF',
  },
  levelSection: {
    gap: 12,
  },
  levelOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#1A1A2E',
  },
  selectedLevel: {
    backgroundColor: '#6B46C1',
    borderColor: '#6B46C1',
  },
  levelContent: {
    flex: 1,
  },
  levelTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  selectedLevelTitle: {
    color: '#FFFFFF',
  },
  levelDescription: {
    fontSize: 14,
    color: '#94A3B8',
  },
  selectedLevelDescription: {
    color: '#E2E8F0',
  },
  frequencySection: {
    gap: 12,
  },
  frequencyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#1A1A2E',
  },
  selectedFrequency: {
    backgroundColor: '#6B46C1',
    borderColor: '#6B46C1',
  },
  frequencyContent: {
    flex: 1,
  },
  frequencyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  selectedFrequencyTitle: {
    color: '#FFFFFF',
  },
  frequencyDescription: {
    fontSize: 14,
    color: '#94A3B8',
  },
  selectedFrequencyDescription: {
    color: '#E2E8F0',
  },
  equipmentSection: {
    gap: 12,
  },
  equipmentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  equipmentOption: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    padding: 12,
    borderWidth: 2,
    borderColor: '#1A1A2E',
  },
  selectedEquipmentOption: {
    backgroundColor: '#6B46C1',
    borderColor: '#6B46C1',
  },
  equipmentContent: {
    flex: 1,
  },
  equipmentTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  selectedEquipmentTitle: {
    color: '#FFFFFF',
  },
  equipmentSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
  },
  selectedEquipmentSubtitle: {
    color: '#E2E8F0',
  },
  personalSection: {
    gap: 20,
  },
  subsection: {
    gap: 12,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B46C1',
    marginBottom: 4,
  },
  unitOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#1A1A2E',
  },
  selectedUnit: {
    backgroundColor: '#6B46C1',
    borderColor: '#6B46C1',
  },
  unitContent: {
    flex: 1,
  },
  unitLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  selectedUnitLabel: {
    color: '#FFFFFF',
  },
  unitDescription: {
    fontSize: 14,
    color: '#94A3B8',
  },
  selectedUnitDescription: {
    color: '#E2E8F0',
  },
  genderOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#1A1A2E',
  },
  selectedGender: {
    backgroundColor: '#6B46C1',
    borderColor: '#6B46C1',
  },
  genderLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  selectedGenderLabel: {
    color: '#FFFFFF',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    padding: 16,
    gap: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  statsNote: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
});
