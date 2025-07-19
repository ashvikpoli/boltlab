import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

interface GlassMorphCardProps {
  children: ReactNode;
  style?: ViewStyle;
  intensity?: 'light' | 'medium' | 'strong';
  variant?:
    | 'primary'
    | 'secondary'
    | 'accent'
    | 'success'
    | 'warning'
    | 'danger';
  glowEffect?: boolean;
  borderWidth?: number;
  accessible?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: 'none' | 'button' | 'text' | 'image';
}

const glassConfig = {
  light: {
    colors: ['rgba(26, 26, 46, 0.4)', 'rgba(15, 15, 35, 0.6)'] as const,
    borderColor: 'rgba(107, 70, 193, 0.2)',
    shadowOpacity: 0.1,
  },
  medium: {
    colors: ['rgba(26, 26, 46, 0.6)', 'rgba(15, 15, 35, 0.8)'] as const,
    borderColor: 'rgba(107, 70, 193, 0.3)',
    shadowOpacity: 0.2,
  },
  strong: {
    colors: ['rgba(26, 26, 46, 0.8)', 'rgba(15, 15, 35, 0.9)'] as const,
    borderColor: 'rgba(107, 70, 193, 0.4)',
    shadowOpacity: 0.3,
  },
};

const variantConfig = {
  primary: {
    borderGlow: '#6B46C1',
    shadowColor: '#6B46C1',
  },
  secondary: {
    borderGlow: '#8B5CF6',
    shadowColor: '#8B5CF6',
  },
  accent: {
    borderGlow: '#A855F7',
    shadowColor: '#A855F7',
  },
  success: {
    borderGlow: '#10B981',
    shadowColor: '#10B981',
  },
  warning: {
    borderGlow: '#F59E0B',
    shadowColor: '#F59E0B',
  },
  danger: {
    borderGlow: '#EF4444',
    shadowColor: '#EF4444',
  },
};

export default function GlassMorphCard({
  children,
  style,
  intensity = 'medium',
  variant = 'primary',
  glowEffect = false,
  borderWidth = 1,
  accessible = true,
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole = 'none',
}: GlassMorphCardProps) {
  const config = glassConfig[intensity];
  const variantStyle = variantConfig[variant];

  return (
    <View
      style={[styles.container, style]}
      accessible={accessible}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityRole={accessibilityRole}
    >
      {/* Glow Effect */}
      {glowEffect && (
        <View
          style={[
            styles.glowContainer,
            {
              shadowColor: variantStyle.shadowColor,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.4,
              shadowRadius: 15,
              elevation: 10,
            },
          ]}
        >
          <LinearGradient
            colors={[variantStyle.shadowColor + '40', 'transparent']}
            style={styles.glowGradient}
          />
        </View>
      )}

      {/* Main Glass Card */}
      <LinearGradient
        colors={config.colors}
        style={[
          styles.glassMorphCard,
          {
            borderColor: config.borderColor,
            borderWidth,
          },
        ]}
      >
        {/* Inner border glow */}
        <View
          style={[
            styles.innerBorder,
            {
              borderColor: variantStyle.borderGlow + '30',
              borderWidth: 1,
            },
          ]}
        >
          {children}
        </View>
      </LinearGradient>

      {/* Subtle highlight */}
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.1)', 'transparent']}
        style={styles.highlight}
        pointerEvents="none"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  glowContainer: {
    position: 'absolute',
    top: -5,
    left: -5,
    right: -5,
    bottom: -5,
    borderRadius: 20,
    zIndex: -1,
  },
  glowGradient: {
    flex: 1,
    borderRadius: 20,
  },
  glassMorphCard: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(26, 26, 46, 0.3)',
  },
  innerBorder: {
    flex: 1,
    borderRadius: 15,
    padding: 1,
  },
  highlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '30%',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    zIndex: 1,
    pointerEvents: 'none',
  },
});
