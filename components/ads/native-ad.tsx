import { adFeatures, adUnitIds } from '@/services/ads';
import React, { useEffect, useState } from 'react';
import { Platform, StyleSheet, Text, View, Image, ActivityIndicator } from 'react-native';
import {
  NativeAd as GoogleNativeAd,
  NativeAdView,
  NativeAsset,
  NativeAssetType,
  NativeMediaView,
  TestIds,
} from 'react-native-google-mobile-ads';

interface NativeAdProps {
  style?: any;
  compact?: boolean;
}

export function NativeAd({ style, compact = false }: NativeAdProps) {
  const [nativeAd, setNativeAd] = useState<GoogleNativeAd | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!adFeatures.native) {
      setLoading(false);
      return;
    }
    if (Platform.OS === 'web') {
      setLoading(false);
      return;
    }

    // Get the appropriate ad unit ID based on platform and dev mode
    const adUnitId = Platform.OS === 'ios'
      ? adUnitIds.ios.native
      : adUnitIds.android.native;

    if (!adUnitId) {
      setLoading(false);
      return;
    }

    let mounted = true;
    let lastAd: GoogleNativeAd | null = null;

    // Create and load native ad
    GoogleNativeAd.createForAdRequest(adUnitId, {
      requestNonPersonalizedAdsOnly: false,
    })
      .then((ad) => {
        lastAd = ad;
        if (mounted) {
          if (__DEV__) console.log('[NativeAd] Ad loaded successfully', ad);
          setNativeAd(ad);
          setLoading(false);
          setError(false);
        }
      })
      .catch((err) => {
        if (__DEV__) console.log('[NativeAd] Failed to load:', err);
        if (mounted) {
          setLoading(false);
          setError(true);
        }
      });

    // Cleanup
    return () => {
      mounted = false;
      lastAd?.destroy?.();
    };
  }, []);

  if (!adFeatures.native) return null;
  if (Platform.OS === 'web') return null;

  // Show loading state
  if (loading) {
    return (
      <View style={[styles.container, style]}>
        <ActivityIndicator size="small" color="#9CA3AF" />
        <Text style={styles.loadingText}>Loading ad...</Text>
      </View>
    );
  }

  // Show error state or hide if failed
  if (error || !nativeAd) {
    if (__DEV__) {
      return (
        <View style={[styles.container, style]}>
          <Text style={styles.errorText}>Ad failed to load</Text>
        </View>
      );
    }
    return null;
  }

  return (
    <View style={[styles.container, style]}>
      <NativeAdView nativeAd={nativeAd} style={styles.adView}>
        {/* Sponsored label */}
        <View style={styles.sponsoredBadge}>
          <Text style={styles.sponsoredText}>Ad</Text>
        </View>

        <View style={styles.content}>
          {/* Icon */}
          {nativeAd.icon && (
            <NativeAsset assetType={NativeAssetType.ICON}>
              <View style={styles.iconContainer}>
                <Image
                  source={{ uri: nativeAd.icon.url }}
                  style={styles.icon}
                  resizeMode="contain"
                />
              </View>
            </NativeAsset>
          )}

          {/* Text Content */}
          <View style={styles.textContent}>
            {/* Headline */}
            <NativeAsset assetType={NativeAssetType.HEADLINE}>
              <Text
                style={[styles.headline, compact && styles.compactHeadline]}
                numberOfLines={compact ? 1 : 2}
              >
                {nativeAd.headline}
              </Text>
            </NativeAsset>

            {/* Body/Tagline */}
            {!compact && nativeAd.body && (
              <NativeAsset assetType={NativeAssetType.BODY}>
                <Text style={styles.body} numberOfLines={2}>
                  {nativeAd.body}
                </Text>
              </NativeAsset>
            )}

            {/* Advertiser */}
            {nativeAd.advertiser && (
              <NativeAsset assetType={NativeAssetType.ADVERTISER}>
                <Text style={styles.advertiser}>
                  {nativeAd.advertiser}
                </Text>
              </NativeAsset>
            )}
          </View>

          {/* Call to Action Button */}
          {nativeAd.callToAction && (
            <NativeAsset assetType={NativeAssetType.CALL_TO_ACTION}>
              <View style={styles.ctaButton}>
                <Text style={styles.ctaText}>
                  {nativeAd.callToAction}
                </Text>
              </View>
            </NativeAsset>
          )}
        </View>

        {/* Media View for images/videos */}
        {!compact && (
          <NativeMediaView style={styles.mediaView} />
        )}
      </NativeAdView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    marginVertical: 12,
    marginHorizontal: 0,
    backgroundColor: '#FFFFFF',
    minHeight: 100,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  adView: {
    width: '100%',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    textAlign: 'center',
  },
  sponsoredBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#9CA3AF',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    zIndex: 10,
  },
  sponsoredText: {
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
    paddingTop: 24,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
    marginRight: 12,
  },
  icon: {
    width: 40,
    height: 40,
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
    color: '#1F2937',
  },
  compactHeadline: {
    fontSize: 12,
    marginBottom: 2,
  },
  body: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 6,
    color: '#6B7280',
  },
  advertiser: {
    fontSize: 10,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    color: '#9CA3AF',
  },
  ctaButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#FF385C',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
  },
  ctaText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  mediaView: {
    height: 120,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#E5E7EB',
  },
});
