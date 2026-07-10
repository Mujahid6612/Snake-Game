// Shared, app-wide state for full-screen ads (interstitial + app-open).
//
// The App Open ad shows when the app returns to the foreground. Without this
// guard it would also fire right after an interstitial closes (an interstitial
// backgrounds the app, then returns it to the foreground), stacking two ads
// back-to-back — bad UX and against AdMob policy. Both hooks read/write here
// so the App Open ad can tell "the app came back because the user actually
// left" apart from "the app came back because our own ad just closed".
export const adState = {
  // True while any full-screen ad is on screen right now.
  isShowingFullScreenAd: false,
  // Timestamp (ms) of when the last full-screen ad was dismissed. Used as a
  // short cool-down because the CLOSED event and the AppState "active" event
  // can arrive in either order.
  lastAdClosedAt: 0,
};

// Minimum gap between two full-screen ads (interstitial OR app-open),
// measured from when the previous one was dismissed. Interstitials fire on
// every game-over/level transition and the app-open ad fires on every
// foreground return; without a shared cap a user could see several
// full-screen ads within seconds. That aggregate pattern is exactly what
// Google Play's disruptive-ads / "too many ads" enforcement targets, so both
// hooks gate on the single guard below.
const MIN_FULL_SCREEN_AD_INTERVAL_MS = 60 * 1000;

// Whether it's currently allowed to show a full-screen ad: none on screen,
// and enough time has passed since the last one closed.
export const canShowFullScreenAd = () => {
  if (adState.isShowingFullScreenAd) return false;
  return Date.now() - adState.lastAdClosedAt >= MIN_FULL_SCREEN_AD_INTERVAL_MS;
};

// Call when a full-screen ad becomes visible.
export const markAdOpened = () => {
  adState.isShowingFullScreenAd = true;
};

// Call when a full-screen ad is dismissed.
export const markAdClosed = () => {
  adState.isShowingFullScreenAd = false;
  adState.lastAdClosedAt = Date.now();
};
