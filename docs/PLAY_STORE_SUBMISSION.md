# Classic Snake — Google Play Store Submission Guide

A step-by-step, copy-paste-ready guide to publish **Classic Snake** to the Google
Play Store, including all policy declarations, Data safety answers, store listing
copy, and the build/upload flow.

> **App facts** (keep these handy — they're asked for repeatedly):
> | Field | Value |
> |-------|-------|
> | App name | `Classic Snake` |
> | Package name | `com.mujahid123.snakegamee2xpgpf4tqklcvqx5syi` |
> | Version | `1.0.0` |
> | Privacy policy URL | `https://classic-snake-six.vercel.app/privacy-policy` |
> | AdMob App ID (Android) | `ca-app-pub-8764706450036193~5514158460` |
> | Category | Games → Arcade |
> | Target audience | 13 and older (NOT under-13) |
> | Contains ads | Yes (Google AdMob: banner, interstitial, app-open) |
> | Support email | `techtool269@gmail.com` |

---

## 0. Pre-flight checklist (do before touching Play Console)

- [x] GDPR (European regulations) consent message created **and published** in AdMob.
- [x] US states consent message created **and published** in AdMob.
- [x] Privacy policy hosted and publicly reachable (HTTP 200).
- [x] In-app "View Privacy Policy" + "Manage ad privacy choices" buttons wired.
- [x] Ads restricted to G-rated content; consent gathered before SDK init.
- [ ] **Set `IS_TESTING = false`** in `src/constants/AdMobConstants.ts` (use real ad units for the production build).
- [ ] Verify real ads render as **"Test Ad"** on your registered test device (device ID already added in `src/app/_layout.tsx`).
- [ ] Prepare store graphics (see §6).

---

## 1. Create a Google Play Developer account (one-time)

1. Go to <https://play.google.com/console>.
2. Sign in with the Google account you want to own the app.
3. Pay the **one-time $25** registration fee.
4. Choose account type:
   - **Personal** — requires **identity/ID verification** and, for new accounts, a
     **closed test with 12+ testers for 14 days** before you can publish to Production.
   - **Organization** — requires a D-U-N-S number.
5. Complete: **developer profile**, **identity verification**, and a
   **payments profile** (also used for AdMob payouts).

> ⏳ Identity verification can take 1–3 days. Start it early.

---

## 2. Create the app

**Play Console → All apps → Create app**

| Field | Value |
|-------|-------|
| App name | `Classic Snake` |
| Default language | English (United States) – `en-US` |
| App or game | **Game** |
| Free or paid | **Free** |
| Declarations | Tick both (Developer Program Policies + US export laws) |

Click **Create app**.

---

## 3. Set up your app — Dashboard tasks

Play Console shows a **"Set up your app"** section. Complete every item below.

### 3.1 App access
- Select: **All functionality is available without special access.**
  (Classic Snake has no login/paywall.)

### 3.2 Ads
- Select: **Yes, my app contains ads.**

### 3.3 Content rating
- Start the questionnaire.
- Email: `techtool269@gmail.com`
- Category: **Game**
- Answer honestly — Classic Snake has no violence, sex, gambling, or profanity.
- Result: rates **Everyone / PEGI 3**.

### 3.4 Target audience and content
- Target age group: **13–15, 16–17, 18+** → i.e. **13 and older**.
- **Do NOT select any under-13 age band.** (This keeps the app out of the
  Families program and consistent with the code + privacy policy.)
- "Appeal to children" → **No, my app isn't designed for children.**
- Store listing presence for children → leave unchecked.

### 3.5 News app
- **No.**

### 3.6 COVID-19 contact tracing / status apps
- **No.**

### 3.7 Data safety — see §5 (has its own copy-paste section).

### 3.8 Government apps
- **No.**

### 3.9 Financial features
- **My app doesn't provide any financial features.**

### 3.10 Health
- **No health content.**

### 3.11 Privacy policy
- Paste: `https://classic-snake-six.vercel.app/privacy-policy`

---

## 4. Store listing — copy-paste content

**Play Console → Grow → Store presence → Main store listing**

### App name
```
Classic Snake
```

### Short description (max 80 characters)
```
The classic snake game reborn — 20 levels, power-ups, and escalating hazards.
```

### Full description (max 4000 characters)
```
Classic Snake brings the timeless arcade snake game into the modern age. Guide your snake, eat to grow longer, and clear 20 hand-crafted levels — each tougher than the last.

FEATURES
• 20 unique levels with escalating difficulty
• Power-ups: Speed Boost, Slow Down, Score Boost, and Wall Pass
• Fresh hazards as you progress: moving obstacles, teleporters, restricted zones, and rival snakes
• Simple swipe controls — swipe up, down, left, or right to steer
• Per-level target scores and best-score tracking
• Clean, modern visuals with satisfying sound and music
• Play offline — no account or sign-up required

HOW TO PLAY
• Swipe to steer your snake around the board
• Eat food to grow and earn points
• Reach the level's target score to advance
• Avoid walls, obstacles, restricted zones, and enemy snakes
• Grab power-ups for a temporary edge

Whether you have five minutes or an hour, Classic Snake is easy to pick up and hard to put down. Can you master all 20 levels?

Classic Snake is free to play and supported by ads. Your progress and settings are stored only on your device.
```

### Graphics required
| Asset | Spec |
|-------|------|
| App icon | 512 × 512 PNG (32-bit, with alpha) |
| Feature graphic | 1024 × 500 PNG/JPG |
| Phone screenshots | 2–8 images, 16:9 or 9:16, min 320px, max 3840px |
| (optional) Tablet screenshots | recommended for tablet visibility |

> Tip: capture screenshots of the home screen, a level in play, a power-up
> active, the level-complete dialog, and the help screen.

### Categorization & contact details
- App category: **Games → Arcade**
- Tags: snake, arcade, classic, casual
- Contact email: `techtool269@gmail.com`
- **Website: `https://classic-snake-six.vercel.app`** — set in
  **Store listing → Store listing contact details → Website**.

> ⚠️ **Don't skip the Website field — it's required for AdMob's app-ads.txt
> verification.** You set it here in **Play Console**, but **AdMob uses it**:
> once the app is live, AdMob reads this website from your Play Store page and
> crawls `https://classic-snake-six.vercel.app/app-ads.txt` to verify your
> publisher ID. If the field is empty, app-ads.txt stays "unverified" no matter
> how correctly the file is hosted. Use the **root domain** here (not the
> `/privacy-policy` path). See §9.

---

## 5. Data safety — exact answers

**Play Console → App content → Data safety**

**Does your app collect or share any of the required user data types?**
→ **Yes** (AdMob collects the Advertising ID).

**Is all of the user data collected by your app encrypted in transit?**
→ **Yes.**

**Do you provide a way for users to request that their data is deleted?**
→ **No** (nothing is stored on your servers; game data is local to the device and
deleted on uninstall). Your privacy policy explains this.

### Data types to declare

**Device or other IDs → Yes**
- Collected: **Yes** · Shared: **Yes**
- Processed ephemerally: **No**
- Required or optional: **Required** (users cannot disable ads, but can reset the Ad ID)
- Purposes: **Advertising or marketing**
- Collected/shared by: your app's ad partner (Google AdMob)

**App activity → App interactions (ad interactions/analytics) → Yes**
- Collected: **Yes** · Shared: **Yes**
- Purposes: **Advertising or marketing**, **Analytics**

**Everything else → No**, specifically:
- Location → **No** (AdMob's IP-based coarse location is covered by the Device ID
  declaration; do not tick Location unless you add a location feature)
- Personal info (name, email, etc.) → **No**
- Financial info → **No**
- Photos/videos, Audio, Files, Calendar, Contacts → **No**
- App info & performance (crash logs / diagnostics) → **No** (you use no crash SDK)

> 🔑 Golden rule: Data safety answers **must match** the privacy policy. Your policy
> already discloses Advertising ID, IP/coarse location, device info, and ad
> interaction data — so the above lines up. Don't declare more or less than the policy.

---

## 6. Build the production AAB (EAS)

The `production` profile in `eas.json` already builds an Android **App Bundle (AAB)**
with `autoIncrement` on.

```bash
# 1) Finalize ad config
#    - Set IS_TESTING = false in src/constants/AdMobConstants.ts
#    - Confirm your device ID is in TEST_DEVICE_IDS (src/app/_layout.tsx)

# 2) Log in and build
npx eas-cli login
npx eas build --platform android --profile production
```

- Let **EAS manage the signing keystore** (default). Never lose access to your Expo
  account — that keystore signs every future update.
- When the build finishes, **download the `.aab`** from the build page.

> The dev APK being ~260 MB is normal (it bundles the dev client + all CPU ABIs).
> The AAB → Play generates per-device split APKs, so the actual user download is
> typically ~30–50 MB.

---

## 7. Upload & release

### Because a new Personal account must run closed testing first:

**Play Console → Testing → Closed testing → Create new release**

1. **App signing**: accept **Play App Signing** (recommended).
2. **Upload** the `.aab`.
3. **Release name**: `1.0.0` · **Release notes**:
   ```
   <en-US>
   Initial release of Classic Snake — 20 levels, power-ups, and escalating hazards.
   </en-US>
   ```
4. Create an **email list** of 12+ testers → add them to the track.
5. **Save → Review release → Start rollout to Closed testing.**
6. Share the opt-in link with your testers. Keep the test running **14 days** with
   **12+ testers opted in**.

### Then promote to Production:

**Play Console → Production → Create new release** → **"Promote"** the tested
release (or upload the AAB again) → complete **Countries/regions** (select all or
your targets) → **Review → Start rollout to Production**.

---

## 8. Alternative: automated submit (optional)

Instead of manual upload you can use EAS Submit once a Google service account is set up:

1. Play Console → **Setup → API access** → create/link a Google Cloud service
   account with the **Service Account User** role and grant it release permissions.
2. Download the JSON key, reference it in `eas.json` under `submit.production`.
3. Run:
   ```bash
   npx eas submit --platform android --profile production
   ```

---

## 9. AdMob ↔ Play linking & app-ads.txt (post-publish)

1. **Link the app in AdMob**: AdMob → Apps → Classic Snake → **App settings** →
   "Linked to Play Store." (Do this once the app is live so AdMob can verify it.)
2. **app-ads.txt** (recommended, protects ad revenue): host a file at
   `https://classic-snake-six.vercel.app/app-ads.txt`. AdMob → Apps → **app-ads.txt**
   shows the exact single line to paste, e.g.:
   ```
   google.com, pub-8764706450036193, DIRECT, f08c47fec0942fa0
   ```
   (Use the exact line AdMob generates for your account.)
3. **Set the developer website in the Play listing** (Play Console → Store listing
   → Store listing contact details → Website) to `https://classic-snake-six.vercel.app`
   — the **root domain**, not the `/privacy-policy` path. This is what AdMob reads
   to locate and crawl your `app-ads.txt`. Without it, verification never completes.
   (Also covered in §4.)

> ℹ️ Which console does what: you **enter the website in Play Console**, but
> **AdMob consumes it** to run the app-ads.txt crawl. AdMob only starts crawling
> **after the app is live** on Play and linked in AdMob, so an "unverified" status
> before launch is normal.

---

## 10. Review timeline & common rejection causes

- First review for a new account: **a few days up to ~7 days**.
- Top rejection causes to avoid (all already handled if you followed this guide):
  - Privacy policy URL missing / not reachable → **set & live** ✓
  - Data safety doesn't match privacy policy → **aligned** ✓
  - Ads declaration missing → **declared Yes** ✓
  - Target audience includes under-13 but uses non-Families ads → **13+ only** ✓
  - No consent form for EEA users → **GDPR + US messages published** ✓

---

## 11. Final pre-submit checklist

- [ ] `IS_TESTING = false` and production AAB built from that code.
- [ ] Both AdMob consent messages published (GDPR + US states).
- [ ] Privacy policy URL live and set in Play + AdMob + in-app.
- [ ] Data safety completed and matches policy.
- [ ] Content rating questionnaire completed.
- [ ] Target audience = 13+ (no under-13 band).
- [ ] Store listing text + icon (512²) + feature graphic (1024×500) + 2+ screenshots.
- [ ] Closed test with 12+ testers running (14-day requirement for new accounts).
- [ ] Countries/regions selected for release.

Once all boxes are ticked, promote to Production and submit for review. 🎉
