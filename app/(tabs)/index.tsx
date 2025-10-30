import React, { useState, useEffect } from 'react';
import {StyleSheet, Pressable, ActivityIndicator, Text, Platform, ScrollView} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { IconSymbol } from '@/components/ui/icon-symbol';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { GameFactCard } from '@/components/game-fact-card';
import { FactDetailModal } from '@/components/fact-detail-modal';
import { BannerAd } from '@/components/ads/banner-ad';
import { InterstitialAd } from '@/components/ads/interstitial-ad';
import { factsApi, EnhancedFact, GameFact } from '@/services/facts-api';

export default function HomeScreen() {
  const [, setFactsHistory] = useState<EnhancedFact[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [interstitialVisible, setInterstitialVisible] = useState(false);
  const [, setFactGenerationCount] = useState(0);

  // Unified guessing game states
  const [gameFactsHistory, setGameFactsHistory] = useState<GameFact[]>([]);
  const [currentGameFactIndex, setCurrentGameFactIndex] = useState(-1);
  const [totalScore, setTotalScore] = useState({ correct: 0, total: 0 });
  const [hasAnswered, setHasAnswered] = useState(false);

  // Computed values
  const currentGameFact = currentGameFactIndex >= 0 ? gameFactsHistory[currentGameFactIndex] : null;
  const totalGameFacts = gameFactsHistory.length;
  const hasNextGameFact = currentGameFactIndex < gameFactsHistory.length - 1;
  const hasPreviousGameFact = currentGameFactIndex > 0;
  const isViewingGameHistory = currentGameFactIndex < gameFactsHistory.length - 1;

  // Load initial fact on mount
  useEffect(() => {
    loadNewGameFact();
  }, []);

  const loadNewGameFact = async () => {
    setIsLoading(true);
    setError(null);
    setHasAnswered(false);

    try {
      const gameFact = await factsApi.getRandomGameFact();

      // Add to game facts history and set as current
      setGameFactsHistory(prev => [...prev, gameFact]);
      setCurrentGameFactIndex(prev => prev + 1);

      // Show interstitial ad every 5 facts
      setFactGenerationCount(prev => {
        const newCount = prev + 1;
        if (newCount % 5 === 0) {
          setTimeout(() => setInterstitialVisible(true), 500);
        }
        return newCount;
      });
    } catch (err) {
      console.error('Error loading game fact:', err);
      setError('Failed to load fact. Please try again.');

      // Fallback to false fact
      const falseFact = factsApi.getFalseGameFact();
      setGameFactsHistory(prev => [...prev, falseFact]);
      setCurrentGameFactIndex(prev => prev + 1);

      setFactGenerationCount(prev => {
        const newCount = prev + 1;
        if (newCount % 5 === 0) {
          setTimeout(() => setInterstitialVisible(true), 500);
        }
        return newCount;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateNewFact = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    loadNewGameFact();
  };

  const goToPreviousGameFact = () => {
    if (hasPreviousGameFact) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setCurrentGameFactIndex(prev => {
        const newIndex = prev - 1;
        const targetFact = gameFactsHistory[newIndex];
        setHasAnswered(targetFact?.isAnswered || false);
        return newIndex;
      });
    }
  };

  const goToNextGameFact = () => {
    if (hasNextGameFact) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setCurrentGameFactIndex(prev => {
        const newIndex = prev + 1;
        const targetFact = gameFactsHistory[newIndex];
        setHasAnswered(targetFact?.isAnswered || false);
        return newIndex;
      });
    }
  };

  const goToLatestGameFact = () => {
    if (gameFactsHistory.length > 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const latestIndex = gameFactsHistory.length - 1;
      setCurrentGameFactIndex(latestIndex);
      const latestFact = gameFactsHistory[latestIndex];
      setHasAnswered(latestFact?.isAnswered || false);
    }
  };

  const openFactModal = () => {
    if (!isLoading) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setModalVisible(true);
    }
  };

  const handleAnswer = (userGuess: boolean, isCorrect: boolean) => {
    // Update total score
    setTotalScore(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1
    }));

    // Mark current fact as answered in the game facts history
    if (currentGameFact) {
      setGameFactsHistory(prev =>
        prev.map((fact, index) =>
          index === currentGameFactIndex
            ? {
                ...fact,
                isAnswered: true,
                userGuess: userGuess,
                wasGuessCorrect: isCorrect
              }
            : fact
        )
      );

      // Add to regular facts history for browsing
      const enhancedFact = factsApi.gameFactToEnhanced(currentGameFact);
      setFactsHistory(prev => [...prev, enhancedFact]);
    }

    setHasAnswered(true);
  };

  return (
    <ScrollView>
      <LinearGradient
        colors={['#FFFFFF', '#FFFFFF', '#FFFFFF']}
        style={styles.header}
      >
        <ThemedView style={styles.headerContent}>
          <Text style={styles.title}>Fun Facts</Text>
          <ThemedText style={styles.subtitle}>
            Guess if facts are true or false!
          </ThemedText>

          <ThemedView style={styles.statsRow}>
            <ThemedView style={styles.scoreContainerWrapper}>
              <LinearGradient
                colors={
                  totalScore.total > 0
                    ? [
                        '#10B981', // Green
                        '#10B981', // Green
                        '#EF4444', // Red
                        '#EF4444'  // Red
                      ]
                    : ['#EBEBEB', '#EBEBEB'] // Default gray when no answers
                }
                locations={
                  totalScore.total > 0
                    ? [
                        0,
                        totalScore.correct / totalScore.total,
                        totalScore.correct / totalScore.total,
                        1
                      ]
                    : [0, 1]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.scoreGradientBorder}
              >
                <ThemedView style={styles.statsContainer}>
                  <Text style={styles.statsText}>
                    Score: {totalScore.correct}/{totalScore.total}
                    {totalScore.total > 0 && ` (${Math.round((totalScore.correct / totalScore.total) * 100)}%)`}
                  </Text>
                </ThemedView>
              </LinearGradient>
            </ThemedView>

            <ThemedView style={[styles.statsContainer, styles.factsContainer]}>
              <ThemedText style={styles.statsText}>
                Facts: {totalGameFacts}
              </ThemedText>
            </ThemedView>
          </ThemedView>

          {error && (
            <ThemedView style={styles.errorContainer}>
              <ThemedText style={styles.errorText}>{error}</ThemedText>
            </ThemedView>
          )}
        </ThemedView>
      </LinearGradient>

      <ThemedView style={styles.cardContainer}>
        {currentGameFact ? (
          <GameFactCard
            gameFact={currentGameFact}
            onAnswer={handleAnswer}
            onPress={openFactModal}
            isLoading={isLoading}
            disabled={hasAnswered}
            forceRevealed={isViewingGameHistory}
            isFactAnswered={currentGameFact.isAnswered || false}
          />
        ) : (
          <ThemedView style={styles.loadingCard}>
            <ActivityIndicator size="large" color="#FF385C" />
            <ThemedText style={styles.loadingText}>Loading your first challenge...</ThemedText>
          </ThemedView>
        )}
      </ThemedView>

      {/* History Navigation */}
      {totalGameFacts > 1 && (
        <ThemedView style={styles.historyNavigation}>
          <Pressable
            style={[
              styles.navButton,
              { opacity: hasPreviousGameFact ? 1 : 0.4 }
            ]}
            onPress={goToPreviousGameFact}
            disabled={!hasPreviousGameFact}
          >
            <IconSymbol name="chevron.left" size={20} color="#717171" />
          </Pressable>

          <ThemedView style={styles.historyIndicator}>
            <ThemedText style={styles.historyText}>
              {currentGameFactIndex + 1} / {totalGameFacts}
            </ThemedText>
          </ThemedView>

          <Pressable
            style={[
              styles.navButton,
              { opacity: hasNextGameFact ? 1 : 0.4 }
            ]}
            onPress={goToNextGameFact}
            disabled={!hasNextGameFact}
          >
            <IconSymbol name="chevron.right" size={20} color="#717171" />
          </Pressable>
        </ThemedView>
      )}

      {/* Generate New Fact Button */}
      <ThemedView style={styles.buttonContainer}>
          <Pressable
            style={[
              styles.generateButton,
              {
                backgroundColor: '#FF385C', // Authentic Airbnb coral
                borderWidth: 0,
                opacity: isLoading ? 0.6 : 1,
                shadowColor: '#FF385C',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.15,
                shadowRadius: 8,
              }
            ]}
            onPress={generateNewFact}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <IconSymbol name="arrow.clockwise" size={24} color="#FFFFFF" />
            )}
            <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>
              {isLoading ? 'Loading...' : 'New Challenge'}
            </Text>
          </Pressable>

          {/* Back to Latest Button */}
          {isViewingGameHistory && (
            <Pressable
              style={[
                styles.generateButton,
                styles.secondaryGenerateButton,
                {
                  backgroundColor: '#FFFFFF',
                  borderWidth: 1,
                  borderColor: '#DDDDDD', // Airbnb light gray border
                  shadowColor: '#000000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.08,
                  shadowRadius: 4,
                }
              ]}
              onPress={goToLatestGameFact}
            >
              <IconSymbol name="arrow.up" size={24} color="#000000" />
              <Text style={[
                styles.buttonText,
                { color: '#000000' }
              ]}>
                Back to Latest
              </Text>
            </Pressable>
          )}
      </ThemedView>

      {/* Banner Ad */}
      <BannerAd size="medium" />

      <FactDetailModal
        visible={modalVisible}
        fact={currentGameFact ? factsApi.gameFactToEnhanced(currentGameFact) : null}
        onClose={() => setModalVisible(false)}
      />

      {/* Interstitial Ad */}
      <InterstitialAd
        visible={interstitialVisible}
        onClose={() => setInterstitialVisible(false)}
        onAdClick={() => {
          // Optional: handle ad click events
          console.log('Interstitial ad clicked');
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    marginTop: 100,
    //paddingTop: 40,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    backgroundColor: 'transparent',
    marginTop: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    textAlign: 'center',
    marginBottom: 8,
    color: '#000000', // Pure black like Airbnb
    marginTop: 10,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    fontWeight: '400',
    textAlign: 'center',
    marginBottom: 20,
    color: '#717171', // Airbnb gray for secondary text
    letterSpacing: 0.2,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    alignSelf: 'center',
    backgroundColor: 'transparent',
  },
  scoreContainerWrapper: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scoreGradientBorder: {
    borderRadius: 12,
    padding: 2, // This creates the border thickness
    minHeight: 44, // Ensure minimum height
  },
  statsContainer: {
    backgroundColor: '#F7F7F7', // Airbnb light gray
    borderRadius: 10, // Slightly smaller to account for gradient border
    paddingVertical: 8,
    paddingHorizontal: 16,
    flex: 1,
    minHeight: 40, // Ensure the content has proper height
    justifyContent: 'center', // Center the text vertically
  },
  factsContainer: {
    borderWidth: 1,
    borderColor: '#EBEBEB',
    borderRadius: 12, // Back to original radius for facts container
  },
  statsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000', // Black like Airbnb
    textAlign: 'center',
  },
  cardContainer: {
    paddingTop: 20,
    backgroundColor: 'transparent',
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    backgroundColor: 'transparent',
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 25,
    gap: 12,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonText: {
    fontSize: 18,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  infoContainer: {
    paddingHorizontal: 20,
    paddingTop: 30,
    backgroundColor: 'transparent',
  },
  infoText: {
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    fontWeight: '400',
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 16,
    lineHeight: 22,
    letterSpacing: 0.1,
  },
  categoriesText: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.6,
    lineHeight: 20,
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 0, 0, 0.2)',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 12,
  },
  errorText: {
    fontSize: 12,
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '500',
  },
  loadingCard: {
    backgroundColor: 'transparent',
    borderRadius: 20,
    padding: 40,
    marginHorizontal: 20,
    marginVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 16,
    opacity: 0.7,
  },
  historyNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'transparent',
  },
  navButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 50,
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#DDDDDD', // Airbnb light border
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    shadowColor: '#000000',
  },
  historyIndicator: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: '#DDDDDD', // Airbnb light border
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    shadowColor: '#000000',
  },
  historyText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  secondaryGenerateButton: {
    marginTop: 12,
  },
});
