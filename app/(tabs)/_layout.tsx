import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { GameProvider } from '@/contexts/game-context';

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <GameProvider>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#007AFF', // Classic iOS blue for selection
          tabBarInactiveTintColor: '#9CA3AF', // Soft gray for inactive
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarShowLabel: true, // Explicitly show labels on all platforms
          tabBarLabelPosition: 'below-icon', // Ensure labels are below icons
          tabBarLabelStyle: {
            fontSize: Platform.OS === 'android' ? 12 : 11,
            fontWeight: '700',
            marginTop: Platform.OS === 'android' ? 4 : 6,
            marginBottom: 2,
            letterSpacing: 0.3,
            fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
          },
          tabBarIconStyle: {
            marginTop: Platform.OS === 'android' ? 6 : 4,
            marginBottom: Platform.OS === 'android' ? 2 : 0,
          },
          tabBarStyle: {
            backgroundColor: '#FFFFFF',
            borderTopWidth: 0.5,
            borderTopColor: 'rgba(0,0,0,0.08)',
            paddingTop: Platform.OS === 'android' ? 12 : 8,
            paddingBottom: Platform.OS === 'android' ? Math.max(insets.bottom, 12) : 8,
            height: Platform.OS === 'android' ? 80 + Math.max(insets.bottom, 12) : 72 + 8,
            shadowColor: '#000000',
            shadowOffset: {
              width: 0,
              height: -2,
            },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 8,
          },
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Fun Facts',
            tabBarIcon: ({ color }) => (
              <IconSymbol
                size={24}
                name="lightbulb.fill"
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="scores"
          options={{
            title: 'Scores',
            tabBarIcon: ({ color }) => (
              <IconSymbol
                size={24}
                name="chart.bar.fill"
                color={color}
              />
            ),
          }}
        />
      </Tabs>
    </GameProvider>
  );
}
