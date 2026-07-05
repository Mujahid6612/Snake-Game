import { useEffect, useState } from 'react';
import { RewardedAd, RewardedAdEventType, AdEventType } from 'react-native-google-mobile-ads';
import { AD_UNIT_IDS } from '@/constants/AdMobConstants';

const AD_RETRY_DELAY = 30000; // 30 seconds between retries
const MAX_RETRIES = 3; // Maximum number of retry attempts

export const useRewardedAd = () => {
  const [rewardedAd, setRewardedAd] = useState<RewardedAd | null>(null);
  const [isAdLoaded, setIsAdLoaded] = useState(false);
  const [hasRewarded, setHasRewarded] = useState(false);
  const [lastLoadAttempt, setLastLoadAttempt] = useState(0);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    console.log('[RewardedAd] Initializing hook');
    loadAd();
    return () => {
      if (rewardedAd) {
        console.log('[RewardedAd] Cleaning up listeners');
        rewardedAd.removeAllListeners();
        setRewardedAd(null);
      }
    };
  }, []);

  const loadAd = () => {
    const now = Date.now();
    if (now - lastLoadAttempt < AD_RETRY_DELAY) {
      console.log('[RewardedAd] Too soon to request another ad. Waiting...', {
        timeSinceLastAttempt: now - lastLoadAttempt,
        requiredDelay: AD_RETRY_DELAY
      });
      return;
    }

    if (retryCount >= MAX_RETRIES) {
      console.log('[RewardedAd] Max retries reached', {
        retryCount,
        maxRetries: MAX_RETRIES
      });
      setTimeout(() => {
        console.log('[RewardedAd] Resetting retry count and attempting reload');
        setRetryCount(0);
        loadAd();
      }, AD_RETRY_DELAY * 2);
      return;
    }

    console.log('[RewardedAd] Starting to load new ad', {
      retryCount,
      lastLoadAttempt: new Date(lastLoadAttempt).toISOString()
    });
    setLastLoadAttempt(now);

    const ad = RewardedAd.createForAdRequest(AD_UNIT_IDS.REWARDED, {
      requestNonPersonalizedAdsOnly: true,
      keywords: ['game', 'snake', 'arcade'],
    });

    ad.addAdEventListener(RewardedAdEventType.LOADED, () => {
      console.log('[RewardedAd] Ad loaded successfully');
      setIsAdLoaded(true);
      setRewardedAd(ad);
      setRetryCount(0);
    });

    ad.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
      console.log('[RewardedAd] User earned reward');
      setHasRewarded(true);
    });

    ad.addAdEventListener(AdEventType.ERROR, (error) => {
      console.log('[RewardedAd] Error loading ad:', {
        error,
        retryCount,
      });
      setIsAdLoaded(false);
      
      const nextRetryCount = retryCount + 1;
      const retryDelay = Math.min(AD_RETRY_DELAY * Math.pow(2, retryCount), 300000);
      console.log('[RewardedAd] Scheduling retry', {
        nextRetryCount,
        retryDelay: `${retryDelay/1000}s`
      });
      
      setRetryCount(nextRetryCount);
      setTimeout(loadAd, retryDelay);
    });

    ad.addAdEventListener(AdEventType.CLOSED, () => {
      console.log('[RewardedAd] Ad closed', {
        wasRewarded: true
      });
      setIsAdLoaded(false);
      const wasRewarded = true;
      setHasRewarded(true);
      console.log('[RewardedAd] Scheduling next ad load');
      setTimeout(() => {
        loadAd();
      }, AD_RETRY_DELAY);
      
      if (!wasRewarded) {
        console.log('[RewardedAd] User closed ad without getting reward');
        setRetryCount(prev => prev + 1);
      }
    });

    try {
      console.log('[RewardedAd] Initiating ad load');
      ad.load();
    } catch (error) {
      console.log('[RewardedAd] Critical error loading ad:', error);
      setIsAdLoaded(false);
    }
  };

  const showAd = async (): Promise<boolean> => {
    if (!isAdLoaded || !rewardedAd) {
      console.log('[RewardedAd] Attempted to show ad when not ready', {
        isAdLoaded,
        hasRewardedAd: !!rewardedAd
      });
      return false;
    }

    try {
      console.log('[RewardedAd] Showing ad');
      setHasRewarded(false);
      await rewardedAd.show();
      
      return new Promise((resolve) => {
        console.log('[RewardedAd] Waiting for reward confirmation');
        const checkReward = setInterval(() => {
          if (!isAdLoaded) {
            clearInterval(checkReward);
            console.log('[RewardedAd] Reward status:', hasRewarded);
            resolve(hasRewarded);
          }
        }, 100);

        setTimeout(() => {
          console.log('[RewardedAd] Reward check timed out');
          clearInterval(checkReward);
          resolve(false);
        }, 30000);
      });
    } catch (error) {
      console.log('[RewardedAd] Error showing ad:', error);
      return false;
    }
  };

  console.log("hasRewarded", hasRewarded);
  return { showAd, isAdLoaded, hasRewarded };
}; 