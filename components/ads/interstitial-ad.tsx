import { IconSymbol } from '@/components/ui/icon-symbol';
import { adFeatures, showInterstitial } from '@/services/ads';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Dimensions, Modal, Platform, Pressable, Platform as RNPlatform, StyleSheet, Text, View } from 'react-native';

interface InterstitialAdProps {
  visible: boolean;
  onClose: () => void;
  onAdClick?: () => void;
}

const { width } = Dimensions.get('window');

// Mock interstitial ad data
const mockInterstitialAds = [
  {
    id: '1',
    title: 'Discover Amazing Travel Deals',
    description: 'Book your dream vacation with up to 70% off flights and hotels. Limited time offer!',
    brandName: 'TravelGenius',
    ctaText: 'Book Now',
    closeDelay: 5, // seconds before close button appears
    backgroundImage: '🏝️',
    colors: ['#FF5A5F', '#FF385C', '#E31C5F'] as const,
  },
  {
    id: '2',
    title: 'Master New Skills Online',
    description: 'Learn from industry experts with thousands of courses in design, business, tech and more.',
    brandName: 'SkillAcademy',
    ctaText: 'Start Learning',
    closeDelay: 5,
    backgroundImage: '🎓',
    colors: ['#00A699', '#20B2AA', '#48D1CC'] as const,
  },
  {
    id: '3',
    title: 'Premium Food Delivery',
    description: 'Gourmet meals from top restaurants delivered in 30 minutes. Free delivery on your first order!',
    brandName: 'QuickEats',
    ctaText: 'Order Food',
    closeDelay: 5,
    backgroundImage: '🍕',
    colors: ['#767676', '#484848', '#6B7280'] as const,
  }
] as const;

export function InterstitialAd({ visible, onClose, onAdClick }: InterstitialAdProps) {
  // If interstitials are disabled, render nothing
  if (!adFeatures.interstitial) return null;
  const [showCloseButton, setShowCloseButton] = React.useState(false);
  const [timeLeft, setTimeLeft] = React.useState(5);

  // Randomly select an ad
  const ad = React.useMemo(() =>
    mockInterstitialAds[Math.floor(Math.random() * mockInterstitialAds.length)],
    [visible]
  );

  React.useEffect(() => {
    if (visible) {
      setShowCloseButton(false);
      setTimeLeft(ad.closeDelay);

      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setShowCloseButton(true);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [visible, ad.closeDelay]);

  const handleAdClick = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    console.log(`Mock interstitial ad clicked: ${ad.title}`);
    onAdClick?.();
    // In real implementation, this would track ad clicks and open ad destination
  };

  const handleClose = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  // Native platforms: show real interstitial and return nothing
  // Guard against duplicate shows (e.g., StrictMode double effect in dev)
  const requestedRef = useRef(false);
  useEffect(() => {
    if (visible && RNPlatform.OS !== 'web' && !requestedRef.current) {
      requestedRef.current = true;
      if (__DEV__) console.log('[Ads] Interstitial visible=true → showInterstitial()');
      showInterstitial(() => {
        requestedRef.current = false;
        onClose();
      });
    }
  }, [visible, onClose]);

  if (!visible || RNPlatform.OS !== 'web') return null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={false}
      onRequestClose={handleClose}
    >
      <LinearGradient
        colors={ad.colors}
        style={styles.container}
      >
        {/* Ad Label */}
        <View style={styles.adLabel}>
          <Text style={styles.adLabelText}>Advertisement</Text>
        </View>

        {/* Close Button or Timer */}
        <View style={styles.closeButtonContainer}>
          {showCloseButton ? (
            <Pressable style={styles.closeButton} onPress={handleClose}>
              <IconSymbol name="xmark" size={20} color="#FFFFFF" />
            </Pressable>
          ) : (
            <View style={styles.timerContainer}>
              <Text style={styles.timerText}>{timeLeft}</Text>
            </View>
          )}
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          <Text style={styles.backgroundEmoji}>{ad.backgroundImage}</Text>

          <View style={styles.textContainer}>
            <Text style={styles.title}>{ad.title}</Text>
            <Text style={styles.description}>{ad.description}</Text>
            <Text style={styles.brandName}>{ad.brandName}</Text>
          </View>

          <Pressable style={styles.ctaButton} onPress={handleAdClick}>
            <Text style={styles.ctaText}>{ad.ctaText}</Text>
            <IconSymbol name="arrow.right" size={16} color="#1F2937" />
          </Pressable>
        </View>

        {/* Skip Option */}
        {showCloseButton && (
          <Pressable style={styles.skipButton} onPress={handleClose}>
            <Text style={styles.skipText}>Skip Ad</Text>
          </Pressable>
        )}
      </LinearGradient>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  adLabel: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  adLabelText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  closeButtonContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    right: 20,
  },
  closeButton: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerContainer: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  content: {
    alignItems: 'center',
    maxWidth: width - 80,
  },
  backgroundEmoji: {
    fontSize: 80,
    marginBottom: 30,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 34,
  },
  description: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 12,
  },
  brandName: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  ctaButton: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
    gap: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  ctaText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  skipButton: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 50 : 30,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  skipText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textDecorationLine: 'underline',
  },
});