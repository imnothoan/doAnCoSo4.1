import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { GlassTabBar } from '@/components/glass-tab-bar.ios';

/**
 * iOS-specific Tab Layout with Liquid Glass Effect
 * Uses @expo/ui SwiftUI components for native iOS 18+ glass morphism
 */
export default function TabLayout() {
  const colorScheme = useColorScheme();
  
  return (
    <Tabs
      tabBar={(props) => <GlassTabBar {...props} />}
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          display: 'none', // Hide default tab bar since we're using custom one
        },
      }}>
      <Tabs.Screen
        name="hangout"
        options={{
          title: 'Hang out',
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="person.2.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="my-events"
        options={{
          title: 'My events',
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="calendar" color={color} />,
        }}
      />
      <Tabs.Screen
        name="discussion"
        options={{
          title: 'Feed',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons size={24} name="earth" color={color} />,
        }}
      />
      <Tabs.Screen
        name="connection"
        options={{
          title: 'Connection',
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="person.3.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="inbox"
        options={{
          title: 'Inbox',
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="envelope.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Account',
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="person.fill" color={color} />,
        }}
      />
      {/* Hide old tabs but keep files for reference */}
      <Tabs.Screen
        name="index-old"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
