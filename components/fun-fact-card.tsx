import React from 'react';
import { StyleSheet, Pressable, Platform } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withSequence } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { FunFact } from '@/constants/fun-facts';
import { EnhancedFact } from '@/services/facts-api';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface FunFactCardProps {
  funFact: FunFact | EnhancedFact;
  onPress?: () => void;
  isLoading?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function FunFactCard({ funFact, onPress, isLoading = false }: FunFactCardProps) {
  const colorScheme = useColorScheme();
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotateZ: `${rotation.value}deg` }
    ],
  }));

  const handlePress = () => {
    // Haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Enhanced Animation
    scale.value = withSequence(
      withSpring(0.92, { duration: 150 }),
      withSpring(1.02, { duration: 150 }),
      withSpring(1, { duration: 100 })
    );

    rotation.value = withSequence(
      withSpring(-1, { duration: 100 }),
      withSpring(1, { duration: 100 }),
      withSpring(0, { duration: 150 })
    );

    onPress?.();
  };


  return (
    <AnimatedPressable
      style={[styles.container, animatedStyle]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <ThemedView style={[
        styles.card,
        {
          backgroundColor: colorScheme === 'dark'
            ? Colors.dark.background
            : Colors.light.background,
          shadowColor: colorScheme === 'dark' ? '#000' : '#000',
        }
      ]}>

        <ThemedText style={styles.factText}>
          {isLoading ? 'Loading amazing fact...' : ('text' in funFact ? funFact.text : funFact.fact)}
        </ThemedText>

        {!isLoading && (
          <ThemedView style={styles.tapHint}>
            <IconSymbol name="info.circle" size={16} color={Platform.OS === 'ios' ? '#6B7280' : '#000000'} />
            <ThemedText style={styles.tapHintText}>
              Tap for more details
            </ThemedText>
          </ThemedView>
        )}
      </ThemedView>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginVertical: 10,
  },
  card: {
    borderRadius: 20,
    padding: 24,
    shadowOffset: {
      width: 0,
      height: Platform.OS === 'ios' ? 10 : 8,
    },
    shadowOpacity: Platform.OS === 'ios' ? 0.15 : 0.1,
    shadowRadius: Platform.OS === 'ios' ? 20 : 16,
    elevation: 12,
    borderWidth: Platform.OS === 'ios' ? 2 : 1,
    borderColor: Platform.OS === 'ios' ? '#10B981' : '#000000',
    backgroundColor: Platform.OS === 'ios' ? '#ECFDF5' : '#FFFFFF',
    ...(Platform.OS === 'ios' && {
      shadowColor: '#10B981',
    })
  },
  factText: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '500',
    textAlign: 'left',
    marginBottom: 12,
  },
  tapHint: {
    backgroundColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 15,
    backgroundColor: Platform.OS === 'ios' ? 'rgba(249, 250, 251, 0.8)' : 'rgba(255,255,255,0.8)',
    borderWidth: Platform.OS === 'ios' ? 1 : 1,
    borderColor: Platform.OS === 'ios' ? '#D1D5DB' : '#000000',
  },
  tapHintText: {
    fontSize: 13,
    fontWeight: '600',
    opacity: 0.8,
    fontStyle: 'italic',
  },
});