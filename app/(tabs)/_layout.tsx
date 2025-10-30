import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { GameProvider } from '@/contexts/game-context';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <GameProvider>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
            marginTop: 4,
          },
          tabBarStyle: {
            paddingBottom: 8,
          },
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Fun Facts',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="lightbulb.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="scores"
          options={{
            title: 'Scores',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="chart.bar.fill" color={color} />,
          }}
        />
      </Tabs>
    </GameProvider>
  );
}
