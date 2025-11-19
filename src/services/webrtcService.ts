/**
 * Expo-compatible WebRTC Service (Mock/Stub for Expo Go)
 * 
 * This is a mock implementation for use with Expo Go.
 * For full WebRTC functionality, you need to create a development build.
 * 
 * To enable real WebRTC:
 * 1. Run: npx expo prebuild
 * 2. Build with EAS: eas build --profile development
 * 3. Install the development build on your device
 * 4. Replace this file with the native webrtcService.ts
 */

import EventEmitter from 'eventemitter3';
import { Alert } from 'react-native';

// Mock MediaStream type for Expo Go
export interface MockMediaStream {
  id: string;
  active: boolean;
  getTracks: () => MockMediaStreamTrack[];
  getAudioTracks: () => MockMediaStreamTrack[];
  getVideoTracks: () => MockMediaStreamTrack[];
}

export interface MockMediaStreamTrack {
  id: string;
  kind: 'audio' | 'video';
  enabled: boolean;
  stop: () => void;
  _switchCamera?: () => void;
}

export interface WebRTCStreamEvent {
  stream: MockMediaStream;
}

let hasShownWarning = false;

class WebRTCServiceExpo extends EventEmitter {
  private localStream: MockMediaStream | null = null;
  private remoteStream: MockMediaStream | null = null;
  private callId: string | null = null;
  private isInitiator: boolean = false;
  private isMuted: boolean = false;
  private isVideoOff: boolean = false;

  private showExpoGoWarning() {
    if (!hasShownWarning) {
      hasShownWarning = true;
      console.warn(
        '⚠️ WebRTC is NOT supported in Expo Go.\n' +
        'You are seeing a mock implementation.\n\n' +
        'For real video/voice calls:\n' +
        '1. Create a development build: npx expo prebuild\n' +
        '2. Build with EAS: eas build --profile development\n' +
        '3. Install the build on your device\n\n' +
        'See: https://docs.expo.dev/workflow/prebuild/'
      );

      // Show user-friendly alert
      setTimeout(() => {
        Alert.alert(
          'Video/Voice Calls Unavailable',
          'WebRTC is not supported in Expo Go.\n\n' +
          'To enable video and voice calls, you need to create a development build.\n\n' +
          'See the console for instructions.',
          [{ text: 'OK', style: 'default' }]
        );
      }, 1000);
    }
  }

  // Initialize WebRTC for a call (Mock)
  async initialize(callId: string, isInitiator: boolean, isVideoCall: boolean = true): Promise<void> {
    console.log('[WebRTCService EXPO] Mock initialize', { callId, isInitiator, isVideoCall });
    this.showExpoGoWarning();
    
    this.callId = callId;
    this.isInitiator = isInitiator;

    try {
      // Create mock local stream
      this.localStream = this.createMockStream(isVideoCall);
      this.emit('local_stream', { stream: this.localStream });

      // Simulate connection process
      setTimeout(() => {
        console.log('[WebRTCService EXPO] Mock connection establishing...');
        this.emit('connection_state_change', 'connecting');
      }, 500);

      setTimeout(() => {
        // Create mock remote stream
        this.remoteStream = this.createMockStream(isVideoCall);
        this.emit('remote_stream', { stream: this.remoteStream });
        this.emit('connection_state_change', 'connected');
        console.log('[WebRTCService EXPO] Mock connection established');
      }, 1500);

      console.log('[WebRTCService EXPO] Mock WebRTC initialized');
    } catch (error) {
      console.error('[WebRTCService EXPO] Mock initialization error:', error);
      throw error;
    }
  }

  // Create a mock media stream
  private createMockStream(hasVideo: boolean): MockMediaStream {
    const audioTrack: MockMediaStreamTrack = {
      id: `audio-${Date.now()}`,
      kind: 'audio',
      enabled: true,
      stop: () => console.log('[WebRTCService EXPO] Mock audio track stopped'),
    };

    const videoTrack: MockMediaStreamTrack | null = hasVideo ? {
      id: `video-${Date.now()}`,
      kind: 'video',
      enabled: true,
      stop: () => console.log('[WebRTCService EXPO] Mock video track stopped'),
      _switchCamera: () => console.log('[WebRTCService EXPO] Mock camera switched'),
    } : null;

    const tracks = videoTrack ? [audioTrack, videoTrack] : [audioTrack];

    return {
      id: `stream-${Date.now()}`,
      active: true,
      getTracks: () => tracks,
      getAudioTracks: () => [audioTrack],
      getVideoTracks: () => videoTrack ? [videoTrack] : [],
    };
  }

  // Toggle mute (Mock)
  toggleMute(): boolean {
    if (!this.localStream) return false;

    const audioTrack = this.localStream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      this.isMuted = !audioTrack.enabled;
      console.log('[WebRTCService EXPO] Mock audio muted:', this.isMuted);
      return this.isMuted;
    }
    return false;
  }

  // Toggle video (Mock)
  toggleVideo(): boolean {
    if (!this.localStream) return false;

    const videoTrack = this.localStream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      this.isVideoOff = !videoTrack.enabled;
      console.log('[WebRTCService EXPO] Mock video disabled:', this.isVideoOff);
      return this.isVideoOff;
    }
    return false;
  }

  // Switch camera (Mock)
  async switchCamera(): Promise<void> {
    if (!this.localStream) return;

    const videoTrack = this.localStream.getVideoTracks()[0];
    if (videoTrack && videoTrack._switchCamera) {
      videoTrack._switchCamera();
      console.log('[WebRTCService EXPO] Mock camera switched');
    }
  }

  // Get local stream
  getLocalStream(): MockMediaStream | null {
    return this.localStream;
  }

  // Get remote stream
  getRemoteStream(): MockMediaStream | null {
    return this.remoteStream;
  }

  // Cleanup and close connection (Mock)
  cleanup(): void {
    console.log('[WebRTCService EXPO] Mock cleanup');

    // Stop all tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        track.stop();
      });
      this.localStream = null;
    }

    this.remoteStream = null;
    this.callId = null;
    this.isInitiator = false;
    this.isMuted = false;
    this.isVideoOff = false;

    console.log('[WebRTCService EXPO] Mock cleanup complete');
  }
}

export default new WebRTCServiceExpo();
