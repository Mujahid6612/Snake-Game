import { useAudioPlayer } from 'expo-audio';

/**
 * Loads the short sound-effect players used during gameplay.
 *
 * Background music is intentionally NOT loaded here — it's owned by the
 * `SoundManager` singleton and bootstrapped once at the app root
 * (see `src/app/_layout.tsx`). Loading it per-level created a redundant,
 * never-played AudioPlayer in every level screen.
 */
export function useLevelSounds() {
  const eatSound = useAudioPlayer(require('../../assets/eat.wav'));
  const gameOverSound = useAudioPlayer(require('../../assets/game-over.wav'));
  const scoreBoostSound = useAudioPlayer(require('../../assets/score-boost.wav'));

  return { eatSound, gameOverSound, scoreBoostSound };
}
