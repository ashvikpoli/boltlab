import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Zap,
  Dumbbell,
  User,
  Settings,
  Info,
  Play,
  Star,
  MoreHorizontal,
} from 'lucide-react-native';
import { Exercise } from '@/types/workout';
import {
  getExerciseImage as getExerciseImageFromRegistry,
} from '@/data/availableExercises';

interface ExerciseCardProps {
  exercise: Exercise;
  onStart: (exercise: Exercise) => void;
  onShowDetails?: (exercise: Exercise) => void;
  showFullDetails?: boolean;
}

const getMuscleGroupIcon = (muscleGroup: string) => {
  switch (muscleGroup.toLowerCase()) {
    case 'chest':
    case 'back':
    case 'shoulders':
      return Dumbbell;
    case 'legs':
      return User;
    case 'arms':
      return Settings;
    default:
      return Dumbbell;
  }
};

const getCategoryColor = (category: string | undefined) => {
  if (!category) return '#6B46C1';
  switch (category) {
    case 'strength':
      return '#6B46C1';
    case 'cardio':
      return '#3B82F6';
    case 'flexibility':
      return '#10B981';
    case 'balance':
      return '#F59E0B';
    default:
      return '#6B46C1';
  }
};

// Helper function to get exercise image using the registry
const getExerciseImage = (exerciseName: string) => {
  return getExerciseImageFromRegistry(exerciseName);
};

export default function ExerciseCard({
  exercise,
  onStart,
  onShowDetails,
  showFullDetails = false,
}: ExerciseCardProps) {
  const [imageError, setImageError] = useState(false);
  const categoryColor = getCategoryColor(exercise.category);
  const MuscleIcon = getMuscleGroupIcon(exercise.muscleGroup);

  const handleImageError = () => {
    setImageError(true);
  };

  const showInstructions = () => {
    if (onShowDetails) {
      onShowDetails(exercise);
    } else {
      Alert.alert(
        String(exercise.name || 'Exercise'),
        exercise.instructions?.setup?.join('\n') ||
          String(exercise.description || 'No instructions available'),
        [{ text: 'OK' }]
      );
    }
  };

  // Get the exercise image
  const exerciseImage = getExerciseImage(exercise.name);

  return (
    <View style={styles.card}>
      <LinearGradient colors={['#1A1A2E', '#0F0F23']} style={styles.gradient}>
        <View style={styles.header}>
        <View style={styles.imageContainer}>
          {!imageError && exerciseImage ? (
            <Image
              source={exerciseImage}
              style={styles.exerciseImage}
                resizeMode="cover"
              onError={handleImageError}
            />
          ) : (
            <View
              style={[
                  styles.placeholderImage,
                { backgroundColor: categoryColor + '20' },
              ]}
            >
                <MuscleIcon size={32} color={categoryColor} />
              </View>
            )}
            <View
              style={[styles.categoryBadge, { backgroundColor: categoryColor }]}
            >
              <Text style={styles.categoryText}>{String(exercise.category || 'General')}</Text>
            </View>
          </View>

          <View style={styles.content}>
            <View style={styles.mainInfo}>
              <Text style={styles.name} numberOfLines={2}>
                {String(exercise.name || 'Exercise')}
              </Text>
              <Text style={styles.muscleGroup}>{String(exercise.muscleGroup || 'Unknown')}</Text>

              {showFullDetails && (
                <View style={styles.details}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Equipment:</Text>
                    <Text style={styles.detailValue}>{String(exercise.equipment || 'None')}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Difficulty:</Text>
                    <View style={styles.difficultyContainer}>
                      <Text
                        style={[
                          styles.difficultyText,
                          { color: categoryColor },
                        ]}
                      >
                        {String(exercise.difficulty || 'Beginner')}
                      </Text>
                    </View>
                  </View>
                  {exercise.sets && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Sets:</Text>
                      <Text style={styles.detailValue}>{String(exercise.sets)}</Text>
                    </View>
                  )}
                  {exercise.reps && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Reps:</Text>
                      <Text style={styles.detailValue}>{String(exercise.reps)}</Text>
                    </View>
                  )}
                  {exercise.weight && exercise.weight > 0 && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Weight:</Text>
                      <Text style={styles.detailValue}>
                        {String(exercise.weight)} lbs
                      </Text>
                    </View>
                  )}
            </View>
          )}
            </View>

            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={showInstructions}
              >
                <Info size={20} color="#94A3B8" />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.startButton, { backgroundColor: categoryColor }]}
                onPress={() => onStart(exercise)}
              >
                <Play size={16} color="#FFFFFF" />
                <Text style={styles.startButtonText}>Start</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {showFullDetails && exercise.description && (
          <View style={styles.description}>
            <Text style={styles.descriptionText}>{String(exercise.description)}</Text>
        </View>
        )}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 16,
    overflow: 'hidden',
  },
  gradient: {
    flexDirection: 'column',
    padding: 16,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  exerciseImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  categoryBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  mainInfo: {
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  muscleGroup: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '400',
  },
  details: {
    marginTop: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '400',
  },
  detailValue: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  difficultyContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#26263F',
  },
  difficultyText: {
    fontSize: 13,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    padding: 8,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 8,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  description: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#33334D',
  },
  descriptionText: {
    fontSize: 14,
    color: '#94A3B8',
    lineHeight: 22,
  },
});
