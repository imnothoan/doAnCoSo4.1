import React, { useState, useEffect, useCallback, useRef } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Image, RefreshControl, ActivityIndicator, InteractionManager } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Chat } from '@/src/types';
import { getRelativeTime } from '@/src/utils/date';
import { useAuth } from '@/src/context/AuthContext';
import { useTheme } from '@/src/context/ThemeContext';
import ApiService from '@/src/services/api';
import WebSocketService from '@/src/services/websocket';
import { useFocusEffect } from '@react-navigation/native';

export default function InboxScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { colors } = useTheme();
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'events' | 'users'>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const enrichedConversationsRef = useRef<Set<string>>(new Set());

  const loadChats = useCallback(async () => {
    if (!user?.username) return;
    try {
      setLoading(true);
      const data = await ApiService.getConversations(user.username);
      setChats(data);
      enrichedConversationsRef.current = new Set();
    } catch (error) {
      console.error('Error loading chats:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.username]);

  useEffect(() => {
    loadChats();
  }, [loadChats]);

  useFocusEffect(
    useCallback(() => {
      loadChats();
    }, [loadChats])
  );

  useEffect(() => {
    if (!user?.username) return;

    const handleNewMessage = (message: any) => {
      const conversationId = String(message.chatId || message.conversation_id || message.conversationId);
      
      setChats(prevChats => {
        const existingIndex = prevChats.findIndex(c => String(c.id) === conversationId);
        
        if (existingIndex >= 0) {
          const updatedChats = [...prevChats];
          const existingChat = updatedChats[existingIndex];
          
          updatedChats.splice(existingIndex, 1);
          updatedChats.unshift({
            ...existingChat,
            lastMessage: {
              content: message.content || '',
              timestamp: message.timestamp || new Date().toISOString(),
              sender: message.sender || { username: message.senderId },
            },
            unreadCount: message.senderId !== user.username 
              ? (existingChat.unreadCount || 0) + 1 
              : existingChat.unreadCount,
          });
          
          return updatedChats;
        } else {
          loadChats();
          return prevChats;
        }
      });
    };

    WebSocketService.onNewMessage(handleNewMessage);

    return () => {
      WebSocketService.off('new_message', handleNewMessage);
    };
  }, [user?.username, loadChats]);

  useEffect(() => {
    let cancelled = false;
    const enrichMissing = async () => {
      if (!user?.username) return;
      
      const targets = chats.filter(c => {
        if (enrichedConversationsRef.current.has(c.id)) return false;
        if (c.type !== 'user' && c.type !== 'dm') return false;
        if (!c.participants || c.participants.length < 2) return true;
        
        const otherUser = c.participants.find(p => p.username && p.username !== user.username);
        return !otherUser || !otherUser.name || !otherUser.avatar;
      });

      if (targets.length === 0) return;

      for (const conv of targets) {
        try {
          enrichedConversationsRef.current.add(conv.id);
          
          const detail = await ApiService.getConversation(conv.id);
          if (cancelled) return;

          const detailedOtherUser = detail.participants?.find(p => p.username && p.username !== user.username);
          
          let completeOtherUser = detailedOtherUser;
          if (detailedOtherUser?.username && (!detailedOtherUser.name || !detailedOtherUser.avatar)) {
            try {
              completeOtherUser = await ApiService.getUserByUsername(detailedOtherUser.username);
            } catch {
              console.warn('Failed to fetch user profile for', detailedOtherUser.username);
            }
          }

          if (cancelled) return;

          setChats(prev =>
            prev.map(c => {
              if (c.id !== conv.id) return c;
              
              const enrichedParticipants = [...(detail.participants || [])];
              
              if (completeOtherUser) {
                const idx = enrichedParticipants.findIndex(p => p.username === completeOtherUser?.username);
                if (idx >= 0) {
                  enrichedParticipants[idx] = completeOtherUser;
                } else {
                  enrichedParticipants.push(completeOtherUser);
                }
              }

              return {
                ...c,
                participants: enrichedParticipants.length > 0 ? enrichedParticipants : c.participants,
              };
            })
          );
        } catch (e) {
          console.warn('Failed to enrich conversation', conv.id, e);
        }
      }
    };
    
    InteractionManager.runAfterInteractions(enrichMissing);
    return () => { cancelled = true; };
  }, [chats, user?.username]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadChats();
    setRefreshing(false);
  }, [loadChats]);

  const filteredChats = chats.filter(chat => {
    if (activeTab === 'all') return true;
    if (activeTab === 'events') return chat.type === 'event';
    if (activeTab === 'users') return chat.type === 'user';
    return true;
  });

  const handleOpenChat = useCallback(async (chat: Chat) => {
    try {
      if (user?.username) {
        await ApiService.markAllMessagesAsRead(chat.id, user.username);
      }
      setChats(prev => prev.map(c => c.id === chat.id ? { ...c, unreadCount: 0 } as Chat : c));
    } catch (e) {
      console.warn('mark read failed:', e);
    } finally {
      router.push(\`/chat?id=\${chat.id}\`);
    }
  }, [router, user?.username]);

  const renderChatItem = ({ item }: { item: Chat }) => {
    const isDM = item.type === 'dm' || item.type === 'user';

    let otherUser = isDM
      ? item.participants?.find(p => p.username && p.username !== user?.username)
      : undefined;

    const sender = item.lastMessage?.sender;
    if (!otherUser && sender?.username && sender.username !== user?.username) {
      otherUser = sender;
    }

    if (!otherUser && item.participants && item.participants.length) {
      const first = item.participants.find(p => p.username !== user?.username);
      if (first) otherUser = first;
    }

    const displayName = isDM
      ? (otherUser?.name || otherUser?.username || 'Direct Message')
      : (item.name || 'Group');

    const avatarUrl = isDM ? (otherUser?.avatar || '') : '';

    const relativeTime = item.lastMessage?.timestamp
      ? getRelativeTime(item.lastMessage.timestamp)
      : '';

    const isUnread = (item.unreadCount ?? 0) > 0;

    return (
      <TouchableOpacity
        style={styles.chatItemContainer}
        onPress={() => handleOpenChat(item)}
      >
        <BlurView
          intensity={isUnread ? 90 : 70}
          tint="systemThinMaterial"
          style={styles.glassChatItem}
        >
          <LinearGradient
            colors={
              isUnread
                ? ['rgba(0, 122, 255, 0.15)', 'rgba(0, 122, 255, 0.05)']
                : ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.chatItemGradient}
          >
            <View style={styles.avatarContainer}>
              {isDM ? (
                avatarUrl ? (
                  <Image source={{ uri: avatarUrl }} style={styles.chatAvatar} />
                ) : (
                  <View style={styles.eventAvatarPlaceholder}>
                    <Ionicons name="person-circle-outline" size={32} color="#999" />
                  </View>
                )
              ) : (
                <View style={styles.eventAvatarPlaceholder}>
                  <Ionicons name="people-outline" size={24} color={colors.primary} />
                </View>
              )}
              {isUnread && <View style={[styles.unreadDot, { backgroundColor: colors.primary, borderColor: colors.card }]} />}
            </View>

            <View style={styles.chatContent}>
              <View style={styles.chatHeader}>
                <Text style={[styles.chatName, isUnread && styles.unreadText, { color: colors.text }]}>
                  {displayName}
                </Text>
                {!!relativeTime && (
                  <Text style={[styles.chatTime, { color: colors.text, opacity: 0.6 }]}>{relativeTime}</Text>
                )}
              </View>
              <View style={styles.messageRow}>
                {item.lastMessage?.content && (
                  <Text
                    style={[styles.lastMessage, isUnread && styles.unreadText, { color: colors.text }]}
                    numberOfLines={1}
                  >
                    {item.lastMessage.content}
                  </Text>
                )}
                {isUnread && item.unreadCount && item.unreadCount > 0 && (
                  <View style={[styles.unreadBadge, { backgroundColor: colors.primary }]}>
                    <Text style={styles.unreadBadgeText}>{item.unreadCount}</Text>
                  </View>
                )}
              </View>
            </View>
          </LinearGradient>
        </BlurView>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <BlurView
        intensity={100}
        tint="systemChromeMaterial"
        style={styles.header}
      >
        <Text style={[styles.headerTitle, { color: colors.text }]}>Inbox</Text>
      </BlurView>

      <BlurView
        intensity={90}
        tint="systemMaterial"
        style={styles.tabsContainer}
      >
        <TouchableOpacity
          style={[styles.tab, activeTab === 'all' && styles.activeTab]}
          onPress={() => setActiveTab('all')}
        >
          <Text style={[styles.tabText, { color: colors.text }, activeTab === 'all' && [styles.activeTabText, { color: colors.primary }]]}>
            All
          </Text>
          {activeTab === 'all' && <View style={[styles.activeTabIndicator, { backgroundColor: colors.primary }]} />}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'events' && styles.activeTab]}
          onPress={() => setActiveTab('events')}
        >
          <Text style={[styles.tabText, { color: colors.text }, activeTab === 'events' && [styles.activeTabText, { color: colors.primary }]]}>
            Events
          </Text>
          {activeTab === 'events' && <View style={[styles.activeTabIndicator, { backgroundColor: colors.primary }]} />}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'users' && styles.activeTab]}
          onPress={() => setActiveTab('users')}
        >
          <Text style={[styles.tabText, { color: colors.text }, activeTab === 'users' && [styles.activeTabText, { color: colors.primary }]]}>
            Users
          </Text>
          {activeTab === 'users' && <View style={[styles.activeTabIndicator, { backgroundColor: colors.primary }]} />}
        </TouchableOpacity>
      </BlurView>

      {loading && chats.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredChats}
          renderItem={renderChatItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.chatList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubbles-outline" size={64} color="#ccc" />
              <Text style={[styles.emptyText, { color: colors.text }]}>No conversations yet</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    position: 'relative',
  },
  activeTab: {
    // Active state handled by indicator
  },
  tabText: {
    fontSize: 15,
    fontWeight: '500',
  },
  activeTabText: {
    fontWeight: '600',
  },
  activeTabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    borderRadius: 1.5,
  },
  chatList: {
    padding: 12,
    paddingBottom: 100,
  },
  chatItemContainer: {
    marginBottom: 12,
  },
  glassChatItem: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  chatItemGradient: {
    flexDirection: 'row',
    padding: 14,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  chatAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  eventAvatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(128, 128, 128, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
  },
  chatContent: {
    flex: 1,
    justifyContent: 'center',
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  chatName: {
    fontSize: 17,
    fontWeight: '500',
    flex: 1,
  },
  unreadText: {
    fontWeight: '600',
  },
  chatTime: {
    fontSize: 13,
    marginLeft: 8,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: 15,
    opacity: 0.7,
    flex: 1,
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginLeft: 8,
  },
  unreadBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 17,
    opacity: 0.6,
  },
});
