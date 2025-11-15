import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Image, TextInput, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Community } from '@/src/types';
import ApiService from '@/src/services/api';
import { useTheme } from '@/src/context/ThemeContext';

export default function DiscussionScreen() {
  const { colors } = useTheme();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadCommunities = useCallback(async () => {
    try {
      setLoading(true);
      if (searchQuery.trim()) {
        const data = await ApiService.searchCommunities(searchQuery);
        setCommunities(data);
      } else {
        const data = await ApiService.getSuggestedCommunities(20);
        setCommunities(data);
      }
    } catch (error) {
      console.error('Error loading communities:', error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadCommunities();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [loadCommunities]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadCommunities();
    setRefreshing(false);
  }, [loadCommunities]);

  const renderCommunityCard = ({ item }: { item: Community }) => (
    <TouchableOpacity style={styles.communityCardContainer}>
      <BlurView
        intensity={75}
        tint="systemThinMaterial"
        style={styles.glassCommunityCard}
      >
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.15)', 'rgba(255, 255, 255, 0.05)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardGradient}
        >
          {item.image && (
            <Image source={{ uri: item.image }} style={styles.communityImage} />
          )}
          <View style={styles.communityContent}>
            <Text style={[styles.communityName, { color: colors.text }]}>{item.name}</Text>
            {item.description && (
              <Text style={[styles.communityDescription, { color: colors.text }]} numberOfLines={2}>
                {item.description}
              </Text>
            )}
            <View style={styles.communityFooter}>
              <BlurView
                intensity={60}
                tint="systemMaterial"
                style={styles.memberCountBadge}
              >
                <Ionicons name="people-outline" size={14} color={colors.primary} />
                <Text style={[styles.memberCountText, { color: colors.text }]}>
                  {item.memberCount} members
                </Text>
              </BlurView>
            </View>
          </View>
        </LinearGradient>
      </BlurView>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <BlurView
        intensity={100}
        tint="systemChromeMaterial"
        style={styles.header}
      >
        <Text style={[styles.headerTitle, { color: colors.text }]}>Discussion</Text>
      </BlurView>

      <BlurView
        intensity={90}
        tint="systemMaterial"
        style={styles.searchContainer}
      >
        <Ionicons name="search-outline" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search communities"
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
      </BlurView>

      <TouchableOpacity style={styles.uploadButtonContainer}>
        <BlurView
          intensity={80}
          tint="systemThinMaterial"
          style={styles.glassUploadButton}
        >
          <LinearGradient
            colors={['rgba(0, 122, 255, 0.2)', 'rgba(0, 122, 255, 0.1)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.uploadButtonGradient}
          >
            <Ionicons name="add-circle-outline" size={24} color={colors.primary} />
            <Text style={[styles.uploadButtonText, { color: colors.primary }]}>Upload to Communities</Text>
          </LinearGradient>
        </BlurView>
      </TouchableOpacity>

      <View style={styles.sectionTitleContainer}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Suggested Communities</Text>
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={communities}
          renderItem={renderCommunityCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.communityList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="earth-outline" size={64} color="#ccc" />
              <Text style={[styles.emptyText, { color: colors.text }]}>No communities found</Text>
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    overflow: 'hidden',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  uploadButtonContainer: {
    marginHorizontal: 16,
    marginTop: 12,
  },
  glassUploadButton: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(0, 122, 255, 0.3)',
  },
  uploadButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 8,
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  sectionTitleContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  communityList: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  communityCardContainer: {
    marginBottom: 12,
  },
  glassCommunityCard: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  cardGradient: {
    padding: 16,
  },
  communityImage: {
    width: '100%',
    height: 160,
    borderRadius: 12,
    marginBottom: 12,
  },
  communityContent: {
    gap: 8,
  },
  communityName: {
    fontSize: 18,
    fontWeight: '600',
  },
  communityDescription: {
    fontSize: 15,
    opacity: 0.8,
    lineHeight: 20,
  },
  communityFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  memberCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  memberCountText: {
    fontSize: 13,
    fontWeight: '500',
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
