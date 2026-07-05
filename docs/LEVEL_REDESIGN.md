# Level screen redesign — change reference

This documents the redesign applied to `src/levels/level1.tsx` and the plan for
propagating it to the other levels. Level 1 is the reference implementation.

> The **tutorial** (item 17–18) is **Level 1 only** — do not add it to other levels.

## New / modified shared files

- **New:** `src/components/GameOverModal.tsx` — game-over modal (skull, score,
  Restart / Continue / Back-to-levels).
- **New:** `src/components/LevelTutorial.tsx` — Level 1 only interactive tutorial.
- **Modified:** `src/components/LevelCompletionDialog.tsx` — added a primary
  **Next Level** button (shown when `onNextLevel` is provided).
- **Modified:** `src/constants/theme.ts` — added brown `wall` token.

## Per-level changes (apply to every level except the tutorial)

### Flow & structure
1. Remove the intro `LevelInfoModal` (import, render, `showLevelInfo` state,
   `handleStartGame`). Level opens straight into a ready state.
2. New **top bar**: back button (`router.back()`), `Level {n}` title, and a
   play/pause toggle button (disabled on game over).
3. Restyle the **HUD** into a stats row: Score · active power-ups · Best as
   themed cards below the top bar.
4. Remove the tap-anywhere `TouchableWithoutFeedback` wrapper (use a plain
   `View`). Pausing is explicit via the button.

### Play / pause
5. Header play/pause toggle wired to `resumeGame`.
6. Centered **"Tap to start"** ready overlay with a big play button.
7. Centered **"Paused"** overlay with a resume button.

### Play-field visuals
8. Render the snake as colored `View`s (not emoji): head bright
   `theme.primary` (rounded, dark outline), body `theme.primaryDark`.
9. Give the head `zIndex` so it stays visible when the snake crosses itself.
10. Add a **brown wall border** (`theme.wall`) around the play area; widen the
    field by the border thickness (`+6`) so the grid stays exact.
11. Hide the wall border while **Wall Pass** is active (`gameAreaNoWall`
    transparent), restore it afterwards.
12. Replace power-up emojis with sized `MaterialCommunityIcons`
    (`POWER_ICONS`: `lightning-bolt` / `snail` / `star-four-points` / `wall`) —
    gold on the field, green in the HUD chips.

### Power-up logic
13. Add a derivation effect that computes `canPassWalls` and `gameSpeed`
    directly from `activePowers`, so powers end exactly when their timers
    finish (fixes lingering Wall Pass / speed).
14. Add `showPowerToast(text)` and call it in every `handlePowerUp` case so all
    powers show a floating label (reuses the score-boost `+5` animation).

### Modals & progression
15. Replace the inline game-over buttons with `<GameOverModal>` shown on
    `isGameOver` (Restart / Continue / Back to levels).
16. Pass `onNextLevel={goToNextLevel}` to `LevelCompletionDialog`, where
    `goToNextLevel` does `router.replace('/game-levels?level=' + (currentLevel + 1))`.

### Level 1 only
17. Interactive `LevelTutorial` (swipe right/down/left/up), skippable.
18. Shown once via `@Level1_Tutorial_Done`; `ALWAYS_SHOW_TUTORIAL` dev toggle.

## Not changed / preserved

- Swipe handling stays the original `handleGesture` (fires on gesture end).
- Food is still the 🍎 emoji.
- Each level keeps its own obstacle / teleporter / enemy logic, constants
  (`currentLevel`, `POINTS_TO_NEXT_LEVEL`, `INITIAL_GAME_SPEED`/`baseSpeed`),
  and `moveSnake` collision code.
