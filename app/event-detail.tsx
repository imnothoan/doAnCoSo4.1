import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { MOCK_EVENTS, MOCK_USERS } from '@/src/services/mockData';
import { formatDate } from '@/src/utils/date';

export default function EventDetailScreen() {
  const params = useLocalSearchParams();
  const eventId = params.id as string;
  
  // In a real app, we'd fetch this from the API
  const event = MOCK_EVENTS.find(e => e.id === eventId) || MOCK_EVENTS[0];
  
  const [comment, setComment] = useState('');
  const [isInterested, setIsInterested] = useState(false);

  const handleJoinEvent = () => {
    setIsInterested(!isInterested);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: event.name,
          headerTitleStyle: { fontSize: 16 },
        }}
      />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ScrollView>
          {/* Event Image */}
          {event.image && (
            <Image source={{ uri: event.image }} style={styles.eventImage} />
          )}

          {/* Event Header */}
          <View style={styles.headerSection}>
            <Text style={styles.eventName}>{event.name}</Text>
            
            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="chatbubbles-outline" size={20} color="#007AFF" />
                <Text style={styles.actionButtonText}>Chat</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="person-add-outline" size={20} color="#007AFF" />
                <Text style={styles.actionButtonText}>Invite Friends</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.joinButton, isInterested && styles.joinButtonActive]}
                onPress={handleJoinEvent}
              >
                <Ionicons 
                  name={isInterested ? "checkmark-circle" : "add-circle-outline"} 
                  size={20} 
                  color="#fff" 
                />
                <Text style={styles.joinButtonText}>
                  {isInterested ? 'Interested' : 'Join Event'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Event Details */}
          <View style={styles.detailsSection}>
            <View style={styles.detailRow}>
              <Ionicons name="pricetag-outline" size={20} color="#666" />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Entrance Fee</Text>
                <Text style={styles.detailValue}>{event.entranceFee || 'Free'}</Text>
              </View>
            </View>

            {event.pricingMenu && (
              <View style={styles.detailRow}>
                <Ionicons name="restaurant-outline" size={20} color="#666" />
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Pricing Menu</Text>
                  <Text style={styles.detailValue}>{event.pricingMenu}</Text>
                </View>
              </View>
            )}

            <View style={styles.detailRow}>
              <Ionicons name="person-outline" size={20} color="#666" />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Hosted by</Text>
                <Text style={styles.detailValue}>{event.hostedBy.name}</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <Ionicons name="calendar-outline" size={20} color="#666" />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Time</Text>
                <Text style={styles.detailValue}>{formatDate(event.dateStart)}</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <Ionicons name="location-outline" size={20} color="#666" />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Address</Text>
                <Text style={styles.detailValue}>{event.address}</Text>
              </View>
            </View>

            {event.schedule && (
              <View style={styles.detailRow}>
                <Ionicons name="time-outline" size={20} color="#666" />
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Schedule</Text>
                  <Text style={styles.detailValue}>
                    {event.schedule} {event.timeStart} - {event.timeEnd}
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Participants */}
          <View style={styles.participantsSection}>
            <Text style={styles.sectionTitle}>
              Participants ({event.participants.length})
            </Text>
            <View style={styles.participantsList}>
              {event.participants.map((participant) => (
                <TouchableOpacity key={participant.id} style={styles.participantItem}>
                  <Image 
                    source={{ uri: participant.avatar }} 
                    style={styles.participantAvatar} 
                  />
                </TouchableOpacity>
              ))}
              {/* Add more participants indicator */}
              <TouchableOpacity style={styles.moreParticipants}>
                <Ionicons name="add" size={24} color="#666" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Event Details */}
          {event.details && (
            <View style={styles.descriptionSection}>
              <Text style={styles.sectionTitle}>Details</Text>
              <Text style={styles.descriptionText}>{event.details}</Text>
            </View>
          )}

          {/* Comments Section */}
          <View style={styles.commentsSection}>
            <Text style={styles.sectionTitle}>
              Comments ({event.comments?.length || 0})
            </Text>
            
            {/* Comment Input */}
            <View style={styles.commentInputContainer}>
              <Image 
                source={{ uri: MOCK_USERS[0].avatar }} 
                style={styles.commentAvatar} 
              />
              <View style={styles.commentInputWrapper}>
                <TextInput
                  style={styles.commentInput}
                  placeholder="What's on your mind?"
                  value={comment}
                  onChangeText={setComment}
                  multiline
                />
                <View style={styles.commentActions}>
                  <TouchableOpacity style={styles.imageButton}>
                    <Ionicons name="image-outline" size={20} color="#666" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.postButton, comment.length > 0 && styles.postButtonActive]}
                    disabled={comment.length === 0}
                  >
                    <Text style={[styles.postButtonText, comment.length > 0 && styles.postButtonTextActive]}>
                      Post
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Comments List */}
            {event.comments && event.comments.length > 0 ? (
              event.comments.map((commentItem) => (
                <View key={commentItem.id} style={styles.commentItem}>
                  <Image 
                    source={{ uri: commentItem.user.avatar }} 
                    style={styles.commentAvatar} 
                  />
                  <View style={styles.commentContent}>
                    <Text style={styles.commentAuthor}>{commentItem.user.name}</Text>
                    <Text style={styles.commentText}>{commentItem.content}</Text>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.noComments}>No comments yet. Be the first to comment!</Text>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  eventImage: {
    width: '100%',
    height: 250,
    backgroundColor: '#e0e0e0',
  },
  headerSection: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  eventName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    lineHeight: 28,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
    gap: 6,
  },
  actionButtonText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  joinButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    gap: 6,
  },
  joinButtonActive: {
    backgroundColor: '#4CAF50',
  },
  joinButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  detailsSection: {
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  detailRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailContent: {
    marginLeft: 12,
    flex: 1,
  },
  detailLabel: {
    fontSize: 13,
    color: '#999',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  participantsSection: {
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  participantsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  participantItem: {
    marginBottom: 8,
  },
  participantAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#fff',
  },
  moreParticipants: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  descriptionSection: {
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 8,
  },
  descriptionText: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
  },
  commentsSection: {
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 8,
  },
  commentInputContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  commentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  commentInputWrapper: {
    flex: 1,
  },
  commentInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: '#333',
    minHeight: 40,
    marginBottom: 8,
  },
  commentActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  imageButton: {
    padding: 8,
  },
  postButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
  },
  postButtonActive: {
    backgroundColor: '#007AFF',
  },
  postButtonText: {
    fontSize: 14,
    color: '#999',
    fontWeight: '600',
  },
  postButtonTextActive: {
    color: '#fff',
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  commentContent: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 12,
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  commentText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  noComments: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingVertical: 20,
  },
});
