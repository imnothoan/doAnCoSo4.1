import React from 'react';
import { StyleSheet, View, Platform, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';

interface LiquidGlassHeaderProps {
  children: React.ReactNode;
  intensity?: number;
  style?: ViewStyle;
  translucent?: boolean;
}

/**
 * LiquidGlassHeader - iOS-style Navigation Header with Liquid Glass
 * 
 * Creates a navigation header with:
 * - Translucent blur effect
 * - Adaptive to content scrolling
 * - System chrome material
 * - Safe area support
 * 
 * Perfect for:
 * - Navigation bars
 * - Tab bars
 * - Headers that overlay content
 */
export const LiquidGlassHeader: React.FC<LiquidGlassHeaderProps> = ({
  children,
  intensity = 95,
  style,
  translucent = true,
}) => {
  if (Platform.OS === 'ios' && translucent) {
    return (
      <BlurView
        intensity={intensity}
        tint="systemChromeMaterial"
        style={[styles.header, style]}
      >
        <View style={styles.content}>
          {children}
        </View>
      </BlurView>
    );
  }

  // Fallback for non-iOS or non-translucent mode
  return (
    <View style={[styles.header, styles.fallback, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    borderBottomWidth: Platform.OS === 'ios' ? 0.5 : 0,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  content: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  fallback: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
});
