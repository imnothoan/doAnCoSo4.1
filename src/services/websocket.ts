import { io, Socket } from 'socket.io-client';
import { Message } from '../types';

class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = Infinity; // Infinite reconnection attempts
  private reconnectDelay = 1000;
  private isConnecting = false;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private connectionStatusListeners: Array<(connected: boolean) => void> = [];

  connect(url: string, token?: string) {
    if (this.socket?.connected || this.isConnecting) {
      console.log('WebSocket already connected or connecting');
      return;
    }

    console.log('Connecting to WebSocket:', url);
    this.isConnecting = true;

    this.socket = io(url, {
      auth: {
        token,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
      reconnectionDelayMax: 5000,
      timeout: 10000,
      autoConnect: true,
    });

    this.socket.on('connect', () => {
      console.log('✅ WebSocket connected successfully');
      this.reconnectAttempts = 0;
      this.isConnecting = false;
      this.startHeartbeat();
      this.notifyConnectionStatus(true);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ WebSocket disconnected:', reason);
      this.isConnecting = false;
      this.stopHeartbeat();
      this.notifyConnectionStatus(false);
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error.message);
      this.reconnectAttempts++;
      this.isConnecting = false;
      this.notifyConnectionStatus(false);
    });

    // Listen for heartbeat from server
    this.socket.on('heartbeat', () => {
      // Acknowledge heartbeat to keep connection alive
      this.socket?.emit('heartbeat_ack');
    });
  }

  private startHeartbeat() {
    this.stopHeartbeat();
    // Send heartbeat every 25 seconds (server expects response within 30s)
    this.heartbeatInterval = setInterval(() => {
      if (this.socket?.connected) {
        this.socket.emit('heartbeat_ack');
      }
    }, 25000);
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private notifyConnectionStatus(connected: boolean) {
    this.connectionStatusListeners.forEach(listener => {
      try {
        listener(connected);
      } catch (error) {
        console.error('Error in connection status listener:', error);
      }
    });
  }

  onConnectionStatusChange(callback: (connected: boolean) => void) {
    this.connectionStatusListeners.push(callback);
    // Immediately call with current status
    callback(this.isConnected());
  }

  offConnectionStatusChange(callback: (connected: boolean) => void) {
    const index = this.connectionStatusListeners.indexOf(callback);
    if (index > -1) {
      this.connectionStatusListeners.splice(index, 1);
    }
  }

  disconnect() {
    if (this.socket) {
      console.log('Disconnecting WebSocket');
      this.stopHeartbeat();
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnecting = false;
    this.reconnectAttempts = 0;
    this.notifyConnectionStatus(false);
  }

  // Force reconnection
  forceReconnect() {
    console.log('Forcing WebSocket reconnection...');
    if (this.socket && !this.socket.connected) {
      this.socket.connect();
    }
  }

  // Join a conversation room
  joinConversation(conversationId: string) {
    if (this.socket) {
      this.socket.emit('join_conversation', { conversationId });
    }
  }

  // Leave a conversation room
  leaveConversation(conversationId: string) {
    if (this.socket) {
      this.socket.emit('leave_conversation', { conversationId });
    }
  }

  // Send a message
  sendMessage(conversationId: string, senderUsername: string, content: string, replyToMessageId?: string) {
    if (this.socket?.connected) {
      this.socket.emit('send_message', {
        conversationId,
        senderUsername,
        content,
        replyToMessageId,
      });
      return true;
    } else {
      console.warn('WebSocket not connected, cannot send message');
      return false;
    }
  }

  // Send typing indicator
  sendTyping(conversationId: string, username: string, isTyping: boolean) {
    if (this.socket) {
      this.socket.emit('typing', {
        conversationId,
        username,
        isTyping,
      });
    }
  }

  // Mark messages as read
  markAsRead(conversationId: string, username: string, upToMessageId: number) {
    if (this.socket) {
      this.socket.emit('mark_read', {
        conversationId,
        username,
        upToMessageId,
      });
    }
  }

  // Listen for new messages
  onNewMessage(callback: (message: Message) => void) {
    if (this.socket) {
      this.socket.on('new_message', callback);
    }
  }

  // Listen for typing indicator
  onTyping(callback: (data: { conversationId: string; username: string; isTyping: boolean }) => void) {
    if (this.socket) {
      this.socket.on('typing', callback);
    }
  }

  // Listen for messages marked as read
  onMessagesRead(callback: (data: { conversationId: string; username: string; upToMessageId: number }) => void) {
    if (this.socket) {
      this.socket.on('messages_read', callback);
    }
  }

  // Listen for user online status
  onUserOnline(callback: (data: { username: string; isOnline: boolean }) => void) {
    if (this.socket) {
      this.socket.on('user_status', callback);
    }
  }

  // Remove all listeners
  removeAllListeners() {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }

  // Remove specific listener
  off(event: string, callback?: (...args: any[]) => void) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  // Check if connected
  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export default new WebSocketService();
