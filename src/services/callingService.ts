import { EventEmitter } from 'events';
import WebSocketService from './websocket';

export type CallType = 'voice' | 'video';

export interface CallData {
  callId: string;
  callerId: string;
  callerName: string;
  callerAvatar?: string;
  receiverId: string;
  callType: CallType;
  timestamp: string;
}

export interface CallState {
  isActive: boolean;
  isIncoming: boolean;
  callData?: CallData;
  isConnected: boolean;
  isMuted: boolean;
  isVideoEnabled: boolean;
}

class CallingService extends EventEmitter {
  private callState: CallState = {
    isActive: false,
    isIncoming: false,
    isConnected: false,
    isMuted: false,
    isVideoEnabled: true,
  };

  constructor() {
    super();
    this.setupWebSocketListeners();
  }

  private setupWebSocketListeners() {
    // Listen for incoming calls
    WebSocketService.on('incoming_call', (data: CallData) => {
      this.handleIncomingCall(data);
    });

    // Listen for call accepted
    WebSocketService.on('call_accepted', (data: any) => {
      this.handleCallAccepted(data);
    });

    // Listen for call rejected
    WebSocketService.on('call_rejected', (data: any) => {
      this.handleCallRejected(data);
    });

    // Listen for call ended
    WebSocketService.on('call_ended', (data: any) => {
      this.handleCallEnded(data);
    });
  }

  // Initiate a call to another user
  async initiateCall(
    receiverId: string,
    receiverName: string,
    callType: CallType,
    callerId: string,
    callerName: string,
    callerAvatar?: string
  ): Promise<void> {
    const callId = `call_${Date.now()}_${callerId}_${receiverId}`;
    
    const callData: CallData = {
      callId,
      callerId,
      callerName,
      callerAvatar,
      receiverId,
      callType,
      timestamp: new Date().toISOString(),
    };

    this.callState = {
      isActive: true,
      isIncoming: false,
      callData,
      isConnected: false,
      isMuted: false,
      isVideoEnabled: callType === 'video',
    };

    // Send call initiation through WebSocket
    WebSocketService.emit('initiate_call', callData);
    
    this.emit('call_initiated', callData);
  }

  // Handle incoming call
  private handleIncomingCall(callData: CallData) {
    this.callState = {
      isActive: true,
      isIncoming: true,
      callData,
      isConnected: false,
      isMuted: false,
      isVideoEnabled: callData.callType === 'video',
    };

    this.emit('incoming_call', callData);
  }

  // Accept an incoming call
  acceptCall() {
    if (!this.callState.callData) return;

    WebSocketService.emit('accept_call', {
      callId: this.callState.callData.callId,
    });

    this.callState.isConnected = true;
    this.emit('call_accepted', this.callState.callData);
  }

  // Reject an incoming call
  rejectCall() {
    if (!this.callState.callData) return;

    WebSocketService.emit('reject_call', {
      callId: this.callState.callData.callId,
    });

    this.resetCallState();
    this.emit('call_rejected');
  }

  // End an active call
  endCall() {
    if (!this.callState.callData) return;

    WebSocketService.emit('end_call', {
      callId: this.callState.callData.callId,
    });

    this.resetCallState();
    this.emit('call_ended');
  }

  // Handle call accepted by receiver
  private handleCallAccepted(data: any) {
    this.callState.isConnected = true;
    this.emit('call_connected', data);
  }

  // Handle call rejected by receiver
  private handleCallRejected(data: any) {
    this.resetCallState();
    this.emit('call_rejected', data);
  }

  // Handle call ended by either party
  private handleCallEnded(data: any) {
    this.resetCallState();
    this.emit('call_ended', data);
  }

  // Toggle mute
  toggleMute() {
    this.callState.isMuted = !this.callState.isMuted;
    this.emit('mute_toggled', this.callState.isMuted);
    return this.callState.isMuted;
  }

  // Toggle video
  toggleVideo() {
    this.callState.isVideoEnabled = !this.callState.isVideoEnabled;
    this.emit('video_toggled', this.callState.isVideoEnabled);
    return this.callState.isVideoEnabled;
  }

  // Get current call state
  getCallState(): CallState {
    return { ...this.callState };
  }

  // Reset call state
  private resetCallState() {
    this.callState = {
      isActive: false,
      isIncoming: false,
      callData: undefined,
      isConnected: false,
      isMuted: false,
      isVideoEnabled: true,
    };
  }
}

export default new CallingService();
