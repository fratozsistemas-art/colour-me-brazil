// ✅ CRITICAL FIX: Robust AudioManager with proper cleanup to prevent memory leaks

class AudioManager {
  constructor() {
    this.audioContext = null;
    this.currentAudio = null;
    this.audioQueue = [];
    this.isPlaying = false;
    this.cleanup = this.cleanup.bind(this);
  }

  // ✅ Initialize audio context with proper error handling
  initializeContext() {
    if (this.audioContext && this.audioContext.state !== 'closed') {
      return this.audioContext;
    }

    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioContext();
      console.log('✅ AudioContext initialized:', this.audioContext.state);
      return this.audioContext;
    } catch (error) {
      console.error('❌ Failed to initialize AudioContext:', error);
      return null;
    }
  }

  // ✅ Play audio with cleanup
  async play(audioUrl, onEnded = null) {
    try {
      // Stop current audio if playing
      this.stop();

      // Create new audio element
      this.currentAudio = new Audio(audioUrl);
      this.currentAudio.crossOrigin = 'anonymous';
      
      // ✅ Setup event listeners with cleanup
      const endHandler = () => {
        this.isPlaying = false;
        if (onEnded) onEnded();
        this.cleanup();
      };

      const errorHandler = (error) => {
        console.error('❌ Audio playback error:', error);
        this.isPlaying = false;
        this.cleanup();
      };

      this.currentAudio.addEventListener('ended', endHandler);
      this.currentAudio.addEventListener('error', errorHandler);

      // Play audio
      await this.currentAudio.play();
      this.isPlaying = true;
      console.log('✅ Audio playing:', audioUrl);

    } catch (error) {
      console.error('❌ Failed to play audio:', error);
      this.cleanup();
      throw error;
    }
  }

  // ✅ Stop current audio
  stop() {
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
        this.isPlaying = false;
      } catch (error) {
        console.error('❌ Error stopping audio:', error);
      }
    }
  }

  // ✅ Pause current audio
  pause() {
    if (this.currentAudio && this.isPlaying) {
      try {
        this.currentAudio.pause();
        this.isPlaying = false;
      } catch (error) {
        console.error('❌ Error pausing audio:', error);
      }
    }
  }

  // ✅ Resume paused audio
  resume() {
    if (this.currentAudio && !this.isPlaying) {
      try {
        this.currentAudio.play();
        this.isPlaying = true;
      } catch (error) {
        console.error('❌ Error resuming audio:', error);
      }
    }
  }

  // ✅ CRITICAL: Cleanup to prevent memory leaks
  cleanup() {
    console.log('🧹 AudioManager cleanup started');

    // Clean up current audio
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.src = '';
        this.currentAudio.load(); // Force resource release
        this.currentAudio.remove();
        this.currentAudio = null;
      } catch (error) {
        console.error('❌ Error cleaning up audio:', error);
      }
    }

    // Clean up audio context
    if (this.audioContext && this.audioContext.state !== 'closed') {
      try {
        this.audioContext.close();
        this.audioContext = null;
        console.log('✅ AudioContext closed');
      } catch (error) {
        console.error('❌ Error closing AudioContext:', error);
      }
    }

    // Clear queue
    this.audioQueue = [];
    this.isPlaying = false;

    console.log('🧹 AudioManager cleanup completed');
  }

  // ✅ Get current playback state
  getState() {
    return {
      isPlaying: this.isPlaying,
      currentTime: this.currentAudio?.currentTime || 0,
      duration: this.currentAudio?.duration || 0,
      contextState: this.audioContext?.state || 'closed'
    };
  }

  // ✅ Set volume
  setVolume(volume) {
    if (this.currentAudio) {
      this.currentAudio.volume = Math.max(0, Math.min(1, volume));
    }
  }

  // ✅ Set playback rate
  setPlaybackRate(rate) {
    if (this.currentAudio) {
      this.currentAudio.playbackRate = Math.max(0.5, Math.min(2, rate));
    }
  }
}

// ✅ Export singleton instance
export const audioManager = new AudioManager();

// ✅ Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    audioManager.cleanup();
  });
}

export default audioManager;