import React, { useState } from 'react';
import { StyleSheet, Pressable, Platform, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { GameFact } from '@/services/facts-api';

interface GameFactCardProps {
  gameFact: GameFact;
  onAnswer: (userGuess: boolean, isCorrect: boolean) => void;
  onPress?: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  forceRevealed?: boolean; // Force the card to show in revealed state (for history)
  isFactAnswered?: boolean; // Whether this specific fact has been answered
}

type AnswerState = 'waiting' | 'correct' | 'incorrect' | 'revealed';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function GameFactCard({ gameFact, onAnswer, onPress, isLoading = false, disabled = false, forceRevealed = false, isFactAnswered = false }: GameFactCardProps) {
  const [answerState, setAnswerState] = useState<AnswerState>('waiting');
  const [showExplanation, setShowExplanation] = useState(false);

  const scale = useSharedValue(1);
  const cardOpacity = useSharedValue(1);
  const tapHintOpacity = useSharedValue(1);
  const tapHintScale = useSharedValue(1);

  // Reset state when a new fact is loaded or force revealed state
  React.useEffect(() => {
    if (forceRevealed || isFactAnswered) {
      setAnswerState('revealed');
      setShowExplanation(true);
      // Start tap hint animation
      startTapHintAnimation();
    } else {
      setAnswerState('waiting');
      setShowExplanation(false);
      // Reset tap hint animation
      tapHintOpacity.value = 1;
      tapHintScale.value = 1;
    }
  }, [gameFact.id, forceRevealed, isFactAnswered]); // Reset when fact ID changes, forceRevealed changes, or answered state changes

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: cardOpacity.value,
  }));

  const tapHintAnimatedStyle = useAnimatedStyle(() => ({
    opacity: tapHintOpacity.value,
    transform: [{ scale: tapHintScale.value }],
  }));

  const startTapHintAnimation = () => {
    // Start a quick, subtle blinking and scaling animation to attract attention
    tapHintOpacity.value = withRepeat(
      withSequence(
        withTiming(0.4, { duration: 250 }),
        withTiming(1, { duration: 250 })
      ),
      1, // Repeat 2 times (1 second total)
      false
    );

    tapHintScale.value = withRepeat(
      withSequence(
        withSpring(1.05, { duration: 250 }),
        withSpring(1, { duration: 250 })
      ),
      1, // Repeat 2 times (1 second total)
      false
    );
  };

  const handleAnswer = async (userGuess: boolean) => {
    if (disabled || isLoading || answerState !== 'waiting' || forceRevealed || isFactAnswered) return;

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const isCorrect = userGuess === gameFact.isTrue;

    // Animation feedback
    scale.value = withSequence(
      withSpring(0.95, { duration: 150 }),
      withSpring(1.05, { duration: 150 }),
      withSpring(1, { duration: 100 })
    );

    // Set answer state and show result
    setAnswerState(isCorrect ? 'correct' : 'incorrect');

    // Show explanation after a delay
    setTimeout(() => {
      setShowExplanation(true);
      setAnswerState('revealed');
      // Start tap hint animation when explanation is shown
      startTapHintAnimation();
    }, 1500);

    // Notify parent component
    onAnswer(userGuess, isCorrect);
  };

  const getCardBackgroundColor = () => {
    switch (answerState) {
      case 'correct':
        return '#E8F5E9'; // Light green (Airbnb style)
      case 'incorrect':
        return '#FFEBEE'; // Light red (Airbnb style)
      case 'revealed':
        return '#F7F7F7'; // Light gray
      default:
        return '#FFFFFF'; // White
    }
  };

  const getCardBorderColor = () => {
    switch (answerState) {
      case 'correct':
        return '#00A86B'; // Jade green
      case 'incorrect':
        return '#DC3545'; // Crimson red
      case 'revealed':
        return '#DDDDDD'; // Gray
      default:
        return '#DDDDDD'; // Light gray
    }
  };

  return (
    <AnimatedPressable style={[styles.container, animatedStyle]}>
      <Pressable
        onPress={onPress}
        disabled={isLoading || !onPress || answerState === 'waiting'}
        style={[
          styles.card,
          {
            backgroundColor: getCardBackgroundColor(),
            borderColor: getCardBorderColor(),
          }
        ]}
      >
        <ThemedView style={styles.cardContent}>
          <ThemedText style={styles.factText}>
            {isLoading ? 'Loading amazing fact...' : gameFact.text}
          </ThemedText>

          {answerState === 'waiting' && !isLoading && !forceRevealed && !isFactAnswered && (
          <ThemedView style={styles.gameControls}>
            <ThemedText style={styles.promptText}>
              Is this fact true or false?
            </ThemedText>

            <ThemedView style={styles.buttonContainer}>
              <Pressable
                style={[styles.answerButton, styles.trueButton]}
                onPress={() => handleAnswer(true)}
                disabled={disabled}
              >
                <IconSymbol name="checkmark.circle.fill" size={20} color="#FFFFFF" />
                <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>
                  True
                </Text>
              </Pressable>

              <Pressable
                style={[styles.answerButton, styles.falseButton]}
                onPress={() => handleAnswer(false)}
                disabled={disabled}
              >
                <IconSymbol name="xmark.circle.fill" size={20} color="#FFFFFF" />
                <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>
                  False
                </Text>
              </Pressable>
            </ThemedView>
          </ThemedView>
        )}


        {showExplanation && answerState === 'revealed' && (
          <ThemedView style={styles.explanationContainer}>
            <ThemedView style={styles.answerReveal}>
              <IconSymbol
                name={
                  gameFact.wasGuessCorrect !== undefined
                    ? (gameFact.wasGuessCorrect ? "checkmark.circle.fill" : "xmark.circle.fill")
                    : (gameFact.isTrue ? "checkmark.circle.fill" : "xmark.circle.fill")
                }
                size={28}
                color={
                  gameFact.wasGuessCorrect !== undefined
                    ? (gameFact.wasGuessCorrect ? "#00A86B" : "#DC3545")
                    : (gameFact.isTrue ? "#00A86B" : "#DC3545")
                }
              />
              <ThemedText style={styles.answerText}>
                {gameFact.wasGuessCorrect !== undefined ? (
                  <>
                    Your guess is <Text style={{
                      fontWeight: 'bold',
                      color: gameFact.wasGuessCorrect ? '#00A86B' : '#DC3545'
                    }}>
                      {gameFact.wasGuessCorrect ? 'CORRECT' : 'INCORRECT'}
                    </Text>
                  </>
                ) : (
                  <>
                    The fact is <Text style={{
                      fontWeight: 'bold',
                      color: gameFact.isTrue ? '#00A86B' : '#DC3545'
                    }}>
                      {gameFact.isTrue ? 'TRUE' : 'FALSE'}
                    </Text>
                  </>
                )}
              </ThemedText>
            </ThemedView>

            {gameFact.explanation && (
              <ThemedText style={styles.explanationText}>
                {gameFact.explanation}
              </ThemedText>
            )}

            {/* Show tap hint only after answer is revealed */}
            {onPress && (
              <Animated.View style={[styles.tapHint, tapHintAnimatedStyle]}>
                <IconSymbol name="info.circle" size={16} color="#9CA3AF" />
                <ThemedText style={styles.tapHintText}>
                  Tap for details & sharing
                </ThemedText>
              </Animated.View>
            )}
          </ThemedView>
        )}
        </ThemedView>
      </Pressable>
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
    borderWidth: 1.5,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  cardContent: {
    backgroundColor: 'transparent',
  },
  factText: {
    fontSize: 18,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    lineHeight: 26,
    fontWeight: '400',
    textAlign: 'left',
    marginBottom: 20,
    letterSpacing: 0.1,
    color: '#000000',
  },
  gameControls: {
    backgroundColor: 'transparent',
  },
  promptText: {
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
    color: '#374151',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: 'transparent',
  },
  answerButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.12,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  trueButton: {
    backgroundColor: '#00A86B',
  },
  falseButton: {
    backgroundColor: '#DC3545',
  },
  buttonText: {
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    fontWeight: '600',
  },
  resultContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 16,
    backgroundColor: 'transparent',
  },
  resultText: {
    fontSize: 18,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    fontWeight: 'bold',
  },
  explanationContainer: {
    backgroundColor: 'transparent',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  answerReveal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    backgroundColor: 'transparent',
  },
  answerText: {
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    fontWeight: '500',
    color: '#374151',
  },
  explanationText: {
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    lineHeight: 20,
    color: '#6B7280',
    fontStyle: 'italic',
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
    marginTop: 12,
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