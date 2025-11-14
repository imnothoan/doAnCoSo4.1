import React from 'react';
import { View, StyleSheet, ViewStyle, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
  variant?: 'light' | 'dark' | 'tint' | 'primary';
  borderRadius?: number;
  noPadding?: boolean;
}

/**
 * Liquid Glass Card Component
 * Implements Apple's glassmorphism design with blur and transparency
 * Inspired by iOS 17+ and macOS Sonoma's liquid glass design
 */
export const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  style, 
  intensity = 30,
  variant = 'light',
  borderRadius = 20,
  noPadding = false,
}) => {
  const overlayColors = {
    light: ['rgba(255, 255, 255, 0.8)', 'rgba(255, 255, 255, 0.4)'],
    dark: ['rgba(30, 30, 30, 0.7)', 'rgba(10, 10, 10, 0.3)'],
    tint: ['rgba(120, 160, 255, 0.4)', 'rgba(80, 120, 255, 0.2)'],
    primary: ['rgba(0, 122, 255, 0.3)', 'rgba(0, 80, 200, 0.1)'],
  };

  return (
    <View style={[styles.container, { borderRadius }, style]}>
      <BlurView 
        intensity={intensity} 
        tint={variant === 'dark' ? 'dark' : 'light'}
        style={[styles.blur, { borderRadius }]}
      >
        <LinearGradient
          colors={overlayColors[variant]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.gradient, noPadding ? { padding: 0 } : null]}
        >
          {children}
        </LinearGradient>
      </BlurView>
    </View>
  );
};

/**
 * Glass Background Component
 * Full-screen glass effect for backgrounds
 */
export const GlassBackground: React.FC<{
  children: React.ReactNode;
  intensity?: number;
  variant?: 'light' | 'dark';
}> = ({ children, intensity = 50, variant = 'light' }) => {
  return (
    <BlurView 
      intensity={intensity}
      tint={variant}
      style={styles.fullScreen}
    >
      <LinearGradient
        colors={
          variant === 'dark'
            ? ['rgba(0, 0, 0, 0.3)', 'rgba(30, 30, 30, 0.1)']
            : ['rgba(255, 255, 255, 0.2)', 'rgba(240, 240, 250, 0.1)']
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.fullScreen}
      >
        {children}
      </LinearGradient>
    </BlurView>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    borderWidth: Platform.OS === 'ios' ? 0.5 : 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 25,
    elevation: 8,
  },
  blur: {
    flex: 1,
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
    padding: 16,
  },
  fullScreen: {
    flex: 1,
  },
});
