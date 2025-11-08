import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { MOCK_CHATS, MOCK_USERS } from '@/src/services/mockData';
import { Message } from '@/src/types';
import { formatTime } from '@/src/utils/date';

export default function ChatScreen() {
  const params = useLocalSearchParams();
  const chatId = params.id as string;
  
  const chat = MOCK_CHATS.find(c => c.id === chatId) || MOCK_CHATS[0];
  const otherUser = chat.participants[0];
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    // Load mock messages
    loadMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadMessages = () => {
    // Mock messages for this chat
    const mockMessages: Message[] = [
      {
        id: 'm1',
        chatId: chat.id,
        senderId: otherUser.id,
        sender: otherUser,
        content: 'Hey! How are you doing?',
        timestamp: '2025-11-08T09:00:00Z',
        read: true,
      },
      {
        id: 'm2',
        chatId: chat.id,
        senderId: MOCK_USERS[0].id,
        sender: MOCK_USERS[0],
        content: "I'm great! How about you?",
        timestamp: '2025-11-08T09:05:00Z',
        read: true,
      },
      {
        id: 'm3',
        chatId: chat.id,
        senderId: otherUser.id,
        sender: otherUser,
        content: 'Doing well! Are you going to the event tonight?',
        timestamp: '2025-11-08T09:10:00Z',
        read: true,
      },
      {
        id: 'm4',
        chatId: chat.id,
        senderId: MOCK_USERS[0].id,
        sender: MOCK_USERS[0],
        content: 'Yes! Looking forward to it. See you there?',
        timestamp: '2025-11-08T09:15:00Z',
        read: true,
      },
      {
        id: 'm5',
        chatId: chat.id,
        senderId: otherUser.id,
        sender: otherUser,
        content: 'Definitely! 😊',
        timestamp: '2025-11-08T09:20:00Z',
        read: true,
      },
    ];
    setMessages(mockMessages);
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const newMessage: Message = {
      id: `m${Date.now()}`,
      chatId: chat.id,
      senderId: MOCK_USERS[0].id,
      sender: MOCK_USERS[0],
      content: inputText,
      timestamp: new Date().toISOString(),
      read: false,
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');
    
    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleQuickMessage = (message: string) => {
    setInputText(message);
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isOwnMessage = item.senderId === MOCK_USERS[0].id;
    
    return (
      <View style={[styles.messageContainer, isOwnMessage && styles.ownMessageContainer]}>
        {!isOwnMessage && (
          <Image source={{ uri: item.sender.avatar }} style={styles.messageAvatar} />
        )}
        <View style={[styles.messageBubble, isOwnMessage && styles.ownMessageBubble]}>
          {!isOwnMessage && (
            <Text style={styles.senderName}>{item.sender.name}</Text>
          )}
          <Text style={[styles.messageText, isOwnMessage && styles.ownMessageText]}>
            {item.content}
          </Text>
          <Text style={[styles.messageTime, isOwnMessage && styles.ownMessageTime]}>
            {formatTime(item.timestamp)}
          </Text>
        </View>
      </View>
    );
  };

  const quickMessages = [
    { shortcut: '/x', message: 'Xin chào' },
    { shortcut: '/h', message: 'Hello!' },
    { shortcut: '/t', message: 'Thank you!' },
    { shortcut: '/s', message: 'See you soon!' },
  ];

  const [showQuickMessages, setShowQuickMessages] = useState(false);

  return (
    <>
      <Stack.Screen
        options={{
          title: chat.name || otherUser.name,
          headerRight: () => (
            <View style={styles.headerRight}>
              <TouchableOpacity style={styles.headerButton}>
                <Ionicons name="call-outline" size={24} color="#007AFF" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerButton}>
                <Ionicons name="videocam-outline" size={24} color="#007AFF" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerButton}>
                <Ionicons name="ellipsis-vertical" size={24} color="#007AFF" />
              </TouchableOpacity>
            </View>
          ),
        }}
      />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          {/* Messages List */}
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messagesList}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
          />

          {/* Quick Messages Panel */}
          {showQuickMessages && (
            <View style={styles.quickMessagesPanel}>
              <View style={styles.quickMessagesPanelHeader}>
                <Text style={styles.quickMessagesPanelTitle}>Quick Messages</Text>
                <TouchableOpacity onPress={() => setShowQuickMessages(false)}>
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>
              <View style={styles.quickMessagesList}>
                {quickMessages.map((qm, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.quickMessageItem}
                    onPress={() => {
                      handleQuickMessage(qm.message);
                      setShowQuickMessages(false);
                    }}
                  >
                    <Text style={styles.quickMessageShortcut}>{qm.shortcut}</Text>
                    <Text style={styles.quickMessageText}>{qm.message}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Input Area */}
          <View style={styles.inputContainer}>
            <TouchableOpacity 
              style={styles.inputIconButton}
              onPress={() => setShowQuickMessages(!showQuickMessages)}
            >
              <Ionicons name="flash-outline" size={24} color="#666" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.inputIconButton}>
              <Ionicons name="image-outline" size={24} color="#666" />
            </TouchableOpacity>

            <TextInput
              style={styles.input}
              placeholder="Type a message..."
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={1000}
              placeholderTextColor="#999"
            />

            <TouchableOpacity
              style={[styles.sendButton, inputText.trim().length > 0 && styles.sendButtonActive]}
              onPress={handleSendMessage}
              disabled={inputText.trim().length === 0}
            >
              <Ionicons name="send" size={20} color={inputText.trim().length > 0 ? '#fff' : '#999'} />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 16,
    marginRight: 8,
  },
  headerButton: {
    padding: 4,
  },
  keyboardView: {
    flex: 1,
  },
  messagesList: {
    padding: 16,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  ownMessageContainer: {
    flexDirection: 'row-reverse',
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  messageBubble: {
    maxWidth: '75%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  ownMessageBubble: {
    backgroundColor: '#007AFF',
  },
  senderName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 20,
  },
  ownMessageText: {
    color: '#fff',
  },
  messageTime: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  ownMessageTime: {
    color: '#E3F2FD',
  },
  quickMessagesPanel: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    maxHeight: 200,
  },
  quickMessagesPanelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  quickMessagesPanelTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  quickMessagesList: {
    padding: 8,
  },
  quickMessageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  quickMessageShortcut: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
    width: 40,
  },
  quickMessageText: {
    fontSize: 15,
    color: '#333',
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  inputIconButton: {
    padding: 8,
    marginBottom: 4,
  },
  input: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: '#333',
    maxHeight: 100,
    marginHorizontal: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  sendButtonActive: {
    backgroundColor: '#007AFF',
  },
});
