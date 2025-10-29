import React from 'react';
import {
  Modal,
  StyleSheet,
  Pressable,
  ScrollView,
  Share,
  Alert,
  Linking,
  Dimensions,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { IconSymbol } from '@/components/ui/icon-symbol';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { EnhancedFact } from '@/services/facts-api';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { NativeAd } from '@/components/ads/native-ad';

interface FactDetailModalProps {
  visible: boolean;
  fact: EnhancedFact | null;
  onClose: () => void;
}

const { width, height } = Dimensions.get('window');

export function FactDetailModal({ visible, fact, onClose }: FactDetailModalProps) {
  const colorScheme = useColorScheme();

  // Use the accessible color utility functions

  const handleShare = async () => {
    if (!fact) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      await Share.share({
        message: `Fun Fact: ${fact.text}\n\nSource: ${fact.source}\n\nShared from Fun Facts App`,
        title: 'Amazing Fun Fact!'
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleOpenSource = () => {
    if (!fact?.source_url) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    Alert.alert(
      'Open Source',
      'Do you want to open the source website?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Open',
          onPress: () => Linking.openURL(fact.source_url)
        }
      ]
    );
  };

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  if (!fact) return null;


  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <ThemedView style={styles.container}>
        <LinearGradient
          colors={['#FFFFFF', '#FFFFFF', '#FFFFFF']}
          style={styles.header}
        >
          <ThemedView style={styles.headerContent}>
            <Pressable style={styles.closeButton} onPress={handleClose}>
              <ThemedText style={styles.closeButtonText}>✕</ThemedText>
            </Pressable>

            <ThemedText style={styles.modalTitle}>Fun Fact Details</ThemedText>

          </ThemedView>
        </LinearGradient>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <ThemedView style={styles.factCard}>
            <ThemedText style={styles.factText}>
              {fact.text}
            </ThemedText>
          </ThemedView>

          <ThemedView style={styles.detailsSection}>
            <ThemedText style={styles.sectionTitle}>Details</ThemedText>

            <ThemedView style={styles.detailRow}>
              <IconSymbol name="globe" size={20} color="#9CA3AF" />
              <ThemedView style={styles.detailContent}>
                <ThemedText style={styles.detailLabel}>Source</ThemedText>
                <ThemedText style={styles.detailValue}>{fact.source}</ThemedText>
              </ThemedView>
          </ThemedView>

            {fact.dateDiscovered && (
              <ThemedView style={styles.detailRow}>
                <IconSymbol name="calendar" size={20} color="#9CA3AF" />
                <ThemedView style={styles.detailContent}>
                  <ThemedText style={styles.detailLabel}>Discovered</ThemedText>
                  <ThemedText style={styles.detailValue}>
                    {new Date(fact.dateDiscovered).toLocaleDateString()}
                  </ThemedText>
                </ThemedView>
              </ThemedView>
            )}
          </ThemedView>

          {/* Native Ad */}
          <NativeAd style={styles.nativeAd} />

          <ThemedView style={styles.actionsSection}>
            <Pressable
              style={[
                styles.actionButton,
                {
                  backgroundColor: '#FF385C', // Authentic Airbnb coral
                  borderWidth: 0,
                  shadowColor: '#FF385C',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.15,
                  shadowRadius: 8,
                }
              ]}
              onPress={handleShare}
            >
              <IconSymbol name="square.and.arrow.up" size={20} color="#FFFFFF" />
              <ThemedText style={[styles.actionButtonText, { color: '#FFFFFF' }]}>Share Fact</ThemedText>
            </Pressable>

            {fact.source_url && (
              <Pressable
                style={[
                  styles.actionButton,
                  {
                    backgroundColor: '#FFFFFF',
                    borderWidth: 1,
                    borderColor: '#DDDDDD', // Airbnb light border
                    shadowColor: '#000000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 4,
                  }
                ]}
                onPress={handleOpenSource}
              >
                <IconSymbol name="link" size={20} color="#000000" />
                <ThemedText style={[styles.actionButtonText, { color: '#000000' }]}>
                  View Source
                </ThemedText>
              </Pressable>
            )}
          </ThemedView>
        </ScrollView>
      </ThemedView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  closeButton: {
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
  closeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 50,
  },
  factCard: {
    backgroundColor: 'transparent',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  factText: {
    fontSize: 18,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    lineHeight: 26,
    fontWeight: '400',
    textAlign: 'center',
    letterSpacing: 0.1,
  },
  detailsSection: {
    backgroundColor: 'transparent',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    fontWeight: '600',
    marginBottom: 16,
    letterSpacing: -0.2,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  detailContent: {
    marginLeft: 12,
    flex: 1,
    backgroundColor: 'transparent',
  },
  detailLabel: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  nativeAd: {
    marginHorizontal: 0,
    marginBottom: 20,
  },
  actionsSection: {
    backgroundColor: 'transparent',
    gap: 12,
  },
  actionButton: {
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
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  secondaryButton: {
    borderWidth: 2,
  },
  actionButtonText: {
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
});