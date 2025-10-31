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
    banner: __DEV__ ? TestIds.ADAPTIVE_BANNER : null, // TODO: Add production iOS banner unit ID
    interstitial: __DEV__ ? TestIds.INTERSTITIAL : null, // Use test ads in dev, TODO: Add production iOS interstitial unit ID
    native: __DEV__ ? TestIds.NATIVE : null, // TODO: Add production iOS native unit ID
  },
  android: {
    banner: 'ca-app-pub-7258081299134493/3365228658',
    interstitial: 'ca-app-pub-7258081299134493/6671184316',
    native: 'ca-app-pub-7258081299134493/7980396551',
  }
} as const;

// Feature flags: enable only banner until other unit IDs are provided
export const adFeatures = {
  banner: true,
  interstitial: true,
  native: true,
} as const;

export const getBannerSize = (size?: 'small' | 'medium' | 'large') => {
  switch (size) {
    case 'small':
      return BannerAdSize.BANNER;
    case 'large':
      return BannerAdSize.BANNER;
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
  if (__DEV__) console.log('[Ads] showInterstitial() called');

  if (!adFeatures.interstitial) {
    if (__DEV__) console.log('[Ads] ❌ Interstitials disabled in features');
    onClosed?.();
    return;
  }
  if (Platform.OS === 'web') {
    if (__DEV__) console.log('[Ads] ❌ Platform is web, not showing native ad');
    onClosed?.();
    return;
  }

  const unitId = Platform.OS === 'ios' ? adUnitIds.ios.interstitial : adUnitIds.android.interstitial;
  if (__DEV__) console.log(`[Ads] Platform: ${Platform.OS}, Unit ID: ${unitId}`);

  if (!unitId) {
    if (__DEV__) console.log('[Ads] ❌ No unit ID configured');
    onClosed?.();
    return;
  }

  if (__DEV__) console.log('[Ads] ✅ Creating InterstitialAd with unit ID:', unitId);
  const interstitial = InterstitialAd.createForAdRequest(unitId);

  return new Promise<void>((resolve) => {
    const unsubscribeLoaded = interstitial.addAdEventListener(AdEventType.LOADED, () => {
      if (__DEV__) console.log('[Ads] 📦 Interstitial LOADED - showing ad now');
      interstitial.show();
    });
    const unsubscribeOpened = interstitial.addAdEventListener(AdEventType.OPENED, () => {
      if (__DEV__) console.log('[Ads] 👁️ Interstitial OPENED - ad is visible to user');
    });
    const unsubscribeClosed = interstitial.addAdEventListener(AdEventType.CLOSED, () => {
      if (__DEV__) console.log('[Ads] 🔚 Interstitial CLOSED - cleaning up');
      unsubscribeLoaded();
      unsubscribeOpened();
      unsubscribeClosed();
      unsubscribeError();
      onClosed?.();
      resolve();
    });
    const unsubscribeError = interstitial.addAdEventListener(AdEventType.ERROR, (error) => {
      if (__DEV__) console.log('[Ads] ❌ Interstitial ERROR:', JSON.stringify(error));
      unsubscribeLoaded();
      unsubscribeOpened();
      unsubscribeClosed();
      unsubscribeError();
      onClosed?.();
      resolve();
    });

    if (__DEV__) console.log('[Ads] 🔄 Calling interstitial.load()...');
    interstitial.load();
  });
}


