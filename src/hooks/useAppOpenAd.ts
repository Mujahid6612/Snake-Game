import { useEffect, useState } from 'react';
import { AppOpenAd, AdEventType } from 'react-native-google-mobile-ads';
import { AD_UNIT_IDS } from '@/constants/AdMobConstants';

export const useAppOpenAd = () => {
  const [appOpenAd, setAppOpenAd] = useState<AppOpenAd | null>(null);

  useEffect(() => {
    const loadAppOpenAd = async () => {
      const ad = AppOpenAd.createForAdRequest(AD_UNIT_IDS.APP_OPEN, {
        requestNonPersonalizedAdsOnly: true,
        keywords: ['game', 'snake', 'arcade'],
      });

      ad.addAdEventListener(AdEventType.LOADED, () => {
        setAppOpenAd(ad);
      });

      ad.addAdEventListener(AdEventType.ERROR, (error) => {
        console.log('App Open Ad error:', error);
      });

      await ad.load();
    };

    loadAppOpenAd();

    return () => {
      if (appOpenAd) {
        appOpenAd.removeAllListeners();
        setAppOpenAd(null);
      }
    };
  }, []);

  const showAppOpenAd = async () => {
    try {
      if (appOpenAd) {
        await appOpenAd.show();
      }
    } catch (error) {
      console.log('Error showing app open ad:', error);
    }
  };

  return { showAppOpenAd };
}; 