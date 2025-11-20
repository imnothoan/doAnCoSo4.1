import React, { createContext, useContext, useState, useEffect } from 'react';
import CallingService, { CallData } from '@/src/services/callingService';
import WebRTCService from '@/src/services/webrtcService';
import DailyCallService from '@/src/services/dailyCallService';
import IncomingCallModal from '@/components/calls/IncomingCallModal';
import VideoCallScreen from '@/components/calls/VideoCallScreen';
import VideoCallWebView from '@/components/calls/VideoCallWebView';
import { Alert, Modal } from 'react-native';
import { useAuth } from './AuthContext';

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
  const { user } = useAuth();
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

    const handleCallAccepted = async (callData: CallData) => {
      console.log('[CallContext] Call accepted, showing active call screen');
      setShowIncomingCall(false);
      setActiveCall(true);
      setActiveCallData(callData);
      setIsVideoEnabled(callData.callType === 'video');
      setIsConnected(true);
      
      // No longer opening browser - will show WebView in-app
      if (!DailyCallService.isConfigured()) {
        console.warn('[CallContext] Daily.co not configured');
        DailyCallService.showSetupInstructions();
        handleEndCall();
      }
    };

    const handleCallConnected = async (data: any) => {
      console.log('[CallContext] Call connected');
      setIsConnected(true);
      
      // If we initiated the call, show WebView in-app
      const callState = CallingService.getCallState();
      if (callState.callData && !callState.isIncoming) {
        setActiveCall(true);
        setActiveCallData(callState.callData);
        setIsVideoEnabled(callState.callData.callType === 'video');
        
        // Check if Daily.co is configured
        if (!DailyCallService.isConfigured()) {
          console.warn('[CallContext] Daily.co not configured');
          DailyCallService.showSetupInstructions();
          handleEndCall();
        }
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

  const handleAcceptCall = async () => {
    console.log('[CallContext] Accepting call');
    CallingService.acceptCall();
    // Call accepted event will trigger handleCallAccepted which opens browser
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

      {/* Active call screen - shows WebView with Daily.co if configured */}
      {activeCall && activeCallData && DailyCallService.isConfigured() && (
        <Modal
          visible={true}
          animationType="fade"
          presentationStyle="fullScreen"
          statusBarTranslucent
        >
          <VideoCallWebView
            callData={activeCallData}
            roomUrl={DailyCallService.getRoomUrl(
              activeCallData.callId,
              user?.name || user?.username
            )}
            userName={user?.name || user?.username || 'User'}
            onEndCall={handleEndCall}
          />
        </Modal>
      )}

      {/* Fallback mock call screen - only shown if Daily.co not configured */}
      {activeCall && activeCallData && !DailyCallService.isConfigured() && (
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
