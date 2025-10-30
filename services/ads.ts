import { gatherConsentAndInitAds } from '@/services/ads-consent';
import { Platform } from 'react-native';
import {
  AdEventType,
  BannerAdSize,
  InterstitialAd,
  TestIds,
} from 'react-native-google-mobile-ads';

// Central place for ad unit IDs. Replace with your real AdMob unit IDs for production.
export const adUnitIds = {
  ios: {
    banner: TestIds.ADAPTIVE_BANNER,
    interstitial: null, // iOS not configured
  },
  android: {
    banner: __DEV__ ? TestIds.ADAPTIVE_BANNER : 'ca-app-pub-7258081299134493/3365228658',
    interstitial: __DEV__ ? TestIds.INTERSTITIAL : 'ca-app-pub-7258081299134493/6671184316',
  }
} as const;

// Feature flags: enable only banner until other unit IDs are provided
export const adFeatures = {
  banner: true,
  interstitial: true,
  native: false,
} as const;

export const getBannerSize = (size?: 'small' | 'medium' | 'large') => {
  switch (size) {
    case 'small':
      return BannerAdSize.BANNER;
    case 'large':
      return BannerAdSize.LARGE_BANNER;
    case 'medium':
    default:
      return BannerAdSize.ANCHORED_ADAPTIVE_BANNER;
  }
};

export function initializeMobileAds() {
  if (Platform.OS === 'web') return;
  // Respect EU consent and delayed app measurement init
  gatherConsentAndInitAds().catch(() => {
    // Avoid crashing the app if consent/init fails in development
  });
}

export async function showInterstitial(onClosed?: () => void) {
  if (!adFeatures.interstitial) {
    onClosed?.();
    return;
  }
  if (Platform.OS === 'web') {
    onClosed?.();
    return;
  }

  const unitId = Platform.OS === 'ios' ? adUnitIds.ios.interstitial : adUnitIds.android.interstitial;
  if (!unitId) {
    onClosed?.();
    return;
  }
  const interstitial = InterstitialAd.createForAdRequest(unitId);

  return new Promise<void>((resolve) => {
    const unsubscribeLoaded = interstitial.addAdEventListener(AdEventType.LOADED, () => {
      interstitial.show();
    });
    const unsubscribeOpened = interstitial.addAdEventListener(AdEventType.OPENED, () => {
    });
    const unsubscribeClosed = interstitial.addAdEventListener(AdEventType.CLOSED, () => {
      unsubscribeLoaded();
      unsubscribeOpened();
      unsubscribeClosed();
      onClosed?.();
      resolve();
    });
    const unsubscribeError = interstitial.addAdEventListener(AdEventType.ERROR, (error) => {
      if (__DEV__) console.log('[Ads] Interstitial error:', error);

    });

    if (__DEV__) console.log('[Ads] Interstitial load()');
    interstitial.load();
  });
}


