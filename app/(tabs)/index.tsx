import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, Pressable, Alert, ActivityIndicator, Text, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { IconSymbol } from '@/components/ui/icon-symbol';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { FunFactCard } from '@/components/fun-fact-card';
import { FactDetailModal } from '@/components/fact-detail-modal';
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
        category: localFact.category,
        isFavorite: false,
        dateDiscovered: new Date().toISOString()
      };

      // Add fallback to history
      setFactsHistory(prev => [...prev, fallbackFact]);
      setCurrentFactIndex(prev => prev + 1);
      setIsViewingHistory(false);
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
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <LinearGradient
        colors={colorScheme === 'dark'
          ? ['#1e3a8a', '#1e40af', '#3b82f6']
          : ['#dbeafe', '#bfdbfe', '#93c5fd']
        }
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
              { opacity: hasPreviousFact ? 1 : 0.3 }
            ]}
            onPress={goToPreviousFact}
            disabled={!hasPreviousFact}
          >
            <IconSymbol name="chevron.left" size={24} color={Platform.OS === 'ios' ? '#2563EB' : '#000000'} />
          </Pressable>

          <ThemedView style={styles.historyIndicator}>
            <ThemedText style={styles.historyText}>
              {currentFactIndex + 1} / {totalFacts}
            </ThemedText>
          </ThemedView>

          <Pressable
            style={[
              styles.navButton,
              { opacity: hasNextFact ? 1 : 0.3 }
            ]}
            onPress={goToNextFact}
            disabled={!hasNextFact}
          >
            <IconSymbol name="chevron.right" size={24} color={Platform.OS === 'ios' ? '#2563EB' : '#000000'} />
          </Pressable>
        </ThemedView>
      )}

      <ThemedView style={styles.buttonContainer}>
        <Pressable
          style={[
            styles.generateButton,
            {
              backgroundColor: '#27AE60', // Static green color for iOS compatibility
              opacity: isLoading ? 0.6 : 1,
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
                backgroundColor: Platform.OS === 'ios' ? '#FEF3C7' : '#FFFFFF',
                borderWidth: Platform.OS === 'ios' ? 3 : 2,
                borderColor: Platform.OS === 'ios' ? '#F59E0B' : '#000000',
                ...(Platform.OS === 'ios' && {
                  shadowColor: '#F59E0B',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.25,
                  shadowRadius: 8,
                })
              }
            ]}
            onPress={goToLatestFact}
          >
            <IconSymbol name="arrow.up" size={24} color={Platform.OS === 'ios' ? '#D97706' : '#000000'} />
            <Text style={[
              styles.buttonText,
              { color: Platform.OS === 'ios' ? '#D97706' : '#000000' }
            ]}>
              Back to Latest
            </Text>
          </Pressable>
        )}
      </ThemedView>

      <ThemedView style={styles.infoContainer}>
        <ThemedText style={styles.infoText}>
          Tap the fact card for detailed information. Use the arrows to browse previous facts!
        </ThemedText>
        <ThemedText style={styles.categoriesText}>
          Facts powered by public API • Navigate through your discovery history
        </ThemedText>
      </ThemedView>

      <FactDetailModal
        visible={modalVisible}
        fact={currentFact}
        onClose={() => setModalVisible(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  contentContainer: {
    paddingBottom: 50,
  },
  header: {
    marginTop: 150,
    paddingTop: 40,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    backgroundColor: 'transparent',
    marginTop: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#FFFFFF',
    marginTop: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.9,
    marginBottom: 20,
    color: '#FFFFFF',
  },
  statsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 15,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'center',
  },
  statsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
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
    fontWeight: '600',
    color: '#FFFFFF',
  },
  infoContainer: {
    paddingHorizontal: 20,
    paddingTop: 30,
    backgroundColor: 'transparent',
  },
  infoText: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 16,
    lineHeight: 22,
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
    backgroundColor: Platform.OS === 'ios' ? '#DBEAFE' : '#FFFFFF',
    borderRadius: 25,
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: Platform.OS === 'ios' ? 2 : 1,
    borderColor: Platform.OS === 'ios' ? '#3B82F6' : '#000000',
    shadowOffset: {
      width: 0,
      height: Platform.OS === 'ios' ? 4 : 2,
    },
    shadowOpacity: Platform.OS === 'ios' ? 0.2 : 0.1,
    shadowRadius: Platform.OS === 'ios' ? 6 : 4,
    elevation: 3,
    ...(Platform.OS === 'ios' && {
      shadowColor: '#3B82F6',
    })
  },
  historyIndicator: {
    backgroundColor: Platform.OS === 'ios' ? '#DBEAFE' : '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 15,
    marginHorizontal: 20,
    borderWidth: Platform.OS === 'ios' ? 2 : 1,
    borderColor: Platform.OS === 'ios' ? '#3B82F6' : '#000000',
    shadowOffset: {
      width: 0,
      height: Platform.OS === 'ios' ? 3 : 2,
    },
    shadowOpacity: Platform.OS === 'ios' ? 0.15 : 0.1,
    shadowRadius: Platform.OS === 'ios' ? 5 : 4,
    elevation: 3,
    ...(Platform.OS === 'ios' && {
      shadowColor: '#3B82F6',
    })
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
