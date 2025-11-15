import React from 'react';
import { StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';

interface BlurTabBarProps {
  children: React.ReactNode;
}

export function BlurTabBar({ children }: BlurTabBarProps) {
  if (Platform.OS !== 'ios') {
    return <>{children}</>;
  }

  return (
    <BlurView
      intensity={100}
      tint="systemChromeMaterial"
      style={styles.container}
    >
      {children}
    </BlurView>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
});
