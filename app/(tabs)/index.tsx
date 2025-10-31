import { IconSymbol } from '@/components/ui/icon-symbol';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View, Animated as RNAnimated, Easing } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, useAnimatedReaction, runOnJS } from 'react-native-reanimated';

import { BannerAd } from '@/components/ads/banner-ad';
import { InterstitialAd } from '@/components/ads/interstitial-ad';
import { NativeAd } from '@/components/ads/native-ad';
import { CircularProgress } from '@/components/circular-progress';
import { FactDetailModal } from '@/components/fact-detail-modal';
import { GameFactCard } from '@/components/game-fact-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useGameContext } from '@/contexts/game-context';
import { EnhancedFact, factsApi, GameFact } from '@/services/facts-api';
import { scoreManager } from '@/services/score-manager';

// Loading spinner component with rotation animation
function LoadingSpinner() {
  const spinValue = React.useRef(new RNAnimated.Value(0)).current;

  React.useEffect(() => {
    const spin = () => {
      spinValue.setValue(0);
      RNAnimated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(() => spin());
    };
    spin();
  }, [spinValue]);

  const rotate = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <RNAnimated.View style={{ transform: [{ rotate }] }}>
      <IconSymbol name="arrow.clockwise" size={48} color="#F54768" />
    </RNAnimated.View>
  );
}

export default function HomeScreen() {
  const { setCurrentScore, hasShownHighScoreNotification, setHasShownHighScoreNotification } = useGameContext();

  const [, setFactsHistory] = useState<EnhancedFact[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [interstitialVisible, setInterstitialVisible] = useState(false);
  const [answerCount, setAnswerCount] = useState(0);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);

  // Debug: Log when interstitialVisible changes
  useEffect(() => {
    if (__DEV__) {
      console.log(`[Ads] interstitialVisible changed to: ${interstitialVisible}, current answerCount: ${answerCount}`);
    }
  }, [interstitialVisible, answerCount]);

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

  const loadNewGameFact = useCallback(async () => {
    const startTime = Date.now();

    if (__DEV__) {
      console.log(`[Game] loadNewGameFact() called`);
    }

    setIsLoading(true);
    setError(null);

    try {
      if (__DEV__) {
        console.log('[Game] Fetching new fact...');
      }

      const gameFact = await factsApi.getRandomGameFact();

      const duration = Date.now() - startTime;

      if (__DEV__) {
        console.log(`[Game] Successfully loaded game fact (${duration}ms):`, {
          id: gameFact.id,
          isTrue: gameFact.isTrue,
          source: gameFact.source,
          textPreview: gameFact.text.substring(0, 50) + '...'
        });
      }

      // Set as current unanswered fact (don't add to history until answered)
      setCurrentUnansweredFact(gameFact);
      // Don't update currentGameFactIndex here - it should stay pointing to the last answered fact in history
      // The currentGameFact computed value will use currentUnansweredFact when it's set
    } catch (err) {
      const duration = Date.now() - startTime;
      if (__DEV__) {
        console.error(`[Game] Error loading game fact after ${duration}ms:`, err);
        console.error('[Game] Error details:', {
          message: err instanceof Error ? err.message : String(err),
          stack: err instanceof Error ? err.stack : undefined
        });
      }
     // setError('Failed to load fact. Please try again.');

      // Fallback to false fact
      if (__DEV__) {
        console.log('[Game] Falling back to local false fact');
      }
      const falseFact = factsApi.getFalseGameFact();
      setCurrentUnansweredFact(falseFact);
      // Don't update currentGameFactIndex here - it should stay pointing to the last answered fact in history
      // The currentGameFact computed value will use currentUnansweredFact when it's set
    } finally {
      setIsLoading(false);
      if (__DEV__) {
        console.log('[Game] loadNewGameFact() completed, loading state set to false');
      }
    }
  }, []);

  const loadInitialGameState = useCallback(async () => {
    if (__DEV__) {
      console.log('[Game] Starting initial game state load');
    }

    // Always start fresh - clear any previously saved current score
    try {
      await scoreManager.resetCurrentScore();
      // Ensure we start with 0/0 every time
      setTotalScore({ correct: 0, total: 0 });
      if (__DEV__) {
        console.log('[Game] Score reset complete');
      }
    } catch (error) {
      if (__DEV__) {
        console.error('[Game] Error resetting current score:', error);
      }
    }

    // Load initial fact (should be instant from queue)
    if (__DEV__) {
      console.log('[Game] Loading initial fact from queue (should be instant)...');
    }
    loadNewGameFact();
  }, [loadNewGameFact]);

  // Load initial fact and current score on mount
  useEffect(() => {
    // Load the initial game state
    loadInitialGameState();
  }, [loadInitialGameState]);

  const loadNewGameFactForRestart = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const gameFact = await factsApi.getRandomGameFact();

      // Set as current unanswered fact (don't add to history until answered)
      setCurrentUnansweredFact(gameFact);
      // For restart, always set index to -1 since we cleared history
      setCurrentGameFactIndex(-1);

      // Reset hasAnswered state NOW that the fact is loaded
      setHasAnswered(false);
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

      // Reset hasAnswered state NOW that the fact is loaded
      setHasAnswered(false);
    } finally {
      setIsLoading(false);
    }
  };

  const generateNewFact = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    // Set loading state first to prevent flash of old card
    setIsLoading(true);
    // Reset hasAnswered after setting loading state
    setHasAnswered(false);
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
    setAnswerCount(0);

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

    // Increment answer count and show ad every 4 answers
    setAnswerCount(prev => {
      const newCount = prev + 1;
      if (__DEV__) {
        console.log(`[Ads] Answer count: ${newCount}, modulo 4 = ${newCount % 4}`);
      }
      if (newCount % 4 === 0) {
        if (__DEV__) {
          console.log(`[Ads] ✅ TRIGGERING INTERSTITIAL AD after ${newCount} answers`);
          console.log(`[Ads] Setting interstitialVisible to true in 500ms...`);
        }
        setTimeout(() => {
          if (__DEV__) {
            console.log(`[Ads] ⚡ NOW calling setInterstitialVisible(true)`);
          }
          setInterstitialVisible(true);
        }, 500);
      }
      return newCount;
    });

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
            <CircularProgress
              percentage={totalScore.total > 0 ? Math.round((totalScore.correct / totalScore.total) * 100) : 0}
              size={100}
              strokeWidth={8}
            />

            <ThemedView style={styles.statsInfo}>
              <ThemedView style={styles.statItem}>
                <ThemedText style={styles.statLabel}>Score</ThemedText>
                <Text style={styles.statValue}>
                  {totalScore.correct}/{totalScore.total}
                </Text>
              </ThemedView>

            
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
            <LoadingSpinner />
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
            // Navigation props
            showNavigation={totalGameFacts > 0}
            hasPrevious={hasPreviousGameFact}
            hasNext={hasNextGameFact}
            onPrevious={goToPreviousGameFact}
            onNext={goToNextGameFact}
            navigationText={
              currentUnansweredFact
                ? 'Current Challenge'
                : totalGameFacts > 0 && currentGameFactIndex >= 0
                  ? `${currentGameFactIndex + 1} / ${totalGameFacts}`
                  : '1 / 1'
            }
          />
        ) : (
          <ThemedView style={styles.loadingCard}>
            <LoadingSpinner />
            <ThemedText style={styles.loadingText}>Loading your first challenge...</ThemedText>
          </ThemedView>
        )}
      </ThemedView>

      {/* Generate New Fact Button */}
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

      {/* Native Ad */}
      <ThemedView style={styles.nativeAdContainer}>
        <NativeAd compact={true} />
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
    marginTop: 100,
    paddingTop: 20,
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
    gap: 20,
    alignSelf: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingVertical: 0,
  },
  statsInfo: {
    backgroundColor: 'transparent',
    gap: 16,
  },
  statItem: {
    backgroundColor: 'transparent',
    alignItems: 'flex-start',
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B6B6B',
    marginBottom: 4,
    letterSpacing: 0.2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    letterSpacing: -0.5,
  },
  cardContainer: {
    paddingTop: 20,
    backgroundColor: 'transparent',
  },
  nativeAdContainer: {
    paddingHorizontal: 20,
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
  bannerContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 60,
    zIndex: 1000,
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 10,
    shadowColor: '#000000',
  },
});
