import { Platform } from 'react-native';

// Test IDs for development
const TEST_IDS = {
  BANNER: Platform.select({
    ios: 'ca-app-pub-3940256099942544/2934735716',
    android: 'ca-app-pub-3940256099942544/6300978111',
    default: 'ca-app-pub-3940256099942544/6300978111',
  }),
  INTERSTITIAL: Platform.select({
    ios: 'ca-app-pub-3940256099942544/4411468910',
    android: 'ca-app-pub-3940256099942544/1033173712',
    default: 'ca-app-pub-3940256099942544/1033173712',
  }),
  APP_OPEN: Platform.select({
    ios: 'ca-app-pub-3940256099942544/5662855259',
    android: 'ca-app-pub-3940256099942544/9257395921',
    default: 'ca-app-pub-3940256099942544/9257395921',
  }),
  REWARDED: Platform.select({
    ios: 'ca-app-pub-3940256099942544/1712485313',  // Correct Test ID
    android: 'ca-app-pub-3940256099942544/5224354917', // Correct Test ID
    default: 'ca-app-pub-3940256099942544/5224354917',
  }),
};

// Production IDs - Replace these with your actual IDs when publishing
const PROD_IDS = {
  BANNER: Platform.select({
    ios: 'ca-app-pub-3940256099942544/2934735716', // TODO: replace with real iOS banner unit when shipping iOS
    android: 'ca-app-pub-8764706450036193/3446362934',
    default: 'ca-app-pub-8764706450036193/3446362934',
  }),
  INTERSTITIAL: Platform.select({
    ios: 'ca-app-pub-3940256099942544/4411468910', // TODO: replace with real iOS interstitial unit when shipping iOS
    android: 'ca-app-pub-8764706450036193/5462187577',
    default: 'ca-app-pub-8764706450036193/5462187577',
  }),
  APP_OPEN: Platform.select({
    ios: 'ca-app-pub-3940256099942544/5662855259', // TODO: replace with real iOS app-open unit when shipping iOS
    android: 'ca-app-pub-8764706450036193/9929603128',
    default: 'ca-app-pub-8764706450036193/9929603128',
  }),
  // NOTE: Rewarded ads are not used in the app. These are left as sample IDs
  // and should not be relied on until a rewarded unit is created on the
  // ca-app-pub-8764706450036193 account.
  REWARDED: Platform.select({
    ios: 'ca-app-pub-3940256099942544/1712485313',
    android: 'ca-app-pub-3940256099942544/5224354917',
    default: 'ca-app-pub-3940256099942544/5224354917',
  }),
};


// ... existing code ...
// Use this to switch between test and production ads
const IS_TESTING = true;

export const AD_UNIT_IDS = IS_TESTING ? TEST_IDS : PROD_IDS; 