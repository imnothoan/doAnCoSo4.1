import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Host, HStack, VStack, GlassEffectContainer, Namespace } from '@expo/ui/swift-ui';
import { glassEffect, glassEffectId, padding, cornerRadius, frame, onTapGesture } from '@expo/ui/swift-ui/modifiers';

/**
 * Custom iOS Tab Bar component with Liquid Glass effect using @expo/ui
 * This provides the modern iOS 18+ glass morphism effect for the bottom navigation
 * Uses GlassEffectContainer for proper liquid glass blending between tabs
 */
export function GlassTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const namespaceId = React.useId();
  
  return (
    <View style={styles.container}>
      <Host style={styles.hostContainer}>
        <Namespace id={namespaceId}>
          <GlassEffectContainer spacing={4}>
            <HStack 
              spacing={4}
              modifiers={[
                padding({ horizontal: 12, vertical: 10 }),
                cornerRadius(28),
                frame({ height: 64 }),
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

                // Get the icon component from options
                const iconColor = isFocused ? '#007AFF' : '#8E8E93';
                
                return (
                  <VStack 
                    key={route.key}
                    spacing={2}
                    modifiers={[
                      glassEffect({ 
                        glass: { 
                          variant: isFocused ? 'clear' : 'regular',
                          interactive: true,
                          tint: isFocused ? '#007AFF' : undefined,
                        },
                        shape: 'capsule'
                      }),
                      glassEffectId(`tab-${route.key}`, namespaceId),
                      padding({ all: 10 }),
                      frame({ minWidth: 50 }),
                      onTapGesture(onPress),
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
                );
              })}
            </HStack>
          </GlassEffectContainer>
        </Namespace>
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
    backgroundColor: 'transparent',
  },
  hostContainer: {
    alignSelf: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
