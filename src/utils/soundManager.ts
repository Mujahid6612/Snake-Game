import { createAudioPlayer, AudioPlayer } from 'expo-audio';

class SoundManager {
  private static instance: SoundManager;
  private backgroundMusic: AudioPlayer | null = null;
  private isMusicPlaying: boolean = false;

  private constructor() {}

  static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  loadBackgroundMusic() {
    try {
      const player = createAudioPlayer(require("../../assets/background-music.mp3"));
      player.loop = true;
      this.backgroundMusic = player;
    } catch (error) {
      console.error('Error loading background music:', error);
    }
  }

  playBackgroundMusic() {
    try {
      if (!this.backgroundMusic) {
        this.loadBackgroundMusic();
      }
      if (this.backgroundMusic && !this.isMusicPlaying) {
        this.backgroundMusic.play();
        this.isMusicPlaying = true;
      }
    } catch (error) {
      console.error('Error playing background music:', error);
    }
  }

  async stopBackgroundMusic() {
    try {
      if (this.backgroundMusic && this.isMusicPlaying) {
        this.backgroundMusic.pause();
        await this.backgroundMusic.seekTo(0);
        this.isMusicPlaying = false;
      }
    } catch (error) {
      console.error('Error stopping background music:', error);
    }
  }

  unloadBackgroundMusic() {
    try {
      if (this.backgroundMusic) {
        this.backgroundMusic.remove();
        this.backgroundMusic = null;
        this.isMusicPlaying = false;
      }
    } catch (error) {
      console.error('Error unloading background music:', error);
    }
  }
}

export default SoundManager;
