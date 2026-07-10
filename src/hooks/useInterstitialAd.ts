import { useEffect, useState } from 'react';
import { InterstitialAd, AdEventType } from 'react-native-google-mobile-ads';
import { AD_UNIT_IDS } from '@/constants/AdMobConstants';
import { canShowFullScreenAd, markAdClosed, markAdOpened } from '@/utils/adState';

export const useInterstitialAd = () => {
  const [interstitialAd, setInterstitialAd] = useState<InterstitialAd | null>(null);
  const [isAdLoaded, setIsAdLoaded] = useState(false);

  useEffect(() => {
    loadAd();
    return () => {
      if (interstitialAd) {
        interstitialAd.removeAllListeners();
        setInterstitialAd(null);
      }
    };
  }, []);

  const loadAd = () => {
    const ad = InterstitialAd.createForAdRequest(AD_UNIT_IDS.INTERSTITIAL, {
      requestNonPersonalizedAdsOnly: true,
      keywords: ['game', 'snake', 'arcade'],
    });

    ad.addAdEventListener(AdEventType.LOADED, () => {
      setIsAdLoaded(true);
      setInterstitialAd(ad);
    });

    ad.addAdEventListener(AdEventType.ERROR, (error) => {
      console.log('Interstitial ad error:', error);
    });

    ad.addAdEventListener(AdEventType.CLOSED, () => {
      markAdClosed();
      setIsAdLoaded(false);
      loadAd(); // Load the next ad
    });

    ad.load();
  };

  const showAd = async () => {
    // Honor the shared frequency cap. When capped we simply skip showing (the
    // loaded ad is kept for next time) so the caller's flow — resuming the game
    // or advancing to the next level — continues uninterrupted.
    if (isAdLoaded && interstitialAd && canShowFullScreenAd()) {
      markAdOpened();
      await interstitialAd.show();
    }
  };

  return { showAd, isAdLoaded };
}; 