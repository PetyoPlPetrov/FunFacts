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
    >
      <ThemedView style={[
        styles.card,
        {
          backgroundColor: '#FFFFFF', // Always white for Airbnb aesthetic
          shadowColor: '#000',
        }
      ]}>

        <ThemedText style={styles.factText}>
          {isLoading ? 'Loading amazing fact...' : ('text' in funFact ? funFact.text : funFact.fact)}
        </ThemedText>

        {!isLoading && (
          <ThemedView style={styles.tapHint}>
            <IconSymbol name="info.circle" size={16} color="#9CA3AF" />
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
    marginVertical: 16,
  },
  card: {
    borderRadius: 12,
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.12)',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: {
          width: 0,
          height: 8,
        },
        shadowOpacity: 0.2,
        shadowRadius: 16,
      },
      android: {
        elevation: 12,
        shadowColor: '#000000',
        shadowOffset: {
          width: 0,
          height: 12,
        },
        shadowOpacity: 0.15,
        shadowRadius: 32,
      },
    }),
  },
  factText: {
    fontSize: 18,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    lineHeight: 26,
    fontWeight: '400',
    textAlign: 'left',
    marginBottom: 12,
    letterSpacing: 0.1,
    color: '#000000', // Pure black for maximum readability
  },
  tapHint: {
    backgroundColor: '#F9FAFB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
  },
  tapHintText: {
    fontSize: 13,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    fontWeight: '500',
    color: '#717171', // Airbnb secondary gray
    fontStyle: 'italic',
    letterSpacing: 0.1,
  },
});