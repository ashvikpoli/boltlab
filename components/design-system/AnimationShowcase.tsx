import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Zap, Heart, Star, Target, Award, Trophy } from 'lucide-react-native';

import { BoltCard } from './BoltCard';
import { LightningButton } from './LightningButton';
import { FloatingActionButton } from './FloatingActionButton';
import { SmartInput } from './SmartInput';
import { ProgressRing } from './ProgressRing';
import {
  CelebrationBurst,
  Pulse,
  Shake,
  BouncyScale,
  AnimatedProgressRing,
  Sparkle,
} from './AnimatedComponents';

export const AnimationShowcase: React.FC = () => {
  const [showCelebration, setShowCelebration] = useState(false);
  const [shakeError, setShakeError] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [progress, setProgress] = useState(0.3);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  const triggerCelebration = () => {
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 100);
  };

  const triggerShake = () => {
    setShakeError(true);
    setTimeout(() => setShakeError(false), 100);
  };

  const incrementProgress = () => {
    setProgress((prev) => (prev >= 1 ? 0 : prev + 0.2));
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header */}
          <BoltCard variant="energy" style={styles.headerCard}>
            <View style={styles.header}>
              <Zap size={32} color="#FFD700" />
              <Text style={styles.headerTitle}>BoltFit Animation Showcase</Text>
              <Text style={styles.headerSubtitle}>
                Premium Phantom Wallet-Inspired Animations
              </Text>
            </View>
          </BoltCard>

          {/* Lightning Buttons */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⚡ Lightning Buttons</Text>
            <View style={styles.buttonGrid}>
              <LightningButton
                variant="primary"
                size="medium"
                onPress={triggerCelebration}
                celebrateOnPress={true}
                icon={<Zap size={18} color="#FFFFFF" />}
              >
                Celebrate!
              </LightningButton>

              <LightningButton
                variant="secondary"
                size="medium"
                onPress={() => {}}
                pulseWhenActive={true}
              >
                Pulsing
              </LightningButton>

              <LightningButton
                variant="danger"
                size="medium"
                onPress={triggerShake}
                icon={<Heart size={18} color="#FFFFFF" />}
              >
                Danger
              </LightningButton>

              <LightningButton
                variant="primary"
                size="large"
                loading={true}
                onPress={() => {}}
              >
                Loading...
              </LightningButton>
            </View>
          </View>

          {/* Bolt Cards */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎴 Bolt Cards</Text>
            <View style={styles.cardGrid}>
              <BoltCard
                variant="glass"
                onPress={() => setSelectedCard('glass')}
                animated={true}
                style={[
                  styles.demoCard,
                  selectedCard === 'glass' && styles.selectedDemoCard,
                ]}
              >
                <Star size={24} color="#6B46C1" />
                <Text style={styles.cardText}>Glass Morphism</Text>
              </BoltCard>

              <BoltCard
                variant="energy"
                onPress={() => setSelectedCard('energy')}
                animated={true}
                pulseOnHover={true}
                style={[
                  styles.demoCard,
                  selectedCard === 'energy' && styles.selectedDemoCard,
                ]}
              >
                <Zap size={24} color="#FFD700" />
                <Text style={styles.cardText}>Energy State</Text>
              </BoltCard>

              <BoltCard
                variant="solid"
                onPress={() => setSelectedCard('solid')}
                animated={true}
                style={[
                  styles.demoCard,
                  selectedCard === 'solid' && styles.selectedDemoCard,
                ]}
              >
                <Target size={24} color="#10B981" />
                <Text style={styles.cardText}>Solid Card</Text>
              </BoltCard>

              <BoltCard
                variant="outline"
                onPress={() => setSelectedCard('outline')}
                animated={true}
                style={[
                  styles.demoCard,
                  selectedCard === 'outline' && styles.selectedDemoCard,
                ]}
              >
                <Award size={24} color="#F59E0B" />
                <Text style={styles.cardText}>Outline</Text>
              </BoltCard>
            </View>
          </View>

          {/* Smart Input */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📝 Smart Input</Text>
            <Shake trigger={shakeError} intensity={8}>
              <SmartInput
                label="Interactive Input"
                value={inputValue}
                onChangeText={setInputValue}
                placeholder="Type something magical..."
                leftIcon={<Star size={20} color="#6B46C1" />}
                style={styles.inputDemo}
              />
            </Shake>
          </View>

          {/* Progress Rings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⭕ Progress Rings</Text>
            <View style={styles.progressGrid}>
              <View style={styles.progressItem}>
                <Text style={styles.progressLabel}>Static Ring</Text>
                <ProgressRing
                  progress={0.75}
                  size={80}
                  strokeWidth={6}
                  colors={['#6B46C1', '#8B5CF6']}
                  backgroundColor="rgba(107, 70, 193, 0.2)"
                />
              </View>

              <View style={styles.progressItem}>
                <Text style={styles.progressLabel}>Animated Ring</Text>
                <AnimatedProgressRing
                  progress={progress}
                  size={80}
                  strokeWidth={6}
                  color="#10B981"
                  backgroundColor="rgba(16, 185, 129, 0.2)"
                  duration={1000}
                />
                <LightningButton
                  variant="ghost"
                  size="small"
                  onPress={incrementProgress}
                  style={styles.progressButton}
                >
                  +20%
                </LightningButton>
              </View>
            </View>
          </View>

          {/* Floating Action Button */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎈 Floating Action</Text>
            <View style={styles.floatingDemo}>
              <FloatingActionButton
                onPress={() => {}}
                variant="primary"
                size="large"
                pulse={true}
                float={true}
                ripple={true}
              >
                <Trophy size={28} color="#FFFFFF" />
              </FloatingActionButton>
            </View>
          </View>

          {/* Animation Effects */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>✨ Animation Effects</Text>
            <View style={styles.effectsGrid}>
              <Pulse enabled={true} scale={1.1} duration={1500}>
                <BoltCard variant="glass" style={styles.effectCard}>
                  <Text style={styles.effectText}>Pulse</Text>
                </BoltCard>
              </Pulse>

              <BouncyScale pressed={false} scale={0.95}>
                <BoltCard variant="energy" style={styles.effectCard}>
                  <Text style={styles.effectText}>Bouncy</Text>
                </BoltCard>
              </BouncyScale>
            </View>
          </View>

          {/* Celebration Trigger */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎉 Celebration</Text>
            <LightningButton
              variant="primary"
              size="large"
              onPress={triggerCelebration}
              celebrateOnPress={true}
              icon={<Star size={20} color="#FFFFFF" />}
              style={styles.celebrationButton}
            >
              Trigger Epic Celebration!
            </LightningButton>
          </View>

          {/* Global Celebration Effect */}
          <CelebrationBurst
            trigger={showCelebration}
            onComplete={() => setShowCelebration(false)}
            sparkleCount={20}
            colors={[
              '#FFD700',
              '#FF6B6B',
              '#4ECDC4',
              '#45B7D1',
              '#96CEB4',
              '#FFEAA7',
              '#6B46C1',
            ]}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F23',
  },
  content: {
    padding: 20,
  },
  headerCard: {
    marginBottom: 24,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#A78BFA',
    marginTop: 4,
    textAlign: 'center',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  demoCard: {
    flex: 1,
    minWidth: 150,
    padding: 20,
    alignItems: 'center',
  },
  selectedDemoCard: {
    borderColor: '#FFD700',
    borderWidth: 2,
  },
  cardText: {
    color: '#FFFFFF',
    marginTop: 8,
    fontSize: 12,
    textAlign: 'center',
  },
  inputDemo: {
    marginVertical: 8,
  },
  progressGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  progressItem: {
    alignItems: 'center',
  },
  progressLabel: {
    color: '#A78BFA',
    fontSize: 12,
    marginBottom: 8,
  },
  progressButton: {
    marginTop: 8,
  },
  floatingDemo: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  effectsGrid: {
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'center',
  },
  effectCard: {
    padding: 20,
    alignItems: 'center',
    minWidth: 100,
  },
  effectText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  celebrationButton: {
    alignSelf: 'center',
  },
});

export default AnimationShowcase;
