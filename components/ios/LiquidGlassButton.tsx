import React from 'react';
import { StyleSheet, View, Platform, ViewStyle, TouchableOpacity, Text } from 'react-native';
import { BlurView } from 'expo-blur';

interface LiquidGlassButtonProps {
  children: React.ReactNode;
  onPress: () => void;
  intensity?: number;
  style?: ViewStyle;
  textStyle?: any;
  variant?: 'primary' | 'secondary' | 'tertiary';
  disabled?: boolean;
}

/**
 * LiquidGlassButton - iOS-style Button with Liquid Glass Effect
 * 
 * Features:
 * - Translucent button with blur
 * - Multiple style variants
 * - Haptic feedback ready
 * - Accessible
 * 
 * Variants:
 * - primary: Prominent with color
 * - secondary: Subtle glass effect
 * - tertiary: Minimal glass effect
 */
export const LiquidGlassButton: React.FC<LiquidGlassButtonProps> = ({
  children,
  onPress,
  intensity = 70,
  style,
  textStyle,
  variant = 'primary',
  disabled = false,
}) => {
  const getTint = () => {
    switch (variant) {
      case 'primary':
        return 'systemMaterial';
      case 'secondary':
        return 'systemThinMaterial';
      case 'tertiary':
        return 'systemUltraThinMaterial';
      default:
        return 'systemMaterial';
    }
  };

  if (Platform.OS === 'ios') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.7}
        style={[styles.buttonContainer, style]}
      >
        <BlurView
          intensity={intensity}
          tint={getTint()}
          style={styles.blurView}
        >
          <View style={[styles.content, disabled && styles.disabled]}>
            {typeof children === 'string' ? (
              <Text style={[styles.text, textStyle]}>{children}</Text>
            ) : (
              children
            )}
          </View>
        </BlurView>
      </TouchableOpacity>
    );
  }

  // Fallback for non-iOS platforms
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      style={[styles.buttonContainer, styles.fallback, style, disabled && styles.disabled]}
    >
      {typeof children === 'string' ? (
        <Text style={[styles.text, textStyle]}>{children}</Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: Platform.OS === 'ios' ? 0.5 : 0,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  blurView: {
    flex: 1,
  },
  content: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  fallback: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
});
