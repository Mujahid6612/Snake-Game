import { theme } from "@/constants/theme";
import React from 'react';
import { BannerAd as RNBannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { StyleSheet, View } from 'react-native';
import { AD_UNIT_IDS } from '@/constants/AdMobConstants';

export const BannerAd = () => {
  return (
    <View style={styles.container}>
      <RNBannerAd
        unitId={AD_UNIT_IDS.BANNER}
        size={BannerAdSize.BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
          keywords: ['game', 'snake', 'arcade'],
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    backgroundColor: theme.background,
    paddingVertical: 5,
  },
}); 