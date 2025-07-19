import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
} from 'react-native';
import { useMoodTracking, MOOD_EMOJIS } from '@/hooks/useMoodTracking';

interface MoodTrackerProps {
  onSave?: () => void;
}

export function MoodTracker({ onSave }: MoodTrackerProps) {
  const { saveMoodEntry, todayMood, loading } = useMoodTracking();

  const [selectedMood, setSelectedMood] = useState(todayMood?.mood_emoji || '');
  const [energyLevel, setEnergyLevel] = useState(todayMood?.energy_level || 5);
  const [confidenceLevel, setConfidenceLevel] = useState(
    todayMood?.confidence_level || 5
  );
  const [sleepQuality, setSleepQuality] = useState(
    todayMood?.sleep_quality || 5
  );
  const [stressLevel, setStressLevel] = useState(todayMood?.stress_level || 5);
  const [notes, setNotes] = useState(todayMood?.notes || '');

  const hasAlreadyTracked = !!todayMood;

  const handleSave = async () => {
    if (!selectedMood) {
      Alert.alert(
        'Please select a mood',
        'Choose an emoji that represents how you feel today'
      );
      return;
    }

    const success = await saveMoodEntry({
      mood_emoji: selectedMood,
      energy_level: energyLevel,
      confidence_level: confidenceLevel,
      sleep_quality: sleepQuality,
      stress_level: stressLevel,
      notes: notes.trim() || undefined,
    });

    if (success) {
      Alert.alert('Success!', 'Your mood has been tracked! 📊');
      onSave?.();
    } else {
      Alert.alert('Error', 'Failed to save your mood. Please try again.');
    }
  };

  const renderMoodSelector = () => (
    <View style={styles.moodSelector}>
      <Text style={styles.sectionTitle}>How are you feeling today?</Text>
      <View style={styles.moodGrid}>
        {MOOD_EMOJIS.map((mood) => (
          <TouchableOpacity
            key={mood.emoji}
            style={[
              styles.moodButton,
              selectedMood === mood.emoji && styles.selectedMoodButton,
            ]}
            onPress={() => setSelectedMood(mood.emoji)}
          >
            <Text style={styles.moodEmoji}>{mood.emoji}</Text>
            <Text style={styles.moodLabel}>{mood.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderSlider = (
    title: string,
    value: number,
    setValue: (value: number) => void,
    leftLabel: string,
    rightLabel: string,
    color: string = '#A855F7'
  ) => (
    <View style={styles.sliderContainer}>
      <Text style={styles.sliderTitle}>{title}</Text>
      <View style={styles.sliderLabels}>
        <Text style={styles.sliderLabel}>{leftLabel}</Text>
        <Text style={[styles.sliderValue, { color }]}>{value}/10</Text>
        <Text style={styles.sliderLabel}>{rightLabel}</Text>
      </View>
      <View style={styles.sliderTrack}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
          <TouchableOpacity
            key={level}
            style={[
              styles.sliderDot,
              level <= value && { backgroundColor: color },
            ]}
            onPress={() => setValue(level)}
          />
        ))}
      </View>
    </View>
  );

  if (hasAlreadyTracked) {
    return (
      <View style={styles.container}>
        <View style={styles.completedHeader}>
          <Text style={styles.completedIcon}>✅</Text>
          <Text style={styles.completedTitle}>Today's Mood Tracked!</Text>
          <Text style={styles.completedSubtitle}>
            You've already logged your mood for today
          </Text>
        </View>

        <View style={styles.summaryContainer}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryMood}>{todayMood.mood_emoji}</Text>
            <Text style={styles.summaryText}>
              {todayMood.notes || 'No notes'}
            </Text>
          </View>

          <View style={styles.metricsGrid}>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Energy</Text>
              <Text style={styles.metricValue}>
                {todayMood.energy_level}/10
              </Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Confidence</Text>
              <Text style={styles.metricValue}>
                {todayMood.confidence_level}/10
              </Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Sleep</Text>
              <Text style={styles.metricValue}>
                {todayMood.sleep_quality}/10
              </Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Stress</Text>
              <Text style={styles.metricValue}>
                {todayMood.stress_level}/10
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Daily Mood Check-in</Text>
        <Text style={styles.subtitle}>
          Track your wellness to optimize your workouts
        </Text>
      </View>

      {renderMoodSelector()}

      {renderSlider(
        'Energy Level',
        energyLevel,
        setEnergyLevel,
        'Exhausted',
        'Energized',
        '#10B981'
      )}

      {renderSlider(
        'Confidence Level',
        confidenceLevel,
        setConfidenceLevel,
        'Low',
        'High',
        '#F59E0B'
      )}

      {renderSlider(
        'Sleep Quality',
        sleepQuality,
        setSleepQuality,
        'Poor',
        'Excellent',
        '#3B82F6'
      )}

      {renderSlider(
        'Stress Level',
        stressLevel,
        setStressLevel,
        'Calm',
        'Stressed',
        '#EF4444'
      )}

      <View style={styles.notesContainer}>
        <Text style={styles.sectionTitle}>Additional Notes (Optional)</Text>
        <TextInput
          style={styles.notesInput}
          placeholder="How are you feeling today? Any concerns or wins?"
          placeholderTextColor="#6B7280"
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
          maxLength={200}
        />
      </View>

      <TouchableOpacity
        style={[styles.saveButton, loading && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={loading}
      >
        <Text style={styles.saveButtonText}>
          {loading ? 'Saving...' : 'Save Mood Check-in'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 20,
    margin: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  completedHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  completedIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  completedTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 4,
  },
  completedSubtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  summaryContainer: {
    backgroundColor: '#262626',
    borderRadius: 12,
    padding: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryMood: {
    fontSize: 32,
    marginRight: 12,
  },
  summaryText: {
    flex: 1,
    fontSize: 16,
    color: '#E5E7EB',
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricItem: {
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  moodSelector: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  moodButton: {
    width: '18%',
    aspectRatio: 1,
    backgroundColor: '#262626',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedMoodButton: {
    borderColor: '#A855F7',
    backgroundColor: '#1A1A2E',
  },
  moodEmoji: {
    fontSize: 24,
    marginBottom: 2,
  },
  moodLabel: {
    fontSize: 10,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  sliderContainer: {
    marginBottom: 20,
  },
  sliderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sliderLabel: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  sliderValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  sliderTrack: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sliderDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#374151',
    borderWidth: 2,
    borderColor: '#4B5563',
  },
  notesContainer: {
    marginBottom: 24,
  },
  notesInput: {
    backgroundColor: '#262626',
    borderRadius: 12,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 16,
    textAlignVertical: 'top',
    minHeight: 80,
  },
  saveButton: {
    backgroundColor: '#A855F7',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
