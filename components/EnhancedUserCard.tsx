import React from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LiquidGlassCard } from '@/components/ios';
import { User } from '@/src/types';

interface EnhancedUserCardProps {
  user: User;
  onPress: () => void;
  distance?: number;
  showLiquidGlass?: boolean;
}

/**
 * EnhancedUserCard - User card with optional iOS Liquid Glass effect
 * 
 * Features:
 * - Toggle between standard and liquid glass style
 * - Avatar, name, bio display
 * - Location and distance info
 * - Interest tags
 * - Online/availability indicators
 */
export const EnhancedUserCard: React.FC<EnhancedUserCardProps> = ({
  user,
  onPress,
  distance,
  showLiquidGlass = Platform.OS === 'ios',
}) => {
  const CardContent = () => (
    <View style={styles.cardContent}>
      {/* Avatar and Basic Info */}
      <View style={styles.header}>
        <Image
          source={{ uri: user.avatar || 'https://via.placeholder.com/80' }}
          style={styles.avatar}
        />
        <View style={styles.headerInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>
              {user.name}
              {user.age && `, ${user.age}`}
            </Text>
            {user.isPro && (
              <View style={styles.proBadge}>
                <Ionicons name="star" size={12} color="#FFB300" />
              </View>
            )}
          </View>
          {user.city && user.country && (
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={14} color="#666" />
              <Text style={styles.locationText} numberOfLines={1}>
                {user.city}, {user.country}
              </Text>
            </View>
          )}
          {distance !== undefined && (
            <View style={styles.distanceRow}>
              <Ionicons name="navigate-outline" size={14} color="#007AFF" />
              <Text style={styles.distanceText}>
                {distance < 1000
                  ? `${Math.round(distance)}m away`
                  : `${(distance / 1000).toFixed(1)}km away`}
              </Text>
            </View>
          )}
        </View>
        {user.isOnline && (
          <View style={styles.onlineIndicator}>
            <View style={styles.onlineDot} />
          </View>
        )}
      </View>

      {/* Bio */}
      {user.bio && (
        <Text style={styles.bio} numberOfLines={2}>
          {user.bio}
        </Text>
      )}

      {/* Interests */}
      {user.interests && user.interests.length > 0 && (
        <View style={styles.interestsContainer}>
          {user.interests.slice(0, 4).map((interest, index) => (
            <View key={index} style={styles.interestTag}>
              <Text style={styles.interestText}>{interest}</Text>
            </View>
          ))}
          {user.interests.length > 4 && (
            <View style={styles.interestTag}>
              <Text style={styles.interestText}>+{user.interests.length - 4}</Text>
            </View>
          )}
        </View>
      )}

      {/* Availability Status */}
      {user.availableToHangout && (
        <View style={styles.availabilityBadge}>
          <Ionicons name="checkmark-circle" size={14} color="#4CAF50" />
          <Text style={styles.availabilityText}>Available to hang out</Text>
        </View>
      )}
    </View>
  );

  if (showLiquidGlass) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        <LiquidGlassCard
          intensity={75}
          tint="systemMaterial"
          borderRadius={16}
          style={styles.card}
        >
          <CardContent />
        </LiquidGlassCard>
      </TouchableOpacity>
    );
  }

  // Standard card without liquid glass
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.card, styles.standardCard]}>
        <CardContent />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
  standardCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardContent: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  proBadge: {
    marginLeft: 6,
    backgroundColor: '#FFF9E6',
    borderRadius: 8,
    padding: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  locationText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 4,
    flex: 1,
  },
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  distanceText: {
    fontSize: 13,
    color: '#007AFF',
    marginLeft: 4,
    fontWeight: '500',
  },
  onlineIndicator: {
    marginLeft: 8,
  },
  onlineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#fff',
  },
  bio: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  interestTag: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 122, 255, 0.2)',
  },
  interestText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  availabilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  availabilityText: {
    fontSize: 12,
    color: '#4CAF50',
    marginLeft: 4,
    fontWeight: '500',
  },
});
