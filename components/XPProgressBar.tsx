import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ProgressRing } from './design-system/ProgressRing';
import {
  AnimatedProgressRing,
  CelebrationBurst,
} from './design-system/AnimatedComponents';

interface XPProgressBarProps {
  currentXP: number;
  requiredXP: number;
  level: number;
  showLevel?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  strokeWidth?: number;
  animated?: boolean;
}

export const XPProgressBar: React.FC<XPProgressBarProps> = ({
  currentXP = 0,
  requiredXP = 100,
  level = 1,
  showLevel = true,
  size = 'lg',
  strokeWidth = 6,
  animated = true,
}) => {
  const [prevLevel, setPrevLevel] = useState(level);
  const [showLevelUpCelebration, setShowLevelUpCelebration] = useState(false);

  // Map string sizes to numbers for AnimatedProgressRing
  const sizeMap = {
    sm: 40,
    md: 60,
    lg: 80,
    xl: 100,
  };
  const numericSize = sizeMap[size];

  // Calculate progress percentage
  const progress = Math.min((currentXP || 0) / (requiredXP || 100), 1);

  // Detect level up
  useEffect(() => {
    if (level > prevLevel) {
      setShowLevelUpCelebration(true);
      setTimeout(() => {
        setShowLevelUpCelebration(false);
        setPrevLevel(level);
      }, 2000);
    } else {
      setPrevLevel(level);
    }
  }, [level, prevLevel]);

  return (
    <View style={styles.container}>
      {animated ? (
        <AnimatedProgressRing
          progress={progress}
          size={numericSize}
          strokeWidth={strokeWidth}
          color="#6B46C1"
          backgroundColor="rgba(107, 70, 193, 0.2)"
          duration={1200}
        />
      ) : (
        <ProgressRing
          progress={progress}
          size={size}
          strokeWidth={strokeWidth}
          color="primary"
          backgroundColor="rgba(107, 70, 193, 0.2)"
        />
      )}

      {/* Level Badge */}
      {showLevel && (
        <View
          style={[
            styles.levelBadge,
            {
              width: numericSize * 0.6,
              height: numericSize * 0.6,
              borderRadius: numericSize * 0.3,
            },
          ]}
        >
          <Text style={[styles.levelText, { fontSize: numericSize * 0.2 }]}>
            {level}
          </Text>
        </View>
      )}

      {/* XP Text */}
      <View style={styles.xpContainer}>
        <Text style={styles.xpText}>
          {(currentXP || 0).toLocaleString()} /{' '}
          {(requiredXP || 100).toLocaleString()} XP
        </Text>
      </View>

      {/* Level Up Celebration */}
      <CelebrationBurst
        trigger={showLevelUpCelebration}
        onComplete={() => setShowLevelUpCelebration(false)}
        sparkleCount={15}
        colors={[
          '#FFD700',
          '#FFA500',
          '#FF6B6B',
          '#4ECDC4',
          '#45B7D1',
          '#96CEB4',
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  levelBadge: {
    position: 'absolute',
    backgroundColor: '#6B46C1',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6B46C1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  levelText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  xpContainer: {
    marginTop: 8,
    alignItems: 'center',
  },
  xpText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '500',
  },
});

export default XPProgressBar;
