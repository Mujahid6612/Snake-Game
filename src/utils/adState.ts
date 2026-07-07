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

// Call when a full-screen ad becomes visible.
export const markAdOpened = () => {
  adState.isShowingFullScreenAd = true;
};

// Call when a full-screen ad is dismissed.
export const markAdClosed = () => {
  adState.isShowingFullScreenAd = false;
  adState.lastAdClosedAt = Date.now();
};
