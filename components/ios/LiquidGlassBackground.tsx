import React from 'react';
import { StyleSheet, View, Platform, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';

interface LiquidGlassBackgroundProps {
  children: React.ReactNode;
  intensity?: number;
  tint?: 'light' | 'dark' | 'default' | 'extraLight' | 'regular' | 'prominent' | 'systemMaterial' | 'systemThickMaterial' | 'systemThinMaterial' | 'systemUltraThinMaterial' | 'systemChromeMaterial' | 'systemChromeMaterialLight' | 'systemChromeMaterialDark';
  style?: ViewStyle;
}

/**
 * LiquidGlassBackground - Full-screen iOS Liquid Glass Background
 * 
 * Creates a full-screen liquid glass effect perfect for:
 * - Screen backgrounds
 * - Modal backdrops
 * - Navigation overlays
 * 
 * Uses iOS system materials that automatically adapt to:
 * - Light/Dark mode
 * - Accessibility settings
 * - User preferences
 */
export const LiquidGlassBackground: React.FC<LiquidGlassBackgroundProps> = ({
  children,
  intensity = 90,
  tint = 'systemThickMaterial',
  style,
}) => {
  if (Platform.OS === 'ios') {
    return (
      <View style={[styles.container, style]}>
        <BlurView
          intensity={intensity}
          tint={tint}
          style={styles.blurView}
        >
          {children}
        </BlurView>
      </View>
    );
  }

  // Fallback for non-iOS platforms
  return (
    <View style={[styles.container, styles.fallback, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  blurView: {
    flex: 1,
  },
  fallback: {
    backgroundColor: '#f5f5f5',
  },
});
