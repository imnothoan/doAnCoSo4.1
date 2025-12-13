import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Clipboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '@/src/context/LanguageContext';
import ExamService from '@/src/services/examService';
import { ExamClass, ClassMember } from '@/src/types/exam';

export default function ClassDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t } = useLanguage();

  const [classData, setClassData] = useState<(ExamClass & { members: ClassMember[] }) | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadClass = useCallback(async () => {
    if (!id) return;
    
    try {
      const data = await ExamService.getClassById(id);
      setClassData(data);
    } catch (error) {
      console.error('Load class error:', error);
      Alert.alert(t.common.error, t.class.loadClassError);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [id, t]);

  useEffect(() => {
    loadClass();
  }, [loadClass]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadClass();
  };

  const handleManageStudents = () => {
    router.push(`/class/students/${id}`);
  };

  const handleCopyInviteCode = () => {
    if (classData?.invite_code) {
      Clipboard.setString(classData.invite_code);
      Alert.alert(t.common.success, t.class.codeCopied);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      t.common.confirm,
      t.class.confirmDeleteClass,
      [
        { text: t.common.cancel, style: 'cancel' },
        {
          text: t.common.delete,
          style: 'destructive',
          onPress: async () => {
            try {
              await ExamService.deleteClass(id!);
              Alert.alert(t.common.success, t.class.classDeletedSuccess);
              router.back();
            } catch (error) {
              console.error('Delete class error:', error);
              Alert.alert(t.common.error, t.class.deleteClassError);
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <>
        <Stack.Screen options={{ title: t.class.classDetails }} />
        <SafeAreaView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>{t.common.loading}</Text>
        </SafeAreaView>
      </>
    );
  }

  if (!classData) {
    return (
      <>
        <Stack.Screen options={{ title: t.class.classDetails }} />
        <SafeAreaView style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color="#FF3B30" />
          <Text style={styles.errorText}>Class not found</Text>
        </SafeAreaView>
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: classData.name,
          headerBackTitle: t.common.back,
          headerRight: () => (
            <TouchableOpacity onPress={handleDelete} style={styles.headerButton}>
              <Ionicons name="trash-outline" size={24} color="#FF3B30" />
            </TouchableOpacity>
          ),
        }}
      />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
          }
        >
          {/* Class Info Card */}
          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <View style={styles.iconCircle}>
                <Ionicons name="school" size={32} color="#007AFF" />
              </View>
              <View style={styles.infoHeaderText}>
                <Text style={styles.className}>{classData.name}</Text>
                <Text style={styles.classCode}>{classData.code}</Text>
              </View>
            </View>
            
            {classData.description && (
              <Text style={styles.classDescription}>{classData.description}</Text>
            )}
            
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Ionicons name="people" size={24} color="#4CAF50" />
                <Text style={styles.statValue}>{classData.student_count}</Text>
                <Text style={styles.statLabel}>{t.class.students}</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="document-text" size={24} color="#FF9800" />
                <Text style={styles.statValue}>{classData.exam_count}</Text>
                <Text style={styles.statLabel}>{t.navigation.exams}</Text>
              </View>
            </View>

            {/* Invite Code */}
            {classData.invite_code && (
              <View style={styles.inviteCodeContainer}>
                <Text style={styles.inviteCodeLabel}>{t.class.inviteCode}</Text>
                <View style={styles.inviteCodeRow}>
                  <Text style={styles.inviteCodeText}>{classData.invite_code}</Text>
                  <TouchableOpacity 
                    style={styles.copyButton}
                    onPress={handleCopyInviteCode}
                  >
                    <Ionicons name="copy-outline" size={20} color="#007AFF" />
                    <Text style={styles.copyButtonText}>{t.class.copyCode}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.primaryButton]}
              onPress={handleManageStudents}
            >
              <Ionicons name="person-add" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>{t.class.manageStudents}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.secondaryButton]}
              onPress={() => Alert.alert('Coming Soon', 'Assign exam feature coming soon')}
            >
              <Ionicons name="document-attach" size={20} color="#007AFF" />
              <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>
                {t.class.assignExam}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Students Preview */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t.class.students}</Text>
              <TouchableOpacity onPress={handleManageStudents}>
                <Text style={styles.viewAllText}>{t.class.viewStudents}</Text>
              </TouchableOpacity>
            </View>

            {classData.members && classData.members.length > 0 ? (
              <View style={styles.studentsList}>
                {classData.members.slice(0, 5).map((member) => (
                  <View key={member.id} style={styles.studentItem}>
                    <View style={styles.studentAvatar}>
                      <Text style={styles.studentAvatarText}>
                        {member.name?.charAt(0) || member.username?.charAt(0) || '?'}
                      </Text>
                    </View>
                    <View style={styles.studentInfo}>
                      <Text style={styles.studentName}>{member.name || member.username}</Text>
                      <Text style={styles.studentEmail}>{member.email}</Text>
                    </View>
                  </View>
                ))}
                {classData.members.length > 5 && (
                  <TouchableOpacity 
                    style={styles.viewMoreButton}
                    onPress={handleManageStudents}
                  >
                    <Text style={styles.viewMoreText}>
                      +{classData.members.length - 5} more
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="people-outline" size={48} color="#ccc" />
                <Text style={styles.emptyText}>{t.class.noStudentsInClass}</Text>
                <TouchableOpacity 
                  style={styles.addStudentButton}
                  onPress={handleManageStudents}
                >
                  <Ionicons name="person-add" size={18} color="#fff" />
                  <Text style={styles.addStudentButtonText}>{t.class.addStudent}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Exams Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t.class.classExams}</Text>
            </View>

            <View style={styles.emptyContainer}>
              <Ionicons name="document-text-outline" size={48} color="#ccc" />
              <Text style={styles.emptyText}>No exams assigned yet</Text>
              <TouchableOpacity 
                style={styles.addStudentButton}
                onPress={() => Alert.alert('Coming Soon', 'Assign exam feature coming soon')}
              >
                <Ionicons name="add" size={18} color="#fff" />
                <Text style={styles.addStudentButtonText}>{t.class.assignExam}</Text>
              </TouchableOpacity>
            </View>
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
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  headerButton: {
    marginLeft: 16,
  },
  infoCard: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#e8f4fd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoHeaderText: {
    marginLeft: 12,
    flex: 1,
  },
  className: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  classCode: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  classDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  inviteCodeContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  inviteCodeLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  inviteCodeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
  },
  inviteCodeText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    letterSpacing: 2,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  copyButtonText: {
    fontSize: 14,
    color: '#007AFF',
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    gap: 8,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#007AFF',
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  viewAllText: {
    fontSize: 14,
    color: '#007AFF',
  },
  studentsList: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  studentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  studentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  studentAvatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  studentInfo: {
    marginLeft: 12,
    flex: 1,
  },
  studentName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  studentEmail: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  viewMoreButton: {
    padding: 12,
    alignItems: 'center',
  },
  viewMoreText: {
    fontSize: 14,
    color: '#007AFF',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  addStudentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  addStudentButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
