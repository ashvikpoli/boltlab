import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { Zap, Target, Users, Mail, Lock, User } from 'lucide-react-native';
import { BoltCard, LightningButton, ProgressRing, SmartInput } from './index';
import { BoltColors, BoltSpacing } from './constants';

export const DesignSystemDemo: React.FC = () => {
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [progress, setProgress] = useState(75);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const goals = [
    {
      id: 'fat-burn',
      title: 'Fat Burn Journey',
      icon: Target,
      description: 'Torch calories, build lean muscle',
    },
    {
      id: 'strength',
      title: 'Strength Journey',
      icon: Zap,
      description: 'Build power, lift heavier',
    },
    {
      id: 'endurance',
      title: 'Cardio Journey',
      icon: Users,
      description: 'Boost endurance, feel energized',
    },
  ];

  const handleGoalSelect = (goalId: string) => {
    setSelectedGoal(goalId);
  };

  const handleSubmit = () => {
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);

      // Reset success state after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    }, 2000);
  };

  const incrementProgress = () => {
    setProgress((prev) => Math.min(prev + 10, 100));
  };

  const decrementProgress = () => {
    setProgress((prev) => Math.max(prev - 10, 0));
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>⚡ BoltFit Design System</Text>
          <Text style={styles.subtitle}>
            Phantom-inspired premium components
          </Text>
        </View>

        {/* Goal Selection Cards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Interactive Goal Cards</Text>
          <View style={styles.goalGrid}>
            {goals.map((goal) => (
              <BoltCard
                key={goal.id}
                variant="interactive"
                size="md"
                selected={selectedGoal === goal.id}
                onPress={() => handleGoalSelect(goal.id)}
                style={styles.goalCard}
              >
                <View style={styles.goalContent}>
                  <View style={styles.goalIcon}>
                    <goal.icon
                      size={24}
                      color={selectedGoal === goal.id ? '#FFFFFF' : '#A78BFA'}
                    />
                  </View>
                  <Text
                    style={[
                      styles.goalTitle,
                      selectedGoal === goal.id && styles.selectedGoalTitle,
                    ]}
                  >
                    {goal.title}
                  </Text>
                  <Text
                    style={[
                      styles.goalDescription,
                      selectedGoal === goal.id &&
                        styles.selectedGoalDescription,
                    ]}
                  >
                    {goal.description}
                  </Text>
                </View>
              </BoltCard>
            ))}
          </View>
        </View>

        {/* Progress Ring Demo */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Progress Rings</Text>
          <View style={styles.progressRow}>
            <View style={styles.progressItem}>
              <ProgressRing
                progress={progress}
                size="lg"
                variant="gradient"
                showPercentage
                color="primary"
              />
              <Text style={styles.progressLabel}>Gradient</Text>
            </View>

            <View style={styles.progressItem}>
              <ProgressRing
                progress={progress}
                size="lg"
                variant="default"
                showPercentage
                color="success"
              />
              <Text style={styles.progressLabel}>Success</Text>
            </View>

            <View style={styles.progressItem}>
              <ProgressRing
                progress={progress}
                size="lg"
                variant="segmented"
                color="warning"
              />
              <Text style={styles.progressLabel}>Segmented</Text>
            </View>
          </View>

          <View style={styles.progressControls}>
            <LightningButton
              variant="secondary"
              size="sm"
              onPress={decrementProgress}
            >
              -10%
            </LightningButton>
            <LightningButton
              variant="secondary"
              size="sm"
              onPress={incrementProgress}
            >
              +10%
            </LightningButton>
          </View>
        </View>

        {/* Smart Inputs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Smart Input Fields</Text>

          <SmartInput
            label="Full Name"
            value={name}
            onChangeText={setName}
            leftIcon={<User size={18} color="#94A3B8" />}
            clearable
            helperText="This will be displayed on your profile"
          />

          <SmartInput
            label="Email Address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon={<Mail size={18} color="#94A3B8" />}
            validation={(value) => {
              if (!value.includes('@'))
                return 'Please enter a valid email address';
              return null;
            }}
            clearable
          />

          <SmartInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            leftIcon={<Lock size={18} color="#94A3B8" />}
            helperText="Must be at least 8 characters"
            validation={(value) => {
              if (value.length < 8)
                return 'Password must be at least 8 characters';
              return null;
            }}
          />
        </View>

        {/* Button Variants */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lightning Buttons</Text>

          <View style={styles.buttonColumn}>
            <LightningButton
              variant="primary"
              size="lg"
              fullWidth
              onPress={handleSubmit}
              loading={loading}
              success={success}
              leftIcon={<Zap size={20} color="#FFFFFF" />}
            >
              {loading
                ? 'Creating Account...'
                : success
                ? 'Account Created!'
                : 'Get Started'}
            </LightningButton>

            <View style={styles.buttonRow}>
              <LightningButton
                variant="secondary"
                size="md"
                style={styles.halfButton}
              >
                Secondary
              </LightningButton>

              <LightningButton
                variant="ghost"
                size="md"
                style={styles.halfButton}
              >
                Ghost
              </LightningButton>
            </View>

            <LightningButton variant="danger" size="sm" fullWidth>
              Danger Action
            </LightningButton>
          </View>
        </View>

        {/* Glass Card Demo */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Glass Morphism Card</Text>

          <BoltCard variant="glass" size="lg">
            <View style={styles.glassContent}>
              <Zap size={32} color="#A78BFA" />
              <Text style={styles.glassTitle}>Premium Feature</Text>
              <Text style={styles.glassDescription}>
                This glass-morphism card creates depth and sophistication,
                perfect for highlighting premium features or important content.
              </Text>
              <ProgressRing
                progress={90}
                size="md"
                variant="gradient"
                showPercentage
                color="primary"
              />
            </View>
          </BoltCard>
        </View>

        {/* Color Palette Demo */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Color Palette</Text>

          <View style={styles.colorGrid}>
            <View
              style={[
                styles.colorSwatch,
                { backgroundColor: BoltColors.primary[600] },
              ]}
            >
              <Text style={styles.colorLabel}>Primary</Text>
            </View>
            <View
              style={[
                styles.colorSwatch,
                { backgroundColor: BoltColors.semantic.success },
              ]}
            >
              <Text style={styles.colorLabel}>Success</Text>
            </View>
            <View
              style={[
                styles.colorSwatch,
                { backgroundColor: BoltColors.semantic.warning },
              ]}
            >
              <Text style={styles.colorLabel}>Warning</Text>
            </View>
            <View
              style={[
                styles.colorSwatch,
                { backgroundColor: BoltColors.semantic.error },
              ]}
            >
              <Text style={styles.colorLabel}>Error</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BoltColors.background.primary,
  },

  scrollView: {
    flex: 1,
  },

  contentContainer: {
    padding: BoltSpacing[4],
    paddingBottom: BoltSpacing[16],
  },

  header: {
    alignItems: 'center',
    marginBottom: BoltSpacing[8],
  },

  title: {
    fontSize: 28,
    fontWeight: '700',
    color: BoltColors.text.primary,
    fontFamily: 'Inter',
    marginBottom: BoltSpacing[2],
  },

  subtitle: {
    fontSize: 16,
    color: BoltColors.text.secondary,
    fontFamily: 'Inter',
    textAlign: 'center',
  },

  section: {
    marginBottom: BoltSpacing[8],
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: BoltColors.text.primary,
    fontFamily: 'Inter',
    marginBottom: BoltSpacing[4],
  },

  // Goal Selection
  goalGrid: {
    gap: BoltSpacing[4],
  },

  goalCard: {
    marginBottom: BoltSpacing[3],
  },

  goalContent: {
    alignItems: 'center',
    paddingVertical: BoltSpacing[2],
  },

  goalIcon: {
    marginBottom: BoltSpacing[3],
  },

  goalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: BoltColors.text.primary,
    fontFamily: 'Inter',
    marginBottom: BoltSpacing[1],
    textAlign: 'center',
  },

  selectedGoalTitle: {
    color: '#FFFFFF',
  },

  goalDescription: {
    fontSize: 14,
    color: BoltColors.text.secondary,
    fontFamily: 'Inter',
    textAlign: 'center',
  },

  selectedGoalDescription: {
    color: 'rgba(255, 255, 255, 0.8)',
  },

  // Progress Ring
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: BoltSpacing[4],
  },

  progressItem: {
    alignItems: 'center',
    gap: BoltSpacing[2],
  },

  progressLabel: {
    fontSize: 12,
    color: BoltColors.text.secondary,
    fontFamily: 'Inter',
  },

  progressControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: BoltSpacing[4],
  },

  // Buttons
  buttonColumn: {
    gap: BoltSpacing[4],
  },

  buttonRow: {
    flexDirection: 'row',
    gap: BoltSpacing[3],
  },

  halfButton: {
    flex: 1,
  },

  // Glass Card
  glassContent: {
    alignItems: 'center',
    gap: BoltSpacing[3],
  },

  glassTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: BoltColors.text.primary,
    fontFamily: 'Inter',
  },

  glassDescription: {
    fontSize: 14,
    color: BoltColors.text.secondary,
    fontFamily: 'Inter',
    textAlign: 'center',
    lineHeight: 20,
  },

  // Color Palette
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: BoltSpacing[3],
  },

  colorSwatch: {
    width: 70,
    height: 70,
    borderRadius: BoltSpacing[2],
    alignItems: 'center',
    justifyContent: 'center',
  },

  colorLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter',
  },
});
