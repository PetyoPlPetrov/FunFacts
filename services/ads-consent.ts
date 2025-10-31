import { Platform } from 'react-native';
import mobileAds, { AdsConsent } from 'react-native-google-mobile-ads';

/**
 * Gathers EU consent (if required) and initializes the Google Mobile Ads SDK
 * when the SDK is allowed to start. Per docs:
 * https://docs.page/invertase/react-native-google-mobile-ads/european-user-consent
 */
export async function gatherConsentAndInitAds(): Promise<void> {
  if (Platform.OS === 'web') return;

  if (__DEV__) {
    console.log('[Ads] Starting consent gathering and initialization...');
  }

  // Attempt to gather consent and then start the SDK when possible.
  // We intentionally do not await before also attempting to start with
  // previous-session consent in parallel (as recommended by docs).
  try {
    await AdsConsent.gatherConsent();
    if (__DEV__) {
      console.log('[Ads] Consent gathered successfully');
    }
  } catch (error) {
    // Ignore consent errors; SDK can still use last known consent state
    if (__DEV__) {
      console.warn('[Ads] Consent gathering failed (will use last known state):', error);
    }
  }

  await startAdsIfAllowed();

  // Also attempt immediately to leverage prior-session consent
  // (this call is safe and a no-op if already started).
  // Deliberately not awaited to run in parallel.

  startAdsIfAllowed();
}

async function startAdsIfAllowed(): Promise<void> {
  const { canRequestAds } = await AdsConsent.getConsentInfo();
  if (!canRequestAds) {
    if (__DEV__) {
      console.warn('[Ads] Cannot request ads - user consent not granted');
    }
    return;
  }

  if (__DEV__) {
    console.log('[Ads] Consent granted, initializing Mobile Ads SDK...');
  }

  await mobileAds().initialize();

  if (__DEV__) {
    console.log('[Ads] Mobile Ads SDK initialized successfully! ✅');
  }
}


