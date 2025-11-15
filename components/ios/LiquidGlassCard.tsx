import React from 'react';
import { StyleSheet, View, Platform, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';

interface LiquidGlassCardProps {
  children: React.ReactNode;
  intensity?: number;
  tint?: 'light' | 'dark' | 'default' | 'extraLight' | 'regular' | 'prominent' | 'systemMaterial' | 'systemThickMaterial' | 'systemThinMaterial' | 'systemUltraThinMaterial' | 'systemChromeMaterial' | 'systemChromeMaterialLight' | 'systemChromeMaterialDark';
  style?: ViewStyle;
  borderRadius?: number;
}

/**
 * LiquidGlassCard - iOS Liquid Glass Material Effect
 * 
 * Implements Apple's latest liquid glass design language with:
 * - Native blur effects using UIVisualEffectView
 * - Translucent backgrounds with material effects
 * - Adaptive appearance for light/dark mode
 * - Enhanced depth and layering
 * 
 * Best used for:
 * - Cards and panels
 * - Navigation bars
 * - Modals and overlays
 * - Bottom sheets
 */
export const LiquidGlassCard: React.FC<LiquidGlassCardProps> = ({
  children,
  intensity = 80,
  tint = 'systemMaterial',
  style,
  borderRadius = 16,
}) => {
  if (Platform.OS === 'ios') {
    return (
      <BlurView
        intensity={intensity}
        tint={tint}
        style={[
          styles.container,
          {
            borderRadius,
            overflow: 'hidden',
          },
          style,
        ]}
      >
        <View style={styles.content}>
          {children}
        </View>
      </BlurView>
    );
  }

  // Fallback for non-iOS platforms
  return (
    <View
      style={[
        styles.container,
        styles.fallback,
        {
          borderRadius,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Platform.OS === 'ios' ? 'transparent' : 'rgba(255, 255, 255, 0.95)',
    borderWidth: Platform.OS === 'ios' ? 0.5 : 0,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  content: {
    flex: 1,
  },
  fallback: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
});
