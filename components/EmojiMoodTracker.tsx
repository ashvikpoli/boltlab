import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Zap,
  Heart,
  Moon,
  Coffee,
  Target,
  TrendingUp,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import GlassMorphCard from './GlassMorphCard';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface MoodOption {
  emoji: string;
  label: string;
  value: number;
  color: string;
}

interface MetricSliderProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  onChange: (value: number) => void;
  color: string;
  minLabel: string;
  maxLabel: string;
}

const moodOptions: MoodOption[] = [
  { emoji: '😴', label: 'Exhausted', value: 1, color: '#64748B' },
  { emoji: '😕', label: 'Low', value: 2, color: '#EF4444' },
  { emoji: '😐', label: 'Okay', value: 3, color: '#F59E0B' },
  { emoji: '😊', label: 'Good', value: 4, color: '#10B981' },
  { emoji: '🚀', label: 'Amazing', value: 5, color: '#6B46C1' },
];

const quickMoodCategories = [
  { emoji: '💪', label: 'Motivated', category: 'motivated' },
  { emoji: '😴', label: 'Tired', category: 'tired' },
  { emoji: '🔥', label: 'Fired_Up', category: 'fired_up' },
  { emoji: '😌', label: 'Calm', category: 'calm' },
  { emoji: '😬', label: 'Anxious', category: 'anxious' },
  { emoji: '🎯', label: 'Focused', category: 'focused' },
  { emoji: '🤕', label: 'Sore', category: 'sore' },
  { emoji: '⚡', label: 'Energetic', category: 'energetic' },
];

function MetricSlider({
  icon,
  label,
  value,
  onChange,
  color,
  minLabel,
  maxLabel,
}: MetricSliderProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = (newValue: number) => {
    // Haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Scale animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    onChange(newValue);
  };

  return (
    <GlassMorphCard style={styles.metricCard}>
      <View style={styles.metricHeader}>
        <View style={[styles.metricIcon, { backgroundColor: color + '20' }]}>
          {icon}
        </View>
        <Text style={styles.metricLabel}>{label}</Text>
      </View>

      <View style={styles.sliderContainer}>
        <Text style={styles.sliderMinLabel}>{minLabel}</Text>

        <View style={styles.slider}>
          {[1, 2, 3, 4, 5].map((rating) => (
            <Animated.View
              key={rating}
              style={[
                styles.sliderDot,
                {
                  transform: [{ scale: value === rating ? scaleAnim : 1 }],
                },
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.sliderDotTouch,
                  {
                    backgroundColor:
                      value >= rating ? color : 'rgba(100, 116, 139, 0.3)',
                    borderColor:
                      value >= rating ? color : 'rgba(100, 116, 139, 0.5)',
                  },
                ]}
                onPress={() => handlePress(rating)}
              >
                {value >= rating && <View style={styles.sliderDotInner} />}
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>

        <Text style={styles.sliderMaxLabel}>{maxLabel}</Text>
      </View>
    </GlassMorphCard>
  );
}

interface EmojiMoodTrackerProps {
  onSave: (data: any) => void;
  initialData?: any;
}

export default function EmojiMoodTracker({
  onSave,
  initialData,
}: EmojiMoodTrackerProps) {
  const [selectedMood, setSelectedMood] = useState<number>(
    initialData?.mood || 3
  );
  const [energyLevel, setEnergyLevel] = useState<number>(
    initialData?.energy || 3
  );
  const [confidenceLevel, setConfidenceLevel] = useState<number>(
    initialData?.confidence || 3
  );
  const [sleepQuality, setSleepQuality] = useState<number>(
    initialData?.sleep || 3
  );
  const [stressLevel, setStressLevel] = useState<number>(
    initialData?.stress || 3
  );
  const [selectedQuickMoods, setSelectedQuickMoods] = useState<string[]>(
    initialData?.quickMoods || []
  );

  const selectedMoodData = moodOptions.find((m) => m.value === selectedMood);

  const handleMoodSelect = (mood: MoodOption) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedMood(mood.value);
  };

  const handleQuickMoodToggle = (category: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    setSelectedQuickMoods((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleSave = () => {
    const moodData = {
      mood: selectedMood,
      energy: energyLevel,
      confidence: confidenceLevel,
      sleep: sleepQuality,
      stress: stressLevel,
      quickMoods: selectedQuickMoods,
      timestamp: new Date().toISOString(),
    };

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    onSave(moodData);
  };

  const getOverallWellnessScore = () => {
    const scores = [
      energyLevel,
      confidenceLevel,
      sleepQuality,
      6 - stressLevel,
    ]; // Invert stress
    const average = scores.reduce((a, b) => a + b, 0) / scores.length;
    return Math.round(average * 20); // Convert to percentage
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <GlassMorphCard style={styles.headerCard} glowEffect>
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Heart size={24} color="#6B46C1" />
          </View>
          <Text style={styles.headerTitle}>How are you feeling?</Text>
          <Text style={styles.headerSubtitle}>
            Quick check-in to optimize your workout
          </Text>
        </View>
      </GlassMorphCard>

      {/* Main Mood Selector */}
      <GlassMorphCard style={styles.moodSelectorCard}>
        <Text style={styles.sectionTitle}>Overall Mood</Text>
        <View style={styles.moodSelector}>
          {moodOptions.map((mood) => (
            <TouchableOpacity
              key={mood.value}
              style={[
                styles.moodOption,
                selectedMood === mood.value && styles.moodOptionSelected,
                {
                  borderColor:
                    selectedMood === mood.value ? mood.color : 'transparent',
                  backgroundColor:
                    selectedMood === mood.value
                      ? mood.color + '20'
                      : 'rgba(26, 26, 46, 0.3)',
                },
              ]}
              onPress={() => handleMoodSelect(mood)}
            >
              <Text style={styles.moodEmoji}>{mood.emoji}</Text>
              <Text
                style={[
                  styles.moodLabel,
                  {
                    color: selectedMood === mood.value ? mood.color : '#94A3B8',
                  },
                ]}
              >
                {mood.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </GlassMorphCard>

      {/* Quick Mood Tags */}
      <GlassMorphCard style={styles.quickMoodCard}>
        <Text style={styles.sectionTitle}>What's on your mind?</Text>
        <Text style={styles.sectionSubtitle}>Tap all that apply</Text>
        <View style={styles.quickMoodGrid}>
          {quickMoodCategories.map((item) => (
            <TouchableOpacity
              key={item.category}
              style={[
                styles.quickMoodTag,
                selectedQuickMoods.includes(item.category) &&
                  styles.quickMoodTagSelected,
              ]}
              onPress={() => handleQuickMoodToggle(item.category)}
            >
              <Text style={styles.quickMoodEmoji}>{item.emoji}</Text>
              <Text
                style={[
                  styles.quickMoodLabel,
                  selectedQuickMoods.includes(item.category) &&
                    styles.quickMoodLabelSelected,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </GlassMorphCard>

      {/* Wellness Metrics */}
      <View style={styles.metricsSection}>
        <MetricSlider
          icon={<Zap size={20} color="#10B981" />}
          label="Energy Level"
          value={energyLevel}
          onChange={setEnergyLevel}
          color="#10B981"
          minLabel="Drained"
          maxLabel="Energized"
        />

        <MetricSlider
          icon={<Target size={20} color="#6B46C1" />}
          label="Confidence"
          value={confidenceLevel}
          onChange={setConfidenceLevel}
          color="#6B46C1"
          minLabel="Low"
          maxLabel="High"
        />

        <MetricSlider
          icon={<Moon size={20} color="#3B82F6" />}
          label="Sleep Quality"
          value={sleepQuality}
          onChange={setSleepQuality}
          color="#3B82F6"
          minLabel="Poor"
          maxLabel="Great"
        />

        <MetricSlider
          icon={<Coffee size={20} color="#F59E0B" />}
          label="Stress Level"
          value={stressLevel}
          onChange={setStressLevel}
          color="#F59E0B"
          minLabel="Calm"
          maxLabel="Stressed"
        />
      </View>

      {/* Wellness Score */}
      <GlassMorphCard style={styles.wellnessCard} variant="accent" glowEffect>
        <View style={styles.wellnessHeader}>
          <TrendingUp size={24} color="#A855F7" />
          <Text style={styles.wellnessTitle}>Wellness Score</Text>
        </View>
        <View style={styles.wellnessScore}>
          <Text style={styles.wellnessScoreNumber}>
            {getOverallWellnessScore()}%
          </Text>
          <Text style={styles.wellnessScoreLabel}>
            {getOverallWellnessScore() >= 80
              ? 'Excellent! 🚀'
              : getOverallWellnessScore() >= 60
              ? 'Good! 💪'
              : getOverallWellnessScore() >= 40
              ? 'Okay 👍'
              : 'Take care 🤗'}
          </Text>
        </View>
      </GlassMorphCard>

      {/* Save Button */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <LinearGradient
          colors={['#6B46C1', '#8B5CF6']}
          style={styles.saveButtonGradient}
        >
          <Heart size={20} color="#FFFFFF" />
          <Text style={styles.saveButtonText}>Save Check-in</Text>
        </LinearGradient>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  headerCard: {
    marginBottom: 16,
  },
  header: {
    alignItems: 'center',
    padding: 20,
  },
  headerIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(107, 70, 193, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
  },
  moodSelectorCard: {
    marginBottom: 16,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 16,
    textAlign: 'center',
  },
  moodSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  moodOption: {
    width: (SCREEN_WIDTH - 80) / 5,
    aspectRatio: 1,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    marginBottom: 8,
  },
  moodOptionSelected: {
    borderWidth: 2,
  },
  moodEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  moodLabel: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  quickMoodCard: {
    marginBottom: 16,
    padding: 20,
  },
  quickMoodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickMoodTag: {
    width: (SCREEN_WIDTH - 80) / 3,
    backgroundColor: 'rgba(26, 26, 46, 0.3)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  quickMoodTagSelected: {
    backgroundColor: 'rgba(107, 70, 193, 0.2)',
    borderColor: '#6B46C1',
  },
  quickMoodEmoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  quickMoodLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#94A3B8',
    textAlign: 'center',
  },
  quickMoodLabelSelected: {
    color: '#6B46C1',
  },
  metricsSection: {
    gap: 12,
    marginBottom: 16,
  },
  metricCard: {
    padding: 16,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  metricIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  metricLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sliderMinLabel: {
    fontSize: 12,
    color: '#64748B',
    width: 60,
  },
  sliderMaxLabel: {
    fontSize: 12,
    color: '#64748B',
    width: 60,
    textAlign: 'right',
  },
  slider: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-between',
    marginHorizontal: 16,
  },
  sliderDot: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  sliderDotTouch: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sliderDotInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  wellnessCard: {
    marginBottom: 24,
    padding: 20,
  },
  wellnessHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  wellnessTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  wellnessScore: {
    alignItems: 'center',
  },
  wellnessScoreNumber: {
    fontSize: 48,
    fontWeight: '800',
    color: '#A855F7',
    marginBottom: 8,
  },
  wellnessScoreLabel: {
    fontSize: 16,
    color: '#94A3B8',
    fontWeight: '500',
  },
  saveButton: {
    marginBottom: 32,
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
});
