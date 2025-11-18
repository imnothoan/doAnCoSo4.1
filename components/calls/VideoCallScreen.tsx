import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RTCView } from 'react-native-webrtc';
import WebRTCService from '@/src/services/webrtcService';
import { CallData } from '@/src/services/callingService';

const { width, height } = Dimensions.get('window');

interface VideoCallScreenProps {
  callData: CallData;
  isMuted: boolean;
  isVideoEnabled: boolean;
  isConnected: boolean;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onEndCall: () => void;
  onSwitchCamera: () => void;
}

export default function VideoCallScreen({
  callData,
  isMuted,
  isVideoEnabled,
  isConnected,
  onToggleMute,
  onToggleVideo,
  onEndCall,
  onSwitchCamera,
}: VideoCallScreenProps) {
  const [localStream, setLocalStream] = useState<any>(null);
  const [remoteStream, setRemoteStream] = useState<any>(null);
  const [callDuration, setCallDuration] = useState(0);
  const [connectionState, setConnectionState] = useState<string>('new');

  useEffect(() => {
    // Listen for local stream
    const handleLocalStream = (event: any) => {
      console.log('[VideoCallScreen] Local stream received');
      setLocalStream(event.stream);
    };

    // Listen for remote stream
    const handleRemoteStream = (event: any) => {
      console.log('[VideoCallScreen] Remote stream received');
      setRemoteStream(event.stream);
    };

    // Listen for connection state changes
    const handleConnectionStateChange = (state: string) => {
      console.log('[VideoCallScreen] Connection state:', state);
      setConnectionState(state);
    };

    WebRTCService.on('local_stream', handleLocalStream);
    WebRTCService.on('remote_stream', handleRemoteStream);
    WebRTCService.on('connection_state_change', handleConnectionStateChange);

    // Get current streams if already available
    const currentLocalStream = WebRTCService.getLocalStream();
    const currentRemoteStream = WebRTCService.getRemoteStream();
    
    if (currentLocalStream) {
      setLocalStream(currentLocalStream);
    }
    if (currentRemoteStream) {
      setRemoteStream(currentRemoteStream);
    }

    return () => {
      WebRTCService.off('local_stream', handleLocalStream);
      WebRTCService.off('remote_stream', handleRemoteStream);
      WebRTCService.off('connection_state_change', handleConnectionStateChange);
    };
  }, []);

  useEffect(() => {
    if (!isConnected || connectionState !== 'connected') return;

    const interval = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isConnected, connectionState]);

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusText = () => {
    if (connectionState === 'connected') {
      return formatDuration(callDuration);
    } else if (connectionState === 'connecting') {
      return 'Connecting...';
    } else {
      return 'Setting up call...';
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      {/* Remote video (full screen) */}
      <View style={styles.remoteVideoContainer}>
        {remoteStream && isVideoEnabled ? (
          <RTCView
            streamURL={remoteStream.toURL()}
            style={styles.remoteVideo}
            objectFit="cover"
            mirror={false}
          />
        ) : (
          <View style={styles.placeholderContainer}>
            <Ionicons name="person-circle-outline" size={120} color="#666" />
            <Text style={styles.placeholderText}>
              {remoteStream ? 'Camera is off' : 'Connecting...'}
            </Text>
          </View>
        )}

        {/* Call info overlay (top) */}
        <View style={styles.topOverlay}>
          <Text style={styles.callerName}>{callData.callerName}</Text>
          <Text style={styles.callStatus}>{getStatusText()}</Text>
        </View>
      </View>

      {/* Local video (picture-in-picture, like Messenger) */}
      {localStream && isVideoEnabled && (
        <View style={styles.localVideoContainer}>
          <RTCView
            streamURL={localStream.toURL()}
            style={styles.localVideo}
            objectFit="cover"
            mirror={true}
          />
          
          {/* Camera switch button */}
          <TouchableOpacity
            style={styles.switchCameraButton}
            onPress={onSwitchCamera}
          >
            <Ionicons name="camera-reverse" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      )}

      {/* Control buttons (bottom) */}
      <View style={styles.controlsContainer}>
        {/* Mute button */}
        <TouchableOpacity
          style={[styles.controlButton, isMuted && styles.controlButtonActive]}
          onPress={onToggleMute}
        >
          <Ionicons
            name={isMuted ? 'mic-off' : 'mic'}
            size={28}
            color={isMuted ? '#fff' : '#fff'}
          />
        </TouchableOpacity>

        {/* Video toggle button */}
        <TouchableOpacity
          style={[styles.controlButton, !isVideoEnabled && styles.controlButtonActive]}
          onPress={onToggleVideo}
        >
          <Ionicons
            name={isVideoEnabled ? 'videocam' : 'videocam-off'}
            size={28}
            color="#fff"
          />
        </TouchableOpacity>

        {/* End call button */}
        <TouchableOpacity
          style={[styles.controlButton, styles.endCallButton]}
          onPress={onEndCall}
        >
          <Ionicons name="call" size={28} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  remoteVideoContainer: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  remoteVideo: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  placeholderText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
  },
  topOverlay: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingVertical: 12,
  },
  callerName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  callStatus: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  localVideoContainer: {
    position: 'absolute',
    top: 120,
    right: 16,
    width: width * 0.35,
    height: width * 0.35 * 1.5, // 2:3 aspect ratio
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  localVideo: {
    width: '100%',
    height: '100%',
  },
  switchCameraButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
    paddingHorizontal: 20,
  },
  controlButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  controlButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  endCallButton: {
    backgroundColor: '#FF3B30',
  },
});
