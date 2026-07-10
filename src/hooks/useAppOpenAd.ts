import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { AppOpenAd, AdEventType } from 'react-native-google-mobile-ads';
import { AD_UNIT_IDS } from '@/constants/AdMobConstants';
import { canShowFullScreenAd, markAdClosed, markAdOpened } from '@/utils/adState';

// App Open ads expire ~4 hours after loading. After that they must be
// reloaded before showing, or the impression is wasted.
const AD_EXPIRY_MS = 4 * 60 * 60 * 1000;

/**
 * Self-contained App Open ad manager. Call once, high in the tree (e.g. the
 * root layout). It loads an ad on mount and shows it whenever the app returns
 * to the foreground — as long as no other full-screen ad just played.
 *
 * By design it does NOT show on the very first cold start (the app is already
 * "active" at mount, and showing an ad over the splash screen is jarring and
 * can trip AdMob policy). It shows on the next foreground and onward.
 */
export const useAppOpenAd = () => {
  const adRef = useRef<AppOpenAd | null>(null);
  const isLoadedRef = useRef(false);
  const loadTimeRef = useRef(0);
  const appState = useRef<AppStateStatus>(AppState.currentState);

  const isAdAvailable = () =>
    isLoadedRef.current &&
    adRef.current != null &&
    Date.now() - loadTimeRef.current < AD_EXPIRY_MS;

  const loadAd = () => {
    const ad = AppOpenAd.createForAdRequest(AD_UNIT_IDS.APP_OPEN, {
      requestNonPersonalizedAdsOnly: true,
      keywords: ['game', 'snake', 'arcade'],
    });

    ad.addAdEventListener(AdEventType.LOADED, () => {
      isLoadedRef.current = true;
      loadTimeRef.current = Date.now();
      adRef.current = ad;
    });

    ad.addAdEventListener(AdEventType.ERROR, (error) => {
      console.log('[AppOpenAd] load error:', error);
      isLoadedRef.current = false;
    });

    ad.addAdEventListener(AdEventType.CLOSED, () => {
      markAdClosed();
      isLoadedRef.current = false;
      adRef.current = null;
      ad.removeAllListeners();
      loadAd(); // preload the next one
    });

    ad.load();
  };

  const showAdIfAvailable = async () => {
    // Honor the shared frequency cap: don't stack on another full-screen ad
    // (e.g. an interstitial that just closed) or show one too soon after the
    // last. See canShowFullScreenAd() in adState.
    if (!canShowFullScreenAd()) return;

    if (!isAdAvailable()) {
      if (!isLoadedRef.current) loadAd();
      return;
    }

    try {
      markAdOpened();
      await adRef.current!.show();
    } catch (error) {
      console.log('[AppOpenAd] show error:', error);
      markAdClosed();
      isLoadedRef.current = false;
      loadAd();
    }
  };

  useEffect(() => {
    loadAd();

    const subscription = AppState.addEventListener('change', (nextState) => {
      const cameToForeground =
        appState.current.match(/inactive|background/) && nextState === 'active';
      if (cameToForeground) {
        showAdIfAvailable();
      }
      appState.current = nextState;
    });

    return () => {
      subscription.remove();
      adRef.current?.removeAllListeners();
      adRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { showAdIfAvailable };
};
