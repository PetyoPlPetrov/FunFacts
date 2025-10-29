import React from 'react';
import { StyleSheet, View, Text, Pressable, Platform } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import * as Haptics from 'expo-haptics';

interface NativeAdProps {
  style?: any;
  compact?: boolean;
}

// Mock native ad data - more text-focused and contextual
const mockNativeAds = [
  {
    id: '1',
    headline: 'Discover More Amazing Facts',
    description: 'Get unlimited access to over 10,000 fascinating facts from around the world.',
    brandName: 'FactVault Pro',
    ctaText: 'Learn More',
    icon: 'book.fill' as const,
    bgColor: '#F3F4F6',
    textColor: '#374151',
    accentColor: '#FF5A5F',
  },
  {
    id: '2',
    headline: 'Test Your Knowledge',
    description: 'Challenge yourself with fun trivia games based on interesting facts and science.',
    brandName: 'BrainQuiz',
    ctaText: 'Play Quiz',
    icon: 'questionmark.circle.fill' as const,
    bgColor: '#FEF3C7',
    textColor: '#92400E',
    accentColor: '#00A699',
  },
  {
    id: '3',
    headline: 'Learn Something New Daily',
    description: 'Join millions discovering fascinating facts with our daily newsletter.',
    brandName: 'Daily Wonder',
    ctaText: 'Subscribe',
    icon: 'envelope.fill' as const,
    bgColor: '#DBEAFE',
    textColor: '#1E40AF',
    accentColor: '#767676',
  },
  {
    id: '4',
    headline: 'Expand Your Mind',
    description: 'Access premium educational content from leading universities and experts.',
    brandName: 'MindExpand',
    ctaText: 'Start Free',
    icon: 'graduationcap.fill' as const,
    bgColor: '#D1FAE5',
    textColor: '#065F46',
    accentColor: '#FF5A5F',
  }
] as const;

export function NativeAd({ style, compact = false }: NativeAdProps) {
  // Randomly select an ad
  const ad = React.useMemo(() =>
    mockNativeAds[Math.floor(Math.random() * mockNativeAds.length)],
    []
  );

  const handleAdClick = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    console.log(`Mock native ad clicked: ${ad.headline}`);
    // In real implementation, this would track ad clicks and open ad destination
  };

  return (
    <View style={[styles.container, { backgroundColor: ad.bgColor }, style]}>
      <Pressable onPress={handleAdClick} style={styles.pressable}>
        {/* Ad Label */}
        <View style={[styles.adLabel, { backgroundColor: ad.accentColor }]}>
          <Text style={styles.adLabelText}>Sponsored</Text>
        </View>

        <View style={[styles.content, compact && styles.compactContent]}>
          {/* Icon */}
          <View style={[styles.iconContainer, { backgroundColor: ad.accentColor }]}>
            <IconSymbol name={ad.icon} size={compact ? 16 : 20} color="#FFFFFF" />
          </View>

          {/* Text Content */}
          <View style={styles.textContent}>
            <Text
              style={[
                styles.headline,
                { color: ad.textColor },
                compact && styles.compactHeadline
              ]}
              numberOfLines={compact ? 1 : 2}
            >
              {ad.headline}
            </Text>

            {!compact && (
              <Text
                style={[styles.description, { color: ad.textColor }]}
                numberOfLines={2}
              >
                {ad.description}
              </Text>
            )}

            <Text style={[styles.brandName, { color: ad.accentColor }]}>
              {ad.brandName}
            </Text>
          </View>

          {/* CTA Button */}
          <View style={styles.ctaContainer}>
            <View style={[styles.ctaButton, { backgroundColor: ad.accentColor }]}>
              <Text style={styles.ctaText}>{ad.ctaText}</Text>
            </View>
          </View>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    marginVertical: 8,
    position: 'relative',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  pressable: {
    flex: 1,
  },
  adLabel: {
    position: 'absolute',
    top: 8,
    right: 8,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    zIndex: 1,
  },
  adLabelText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    paddingTop: 24, // Account for ad label
  },
  compactContent: {
    padding: 12,
    paddingTop: 20,
    alignItems: 'center',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  textContent: {
    flex: 1,
    marginRight: 12,
  },
  headline: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 18,
    marginBottom: 4,
  },
  compactHeadline: {
    fontSize: 12,
    marginBottom: 2,
  },
  description: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 6,
    opacity: 0.8,
  },
  brandName: {
    fontSize: 10,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  ctaContainer: {
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  ctaButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    minWidth: 50,
    alignItems: 'center',
  },
  ctaText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});