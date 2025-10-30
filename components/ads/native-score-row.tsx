import { adFeatures, adUnitIds } from '@/services/ads';
import React, { useEffect, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import {
    NativeAd,
    NativeAdEventType,
    NativeAdView,
    NativeAsset,
    NativeAssetType,
    TestIds,
} from 'react-native-google-mobile-ads';

export function NativeScoreRow() {
  const [nativeAd, setNativeAd] = useState<NativeAd | null>(null);

  useEffect(() => {
    if (!adFeatures.native) return;
    const unitId = Platform.OS === 'ios' ? adUnitIds.ios.native ?? TestIds.NATIVE : adUnitIds.android.native ?? TestIds.NATIVE;
    if (!unitId) return;
    let mounted = true;
    let lastAd: NativeAd | null = null;

    if (__DEV__) console.log('[Ads] Native row load', unitId);
    NativeAd.createForAdRequest(unitId)
      .then((ad) => {
        lastAd = ad;
        if (mounted) setNativeAd(ad);
      })
      .catch((e) => {
        if (__DEV__) console.log('[Ads] Native load error', e);
      });

    return () => {
      mounted = false;
      lastAd?.destroy?.();
    };
  }, []);

  // Log native ad events on Android while testing
  useEffect(() => {
    if (!nativeAd) return;
    const N = NativeAdEventType as any;
    const listeners = [
      (nativeAd as any).addAdEventListener?.(N.LOADED ?? 'loaded', () => __DEV__ && console.log('[Ads] Native LOADED')),
      (nativeAd as any).addAdEventListener?.(N.OPENED ?? 'opened', () => __DEV__ && console.log('[Ads] Native OPENED')),
      (nativeAd as any).addAdEventListener?.(N.CLICKED ?? 'clicked', () => __DEV__ && console.log('[Ads] Native CLICKED')),
      (nativeAd as any).addAdEventListener?.(N.IMPRESSION ?? 'impression', () => __DEV__ && console.log('[Ads] Native IMPRESSION')),
      (nativeAd as any).addAdEventListener?.(N.CLOSED ?? 'closed', () => __DEV__ && console.log('[Ads] Native CLOSED')),
      (nativeAd as any).addAdEventListener?.(N.ERROR ?? 'error', (e: any) => __DEV__ && console.log('[Ads] Native ERROR', e)),
    ].filter(Boolean) as any[];
    return () => {
      listeners.forEach((l: any) => l.remove?.());
    };
  }, [nativeAd]);

  if (!adFeatures.native) return null;
  if (!nativeAd) {
    // Lightweight placeholder to keep spacing consistent while loading
    return (
      <View style={styles.row}>
        <View style={styles.sponsoredBadge}>
          <Text style={styles.sponsoredText}>Sponsored</Text>
        </View>
        <View style={styles.leftStub} />
        <View style={styles.middle}>
          <Text style={styles.body}>Loading ad...</Text>
        </View>
      </View>
    );
  }

  return (
    <NativeAdView nativeAd={nativeAd} style={styles.row}>
      {/* Sponsored label */}
      <View style={styles.sponsoredBadge}>
        <Text style={styles.sponsoredText}>Ad</Text>
      </View>

      {/* Left: rank circle placeholder to match list layout */}
      <View style={styles.leftStub} />

      {/* Middle: headline and body */}
      <View style={styles.middle}>
        <NativeAsset assetType={NativeAssetType.HEADLINE}>
          <Text style={styles.headline} numberOfLines={1}>{nativeAd.headline}</Text>
        </NativeAsset>
        {nativeAd.body && (
          <NativeAsset assetType={NativeAssetType.BODY}>
            <Text style={styles.body} numberOfLines={1}>{nativeAd.body}</Text>
          </NativeAsset>
        )}
      </View>

      {/* Right: CTA */}
      {(nativeAd as any).callToAction ? (
        <NativeAsset assetType={NativeAssetType.CALL_TO_ACTION}>
          <View style={styles.ctaContainer}>
            <Text style={styles.cta} numberOfLines={1}>{(nativeAd as any).callToAction}</Text>
          </View>
        </NativeAsset>
      ) : null}
    </NativeAdView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFBF5',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FFE4B5',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    shadowColor: '#000000',
  },
  sponsoredBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#FFD700',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    zIndex: 10,
  },
  sponsoredText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#000000',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  leftStub: {
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    width: 32,
    height: 32,
    marginRight: 12,
  },
  middle: {
    flex: 1,
    marginRight: 12,
  },
  headline: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  body: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  ctaContainer: {
    backgroundColor: '#FF385C',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    minWidth: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cta: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
});


