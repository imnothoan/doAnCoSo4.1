import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { MOCK_NOTIFICATIONS } from '@/src/services/mockData';
import { Notification } from '@/src/types';
import { getRelativeTime } from '@/src/utils/date';

export default function NotificationScreen() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    setNotifications(MOCK_NOTIFICATIONS);
  }, []);

  const renderNotificationItem = ({ item }: { item: Notification }) => {
    const getIcon = () => {
      switch (item.type) {
        case 'event':
          return 'calendar';
        case 'message':
          return 'chatbubble';
        case 'hangout':
          return 'people';
        case 'connection':
          return 'person-add';
        case 'like':
          return 'heart';
        case 'comment':
          return 'chatbubble-ellipses';
        default:
          return 'notifications';
      }
    };

    const getIconColor = () => {
      switch (item.type) {
        case 'event':
          return '#4CAF50';
        case 'message':
          return '#007AFF';
        case 'hangout':
          return '#FF9800';
        case 'connection':
          return '#9C27B0';
        case 'like':
          return '#E91E63';
        case 'comment':
          return '#00BCD4';
        default:
          return '#666';
      }
    };

    return (
      <TouchableOpacity
        style={[styles.notificationItem, !item.read && styles.unreadNotification]}
      >
        <View style={[styles.iconContainer, { backgroundColor: getIconColor() + '20' }]}>
          <Ionicons name={getIcon() as any} size={24} color={getIconColor()} />
        </View>
        
        <View style={styles.notificationContent}>
          <Text style={[styles.notificationTitle, !item.read && styles.unreadText]}>
            {item.title}
          </Text>
          <Text style={styles.notificationMessage} numberOfLines={2}>
            {item.message}
          </Text>
          <Text style={styles.notificationTime}>
            {getRelativeTime(item.timestamp)}
          </Text>
        </View>

        {!item.read && <View style={styles.unreadDot} />}
      </TouchableOpacity>
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Notifications',
          headerRight: () => (
            unreadCount > 0 ? (
              <TouchableOpacity onPress={markAllAsRead} style={styles.headerButton}>
                <Text style={styles.headerButtonText}>Mark all as read</Text>
              </TouchableOpacity>
            ) : null
          ),
        }}
      />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        {unreadCount > 0 && (
          <View style={styles.unreadBanner}>
            <Text style={styles.unreadBannerText}>
              {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </Text>
          </View>
        )}

        <FlatList
          data={notifications}
          renderItem={renderNotificationItem}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="notifications-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>No notifications</Text>
              <Text style={styles.emptySubtext}>
                You&apos;re all caught up!
              </Text>
            </View>
          }
        />
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerButton: {
    marginRight: 12,
  },
  headerButtonText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  unreadBanner: {
    backgroundColor: '#E3F2FD',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#90CAF9',
  },
  unreadBannerText: {
    fontSize: 14,
    color: '#1976D2',
    fontWeight: '600',
  },
  notificationItem: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    alignItems: 'flex-start',
  },
  unreadNotification: {
    backgroundColor: '#F5F9FF',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  unreadText: {
    fontWeight: '700',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
    lineHeight: 20,
  },
  notificationTime: {
    fontSize: 12,
    color: '#999',
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#007AFF',
    marginLeft: 8,
    marginTop: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#aaa',
    marginTop: 8,
  },
});
