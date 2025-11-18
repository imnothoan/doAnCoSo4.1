import React, { createContext, useContext, useState, useEffect } from 'react';
import CallingService, { CallData } from '@/src/services/callingService';
import IncomingCallModal from '@/components/calls/IncomingCallModal';
import { Alert } from 'react-native';

interface CallContextType {
  showIncomingCall: boolean;
  incomingCallData?: CallData;
}

const CallContext = createContext<CallContextType>({
  showIncomingCall: false,
});

export const useCall = () => useContext(CallContext);

export function CallProvider({ children }: { children: React.ReactNode }) {
  const [showIncomingCall, setShowIncomingCall] = useState(false);
  const [incomingCallData, setIncomingCallData] = useState<CallData | undefined>();

  useEffect(() => {
    const handleIncomingCall = (callData: CallData) => {
      console.log('Global incoming call:', callData);
      setIncomingCallData(callData);
      setShowIncomingCall(true);
    };

    const handleCallAccepted = () => {
      console.log('Call accepted globally');
      setShowIncomingCall(false);
    };

    const handleCallRejected = () => {
      console.log('Call rejected globally');
      setShowIncomingCall(false);
      setIncomingCallData(undefined);
    };

    const handleCallEnded = () => {
      console.log('Call ended globally');
      setShowIncomingCall(false);
      setIncomingCallData(undefined);
    };

    const handleCallTimeout = () => {
      console.log('Call timeout globally');
      setShowIncomingCall(false);
      setIncomingCallData(undefined);
      Alert.alert('Missed Call', 'You missed a call');
    };

    // Register listeners
    CallingService.on('incoming_call', handleIncomingCall);
    CallingService.on('call_accepted', handleCallAccepted);
    CallingService.on('call_rejected', handleCallRejected);
    CallingService.on('call_ended', handleCallEnded);
    CallingService.on('call_timeout', handleCallTimeout);

    return () => {
      CallingService.off('incoming_call', handleIncomingCall);
      CallingService.off('call_accepted', handleCallAccepted);
      CallingService.off('call_rejected', handleCallRejected);
      CallingService.off('call_ended', handleCallEnded);
      CallingService.off('call_timeout', handleCallTimeout);
    };
  }, []);

  const handleAcceptCall = () => {
    CallingService.acceptCall();
    setShowIncomingCall(false);
  };

  const handleRejectCall = () => {
    CallingService.rejectCall();
    setShowIncomingCall(false);
    setIncomingCallData(undefined);
  };

  return (
    <CallContext.Provider value={{ showIncomingCall, incomingCallData }}>
      {children}
      <IncomingCallModal
        visible={showIncomingCall}
        callData={incomingCallData}
        onAccept={handleAcceptCall}
        onReject={handleRejectCall}
      />
    </CallContext.Provider>
  );
}
