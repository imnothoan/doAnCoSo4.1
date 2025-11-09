import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/src/context/AuthContext';
import { MOCK_CURRENT_USER } from '@/src/services/mockData';

export default function AccountScreen() {
  const { user, logout } = useAuth();
  const currentUser = user || MOCK_CURRENT_USER;
  const profileCompletion = 40; // Mock profile completion percentage

  const renderInfoRow = (icon: string, label: string, value: string, onPress?: () => void) => (
    <TouchableOpacity style={styles.infoRow} onPress={onPress} disabled={!onPress}>
      <View style={styles.infoRowLeft}>
        <Ionicons name={icon as any} size={20} color="#666" />
        <Text style={styles.infoLabel}>{label}</Text>
      </View>
      <View style={styles.infoRowRight}>
        <Text style={styles.infoValue}>{value}</Text>
        {onPress && <Ionicons name="chevron-forward" size={20} color="#ccc" />}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <Image source={{ uri: currentUser.avatar }} style={styles.profileAvatar} />
          <Text style={styles.profileName}>{currentUser.name}</Text>
          <View style={styles.locationRow}>
            <Text style={styles.flag}>{currentUser.flag}</Text>
            <Text style={styles.location}>
              {currentUser.city}, {currentUser.country}
            </Text>
          </View>
          
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{currentUser.status}</Text>
          </View>

          <TouchableOpacity style={styles.editProfileButton}>
            <Ionicons name="create-outline" size={20} color="#007AFF" />
            <Text style={styles.editProfileText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Profile Completion */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Your Profile: {profileCompletion}% completed</Text>
            <TouchableOpacity>
              <Ionicons name="chevron-forward" size={20} color="#007AFF" />
            </TouchableOpacity>
          </View>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${profileCompletion}%` }]} />
          </View>
          <Text style={styles.progressHint}>Complete your profile to get more connections</Text>
        </View>

        {/* About Section */}
        {currentUser.bio && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About Me</Text>
            <Text style={styles.bioText}>{currentUser.bio}</Text>
          </View>
        )}

        {/* Languages Section */}
        {currentUser.languages && currentUser.languages.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Languages</Text>
            {currentUser.languages.map((lang, index) => (
              <View key={index} style={styles.languageRow}>
                <Text style={styles.languageName}>{lang.name}</Text>
                <Text style={styles.languageLevel}>{lang.level}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{currentUser.followersCount || 0}</Text>
              <Text style={styles.summaryLabel}>Followers</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{currentUser.gender || 'N/A'}</Text>
              <Text style={styles.summaryLabel}>Gender</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{currentUser.age || 'N/A'}</Text>
              <Text style={styles.summaryLabel}>Age</Text>
            </View>
          </View>
        </View>

        {/* Interests */}
        {currentUser.interests && currentUser.interests.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Interests</Text>
            <View style={styles.interestsContainer}>
              {currentUser.interests.map((interest, index) => (
                <View key={index} style={styles.interestTag}>
                  <Text style={styles.interestText}>{interest}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          {renderInfoRow('notifications-outline', 'Notifications', '', () => {})}
          {renderInfoRow('settings-outline', 'Manage Account', '', () => {})}
          {renderInfoRow('card-outline', 'Payment & Pro Features', '', () => {})}
          {renderInfoRow('information-circle-outline', 'About', '', () => {})}
        </View>

        {/* Sign Out */}
        <TouchableOpacity style={styles.signOutButton} onPress={logout}>
          <Ionicons name="log-out-outline" size={20} color="#FF3B30" />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <View style={styles.footer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  profileHeader: {
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  profileAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  flag: {
    fontSize: 20,
    marginRight: 8,
  },
  location: {
    fontSize: 16,
    color: '#666',
  },
  statusBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 16,
  },
  statusText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  editProfileText: {
    fontSize: 15,
    color: '#007AFF',
    fontWeight: '600',
    marginLeft: 6,
  },
  progressSection: {
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  progressHint: {
    fontSize: 13,
    color: '#666',
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  bioText: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
  },
  languageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  languageName: {
    fontSize: 15,
    color: '#333',
  },
  languageLevel: {
    fontSize: 15,
    color: '#666',
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 13,
    color: '#666',
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestTag: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  interestText: {
    fontSize: 13,
    color: '#007AFF',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  infoLabel: {
    fontSize: 15,
    color: '#333',
    marginLeft: 12,
  },
  infoRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoValue: {
    fontSize: 15,
    color: '#666',
    marginRight: 8,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  signOutText: {
    fontSize: 16,
    color: '#FF3B30',
    fontWeight: '600',
    marginLeft: 8,
  },
  footer: {
    height: 40,
  },
});
