import { IconSymbol } from '@/components/ui/icon-symbol';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { BannerAd } from '@/components/ads/banner-ad';
import { InterstitialAd } from '@/components/ads/interstitial-ad';
import { FactDetailModal } from '@/components/fact-detail-modal';
import { GameFactCard } from '@/components/game-fact-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useGameContext } from '@/contexts/game-context';
import { EnhancedFact, factsApi, GameFact } from '@/services/facts-api';
import { scoreManager } from '@/services/score-manager';
import mobileAds from 'react-native-google-mobile-ads';

mobileAds()
  .initialize()
  .then(adapterStatuses => {
    // Initialization complete!
  });

export default function HomeScreen() {
  const { setCurrentScore, hasShownHighScoreNotification, setHasShownHighScoreNotification } = useGameContext();

  const [, setFactsHistory] = useState<EnhancedFact[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [interstitialVisible, setInterstitialVisible] = useState(false);
  const [, setFactGenerationCount] = useState(0);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);

  // Unified guessing game states
  const [gameFactsHistory, setGameFactsHistory] = useState<GameFact[]>([]);
  const [currentGameFactIndex, setCurrentGameFactIndex] = useState(-1);
  const [currentUnansweredFact, setCurrentUnansweredFact] = useState<GameFact | null>(null);
  const [totalScore, setTotalScore] = useState({ correct: 0, total: 0 });
  const [hasAnswered, setHasAnswered] = useState(false);

  // Computed values
  const currentGameFact = currentUnansweredFact || (currentGameFactIndex >= 0 ? gameFactsHistory[currentGameFactIndex] : null);
  const totalGameFacts = gameFactsHistory.length;
  const hasNextGameFact = currentGameFactIndex < gameFactsHistory.length - 1 && !currentUnansweredFact;
  const hasPreviousGameFact = currentGameFactIndex > 0 && !currentUnansweredFact;
  const isViewingGameHistory = (currentGameFactIndex < gameFactsHistory.length - 1) && !currentUnansweredFact;

  const scrollRef = useRef<ScrollView>(null);
  const [hasAutoScrolled, setHasAutoScrolled] = useState(false);

  // Load initial fact and current score on mount
  useEffect(() => {
    loadInitialGameState();
  }, []);

  const loadInitialGameState = async () => {
    // Always start fresh - clear any previously saved current score
    try {
      await scoreManager.resetCurrentScore();
      // Ensure we start with 0/0 every time
      setTotalScore({ correct: 0, total: 0 });
    } catch (error) {
      if (__DEV__) {
        console.error('Error resetting current score:', error);
      }
    }

    // Load initial fact
    loadNewGameFact();
  };

  const loadNewGameFact = async () => {
    setIsLoading(true);
    setError(null);
    setHasAnswered(false);

    try {
      const gameFact = await factsApi.getRandomGameFact();

      // Set as current unanswered fact (don't add to history until answered)
      setCurrentUnansweredFact(gameFact);
      // Only set index if there are facts in history, otherwise keep at -1
      if (gameFactsHistory.length > 0) {
        setCurrentGameFactIndex(gameFactsHistory.length - 1);
      }

      // Show interstitial ad every 4 facts
      setFactGenerationCount(prev => {
        const newCount = prev + 1;
        if (newCount % 4 === 0) {
          setTimeout(() => setInterstitialVisible(true), 300);
        }
        return newCount;
      });
    } catch (err) {
      if (__DEV__) {
        console.error('Error loading game fact:', err);
      }
     // setError('Failed to load fact. Please try again.');

      // Fallback to false fact
      const falseFact = factsApi.getFalseGameFact();
      setCurrentUnansweredFact(falseFact);
      // Only set index if there are facts in history, otherwise keep at -1
      if (gameFactsHistory.length > 0) {
        setCurrentGameFactIndex(gameFactsHistory.length - 1);
      }

      // Show interstitial ad every 4 facts (fallback case)
      setFactGenerationCount(prev => {
        const newCount = prev + 1;
        if (newCount % 4 === 0) {
          setTimeout(() => setInterstitialVisible(true), 300);
        }
        return newCount;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadNewGameFactForRestart = async () => {
    setIsLoading(true);
    setError(null);
    setHasAnswered(false);

    try {
      const gameFact = await factsApi.getRandomGameFact();

      // Set as current unanswered fact (don't add to history until answered)
      setCurrentUnansweredFact(gameFact);
      // For restart, always set index to -1 since we cleared history
      setCurrentGameFactIndex(-1);

      // Reset fact generation count for restart
      setFactGenerationCount(0);
    } catch (err) {
      if (__DEV__) {
        console.error('Error loading game fact:', err);
      }
      setError('Failed to load fact. Please try again.');

      // Fallback to false fact
      const falseFact = factsApi.getFalseGameFact();
      setCurrentUnansweredFact(falseFact);
      // For restart, always set index to -1 since we cleared history
      setCurrentGameFactIndex(-1);

      // Reset fact generation count for restart
      setFactGenerationCount(0);
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
      setCurrentUnansweredFact(null); // Clear any unanswered fact
      const newIndex = currentGameFactIndex - 1;
      setCurrentGameFactIndex(newIndex);
      const targetFact = gameFactsHistory[newIndex];
      setHasAnswered(targetFact?.isAnswered || false);
    }
  };

  const goToNextGameFact = () => {
    if (hasNextGameFact) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setCurrentUnansweredFact(null); // Clear any unanswered fact
      const newIndex = currentGameFactIndex + 1;
      setCurrentGameFactIndex(newIndex);
      const targetFact = gameFactsHistory[newIndex];
      setHasAnswered(targetFact?.isAnswered || false);
    }
  };

  const goToLatestGameFact = () => {
    if (gameFactsHistory.length > 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setCurrentUnansweredFact(null); // Clear any unanswered fact
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

  const handleRestartGame = () => {
    const hasCorrectAnswers = totalScore.correct > 0;
    const hasPlayedQuestions = totalScore.total > 0;

    let message = 'Start a new game session?';
    if (hasPlayedQuestions) {
      if (hasCorrectAnswers) {
        // Show persistence message only if there are correct answers
        message = `Are you sure you want to restart? Your current score of ${totalScore.correct}/${totalScore.total} (${Math.round((totalScore.correct / totalScore.total) * 100)}%) will be saved to your history.`;
      } else {
        // Don't mention persistence for 0% scores
        message = `Are you sure you want to restart? Your current progress will be reset.`;
      }
    }

    Alert.alert(
      'Restart Game',
      message,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Restart',
          style: 'destructive',
          onPress: performRestart
        }
      ]
    );
  };

  const performRestart = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    // Finalize current score only if there are correct answers
    if (totalScore.total > 0 && totalScore.correct > 0) {
      try {
        // Save current score before finalizing (only when restarting with correct answers)
        await scoreManager.saveCurrentScore(totalScore.correct, totalScore.total);
        const result = await scoreManager.finalizeScore();

        // Show notification if new high score was achieved
        if (result.isNewHighScore) {
          setTimeout(() => {
            Alert.alert(
              '🎉 New Personal Best!',
              `Congratulations! You achieved a new high score of ${result.finalScore.percentage}% (${result.finalScore.correct}/${result.finalScore.total})!`,
              [{ text: 'Awesome!', style: 'default' }]
            );
          }, 500); // Small delay to allow UI to update
        }
      } catch (error) {
        if (__DEV__) {
          console.error('Error finalizing score:', error);
        }
      }
    }

    // Reset all game states
    setGameFactsHistory([]);
    setCurrentGameFactIndex(-1);
    setCurrentUnansweredFact(null);
    setTotalScore({ correct: 0, total: 0 });
    setHasAnswered(false);
    setFactsHistory([]);

    // Reset context states
    setCurrentScore({ correct: 0, total: 0 });
    setHasShownHighScoreNotification(false);

    // Close settings modal
    setSettingsModalVisible(false);

    // Load a new fact to start fresh
    await loadNewGameFactForRestart();
  };

  const handleAnswer = async (userGuess: boolean, isCorrect: boolean) => {
    // Update total score
    const newScore = {
      correct: totalScore.correct + (isCorrect ? 1 : 0),
      total: totalScore.total + 1
    };

    setTotalScore(newScore);

    // Update context with current score for scores tab
    setCurrentScore(newScore);

    // Check for new high score and show notification if needed
    if (!hasShownHighScoreNotification && newScore.correct > 0) {
      try {
        const stats = await scoreManager.getScoreStats();
        const currentGameScore = scoreManager.createScore(newScore.correct, newScore.total);

        if (!stats.highestScore || currentGameScore.compositeScore > stats.highestScore.compositeScore) {
          // This is a new high score!
          setHasShownHighScoreNotification(true);
          setTimeout(() => {
            Alert.alert(
              '🎉 New Personal Best!',
              `Amazing! You've achieved a new high score of ${currentGameScore.percentage}% (${newScore.correct}/${newScore.total})!`,
              [{ text: 'Keep Going!', style: 'default' }]
            );
          }, 500); // Small delay for better UX
        }
      } catch (error) {
        if (__DEV__) {
          console.error('Error checking high score:', error);
        }
      }
    }

    // Add the current unanswered fact to history with answer data
    if (currentUnansweredFact) {
      const answeredFact = {
        ...currentUnansweredFact,
        isAnswered: true,
        userGuess: userGuess,
        wasGuessCorrect: isCorrect
      };

      setGameFactsHistory(prev => [...prev, answeredFact]);
      setCurrentGameFactIndex(prev => prev + 1);
      setCurrentUnansweredFact(null); // Clear the unanswered fact

      // Add to regular facts history for browsing
      const enhancedFact = factsApi.gameFactToEnhanced(answeredFact);
      setFactsHistory(prev => [...prev, enhancedFact]);
    }

    setHasAnswered(true);
  };

  // Auto-scroll when the New Challenge button becomes visible
  useEffect(() => {
    if (hasAnswered) {
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [hasAnswered]);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={{ paddingBottom: 110 }}
        onContentSizeChange={() => {
          if (!hasAutoScrolled) {
            scrollRef.current?.scrollToEnd({ animated: true });
            setHasAutoScrolled(true);
          }
        }}
      >
      <LinearGradient
        colors={['#FFFFFF', '#F7F7F7']}
        style={styles.header}
      >
        <ThemedView style={styles.headerContent}>
          <Pressable
            style={styles.settingsButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setSettingsModalVisible(true);
            }}
          >
            <IconSymbol name="gearshape.fill" size={20} color="#717171" />
          </Pressable>

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
                        '#00A86B', // Jade green
                        '#00A86B',
                        '#DC3545', // Crimson red
                        '#DC3545'
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
        {isLoading ? (
          <ThemedView style={styles.loadingCard}>
            <ActivityIndicator size="large" color="#F54768" />
            <ThemedText style={styles.loadingText}>
              {currentGameFact ? 'Loading next challenge...' : 'Loading your first challenge...'}
            </ThemedText>
          </ThemedView>
        ) : currentGameFact ? (
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
            <ActivityIndicator size="large" color="#F54768" />
            <ThemedText style={styles.loadingText}>Loading your first challenge...</ThemedText>
          </ThemedView>
        )}
      </ThemedView>

      {/* History Navigation */}
      {totalGameFacts > 0 && (
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
              {currentUnansweredFact
                ? 'Current Challenge'
                : totalGameFacts > 0 && currentGameFactIndex >= 0
                  ? `${currentGameFactIndex + 1} / ${totalGameFacts}`
                  : '1 / 1'
              }
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

      {/* Generate New Fact Button (above ad) */}
      <ThemedView style={styles.buttonContainer}> 
          {/* New Challenge Button - Only show after answering */}
          {hasAnswered && (
            <LinearGradient
              colors={['#F54768', '#D91E4F']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[
                styles.generateButton,
                {
                  borderWidth: 0,
                  opacity: isLoading ? 0.5 : 1,
                  shadowColor: '#F54768',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.2,
                  shadowRadius: 12,
                }
              ]}
            >
              <Pressable
                style={styles.gradientButtonInner}
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
            </LinearGradient>
          )}

          {/* Back to Latest Button */}
          {isViewingGameHistory && (
            <Pressable
              style={[
                styles.generateButton,
                styles.secondaryGenerateButton,
                {
                  backgroundColor: '#FFFFFF',
                  borderWidth: 1,
                  borderColor: '#DDDDDD',
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

      </ScrollView>

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
        }}
      />

      {/* Settings Modal */}
      <Modal
        visible={settingsModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSettingsModalVisible(false)}
      >
        <ThemedView style={styles.settingsModal}>
          <LinearGradient
            colors={['#FFFFFF', '#F7F7F7']}
            style={styles.settingsHeader}
          >
            <ThemedView style={styles.settingsHeaderContent}>
              <Pressable
                style={styles.closeSettingsButton}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSettingsModalVisible(false);
                }}
              >
                <ThemedText style={styles.closeSettingsButtonText}>✕</ThemedText>
              </Pressable>
              <ThemedText style={styles.settingsTitle}>Game Settings</ThemedText>
            </ThemedView>
          </LinearGradient>

          <ThemedView style={styles.settingsContent}>
            <ThemedView style={styles.settingsSection}>
              <ThemedText style={styles.settingsSectionTitle}>Game Controls</ThemedText>

              <Pressable
                style={styles.settingsActionButton}
                onPress={handleRestartGame}
              >
                <IconSymbol name="arrow.counterclockwise" size={24} color="#F54768" />
                <ThemedView style={styles.settingsButtonContent}>
                  <ThemedText style={styles.settingsButtonTitle}>Restart Game</ThemedText>
                  <ThemedText style={styles.settingsButtonSubtitle}>
                    {totalScore.total > 0
                      ? `Current score: ${totalScore.correct}/${totalScore.total} (${Math.round((totalScore.correct / totalScore.total) * 100)}%)`
                      : 'Start a new game session'
                    }
                  </ThemedText>
                </ThemedView>
                <IconSymbol name="chevron.right" size={16} color="#9CA3AF" />
              </Pressable>
            </ThemedView>
          </ThemedView>
        </ThemedView>
      </Modal>
      {/* Anchored banner footer */}
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0 }}>
        <BannerAd size="medium" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    marginTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    backgroundColor: 'transparent',
    marginTop: 0,
    position: 'relative',
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    textAlign: 'center',
    marginBottom: 8,
    color: '#000000', // Pure black like Airbnb
    marginTop: 0,
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
    borderRadius: 12,
    gap: 12,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  gradientButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    gap: 12,
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
  settingsButton: {
    position: 'absolute',
    right: 0,
    top: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    shadowColor: '#000000',
  },
  settingsModal: {
    flex: 1,
  },
  settingsHeader: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  settingsHeaderContent: {
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  closeSettingsButton: {
    position: 'absolute',
    right: 0,
    top: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  closeSettingsButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  settingsTitle: {
    fontSize: 24,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  settingsContent: {
    flex: 1,
    padding: 20,
    backgroundColor: 'transparent',
  },
  settingsSection: {
    backgroundColor: 'transparent',
    marginBottom: 30,
  },
  settingsSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
  settingsActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    shadowColor: '#000000',
    gap: 12,
  },
  settingsButtonContent: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  settingsButtonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  settingsButtonSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
});
