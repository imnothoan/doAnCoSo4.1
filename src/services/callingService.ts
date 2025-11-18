import EventEmitter from 'eventemitter3';
import WebSocketService from './websocket';
import RingtoneService from './ringtoneService';

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

  private callTimeoutTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    super();
    this.setupWebSocketListeners();
  }

  private setupWebSocketListeners() {
    console.log('[CallingService] Setting up WebSocket listeners');
    
    // Listen for incoming calls
    WebSocketService.on('incoming_call', (data: CallData) => {
      console.log('[CallingService] Received incoming_call event:', data);
      this.handleIncomingCall(data);
    });

    // Listen for call accepted
    WebSocketService.on('call_accepted', (data: any) => {
      console.log('[CallingService] Received call_accepted event:', data);
      this.handleCallAccepted(data);
    });

    // Listen for call rejected
    WebSocketService.on('call_rejected', (data: any) => {
      console.log('[CallingService] Received call_rejected event:', data);
      this.handleCallRejected(data);
    });

    // Listen for call ended
    WebSocketService.on('call_ended', (data: any) => {
      console.log('[CallingService] Received call_ended event:', data);
      this.handleCallEnded(data);
    });

    // Listen for call timeout from server
    WebSocketService.on('call_timeout', (data: any) => {
      console.log('[CallingService] Received call_timeout event:', data);
      this.handleCallTimeout();
    });

    // Listen for video upgrade requests
    WebSocketService.on('upgrade_to_video', (data: any) => {
      console.log('[CallingService] Received upgrade_to_video event:', data);
      this.handleVideoUpgradeRequest(data);
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
    console.log('[CallingService] Initiating call:', {
      from: callerId,
      to: receiverId,
      type: callType,
    });
    
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

    // Start playing ringtone and set up timeout
    console.log('[CallingService] Starting ringtone for outgoing call');
    await RingtoneService.playRingtone(() => {
      // After 2 loops of ringtone, auto-end the call if not answered
      console.log('[CallingService] Ringtone completed 2 loops');
      if (!this.callState.isConnected) {
        console.log('[CallingService] Call not answered, timing out');
        this.handleCallTimeout();
      }
    });

    // Send call initiation through WebSocket
    console.log('[CallingService] Emitting initiate_call to WebSocket');
    WebSocketService.emit('initiate_call', callData);
    
    this.emit('call_initiated', callData);
  }

  // Handle incoming call
  private handleIncomingCall(callData: CallData) {
    console.log('[CallingService] Handling incoming call:', callData);
    
    this.callState = {
      isActive: true,
      isIncoming: true,
      callData,
      isConnected: false,
      isMuted: false,
      isVideoEnabled: callData.callType === 'video',
    };

    // Play ringtone for incoming call
    console.log('[CallingService] Starting ringtone for incoming call');
    RingtoneService.playRingtone(() => {
      // After 2 loops, auto-reject if not answered
      console.log('[CallingService] Incoming call ringtone completed 2 loops');
      if (this.callState.isIncoming && !this.callState.isConnected) {
        console.log('[CallingService] Incoming call not answered, auto-rejecting');
        this.rejectCall();
      }
    });

    console.log('[CallingService] Emitting incoming_call event to UI');
    this.emit('incoming_call', callData);
  }

  // Accept an incoming call
  acceptCall() {
    if (!this.callState.callData) return;

    // Stop ringtone when call is accepted
    RingtoneService.stopRingtone();

    WebSocketService.emit('accept_call', {
      callId: this.callState.callData.callId,
      acceptedBy: this.callState.callData.receiverId,
    });

    this.callState.isConnected = true;
    this.emit('call_accepted', this.callState.callData);
  }

  // Reject an incoming call
  rejectCall() {
    if (!this.callState.callData) return;

    // Stop ringtone when call is rejected
    RingtoneService.stopRingtone();

    WebSocketService.emit('reject_call', {
      callId: this.callState.callData.callId,
      rejectedBy: this.callState.callData.receiverId,
    });

    this.resetCallState();
    this.emit('call_rejected');
  }

  // End an active call
  endCall() {
    if (!this.callState.callData) return;

    // Stop ringtone if still playing
    RingtoneService.stopRingtone();

    const callerId = this.callState.callData.callerId;
    const receiverId = this.callState.callData.receiverId;
    
    // Determine who is ending the call (we need current user info)
    // For now, we'll send both IDs and let server handle it
    WebSocketService.emit('end_call', {
      callId: this.callState.callData.callId,
      endedBy: this.callState.isIncoming ? receiverId : callerId,
    });

    this.resetCallState();
    this.emit('call_ended');
  }

  // Handle call timeout (no answer after ringtone loops)
  private handleCallTimeout() {
    console.log('Call timeout - no answer');
    
    // Stop ringtone
    RingtoneService.stopRingtone();

    if (this.callState.callData) {
      // Send timeout notification to server
      WebSocketService.emit('call_timeout', {
        callId: this.callState.callData.callId,
      });
    }

    this.resetCallState();
    this.emit('call_timeout');
  }

  // Handle call accepted by receiver
  private handleCallAccepted(data: any) {
    // Stop ringtone when call is accepted
    RingtoneService.stopRingtone();
    
    this.callState.isConnected = true;
    this.emit('call_connected', data);
  }

  // Handle call rejected by receiver
  private handleCallRejected(data: any) {
    // Stop ringtone when call is rejected
    RingtoneService.stopRingtone();
    
    this.resetCallState();
    this.emit('call_rejected', data);
  }

  // Handle call ended by either party
  private handleCallEnded(data: any) {
    // Stop ringtone if still playing
    RingtoneService.stopRingtone();
    
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

  // Upgrade voice call to video call (like Messenger)
  upgradeToVideoCall() {
    if (!this.callState.callData) return false;
    
    // Only allow upgrade if currently in a voice call
    if (this.callState.callData.callType === 'video') {
      return false; // Already a video call
    }

    // Update call type to video
    this.callState.callData.callType = 'video';
    this.callState.isVideoEnabled = true;

    // Notify the other party about the upgrade request
    WebSocketService.emit('upgrade_to_video', {
      callId: this.callState.callData.callId,
    });

    this.emit('call_upgraded_to_video', this.callState.callData);
    return true;
  }

  // Handle incoming video upgrade request
  private handleVideoUpgradeRequest(data: any) {
    if (this.callState.callData && this.callState.callData.callId === data.callId) {
      // Update call type to video
      this.callState.callData.callType = 'video';
      this.callState.isVideoEnabled = true;
      
      // Automatically accept the upgrade
      WebSocketService.emit('video_upgrade_accepted', {
        callId: data.callId,
      });

      this.emit('video_upgrade_received', this.callState.callData);
    }
  }

  // Get current call state
  getCallState(): CallState {
    return { ...this.callState };
  }

  // Reset call state
  private resetCallState() {
    // Stop ringtone when resetting state
    RingtoneService.stopRingtone();
    
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
