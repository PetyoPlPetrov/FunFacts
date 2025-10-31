import { adUnitIds, getBannerSize } from '@/services/ads';
import React, { useRef } from 'react';
import { Platform as RNPlatform, StyleSheet, View } from 'react-native';
import { BannerAd as RNGBannerAd, useForeground } from 'react-native-google-mobile-ads';

interface BannerAdProps {
  size?: 'small' | 'medium' | 'large';
  style?: any;
}

export function BannerAd({ size = 'medium', style }: BannerAdProps) {
  // Native banner (iOS/Android)
  const bannerRef = useRef<any>(null);
  useForeground(() => {
    RNPlatform.OS === 'ios' && bannerRef.current?.load();
  });

  if (RNPlatform.OS === 'web') return null;

  const unitId = RNPlatform.OS === 'ios' ? adUnitIds.ios.banner : adUnitIds.android.banner;
  
  // Don't render if no unit ID (e.g., iOS production without unit ID configured)
  if (!unitId) {
    if (__DEV__) {
      console.warn('[Ads] Banner ad unit ID not configured for platform:', RNPlatform.OS);
    }
    return null;
  }

  return (
    <View style={[styles.container, style]}>
      <RNGBannerAd ref={bannerRef} unitId={unitId} size={getBannerSize(size)} />
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    marginTop: 12,
  },
});