import { useEffect, useState } from 'react';
import { InterstitialAd, AdEventType } from 'react-native-google-mobile-ads';
import { AD_UNIT_IDS } from '@/constants/AdMobConstants';

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
      setIsAdLoaded(false);
      loadAd(); // Load the next ad
    });

    ad.load();
  };

  const showAd = async () => {
    if (isAdLoaded && interstitialAd) {
      await interstitialAd.show();
    }
  };

  return { showAd, isAdLoaded };
}; 