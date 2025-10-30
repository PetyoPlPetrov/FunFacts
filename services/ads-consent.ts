import { Platform } from 'react-native';
import mobileAds, { AdsConsent } from 'react-native-google-mobile-ads';

/**
 * Gathers EU consent (if required) and initializes the Google Mobile Ads SDK
 * when the SDK is allowed to start. Per docs:
 * https://docs.page/invertase/react-native-google-mobile-ads/european-user-consent
 */
export async function gatherConsentAndInitAds(): Promise<void> {
  if (Platform.OS === 'web') return;

  // Attempt to gather consent and then start the SDK when possible.
  // We intentionally do not await before also attempting to start with
  // previous-session consent in parallel (as recommended by docs).
  try {
    await AdsConsent.gatherConsent();
  } catch {
    // Ignore consent errors; SDK can still use last known consent state
  }

  await startAdsIfAllowed();

  // Also attempt immediately to leverage prior-session consent
  // (this call is safe and a no-op if already started).
  // Deliberately not awaited to run in parallel.
   
  startAdsIfAllowed();
}

async function startAdsIfAllowed(): Promise<void> {
  const { canRequestAds } = await AdsConsent.getConsentInfo();
  if (!canRequestAds) return;
  await mobileAds().initialize();
}


