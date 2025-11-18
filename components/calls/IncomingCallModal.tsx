import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { CallData } from '@/src/services/callingService';

const { width } = Dimensions.get('window');

interface IncomingCallModalProps {
  visible: boolean;
  callData?: CallData;
  onAccept: () => void;
  onReject: () => void;
}

export default function IncomingCallModal({
  visible,
  callData,
  onAccept,
  onReject,
}: IncomingCallModalProps) {
  if (!callData) return null;

  const isVideoCall = callData.callType === 'video';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      {/* Semi-transparent black background overlay */}
      <View style={styles.overlay}>
        <BlurView intensity={80} style={styles.container}>
          <View style={styles.content}>
          {/* Caller Avatar */}
          <View style={styles.avatarContainer}>
            {callData.callerAvatar ? (
              <Image
                source={{ uri: callData.callerAvatar }}
                style={styles.avatar}
              />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Ionicons name="person-circle-outline" size={120} color="#999" />
              </View>
            )}
          </View>

          {/* Caller Info */}
          <Text style={styles.callerName}>{callData.callerName}</Text>
          <Text style={styles.callType}>
            {isVideoCall ? 'Video Call' : 'Voice Call'}
          </Text>

          {/* Action Buttons */}
          <View style={styles.buttonsContainer}>
            {/* Reject Button */}
            <TouchableOpacity
              style={[styles.actionButton, styles.rejectButton]}
              onPress={onReject}
            >
              <Ionicons name="close" size={32} color="#fff" />
            </TouchableOpacity>

            {/* Accept Button */}
            <TouchableOpacity
              style={[styles.actionButton, styles.acceptButton]}
              onPress={onAccept}
            >
              <Ionicons name="call" size={32} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </BlurView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // Semi-transparent black background
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  avatarContainer: {
    marginBottom: 30,
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
    marginBottom: 8,
    textAlign: 'center',
  },
  callType: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 60,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: width * 0.7,
  },
  actionButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  rejectButton: {
    backgroundColor: '#FF3B30',
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
  },
});
