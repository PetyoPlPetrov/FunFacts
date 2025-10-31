import { adUnitIds, getBannerSize } from '@/services/ads';
import React, { useRef } from 'react';
import { Platform as RNPlatform, StyleSheet } from 'react-native';
import { BannerAd as RNGBannerAd, useForeground } from 'react-native-google-mobile-ads';

interface BannerAdProps {
  size?: 'small' | 'medium' | 'large';
  style?: any;
}

export function BannerAd({ size = 'medium', style }: BannerAdProps) {
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
   // return null;
  }

 

  if (__DEV__) {
    console.log('[Ads] BannerAd rendering with unitId:', unitId, 'size:', getBannerSize(size));
  }

  const handleAdFailedToLoad = (error: any) => {
    console.log('Banner ad failed to load', error);
  };


  return null;

  return (
    
      <RNGBannerAd
        ref={bannerRef}
        unitId={'ca-app-pub-3940256099942544/6300978111'}
        size={getBannerSize(size)}
        
        onAdLoaded={() => {
          if (__DEV__) {
            console.log('[Ads] Banner ad loaded successfully ✅');
          }
          // Reset retry count on successful load
         
        }}
        onAdFailedToLoad={handleAdFailedToLoad}
        onAdOpened={() => {
          if (__DEV__) {
            console.log('[Ads] Banner ad opened');
          }
        }}
        onAdClosed={() => {
          if (__DEV__) {
            console.log('[Ads] Banner ad closed');
          }
        }}
      />
   
  );
}
const styles = StyleSheet.create({
  container: {
    marginTop: 12,
  },
  placeholder: {
    height: 60,
    //backgroundColor: 'transparent',
  },
});