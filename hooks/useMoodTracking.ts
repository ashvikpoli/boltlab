import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';

export interface MoodEntry {
  id: string;
  date: string;
  mood_emoji: string;
  energy_level: number;
  confidence_level: number;
  sleep_quality: number;
  stress_level: number;
  notes?: string;
  created_at: string;
}

export interface MoodStats {
  averageEnergy: number;
  averageConfidence: number;
  averageSleep: number;
  averageStress: number;
  mostCommonMood: string;
  totalEntries: number;
  streakDays: number;
}

export interface MoodTrend {
  date: string;
  energy: number;
  confidence: number;
  sleep: number;
  stress: number;
  mood: string;
}

export const MOOD_EMOJIS = [
  { emoji: '💪', label: 'Powerful', value: 'powerful' },
  { emoji: '😅', label: 'Energetic', value: 'energetic' },
  { emoji: '😤', label: 'Determined', value: 'determined' },
  { emoji: '💀', label: 'Exhausted', value: 'exhausted' },
  { emoji: '🌟', label: 'Amazing', value: 'amazing' },
  { emoji: '😊', label: 'Happy', value: 'happy' },
  { emoji: '😐', label: 'Neutral', value: 'neutral' },
  { emoji: '😓', label: 'Tired', value: 'tired' },
  { emoji: '😴', label: 'Sleepy', value: 'sleepy' },
  { emoji: '🔥', label: 'Motivated', value: 'motivated' },
];

export function useMoodTracking() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [todayMood, setTodayMood] = useState<MoodEntry | null>(null);
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  const [moodStats, setMoodStats] = useState<MoodStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadTodayMood();
      loadMoodHistory();
    }
  }, [user]);

  // Load today's mood entry
  const loadTodayMood = async () => {
    if (!user) return;

    try {
      const today = new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('mood_tracking')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows found
        console.error('Error loading today mood:', error);
      } else {
        setTodayMood(data);
      }
    } catch (error) {
      console.error('Error loading today mood:', error);
    }
  };

  // Load mood history
  const loadMoodHistory = async (days: number = 30) => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('mood_tracking')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(days);

      if (error) {
        console.error('Error loading mood history:', error);
        setError('Failed to load mood history');
      } else {
        setMoodHistory(data || []);
        calculateMoodStats(data || []);
      }
    } catch (error) {
      console.error('Error loading mood history:', error);
      setError('Failed to load mood history');
    } finally {
      setLoading(false);
    }
  };

  // Save or update mood entry
  const saveMoodEntry = async (moodData: {
    mood_emoji: string;
    energy_level: number;
    confidence_level: number;
    sleep_quality: number;
    stress_level: number;
    notes?: string;
  }): Promise<boolean> => {
    if (!user) return false;

    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];

      // Check if entry already exists for today
      const { data: existingEntry } = await supabase
        .from('mood_tracking')
        .select('id')
        .eq('user_id', user.id)
        .eq('date', today)
        .single();

      let result;

      if (existingEntry) {
        // Update existing entry
        result = await supabase
          .from('mood_tracking')
          .update({
            ...moodData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingEntry.id)
          .select()
          .single();
      } else {
        // Create new entry
        result = await supabase
          .from('mood_tracking')
          .insert({
            user_id: user.id,
            date: today,
            ...moodData,
          })
          .select()
          .single();
      }

      if (result.error) {
        console.error('Error saving mood entry:', result.error);
        setError('Failed to save mood entry');
        return false;
      } else {
        setTodayMood(result.data);
        await loadMoodHistory(); // Refresh history
        return true;
      }
    } catch (error) {
      console.error('Error saving mood entry:', error);
      setError('Failed to save mood entry');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Calculate mood statistics
  const calculateMoodStats = (entries: MoodEntry[]) => {
    if (entries.length === 0) {
      setMoodStats(null);
      return;
    }

    const totalEntries = entries.length;

    // Calculate averages
    const avgEnergy =
      entries.reduce((sum, entry) => sum + entry.energy_level, 0) /
      totalEntries;
    const avgConfidence =
      entries.reduce((sum, entry) => sum + entry.confidence_level, 0) /
      totalEntries;
    const avgSleep =
      entries.reduce((sum, entry) => sum + entry.sleep_quality, 0) /
      totalEntries;
    const avgStress =
      entries.reduce((sum, entry) => sum + entry.stress_level, 0) /
      totalEntries;

    // Find most common mood
    const moodCounts: { [key: string]: number } = {};
    entries.forEach((entry) => {
      moodCounts[entry.mood_emoji] = (moodCounts[entry.mood_emoji] || 0) + 1;
    });

    const mostCommonMood =
      Object.entries(moodCounts).sort(([, a], [, b]) => b - a)[0]?.[0] || '😐';

    // Calculate streak days (consecutive days with entries)
    let streakDays = 0;
    const sortedEntries = entries.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    let currentDate = new Date();
    for (const entry of sortedEntries) {
      const entryDate = new Date(entry.date);
      const daysDiff = Math.floor(
        (currentDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysDiff === streakDays) {
        streakDays++;
        currentDate = entryDate;
      } else {
        break;
      }
    }

    setMoodStats({
      averageEnergy: Math.round(avgEnergy * 10) / 10,
      averageConfidence: Math.round(avgConfidence * 10) / 10,
      averageSleep: Math.round(avgSleep * 10) / 10,
      averageStress: Math.round(avgStress * 10) / 10,
      mostCommonMood,
      totalEntries,
      streakDays,
    });
  };

  // Get mood trends for charts
  const getMoodTrends = (days: number = 7): MoodTrend[] => {
    const trends: MoodTrend[] = [];
    const sortedHistory = moodHistory
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-days);

    sortedHistory.forEach((entry) => {
      trends.push({
        date: entry.date,
        energy: entry.energy_level,
        confidence: entry.confidence_level,
        sleep: entry.sleep_quality,
        stress: entry.stress_level,
        mood: entry.mood_emoji,
      });
    });

    return trends;
  };

  // Get correlation insights
  const getMoodInsights = (): string[] => {
    if (moodHistory.length < 7) {
      return ['Track your mood for a week to get personalized insights!'];
    }

    const insights: string[] = [];
    const recent = moodHistory.slice(0, 7);

    // Energy insights
    const avgEnergy =
      recent.reduce((sum, entry) => sum + entry.energy_level, 0) /
      recent.length;
    if (avgEnergy >= 8) {
      insights.push(
        '🌟 Your energy levels have been consistently high this week!'
      );
    } else if (avgEnergy <= 4) {
      insights.push(
        '⚡ Consider focusing on rest and recovery to boost energy levels'
      );
    }

    // Sleep insights
    const avgSleep =
      recent.reduce((sum, entry) => sum + entry.sleep_quality, 0) /
      recent.length;
    if (avgSleep <= 5) {
      insights.push(
        '😴 Poor sleep quality may be affecting your energy and mood'
      );
    } else if (avgSleep >= 8) {
      insights.push('🛌 Great sleep quality is supporting your wellness!');
    }

    // Confidence insights
    const avgConfidence =
      recent.reduce((sum, entry) => sum + entry.confidence_level, 0) /
      recent.length;
    if (avgConfidence >= 8) {
      insights.push('💪 Your confidence levels are through the roof!');
    } else if (avgConfidence <= 5) {
      insights.push('🎯 Regular workouts can help boost confidence levels');
    }

    // Stress insights
    const avgStress =
      recent.reduce((sum, entry) => sum + entry.stress_level, 0) /
      recent.length;
    if (avgStress >= 7) {
      insights.push('🧘 Consider adding recovery activities to manage stress');
    } else if (avgStress <= 3) {
      insights.push("😌 You're managing stress levels really well!");
    }

    return insights.length > 0
      ? insights
      : ['Keep tracking to discover patterns in your wellness journey!'];
  };

  // Delete mood entry
  const deleteMoodEntry = async (date: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('mood_tracking')
        .delete()
        .eq('user_id', user.id)
        .eq('date', date);

      if (error) {
        console.error('Error deleting mood entry:', error);
        setError('Failed to delete mood entry');
        return false;
      } else {
        await loadMoodHistory(); // Refresh history
        if (date === new Date().toISOString().split('T')[0]) {
          setTodayMood(null);
        }
        return true;
      }
    } catch (error) {
      console.error('Error deleting mood entry:', error);
      setError('Failed to delete mood entry');
      return false;
    }
  };

  // Get mood color for visualization
  const getMoodColor = (mood: string): string => {
    const colorMap: { [key: string]: string } = {
      '💪': '#6B46C1', // Purple
      '😅': '#F59E0B', // Amber
      '😤': '#EF4444', // Red
      '💀': '#374151', // Gray
      '🌟': '#10B981', // Emerald
      '😊': '#3B82F6', // Blue
      '😐': '#6B7280', // Gray
      '😓': '#F97316', // Orange
      '😴': '#8B5CF6', // Violet
      '🔥': '#DC2626', // Red
    };
    return colorMap[mood] || '#6B7280';
  };

  return {
    // State
    loading,
    error,
    todayMood,
    moodHistory,
    moodStats,

    // Actions
    saveMoodEntry,
    deleteMoodEntry,
    loadMoodHistory,
    loadTodayMood,

    // Data processing
    getMoodTrends,
    getMoodInsights,
    getMoodColor,

    // Constants
    MOOD_EMOJIS,

    // Utilities
    setError: (error: string | null) => setError(error),
    clearError: () => setError(null),
  };
}
