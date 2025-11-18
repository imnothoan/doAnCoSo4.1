/**
 * Video Call WebView Component
 * 
 * Uses Daily.co to provide video calling through WebView
 * Works with Expo Go - no native modules required!
 */

import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  SafeAreaView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { CallData } from '@/src/services/callingService';

interface VideoCallWebViewProps {
  callData: CallData;
  roomUrl: string;
  userName: string;
  onEndCall: () => void;
}

export default function VideoCallWebView({
  callData,
  roomUrl,
  userName,
  onEndCall,
}: VideoCallWebViewProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const webViewRef = useRef<WebView>(null);

  const handleLoadStart = () => {
    setIsLoading(true);
    setError(null);
  };

  const handleLoadEnd = () => {
    setIsLoading(false);
  };

  const handleError = (syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    console.error('[VideoCallWebView] Error loading:', nativeEvent);
    setError('Failed to load video call. Please check your connection.');
    setIsLoading(false);
  };

  const handleMessage = (event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      console.log('[VideoCallWebView] Message from WebView:', data);

      // Handle messages from Daily.co iframe
      switch (data.type) {
        case 'left-meeting':
          console.log('[VideoCallWebView] User left meeting');
          onEndCall();
          break;
        case 'error':
          console.error('[VideoCallWebView] Error from Daily:', data.error);
          Alert.alert('Call Error', data.error || 'An error occurred during the call');
          break;
      }
    } catch (err) {
      console.warn('[VideoCallWebView] Failed to parse message:', event.nativeEvent.data);
    }
  };

  const handleEndCallPress = () => {
    Alert.alert(
      'End Call',
      'Are you sure you want to end this call?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Call',
          style: 'destructive',
          onPress: () => {
            // Send message to WebView to leave the call
            webViewRef.current?.postMessage(JSON.stringify({ type: 'leave' }));
            onEndCall();
          },
        },
      ]
    );
  };

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#FF3B30" />
          <Text style={styles.errorTitle}>Connection Error</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={onEndCall}>
            <Text style={styles.retryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.callTypeIndicator}>
            <Ionicons 
              name={callData.callType === 'video' ? 'videocam' : 'call'} 
              size={16} 
              color="#fff" 
            />
          </View>
          <View>
            <Text style={styles.callerName}>
              {callData.callType === 'video' ? '📹 ' : '📞 '}
              {callData.callerId === userName ? callData.receiverId : callData.callerName}
            </Text>
            <Text style={styles.callStatus}>Connected via Daily.co</Text>
          </View>
        </View>
      </View>

      {/* WebView */}
      <View style={styles.webViewContainer}>
        <WebView
          ref={webViewRef}
          source={{ uri: roomUrl }}
          style={styles.webView}
          onLoadStart={handleLoadStart}
          onLoadEnd={handleLoadEnd}
          onError={handleError}
          onMessage={handleMessage}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={false}
          // Allow camera and microphone access
          mediaCapturePermissionGrantType="grant"
          // iOS specific
          {...(Platform.OS === 'ios' && {
            allowsLinkPreview: false,
            sharedCookiesEnabled: true,
          })}
          // Android specific
          {...(Platform.OS === 'android' && {
            mixedContentMode: 'always',
            setBuiltInZoomControls: false,
          })}
        />

        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Connecting to call...</Text>
          </View>
        )}
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.controlButton, styles.endCallButton]}
          onPress={handleEndCallPress}
        >
          <Ionicons name="call" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Info Banner */}
      <View style={styles.infoBanner}>
        <Ionicons name="information-circle-outline" size={16} color="#007AFF" />
        <Text style={styles.infoBannerText}>
          Using Daily.co WebView (Expo Go compatible)
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  callTypeIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#34C759',
    justifyContent: 'center',
    alignItems: 'center',
  },
  callerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  callStatus: {
    fontSize: 13,
    color: '#999',
    marginTop: 2,
  },
  webViewContainer: {
    flex: 1,
    position: 'relative',
  },
  webView: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 16,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    gap: 20,
  },
  controlButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  endCallButton: {
    backgroundColor: '#FF3B30',
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    gap: 8,
  },
  infoBannerText: {
    fontSize: 12,
    color: '#007AFF',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#000',
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginTop: 20,
    marginBottom: 10,
  },
  errorText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    lineHeight: 24,
  },
  retryButton: {
    marginTop: 30,
    paddingHorizontal: 30,
    paddingVertical: 14,
    backgroundColor: '#007AFF',
    borderRadius: 25,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
