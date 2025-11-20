import { useAudioPlayer, AudioPlayer, AudioStatus } from 'expo-audio';

class RingtoneService {
  private player: AudioPlayer | null = null;
  private isPlaying: boolean = false;
  private loopCount: number = 0;
  private maxLoops: number = 2; // Play ringtone 2 times
  private onCompleteCallback: (() => void) | null = null;
  private statusListener: ((status: AudioStatus) => void) | null = null;

  async playRingtone(onComplete?: () => void): Promise<void> {
    try {
      console.log('[RingtoneService] Starting ringtone playback');
      
      // Store the callback
      this.onCompleteCallback = onComplete || null;
      
      // Stop any existing playback
      await this.stopRingtone();

      // Note: We can't use useAudioPlayer hook outside of React components
      // So we'll use the Audio API from expo-av instead
      // Import expo-av
      const { Audio } = await import('expo-av');

      console.log('[RingtoneService] Loading ringtone file');
      // Load the ringtone
      const { sound } = await Audio.Sound.createAsync(
        require('@/assets/music/soundPhoneCall1.mp3'),
        { shouldPlay: true, volume: 1.0 },
        this.onPlaybackStatusUpdate.bind(this)
      );

      this.player = sound as any; // Cast to AudioPlayer for now
      this.isPlaying = true;
      this.loopCount = 0;

      console.log('[RingtoneService] Ringtone loaded and playing');
      // Play the sound
      await sound.playAsync();
    } catch (error) {
      console.error('[RingtoneService] Error playing ringtone:', error);
      this.isPlaying = false;
    }
  }

  private onPlaybackStatusUpdate(status: any) {
    if (status.isLoaded && status.didJustFinish && !status.isLooping) {
      this.loopCount++;
      console.log(`[RingtoneService] Ringtone loop ${this.loopCount} completed`);
      
      if (this.loopCount < this.maxLoops && this.player) {
        console.log('[RingtoneService] Replaying ringtone');
        // Replay the sound
        (this.player as any).replayAsync();
      } else {
        console.log('[RingtoneService] Max loops reached, stopping ringtone');
        // Stop after max loops
        this.stopRingtone();
        // Call the completion callback
        if (this.onCompleteCallback) {
          console.log('[RingtoneService] Calling completion callback');
          this.onCompleteCallback();
          this.onCompleteCallback = null;
        }
      }
    }
  }

  async stopRingtone(): Promise<void> {
    try {
      if (this.player) {
        console.log('[RingtoneService] Stopping ringtone');
        // Check if the player is loaded before stopping
        const status = await (this.player as any).getStatusAsync();
        if (status.isLoaded) {
          await (this.player as any).stopAsync();
          await (this.player as any).unloadAsync();
        }
        this.player = null;
      }
      this.isPlaying = false;
      this.loopCount = 0;
      this.onCompleteCallback = null;
    } catch (error) {
      console.error('[RingtoneService] Error stopping ringtone:', error);
      // Force cleanup even if there's an error
      this.player = null;
      this.isPlaying = false;
      this.loopCount = 0;
      this.onCompleteCallback = null;
    }
  }

  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  getLoopCount(): number {
    return this.loopCount;
  }
}

export default new RingtoneService();
