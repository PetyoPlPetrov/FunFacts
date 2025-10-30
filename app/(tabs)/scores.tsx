import { IconSymbol } from '@/components/ui/icon-symbol';
import { useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { BannerAd } from '@/components/ads/banner-ad';
import { NativeScoreRow } from '@/components/ads/native-score-row';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useGameContext } from '@/contexts/game-context';
import { GameScore, scoreManager, ScoreStats } from '@/services/score-manager';

export default function ScoresScreen() {
  const { currentScore } = useGameContext();

  const [scoreStats, setScoreStats] = useState<ScoreStats>({
    currentScore: null,
    highestScore: null,
    allScores: [],
    isNewHighScore: false
  });

  useEffect(() => {
    loadScoreStats();
  }, []);

  // Refresh scores when tab becomes active or current score changes
  useFocusEffect(
    React.useCallback(() => {
      loadScoreStats();
    }, [currentScore])
  );

  // Also reload when current score changes
  useEffect(() => {
    loadScoreStats();
  }, [currentScore]);

  const loadScoreStats = async () => {
    try {
      const stats = await scoreManager.getScoreStats(currentScore);
      setScoreStats(stats);
    } catch (error) {
      if (__DEV__) {
        console.error('Error loading score stats:', error);
      }
    }
  };


  const renderScoreCard = (score: GameScore | null, title: string, isHighest = false) => {
    if (!score || (score.correct === 0 && score.total === 0)) {
      return (
        <ThemedView style={[styles.scoreCard, styles.emptyScoreCard]}>
          <ThemedText style={styles.cardTitle}>{title}</ThemedText>
          <ThemedText style={styles.emptyText}>No scores yet</ThemedText>
          <ThemedText style={styles.emptySubtext}>Start playing to see your scores!</ThemedText>
        </ThemedView>
      );
    }

    return (
      <ThemedView style={[styles.scoreCard, isHighest && styles.highestScoreCard]}>
        <ThemedView style={styles.cardHeader}>
          <ThemedText style={styles.cardTitle}>{title}</ThemedText>
          {isHighest && (
            <IconSymbol name="crown.fill" size={20} color="#FFD700" />
          )}
        </ThemedView>

        <ThemedView style={styles.scoreDisplay}>
          <Text style={[styles.percentageText, isHighest && styles.highestPercentageText]}>
            {score.percentage}%
          </Text>
          <ThemedText style={styles.scoreBreakdown}>
            {score.correct} out of {score.total} correct
          </ThemedText>
          <ThemedText style={styles.compositeScore}>
            Score: {score.compositeScore?.toFixed(1) || 'N/A'}
          </ThemedText>
        </ThemedView>

        <ThemedText style={styles.scoreDate}>{score.date}</ThemedText>
      </ThemedView>
    );
  };

  const handleDeleteScore = (scoreId: string) => {
    Alert.alert(
      'Delete Score',
      'Are you sure you want to delete this score? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await scoreManager.deleteScore(scoreId);
              await loadScoreStats();
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            } catch (error) {
              if (__DEV__) {
                console.error('Error deleting score:', error);
              }
            }
          }
        }
      ]
    );
  };

  const renderScoreHistoryItem = (score: GameScore, index: number) => {
    const isRecent = index < 5; // Highlight recent scores

    return (
      <ThemedView key={score.id} style={[styles.historyItem, isRecent && styles.recentHistoryItem]}>
        <ThemedView style={styles.historyLeft}>
          <ThemedView style={styles.historyRank}>
            <ThemedText style={styles.rankText}>#{index + 1}</ThemedText>
          </ThemedView>
          <ThemedView style={styles.historyScore}>
            <Text style={styles.historyPercentage}>{score.percentage}%</Text>
            <ThemedText style={styles.historyBreakdown}>
              {score.correct}/{score.total} (Score: {score.compositeScore?.toFixed(1) || 'N/A'})
            </ThemedText>
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.historyRight}>
          <ThemedText style={styles.historyDate}>{score.date}</ThemedText>
          <Pressable
            style={styles.deleteButton}
            onPress={() => handleDeleteScore(score.id)}
          >
            <IconSymbol name="trash" size={16} color="#EF4444" />
          </Pressable>
        </ThemedView>
      </ThemedView>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
        <LinearGradient
          colors={['#FFFFFF', '#FFFFFF', '#FFFFFF']}
          style={styles.header}
        >
          <ThemedView style={styles.headerContent}>
            <Text style={styles.title}>Your Scores</Text>
            <ThemedText style={styles.subtitle}>
              Track your Fun Facts performance
            </ThemedText>
          </ThemedView>
        </LinearGradient>

        <ThemedView style={styles.content}>
          {/* Current and Highest Score Cards */}
          <ThemedView style={styles.topScoresSection}>
            {renderScoreCard(scoreStats.currentScore, 'Current Game')}
            {renderScoreCard(scoreStats.highestScore, 'Personal Best', true)}
          </ThemedView>

          {/* Score History */}
          <ThemedView style={styles.historySection}>
            <ThemedView style={styles.sectionHeader}>
              <ThemedText style={styles.sectionTitle}>Score History</ThemedText>
              <ThemedText style={styles.sectionSubtitle}>
                {scoreStats.allScores.length} game{scoreStats.allScores.length !== 1 ? 's' : ''} played
              </ThemedText>
            </ThemedView>

            {scoreStats.allScores.length > 0 ? (
              <ThemedView style={styles.historyList}>
                {(() => {
                  const len = scoreStats.allScores.length;
                  const midIndex = Math.floor((len - 1) / 2); // place roughly in the middle
                  return scoreStats.allScores.map((score, index) => (
                    <React.Fragment key={score.id}>
                      {renderScoreHistoryItem(score, index)}
                      {index === midIndex && <NativeScoreRow />}
                    </React.Fragment>
                  ));
                })()}
              </ThemedView>
            ) : (
              <ThemedView style={styles.emptyHistory}>
                <IconSymbol name="chart.bar" size={48} color="#9CA3AF" />
                <ThemedText style={styles.emptyHistoryText}>No games completed yet</ThemedText>
                <ThemedText style={styles.emptyHistorySubtext}>
                  Complete your first game to see your scores here
                </ThemedText>
              </ThemedView>
            )}
          </ThemedView>
        </ThemedView>
      </ScrollView>

      {/* Fixed Banner Ad at bottom */}
      <View style={styles.bannerContainer}>
        <BannerAd size="medium" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  bannerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  header: {
    marginTop: 100,
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
    color: '#000000',
    marginTop: 10,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    fontWeight: '400',
    textAlign: 'center',
    marginBottom: 20,
    color: '#717171',
    letterSpacing: 0.2,
  },
  content: {
    paddingHorizontal: 20,
    backgroundColor: 'transparent',
  },
  topScoresSection: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 30,
  },
  scoreCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#EBEBEB',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    shadowColor: '#000000',
  },
  highestScoreCard: {
    borderColor: '#FFD700',
    borderWidth: 2,
  },
  emptyScoreCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  scoreDisplay: {
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: 'transparent',
  },
  percentageText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#10B981',
    marginBottom: 4,
  },
  highestPercentageText: {
    color: '#FFD700',
  },
  scoreBreakdown: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  compositeScore: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 2,
    fontWeight: '500',
  },
  scoreDate: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  historySection: {
    backgroundColor: 'transparent',
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  historyList: {
    backgroundColor: 'transparent',
    gap: 8,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  },
  recentHistoryItem: {
    borderColor: '#E5E7EB',
    backgroundColor: '#FAFAFA',
  },
  historyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  historyRank: {
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rankText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  historyScore: {
    backgroundColor: 'transparent',
  },
  historyPercentage: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  historyBreakdown: {
    fontSize: 12,
    color: '#6B7280',
  },
  historyRight: {
    alignItems: 'flex-end',
    backgroundColor: 'transparent',
    gap: 8,
  },
  historyDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  emptyHistory: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    backgroundColor: 'transparent',
  },
  emptyHistoryText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#6B7280',
    marginTop: 16,
    marginBottom: 4,
  },
  emptyHistorySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});