import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Switch, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function HangoutScreen() {
  const [isAvailable, setIsAvailable] = useState(false);
  const [selectedActivities] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'open' | 'my'>('open');
  const [showActivityModal] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Hang Out</Text>
      </View>
      
      <ScrollView style={styles.content}>
        {/* Availability Toggle Section */}
        <View style={styles.availabilitySection}>
          <View style={styles.availabilityRow}>
            <View style={styles.availabilityText}>
              <Text style={styles.availabilityLabel}>Available to hang out now</Text>
              {isAvailable && selectedActivities.length > 0 && (
                <Text style={styles.goingToText}>
                  Going to: {selectedActivities.slice(0, 2).join(', ')}
                  {selectedActivities.length > 2 && ` +${selectedActivities.length - 2} more`}
                </Text>
              )}
            </View>
            <Switch
              value={isAvailable}
              onValueChange={setIsAvailable}
              trackColor={{ false: '#ccc', true: '#4CAF50' }}
              thumbColor={isAvailable ? '#fff' : '#f4f3f4'}
            />
          </View>
          
          {isAvailable && (
            <TouchableOpacity
              style={styles.editStatusButton}
              onPress={() => {
                // TODO: Show activity modal
                console.log('Show activity modal', showActivityModal);
              }}
            >
              <Ionicons name="create-outline" size={20} color="#007AFF" />
              <Text style={styles.editStatusText}>Edit Status</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Sliding Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'open' && styles.activeTab]}
            onPress={() => setActiveTab('open')}
          >
            <Text style={[styles.tabText, activeTab === 'open' && styles.activeTabText]}>
              Open Hangouts
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'my' && styles.activeTab]}
            onPress={() => setActiveTab('my')}
          >
            <Text style={[styles.tabText, activeTab === 'my' && styles.activeTabText]}>
              My Hangouts
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {activeTab === 'open' ? (
          <View style={styles.tabContent}>
            <Text style={styles.placeholderText}>Open hangouts will appear here</Text>
            <Text style={styles.placeholderSubtext}>
              Filter by languages and distance to find people available to hang out
            </Text>
          </View>
        ) : (
          <View style={styles.tabContent}>
            <Text style={styles.placeholderText}>Your past hangouts will appear here</Text>
            <Text style={styles.placeholderSubtext}>
              Connect with people you&apos;ve hung out with before
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
  },
  availabilitySection: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
  },
  availabilityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  availabilityText: {
    flex: 1,
    marginRight: 12,
  },
  availabilityLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  goingToText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  editStatusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingVertical: 8,
  },
  editStatusText: {
    fontSize: 15,
    color: '#007AFF',
    marginLeft: 6,
    fontWeight: '500',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 15,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  tabContent: {
    padding: 20,
    alignItems: 'center',
    marginTop: 40,
  },
  placeholderText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
    marginBottom: 8,
    textAlign: 'center',
  },
  placeholderSubtext: {
    fontSize: 14,
    color: '#aaa',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});
