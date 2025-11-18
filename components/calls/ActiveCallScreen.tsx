import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CallData } from '@/src/services/callingService';

interface ActiveCallScreenProps {
  callData: CallData;
  isMuted: boolean;
  isVideoEnabled: boolean;
  isConnected: boolean;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onEndCall: () => void;
}

export default function ActiveCallScreen({
  callData,
  isMuted,
  isVideoEnabled,
  isConnected,
  onToggleMute,
  onToggleVideo,
  onEndCall,
}: ActiveCallScreenProps) {
  const [callDuration, setCallDuration] = useState(0);
  const isVideoCall = callData.callType === 'video';

  useEffect(() => {
    if (!isConnected) return;

    const interval = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isConnected]);

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Determine if we're the caller or receiver
  const otherPersonName = callData.callerName;
  const otherPersonAvatar = callData.callerAvatar;

  return (
    <View style={styles.container}>
      {/* Video area (placeholder for now) */}
      {isVideoCall && isVideoEnabled ? (
        <View style={styles.videoContainer}>
          <Text style={styles.videoPlaceholder}>Video Call</Text>
          <Text style={styles.videoNote}>
            Video functionality will be implemented with WebRTC
          </Text>
        </View>
      ) : (
        <View style={styles.audioContainer}>
          {/* Avatar */}
          <View style={styles.avatarContainer}>
            {otherPersonAvatar ? (
              <Image
                source={{ uri: otherPersonAvatar }}
                style={styles.avatar}
              />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Ionicons name="person-circle-outline" size={120} color="#999" />
              </View>
            )}
          </View>

          {/* Name */}
          <Text style={styles.callerName}>{otherPersonName}</Text>

          {/* Status */}
          <Text style={styles.callStatus}>
            {isConnected ? formatDuration(callDuration) : 'Connecting...'}
          </Text>
        </View>
      )}

      {/* Control Buttons */}
      <View style={styles.controlsContainer}>
        {/* Mute Button */}
        <TouchableOpacity
          style={[styles.controlButton, isMuted && styles.controlButtonActive]}
          onPress={onToggleMute}
        >
          <Ionicons
            name={isMuted ? 'mic-off' : 'mic'}
            size={28}
            color={isMuted ? '#fff' : '#333'}
          />
        </TouchableOpacity>

        {/* Video Toggle (only for video calls) */}
        {isVideoCall && (
          <TouchableOpacity
            style={[
              styles.controlButton,
              !isVideoEnabled && styles.controlButtonActive,
            ]}
            onPress={onToggleVideo}
          >
            <Ionicons
              name={isVideoEnabled ? 'videocam' : 'videocam-off'}
              size={28}
              color={!isVideoEnabled ? '#fff' : '#333'}
            />
          </TouchableOpacity>
        )}

        {/* End Call Button */}
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
    backgroundColor: '#1a1a1a',
  },
  videoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  videoPlaceholder: {
    fontSize: 24,
    color: '#fff',
    marginBottom: 16,
  },
  videoNote: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  audioContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: 40,
  },
  avatar: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 4,
    borderColor: '#fff',
  },
  avatarPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  callerName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  callStatus: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    gap: 30,
  },
  controlButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  controlButtonActive: {
    backgroundColor: '#666',
  },
  endCallButton: {
    backgroundColor: '#FF3B30',
  },
});
