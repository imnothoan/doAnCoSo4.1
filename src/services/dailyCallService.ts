/**
 * Daily.co Video Call Service
 * 
 * This service provides video calling functionality using Daily.co's API.
 * Works with Expo Go through WebView - no native modules required!
 * 
 * Setup:
 * 1. Sign up at https://daily.co (Free tier: 200,000 minutes/month)
 * 2. Get your domain name from dashboard
 * 3. Add EXPO_PUBLIC_DAILY_DOMAIN to .env
 * 
 * Alternative: Use Whereby.com (also supports WebView)
 */

import axios from 'axios';
import { Alert } from 'react-native';

interface DailyRoom {
  name: string;
  url: string;
  created_at: string;
  config?: {
    exp?: number;
    max_participants?: number;
  };
}

interface CreateRoomOptions {
  callId: string;
  privacy?: 'public' | 'private';
  maxParticipants?: number;
  expiryMinutes?: number;
}

class DailyCallService {
  private dailyDomain: string;
  private apiKey: string | null = null;

  constructor() {
    // Get Daily.co domain from environment
    // Example: "yourcompany" if your rooms are at https://yourcompany.daily.co/room-name
    this.dailyDomain = process.env.EXPO_PUBLIC_DAILY_DOMAIN || '';
    this.apiKey = process.env.EXPO_PUBLIC_DAILY_API_KEY || null;
  }

  /**
   * Check if Daily.co is configured
   */
  isConfigured(): boolean {
    return this.dailyDomain.length > 0;
  }

  /**
   * Create a Daily.co room for a call
   * Free tier: No API key needed, just use the domain
   */
  async createRoom(options: CreateRoomOptions): Promise<DailyRoom> {
    const { callId, privacy = 'private', maxParticipants = 2, expiryMinutes = 60 } = options;

    try {
      // If using free tier without API (iframe embed only)
      if (!this.apiKey) {
        // Generate a simple room URL using the domain
        const roomName = `call-${callId}`;
        const roomUrl = `https://${this.dailyDomain}.daily.co/${roomName}`;
        
        return {
          name: roomName,
          url: roomUrl,
          created_at: new Date().toISOString(),
          config: {
            max_participants: maxParticipants,
            exp: Math.floor(Date.now() / 1000) + (expiryMinutes * 60),
          },
        };
      }

      // If using paid tier with API key
      const response = await axios.post(
        'https://api.daily.co/v1/rooms',
        {
          name: `call-${callId}`,
          privacy: privacy,
          properties: {
            max_participants: maxParticipants,
            exp: Math.floor(Date.now() / 1000) + (expiryMinutes * 60),
            enable_screenshare: true,
            enable_chat: false,
            enable_knocking: false,
            enable_prejoin_ui: false,
            start_video_off: false,
            start_audio_off: false,
          },
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('[DailyCallService] Error creating room:', error.response?.data || error.message);
      throw new Error('Failed to create video call room');
    }
  }

  /**
   * Delete a Daily.co room (requires API key)
   */
  async deleteRoom(roomName: string): Promise<void> {
    if (!this.apiKey) {
      console.log('[DailyCallService] No API key, skipping room deletion');
      return;
    }

    try {
      await axios.delete(
        `https://api.daily.co/v1/rooms/${roomName}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
          },
        }
      );
      console.log('[DailyCallService] Room deleted:', roomName);
    } catch (error: any) {
      console.error('[DailyCallService] Error deleting room:', error.response?.data || error.message);
    }
  }

  /**
   * Generate a room URL for a call
   * This works even without API key - just uses iframe embed
   */
  getRoomUrl(callId: string, userName?: string): string {
    if (!this.isConfigured()) {
      Alert.alert(
        'Configuration Required',
        'Daily.co domain not configured. Please add EXPO_PUBLIC_DAILY_DOMAIN to your .env file.\n\n' +
        'Sign up at https://daily.co to get your free domain.'
      );
      return '';
    }

    const roomName = `call-${callId}`;
    let url = `https://${this.dailyDomain}.daily.co/${roomName}`;
    
    // Add user name if provided
    if (userName) {
      url += `?userName=${encodeURIComponent(userName)}`;
    }

    return url;
  }

  /**
   * Get iframe embed URL with custom parameters
   */
  getIframeUrl(callId: string, options?: {
    userName?: string;
    startVideoOff?: boolean;
    startAudioOff?: boolean;
  }): string {
    if (!this.isConfigured()) {
      return '';
    }

    const roomName = `call-${callId}`;
    let url = `https://${this.dailyDomain}.daily.co/${roomName}`;
    
    const params = new URLSearchParams();
    
    if (options?.userName) {
      params.append('userName', options.userName);
    }
    if (options?.startVideoOff) {
      params.append('startVideoOff', 'true');
    }
    if (options?.startAudioOff) {
      params.append('startAudioOff', 'true');
    }

    const queryString = params.toString();
    if (queryString) {
      url += `?${queryString}`;
    }

    return url;
  }

  /**
   * Show setup instructions if not configured
   */
  showSetupInstructions(): void {
    Alert.alert(
      'Setup Daily.co Video Calls',
      '1. Sign up at https://daily.co (Free!)\n' +
      '2. Get your domain from dashboard\n' +
      '3. Add to .env:\n' +
      '   EXPO_PUBLIC_DAILY_DOMAIN=your-domain\n\n' +
      'Free tier includes:\n' +
      '• 200,000 minutes/month\n' +
      '• Unlimited rooms\n' +
      '• Up to 200 participants per room',
      [{ text: 'OK' }]
    );
  }
}

export default new DailyCallService();
