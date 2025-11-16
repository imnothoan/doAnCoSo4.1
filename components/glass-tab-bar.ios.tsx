import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Host, HStack, VStack } from '@expo/ui/swift-ui';
import { glassEffect, padding, cornerRadius, background } from '@expo/ui/swift-ui/modifiers';

/**
 * Custom iOS Tab Bar component with Liquid Glass effect using @expo/ui
 * This provides the modern iOS 18+ glass morphism effect for the bottom navigation
 */
export function GlassTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  return (
    <View style={styles.container}>
      <Host style={styles.hostContainer}>
        <HStack 
          spacing={0}
          modifiers={[
            glassEffect({ 
              glass: { 
                variant: 'regular',
                interactive: true 
              },
              shape: 'capsule'
            }),
            padding({ horizontal: 8, vertical: 8 }),
            background('rgba(255, 255, 255, 0.1)'),
            cornerRadius(24),
          ]}
        >
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const isFocused = state.index === index;

            const onPress = () => {
              if (Platform.OS === 'ios') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }

              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name, route.params);
              }
            };

            const onLongPress = () => {
              navigation.emit({
                type: 'tabLongPress',
                target: route.key,
              });
            };

            // Get the icon component from options
            const iconColor = isFocused ? '#007AFF' : '#8E8E93';
            
            return (
              <TouchableOpacity
                key={route.key}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={options.tabBarAccessibilityLabel}
                onPress={onPress}
                onLongPress={onLongPress}
                style={styles.tabButton}
              >
                <VStack 
                  spacing={2}
                  modifiers={[
                    padding({ all: 8 }),
                  ]}
                >
                  <View style={styles.iconContainer}>
                    {options.tabBarIcon?.({ 
                      focused: isFocused, 
                      color: iconColor, 
                      size: 24 
                    })}
                  </View>
                </VStack>
              </TouchableOpacity>
            );
          })}
        </HStack>
      </Host>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 34, // Safe area bottom padding for iOS
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  hostContainer: {
    alignSelf: 'center',
    borderRadius: 24,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
