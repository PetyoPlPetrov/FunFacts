import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, Pressable, Alert, ActivityIndicator, Text, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { IconSymbol } from '@/components/ui/icon-symbol';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { FunFactCard } from '@/components/fun-fact-card';
import { FactDetailModal } from '@/components/fact-detail-modal';
import { BannerAd } from '@/components/ads/banner-ad';
import { InterstitialAd } from '@/components/ads/interstitial-ad';
import { factsApi, EnhancedFact } from '@/services/facts-api';
import { getRandomFunFact, FunFact } from '@/constants/fun-facts';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const [factsHistory, setFactsHistory] = useState<EnhancedFact[]>([]);
  const [currentFactIndex, setCurrentFactIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isViewingHistory, setIsViewingHistory] = useState(false);
  const [interstitialVisible, setInterstitialVisible] = useState(false);
  const [factGenerationCount, setFactGenerationCount] = useState(0);

  // Computed values
  const currentFact = currentFactIndex >= 0 ? factsHistory[currentFactIndex] : null;
  const totalFacts = factsHistory.length;
  const hasNextFact = currentFactIndex < factsHistory.length - 1;
  const hasPreviousFact = currentFactIndex > 0;

  // Load initial fact on mount
  useEffect(() => {
    loadNewFact();
  }, []);

  const loadNewFact = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const fact = await factsApi.getRandomFact();
      const enhancedFact = factsApi.enhanceFact(fact);

      // Add to history and set as current
      setFactsHistory(prev => [...prev, enhancedFact]);
      setCurrentFactIndex(prev => prev + 1);
      setIsViewingHistory(false);

      // Show interstitial ad every 5 facts
      setFactGenerationCount(prev => {
        const newCount = prev + 1;
        if (newCount % 5 === 0) {
          setTimeout(() => setInterstitialVisible(true), 500); // Small delay for better UX
        }
        return newCount;
      });
    } catch (err) {
      console.error('Error loading fact:', err);
      setError('Failed to load fact. Please try again.');

      // Fallback to local fact
      const localFact = getRandomFunFact();
      const fallbackFact: EnhancedFact = {
        id: `local-${Date.now()}`,
        text: localFact.fact,
        source: 'Local Database',
        source_url: '',
        language: 'en',
        permalink: '',
        isFavorite: false,
        dateDiscovered: new Date().toISOString()
      };

      // Add fallback to history
      setFactsHistory(prev => [...prev, fallbackFact]);
      setCurrentFactIndex(prev => prev + 1);
      setIsViewingHistory(false);

      // Show interstitial ad every 5 facts (including fallback)
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
    loadNewFact();
  };

  const goToPreviousFact = () => {
    if (hasPreviousFact) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setCurrentFactIndex(prev => prev - 1);
      setIsViewingHistory(true);
    }
  };

  const goToNextFact = () => {
    if (hasNextFact) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setCurrentFactIndex(prev => prev + 1);
      setIsViewingHistory(currentFactIndex + 1 < factsHistory.length - 1);
    }
  };

  const goToLatestFact = () => {
    if (factsHistory.length > 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setCurrentFactIndex(factsHistory.length - 1);
      setIsViewingHistory(false);
    }
  };

  const openFactModal = () => {
    if (currentFact && !isLoading) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setModalVisible(true);
    }
  };

  return (
    <>
      <LinearGradient
        colors={['#FFFFFF', '#FFFFFF', '#FFFFFF']}
        style={styles.header}
      >
        <ThemedView style={styles.headerContent}>
          <Text style={styles.title}>Fun Facts</Text>
          <ThemedText style={styles.subtitle}>
            Discover amazing facts about our world!
          </ThemedText>
          <ThemedView style={styles.statsContainer}>
            <ThemedText style={styles.statsText}>
              {isViewingHistory
                ? `Fact ${currentFactIndex + 1} of ${totalFacts}`
                : `Facts discovered: ${totalFacts}`}
            </ThemedText>
          </ThemedView>

          {error && (
            <ThemedView style={styles.errorContainer}>
              <ThemedText style={styles.errorText}>{error}</ThemedText>
            </ThemedView>
          )}
        </ThemedView>
      </LinearGradient>

      <ThemedView style={styles.cardContainer}>
        {currentFact ? (
          <FunFactCard
            funFact={currentFact}
            onPress={openFactModal}
            isLoading={isLoading}
          />
        ) : (
          <ThemedView style={styles.loadingCard}>
            <ActivityIndicator size="large" color="#27AE60" />
            <ThemedText style={styles.loadingText}>Loading your first fact...</ThemedText>
          </ThemedView>
        )}
      </ThemedView>

      {/* History Navigation */}
      {totalFacts > 1 && (
        <ThemedView style={styles.historyNavigation}>
          <Pressable
            style={[
              styles.navButton,
              { opacity: hasPreviousFact ? 1 : 0.4 }
            ]}
            onPress={goToPreviousFact}
            disabled={!hasPreviousFact}
          >
            <IconSymbol name="chevron.left" size={20} color="#717171" />
          </Pressable>

          <ThemedView style={styles.historyIndicator}>
            <ThemedText style={styles.historyText}>
              {currentFactIndex + 1} / {totalFacts}
            </ThemedText>
          </ThemedView>

          <Pressable
            style={[
              styles.navButton,
              { opacity: hasNextFact ? 1 : 0.4 }
            ]}
            onPress={goToNextFact}
            disabled={!hasNextFact}
          >
            <IconSymbol name="chevron.right" size={20} color="#717171" />
          </Pressable>
        </ThemedView>
      )}

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
            {isLoading ? 'Loading...' : 'Generate New Fact'}
          </Text>
        </Pressable>

        {/* Back to Latest Button */}
        {isViewingHistory && (
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
            onPress={goToLatestFact}
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
        fact={currentFact}
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
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Pure white like Airbnb
  },
  contentContainer: {
    paddingBottom: 50,
  },
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
  statsContainer: {
    backgroundColor: '#F7F7F7', // Airbnb light gray
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: '#EBEBEB',
  },
  statsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000', // Black like Airbnb
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
