import { RTCPeerConnection, RTCIceCandidate, RTCSessionDescription, mediaDevices, MediaStream } from 'react-native-webrtc';
import EventEmitter from 'eventemitter3';
import WebSocketService from './websocket';

// WebRTC configuration with STUN servers
const configuration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ],
};

export interface WebRTCStreamEvent {
  stream: MediaStream;
}

class WebRTCService extends EventEmitter {
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private callId: string | null = null;
  private isInitiator: boolean = false;

  constructor() {
    super();
  }

  // Initialize WebRTC for a call
  async initialize(callId: string, isInitiator: boolean, isVideoCall: boolean = true): Promise<void> {
    console.log('[WebRTCService] Initializing WebRTC', { callId, isInitiator, isVideoCall });
    
    this.callId = callId;
    this.isInitiator = isInitiator;

    try {
      // Get local media stream
      const stream = await this.getLocalStream(isVideoCall);
      this.localStream = stream;
      this.emit('local_stream', { stream });

      // Create peer connection
      this.peerConnection = new RTCPeerConnection(configuration);

      // Add local stream tracks to peer connection
      this.localStream.getTracks().forEach(track => {
        console.log('[WebRTCService] Adding local track:', track.kind);
        this.peerConnection?.addTrack(track, this.localStream!);
      });

      // Handle ICE candidates
      this.peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          console.log('[WebRTCService] Sending ICE candidate');
          WebSocketService.emit('webrtc_ice_candidate', {
            callId: this.callId,
            candidate: event.candidate,
          });
        }
      };

      // Handle remote stream
      this.peerConnection.ontrack = (event) => {
        console.log('[WebRTCService] Received remote track:', event.track.kind);
        if (event.streams && event.streams[0]) {
          this.remoteStream = event.streams[0];
          this.emit('remote_stream', { stream: event.streams[0] });
        }
      };

      // Handle connection state changes
      this.peerConnection.onconnectionstatechange = () => {
        console.log('[WebRTCService] Connection state:', this.peerConnection?.connectionState);
        this.emit('connection_state_change', this.peerConnection?.connectionState);
      };

      // Setup WebSocket listeners for signaling
      this.setupSignalingListeners();

      // If we're the initiator, create and send offer
      if (this.isInitiator) {
        await this.createOffer();
      }

      console.log('[WebRTCService] WebRTC initialized successfully');
    } catch (error) {
      console.error('[WebRTCService] Failed to initialize WebRTC:', error);
      throw error;
    }
  }

  // Get local media stream (audio/video)
  private async getLocalStream(isVideoCall: boolean): Promise<MediaStream> {
    console.log('[WebRTCService] Getting local media stream, video:', isVideoCall);
    
    try {
      const stream = await mediaDevices.getUserMedia({
        audio: true,
        video: isVideoCall ? {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 },
          facingMode: 'user',
        } : false,
      });

      console.log('[WebRTCService] Got local stream with tracks:', stream.getTracks().map(t => t.kind));
      return stream;
    } catch (error) {
      console.error('[WebRTCService] Failed to get user media:', error);
      throw error;
    }
  }

  // Setup signaling listeners
  private setupSignalingListeners(): void {
    console.log('[WebRTCService] Setting up signaling listeners');

    // Listen for WebRTC offer
    WebSocketService.on('webrtc_offer', async (data: any) => {
      if (data.callId === this.callId) {
        console.log('[WebRTCService] Received WebRTC offer');
        await this.handleOffer(data.offer);
      }
    });

    // Listen for WebRTC answer
    WebSocketService.on('webrtc_answer', async (data: any) => {
      if (data.callId === this.callId) {
        console.log('[WebRTCService] Received WebRTC answer');
        await this.handleAnswer(data.answer);
      }
    });

    // Listen for ICE candidates
    WebSocketService.on('webrtc_ice_candidate', async (data: any) => {
      if (data.callId === this.callId) {
        console.log('[WebRTCService] Received ICE candidate');
        await this.handleIceCandidate(data.candidate);
      }
    });
  }

  // Create and send offer (initiator)
  private async createOffer(): Promise<void> {
    if (!this.peerConnection) {
      console.error('[WebRTCService] No peer connection');
      return;
    }

    try {
      console.log('[WebRTCService] Creating offer');
      const offer = await this.peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });

      await this.peerConnection.setLocalDescription(offer);
      console.log('[WebRTCService] Sending offer to remote peer');

      WebSocketService.emit('webrtc_offer', {
        callId: this.callId,
        offer: offer,
      });
    } catch (error) {
      console.error('[WebRTCService] Failed to create offer:', error);
    }
  }

  // Handle incoming offer (receiver)
  private async handleOffer(offer: RTCSessionDescription): Promise<void> {
    if (!this.peerConnection) {
      console.error('[WebRTCService] No peer connection');
      return;
    }

    try {
      console.log('[WebRTCService] Setting remote description from offer');
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

      console.log('[WebRTCService] Creating answer');
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);

      console.log('[WebRTCService] Sending answer to remote peer');
      WebSocketService.emit('webrtc_answer', {
        callId: this.callId,
        answer: answer,
      });
    } catch (error) {
      console.error('[WebRTCService] Failed to handle offer:', error);
    }
  }

  // Handle incoming answer (initiator)
  private async handleAnswer(answer: RTCSessionDescription): Promise<void> {
    if (!this.peerConnection) {
      console.error('[WebRTCService] No peer connection');
      return;
    }

    try {
      console.log('[WebRTCService] Setting remote description from answer');
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    } catch (error) {
      console.error('[WebRTCService] Failed to handle answer:', error);
    }
  }

  // Handle incoming ICE candidate
  private async handleIceCandidate(candidate: RTCIceCandidate): Promise<void> {
    if (!this.peerConnection) {
      console.error('[WebRTCService] No peer connection');
      return;
    }

    try {
      console.log('[WebRTCService] Adding ICE candidate');
      await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (error) {
      console.error('[WebRTCService] Failed to add ICE candidate:', error);
    }
  }

  // Toggle mute
  toggleMute(): boolean {
    if (!this.localStream) return false;

    const audioTrack = this.localStream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      console.log('[WebRTCService] Audio muted:', !audioTrack.enabled);
      return !audioTrack.enabled;
    }
    return false;
  }

  // Toggle video
  toggleVideo(): boolean {
    if (!this.localStream) return false;

    const videoTrack = this.localStream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      console.log('[WebRTCService] Video disabled:', !videoTrack.enabled);
      return !videoTrack.enabled;
    }
    return false;
  }

  // Switch camera (front/back)
  async switchCamera(): Promise<void> {
    if (!this.localStream) return;

    const videoTrack = this.localStream.getVideoTracks()[0];
    if (videoTrack) {
      // @ts-ignore - _switchCamera is available in react-native-webrtc
      videoTrack._switchCamera();
      console.log('[WebRTCService] Camera switched');
    }
  }

  // Get local stream
  getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  // Get remote stream
  getRemoteStream(): MediaStream | null {
    return this.remoteStream;
  }

  // Cleanup and close connection
  cleanup(): void {
    console.log('[WebRTCService] Cleaning up WebRTC resources');

    // Remove WebSocket listeners
    WebSocketService.off('webrtc_offer');
    WebSocketService.off('webrtc_answer');
    WebSocketService.off('webrtc_ice_candidate');

    // Stop all tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        track.stop();
      });
      this.localStream = null;
    }

    // Close peer connection
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    this.remoteStream = null;
    this.callId = null;
    this.isInitiator = false;

    console.log('[WebRTCService] Cleanup complete');
  }
}

export default new WebRTCService();
