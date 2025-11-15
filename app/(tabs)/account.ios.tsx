import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/src/context/AuthContext';
import { useTheme } from '@/src/context/ThemeContext';
import { useRouter } from 'expo-router';
import ApiService from '@/src/services/api';
import { useFocusEffect } from '@react-navigation/native';

export default function AccountScreen() {
  const router = useRouter();
  const { user: authUser, logout, refreshUser } = useAuth();
  const { colors } = useTheme();
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  const loadProfileData = useCallback(async () => {
    if (!authUser?.username) return;
    try {
      const completionData = await ApiService.getProfileCompletion(authUser.username);
      setProfileCompletion(completionData.completion_percentage || 0);

      try {
        await refreshUser();
      } catch (userError) {
        console.error('Error loading user data:', userError);
      }
    } catch (error) {
      console.error('Error loading profile completion:', error);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser?.username]);

  useEffect(() => {
    loadProfileData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProfileData();
      return () => {};
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [authUser?.username])
  );

  const user = authUser;

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      </SafeAreaView>
    );
  }

  const renderInfoRow = (icon: string, label: string, value: string, onPress?: () => void) => (
    <TouchableOpacity onPress={onPress} disabled={!onPress}>
      <BlurView
        intensity={70}
        tint="systemThinMaterial"
        style={styles.glassInfoRow}
      >
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.infoRowGradient}
        >
          <View style={styles.infoRowLeft}>
            <Ionicons name={icon as any} size={20} color={colors.primary} />
            <Text style={[styles.infoLabel, { color: colors.text }]}>{label}</Text>
          </View>
          <View style={styles.infoRowRight}>
            <Text style={[styles.infoValue, { color: colors.text }]}>{value}</Text>
            {onPress && <Ionicons name="chevron-forward" size={20} color="#ccc" />}
          </View>
        </LinearGradient>
      </BlurView>
    </TouchableOpacity>
  );

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            setLoggingOut(true);
            await logout();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <BlurView
        intensity={100}
        tint="systemChromeMaterial"
        style={styles.header}
      >
        <Text style={[styles.headerTitle, { color: colors.text }]}>Account</Text>
      </BlurView>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Section */}
        <BlurView
          intensity={80}
          tint="systemThinMaterial"
          style={styles.glassProfileSection}
        >
          <LinearGradient
            colors={['rgba(0, 122, 255, 0.15)', 'rgba(0, 122, 255, 0.05)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.profileGradient}
          >
            <View style={styles.profileHeader}>
              {user.avatar ? (
                <Image source={{ uri: user.avatar }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="person" size={40} color="#999" />
                </View>
              )}
              <View style={styles.profileInfo}>
                <Text style={[styles.userName, { color: colors.text }]}>{user.name}</Text>
                <Text style={[styles.userUsername, { color: colors.text, opacity: 0.7 }]}>
                  @{user.username}
                </Text>
                {user.bio && (
                  <Text style={[styles.userBio, { color: colors.text, opacity: 0.8 }]} numberOfLines={2}>
                    {user.bio}
                  </Text>
                )}
              </View>
            </View>

            <TouchableOpacity
              style={styles.editProfileButton}
              onPress={() => router.push('/edit-profile')}
            >
              <BlurView
                intensity={90}
                tint="systemMaterial"
                style={styles.glassButton}
              >
                <Ionicons name="create-outline" size={20} color={colors.primary} />
                <Text style={[styles.editButtonText, { color: colors.primary }]}>
                  Edit Profile
                </Text>
              </BlurView>
            </TouchableOpacity>
          </LinearGradient>
        </BlurView>

        {/* Stats Section */}
        <View style={styles.statsSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Statistics</Text>
          <View style={styles.statsRow}>
            {[
              { label: 'Posts', value: user.postsCount || 0 },
              { label: 'Followers', value: user.followersCount || 0 },
              { label: 'Following', value: user.followingCount || 0 },
            ].map((stat, index) => (
              <BlurView
                key={index}
                intensity={75}
                tint="systemThinMaterial"
                style={styles.glassStat}
              >
                <Text style={[styles.statValue, { color: colors.primary }]}>{stat.value}</Text>
                <Text style={[styles.statLabel, { color: colors.text, opacity: 0.7 }]}>
                  {stat.label}
                </Text>
              </BlurView>
            ))}
          </View>
        </View>

        {/* Info Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Information</Text>
          {renderInfoRow('location-outline', 'Location', `${user.city || 'N/A'}, ${user.country || 'N/A'}`)}
          {renderInfoRow('language-outline', 'Languages', user.languages?.join(', ') || 'N/A')}
          {renderInfoRow('heart-outline', 'Interests', user.interests?.join(', ') || 'N/A')}
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Settings</Text>
          {renderInfoRow('settings-outline', 'Settings', '', () => router.push('/settings'))}
          {renderInfoRow('notifications-outline', 'Notifications', '', () => router.push('/notification'))}
          {user.isPro && renderInfoRow('star-outline', 'Pro Package', 'Active')}
        </View>

        {/* Logout Button */}
        <TouchableOpacity onPress={handleLogout} disabled={loggingOut}>
          <BlurView
            intensity={80}
            tint="systemThinMaterial"
            style={styles.glassLogoutButton}
          >
            <LinearGradient
              colors={['rgba(255, 59, 48, 0.2)', 'rgba(255, 59, 48, 0.1)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.logoutGradient}
            >
              {loggingOut ? (
                <ActivityIndicator size="small" color="#FF3B30" />
              ) : (
                <>
                  <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
                  <Text style={styles.logoutButtonText}>Logout</Text>
                </>
              )}
            </LinearGradient>
          </BlurView>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  glassProfileSection: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  profileGradient: {
    padding: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(128, 128, 128, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userUsername: {
    fontSize: 16,
    marginBottom: 4,
  },
  userBio: {
    fontSize: 14,
    lineHeight: 18,
  },
  editProfileButton: {
    marginTop: 12,
  },
  glassButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 8,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(0, 122, 255, 0.3)',
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  statsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  glassStat: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
  },
  section: {
    marginBottom: 24,
    gap: 8,
  },
  glassInfoRow: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  infoRowGradient: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
  },
  infoRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  infoRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoValue: {
    fontSize: 14,
    opacity: 0.7,
  },
  glassLogoutButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 59, 48, 0.3)',
  },
  logoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  logoutButtonText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
