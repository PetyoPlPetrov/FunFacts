import React from 'react';
import { StyleSheet, View, Text, Pressable, Dimensions, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { IconSymbol } from '@/components/ui/icon-symbol';
import * as Haptics from 'expo-haptics';

interface BannerAdProps {
  size?: 'small' | 'medium' | 'large';
  style?: any;
}

const { width } = Dimensions.get('window');

// Mock ad data - in real implementation this would come from Google AdMob
const mockAds = [
  {
    id: '1',
    title: 'Learn Languages Fast',
    description: 'Master any language in 30 days with AI-powered lessons',
    brandName: 'LinguaAI',
    ctaText: 'Start Free Trial',
    colors: ['#FF5A5F', '#E31C5F'] as const,
    icon: 'globe' as const
  },
  {
    id: '2',
    title: 'Brain Training Games',
    description: 'Boost your IQ with fun daily brain exercises',
    brandName: 'MindBoost',
    ctaText: 'Play Now',
    colors: ['#00A699', '#008B8B'] as const,
    icon: 'questionmark.circle' as const
  },
  {
    id: '3',
    title: 'Premium Coffee Delivered',
    description: 'Fresh roasted coffee beans to your doorstep',
    brandName: 'BrewMaster',
    ctaText: 'Order Today',
    colors: ['#767676', '#484848'] as const,
    icon: 'cup.and.saucer' as const
  },
  {
    id: '4',
    title: 'Investment Made Simple',
    description: 'Start investing with just $1. No fees, no minimums',
    brandName: 'WealthEasy',
    ctaText: 'Invest Now',
    colors: ['#FF5A5F', '#E31C5F'] as const,
    icon: 'chart.line.uptrend.xyaxis' as const
  }
] as const;

export function BannerAd({ size = 'medium', style }: BannerAdProps) {
  // Randomly select an ad (in real implementation, this would be handled by AdMob)
  const ad = mockAds[Math.floor(Math.random() * mockAds.length)];

  const handleAdClick = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    console.log(`Mock ad clicked: ${ad.title}`);
    // In real implementation, this would track ad clicks and open ad destination
  };

  const getAdHeight = () => {
    switch (size) {
      case 'small': return 60;
      case 'medium': return 90;
      case 'large': return 120;
      default: return 90;
    }
  };

  const getTextSizes = () => {
    switch (size) {
      case 'small': return { title: 14, description: 11, cta: 11 };
      case 'medium': return { title: 16, description: 12, cta: 12 };
      case 'large': return { title: 18, description: 14, cta: 14 };
      default: return { title: 16, description: 12, cta: 12 };
    }
  };

  const textSizes = getTextSizes();

  return (
    <View style={[styles.container, { height: getAdHeight() }, style]}>
      <Pressable onPress={handleAdClick} style={styles.pressable}>
        <LinearGradient
          colors={ad.colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.adContainer}
        >
          <View style={styles.adLabel}>
            <Text style={styles.adLabelText}>Ad</Text>
          </View>

          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <IconSymbol name={ad.icon} size={size === 'small' ? 20 : 24} color="#FFFFFF" />
            </View>

            <View style={styles.textContent}>
              <Text style={[styles.title, { fontSize: textSizes.title }]} numberOfLines={1}>
                {ad.title}
              </Text>
              <Text style={[styles.description, { fontSize: textSizes.description }]} numberOfLines={size === 'small' ? 1 : 2}>
                {ad.description}
              </Text>
              <Text style={[styles.brandName, { fontSize: textSizes.description - 1 }]}>
                {ad.brandName}
              </Text>
            </View>

            <View style={styles.ctaContainer}>
              <View style={styles.ctaButton}>
                <Text style={[styles.ctaText, { fontSize: textSizes.cta }]}>
                  {ad.ctaText}
                </Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 45,
    width: width - 40,
    alignSelf: 'center',
    marginVertical: 8,
    borderRadius: 12,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  pressable: {
    flex: 1,
  },
  adContainer: {
    flex: 1,
    position: 'relative',
  },
  adLabel: {
    position: 'absolute',
    top: 4,
    left: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    zIndex: 1,
  },
  adLabelText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 24, // Account for ad label
  },
  iconContainer: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContent: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  description: {
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 16,
    marginBottom: 2,
  },
  brandName: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontStyle: 'italic',
  },
  ctaContainer: {
    justifyContent: 'center',
  },
  ctaButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    minWidth: 60,
    alignItems: 'center',
  },
  ctaText: {
    fontWeight: '600',
    color: '#1F2937',
  },
});