import React, { createContext, useContext, useState, useEffect } from 'react';
import CallingService, { CallData } from '@/src/services/callingService';
import WebRTCService from '@/src/services/webrtcService';
import IncomingCallModal from '@/components/calls/IncomingCallModal';
import VideoCallScreen from '@/components/calls/VideoCallScreen';
import { Alert, Modal } from 'react-native';

interface CallContextType {
  showIncomingCall: boolean;
  incomingCallData?: CallData;
  activeCall: boolean;
  activeCallData?: CallData;
}

const CallContext = createContext<CallContextType>({
  showIncomingCall: false,
  activeCall: false,
});

export const useCall = () => useContext(CallContext);

export function CallProvider({ children }: { children: React.ReactNode }) {
  const [showIncomingCall, setShowIncomingCall] = useState(false);
  const [incomingCallData, setIncomingCallData] = useState<CallData | undefined>();
  const [activeCall, setActiveCall] = useState(false);
  const [activeCallData, setActiveCallData] = useState<CallData | undefined>();
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    console.log('[CallContext] Setting up CallingService listeners');
    
    const handleIncomingCall = (callData: CallData) => {
      console.log('[CallContext] Incoming call received:', callData);
      setIncomingCallData(callData);
      setShowIncomingCall(true);
    };

    const handleCallAccepted = (callData: CallData) => {
      console.log('[CallContext] Call accepted, showing active call screen');
      setShowIncomingCall(false);
      setActiveCall(true);
      setActiveCallData(callData);
      setIsVideoEnabled(callData.callType === 'video');
    };

    const handleCallConnected = (data: any) => {
      console.log('[CallContext] Call connected');
      setIsConnected(true);
      
      // If we initiated the call, show active call screen
      const callState = CallingService.getCallState();
      if (callState.callData && !callState.isIncoming) {
        setActiveCall(true);
        setActiveCallData(callState.callData);
        setIsVideoEnabled(callState.callData.callType === 'video');
      }
    };

    const handleCallRejected = () => {
      console.log('[CallContext] Call rejected');
      setShowIncomingCall(false);
      setIncomingCallData(undefined);
      setActiveCall(false);
      setActiveCallData(undefined);
      setIsConnected(false);
    };

    const handleCallEnded = () => {
      console.log('[CallContext] Call ended');
      setShowIncomingCall(false);
      setIncomingCallData(undefined);
      setActiveCall(false);
      setActiveCallData(undefined);
      setIsConnected(false);
      setIsMuted(false);
      setIsVideoEnabled(true);
    };

    const handleCallTimeout = () => {
      console.log('[CallContext] Call timeout');
      setShowIncomingCall(false);
      setIncomingCallData(undefined);
      setActiveCall(false);
      setActiveCallData(undefined);
      setIsConnected(false);
      Alert.alert('Missed Call', 'You missed a call');
    };

    // Register listeners
    CallingService.on('incoming_call', handleIncomingCall);
    CallingService.on('call_accepted', handleCallAccepted);
    CallingService.on('call_connected', handleCallConnected);
    CallingService.on('call_rejected', handleCallRejected);
    CallingService.on('call_ended', handleCallEnded);
    CallingService.on('call_timeout', handleCallTimeout);

    return () => {
      CallingService.off('incoming_call', handleIncomingCall);
      CallingService.off('call_accepted', handleCallAccepted);
      CallingService.off('call_connected', handleCallConnected);
      CallingService.off('call_rejected', handleCallRejected);
      CallingService.off('call_ended', handleCallEnded);
      CallingService.off('call_timeout', handleCallTimeout);
    };
  }, []);

  const handleAcceptCall = () => {
    console.log('[CallContext] Accepting call');
    CallingService.acceptCall();
    // Don't hide incoming call modal immediately - wait for call_accepted event
  };

  const handleRejectCall = () => {
    console.log('[CallContext] Rejecting call');
    CallingService.rejectCall();
    setShowIncomingCall(false);
    setIncomingCallData(undefined);
  };

  const handleToggleMute = () => {
    const muted = WebRTCService.toggleMute();
    setIsMuted(muted);
  };

  const handleToggleVideo = () => {
    const videoDisabled = WebRTCService.toggleVideo();
    setIsVideoEnabled(!videoDisabled);
  };

  const handleEndCall = () => {
    console.log('[CallContext] Ending call from UI');
    CallingService.endCall();
  };

  const handleSwitchCamera = () => {
    WebRTCService.switchCamera();
  };

  return (
    <CallContext.Provider value={{ showIncomingCall, incomingCallData, activeCall, activeCallData }}>
      {children}
      
      {/* Incoming call modal */}
      <IncomingCallModal
        visible={showIncomingCall}
        callData={incomingCallData}
        onAccept={handleAcceptCall}
        onReject={handleRejectCall}
      />

      {/* Active video call screen */}
      {activeCall && activeCallData && (
        <Modal
          visible={true}
          animationType="fade"
          presentationStyle="fullScreen"
          statusBarTranslucent
        >
          <VideoCallScreen
            callData={activeCallData}
            isMuted={isMuted}
            isVideoEnabled={isVideoEnabled}
            isConnected={isConnected}
            onToggleMute={handleToggleMute}
            onToggleVideo={handleToggleVideo}
            onEndCall={handleEndCall}
            onSwitchCamera={handleSwitchCamera}
          />
        </Modal>
      )}
    </CallContext.Provider>
  );
}
