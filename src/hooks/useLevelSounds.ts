import { useEffect } from 'react';
import { useAudioPlayer } from 'expo-audio';

export function useLevelSounds() {
  const sound = useAudioPlayer(require('../../assets/background-music.mp3'));
  const eatSound = useAudioPlayer(require('../../assets/eat.mp3'));
  const gameOverSound = useAudioPlayer(require('../../assets/game-over.mp3'));
  const scoreBoostSound = useAudioPlayer(require('../../assets/score-boost.mp3'));

  useEffect(() => {
    sound.loop = true;
  }, [sound]);

  return { sound, eatSound, gameOverSound, scoreBoostSound };
}
