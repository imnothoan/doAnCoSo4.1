import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          height: 60,
          paddingBottom: 8,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0.1,
          shadowOffset: { width: 0, height: -3 },
          shadowRadius: 12,
        },
      }}>
      {/* Main discovery - Tinder-like swipe interface */}
      <Tabs.Screen
        name="hangout"
        options={{
          title: 'Hang out',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="heart.fill" color={color} />,
        }}
      />
      {/* Combined Explore: People & Events in one tab with sub-tabs */}
      <Tabs.Screen
        name="connection"
        options={{
          title: 'Explore',
        }}
      />
      {/* Feed/Discussion */}
      <Tabs.Screen
        name="discussion"
        options={{
          title: 'Feed',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons size={28} name="earth" color={color} />,
        }}
      />
      {/* Messages/Inbox */}
      <Tabs.Screen
        name="inbox"
        options={{
          title: 'Inbox',
        }}
      />
      {/* Profile/Account */}
      <Tabs.Screen
        name="account"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
        }}
      />
      {/* Hide my-events tab - functionality moved to connection/explore */}
      <Tabs.Screen
        name="my-events"
        options={{
          href: null,
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
