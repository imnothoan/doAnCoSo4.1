import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '@/src/context/ThemeContext';
import { useAuth } from '@/src/context/AuthContext';
import communityService from '@/src/services/communityService';
import { ImageFile } from '@/src/types';

export default function CreateCommunityEventScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ communityId: string; communityName?: string }>();
  const communityId = Number(params.communityId);
  const communityName = params.communityName || 'Community';
  const { colors } = useTheme();
  const { user } = useAuth();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  
  // Use string input for date/time (simpler approach)
  const [startDateStr, setStartDateStr] = useState('');
  const [startTimeStr, setStartTimeStr] = useState('');
  const [endDateStr, setEndDateStr] = useState('');
  const [endTimeStr, setEndTimeStr] = useState('');
  
  const [coverImage, setCoverImage] = useState<ImageFile | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePickCoverImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setCoverImage({
          uri: asset.uri,
          type: asset.mimeType || 'image/jpeg',
          name: asset.fileName || `event_${Date.now()}.jpg`,
        });
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const parseDateTime = (dateStr: string, timeStr: string): Date | null => {
    if (!dateStr) return null;
    
    // Expected format: YYYY-MM-DD for date, HH:MM for time
    const dateMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!dateMatch) return null;
    
    const [, year, month, day] = dateMatch;
    let hours = 12, minutes = 0;
    
    if (timeStr) {
      const timeMatch = timeStr.match(/^(\d{1,2}):(\d{2})$/);
      if (timeMatch) {
        hours = parseInt(timeMatch[1], 10);
        minutes = parseInt(timeMatch[2], 10);
      }
    }
    
    return new Date(
      parseInt(year, 10),
      parseInt(month, 10) - 1,
      parseInt(day, 10),
      hours,
      minutes
    );
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Event name is required');
      return;
    }

    if (!startDateStr) {
      Alert.alert('Error', 'Start date is required (format: YYYY-MM-DD)');
      return;
    }

    const startDate = parseDateTime(startDateStr, startTimeStr);
    if (!startDate) {
      Alert.alert('Error', 'Invalid start date format. Use YYYY-MM-DD');
      return;
    }

    const endDate = endDateStr ? parseDateTime(endDateStr, endTimeStr) : null;

    if (!user?.username) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    setLoading(true);

    try {
      await communityService.createCommunityEvent(communityId, {
        name: name.trim(),
        description: description.trim() || undefined,
        location: location.trim() || undefined,
        start_time: startDate.toISOString(),
        end_time: endDate ? endDate.toISOString() : undefined,
        image: coverImage || undefined,
      });

      Alert.alert('Success', 'Event created successfully!', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error: any) {
      console.error('Error creating event:', error);
      Alert.alert('Error', 'Failed to create event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Create Event</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Community Info */}
        <View style={[styles.communityInfo, { backgroundColor: colors.surface }]}>
          <Ionicons name="people" size={20} color={colors.primary} />
          <Text style={[styles.communityName, { color: colors.text }]}>{communityName}</Text>
        </View>

        {/* Cover Image */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>Event Cover (Optional)</Text>
          <TouchableOpacity
            style={[styles.coverImageContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={handlePickCoverImage}
          >
            {coverImage ? (
              <Image source={{ uri: coverImage.uri }} style={styles.coverImage} />
            ) : (
              <View style={styles.coverImagePlaceholder}>
                <Ionicons name="image-outline" size={48} color={colors.textMuted} />
                <Text style={[styles.coverImageText, { color: colors.textMuted }]}>Tap to add cover image</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Event Name */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>Event Name *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
            placeholder="Enter event name"
            placeholderTextColor={colors.textMuted}
            value={name}
            onChangeText={setName}
            maxLength={100}
          />
        </View>

        {/* Start Date */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>Start Date * (YYYY-MM-DD)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
            placeholder="2024-12-25"
            placeholderTextColor={colors.textMuted}
            value={startDateStr}
            onChangeText={setStartDateStr}
            maxLength={10}
          />
        </View>

        {/* Start Time */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>Start Time (HH:MM, 24h format)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
            placeholder="14:00"
            placeholderTextColor={colors.textMuted}
            value={startTimeStr}
            onChangeText={setStartTimeStr}
            maxLength={5}
          />
        </View>

        {/* End Date */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>End Date (YYYY-MM-DD, Optional)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
            placeholder="2024-12-25"
            placeholderTextColor={colors.textMuted}
            value={endDateStr}
            onChangeText={setEndDateStr}
            maxLength={10}
          />
        </View>

        {/* End Time */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>End Time (HH:MM, Optional)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
            placeholder="18:00"
            placeholderTextColor={colors.textMuted}
            value={endTimeStr}
            onChangeText={setEndTimeStr}
            maxLength={5}
          />
        </View>

        {/* Location */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>Location (Optional)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
            placeholder="Enter event location or online link"
            placeholderTextColor={colors.textMuted}
            value={location}
            onChangeText={setLocation}
            maxLength={200}
          />
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>Description (Optional)</Text>
          <TextInput
            style={[styles.textArea, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
            placeholder="Tell people what this event is about..."
            placeholderTextColor={colors.textMuted}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            maxLength={1000}
          />
        </View>

        {/* Create Button */}
        <TouchableOpacity
          style={[styles.createButton, { backgroundColor: colors.primary }]}
          onPress={handleCreate}
          disabled={loading || !name.trim() || !startDateStr}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="calendar" size={20} color="#fff" />
              <Text style={styles.createButtonText}>Create Event</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    padding: 16,
  },
  communityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  communityName: {
    fontSize: 15,
    fontWeight: '500',
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  coverImageContainer: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverImagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverImageText: {
    fontSize: 14,
    marginTop: 8,
  },
  createButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 32,
    gap: 8,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
