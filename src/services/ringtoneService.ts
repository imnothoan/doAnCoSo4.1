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
      // Store the callback
      this.onCompleteCallback = onComplete || null;
      
      // Stop any existing playback
      await this.stopRingtone();

      // Note: We can't use useAudioPlayer hook outside of React components
      // So we'll use the Audio API from expo-av instead
      // Import expo-av
      const { Audio } = await import('expo-av');

      // Load the ringtone
      const { sound } = await Audio.Sound.createAsync(
        require('@/assets/music/soundPhoneCall1.mp3'),
        { shouldPlay: true, volume: 1.0 },
        this.onPlaybackStatusUpdate.bind(this)
      );

      this.player = sound as any; // Cast to AudioPlayer for now
      this.isPlaying = true;
      this.loopCount = 0;

      // Play the sound
      await sound.playAsync();
    } catch (error) {
      console.error('Error playing ringtone:', error);
      this.isPlaying = false;
    }
  }

  private onPlaybackStatusUpdate(status: any) {
    if (status.isLoaded && status.didJustFinish && !status.isLooping) {
      this.loopCount++;
      
      if (this.loopCount < this.maxLoops && this.player) {
        // Replay the sound
        (this.player as any).replayAsync();
      } else {
        // Stop after max loops
        this.stopRingtone();
        // Call the completion callback
        if (this.onCompleteCallback) {
          this.onCompleteCallback();
          this.onCompleteCallback = null;
        }
      }
    }
  }

  async stopRingtone(): Promise<void> {
    try {
      if (this.player) {
        await (this.player as any).stopAsync();
        await (this.player as any).unloadAsync();
        this.player = null;
      }
      this.isPlaying = false;
      this.loopCount = 0;
      this.onCompleteCallback = null;
    } catch (error) {
      console.error('Error stopping ringtone:', error);
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
