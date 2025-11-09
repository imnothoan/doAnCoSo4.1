import { io, Socket } from 'socket.io-client';
import { Message } from '../types';

class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  connect(url: string, token?: string) {
    if (this.socket?.connected) {
      return;
    }

    this.socket = io(url, {
      auth: {
        token,
      },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
    });

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
        this.disconnect();
      }
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
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
    if (this.socket) {
      this.socket.emit('send_message', {
        conversationId,
        senderUsername,
        content,
        replyToMessageId,
      });
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
