import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '@/src/context/LanguageContext';
import ExamService from '@/src/services/examService';
import { ClassMember } from '@/src/types/exam';

export default function ManageStudentsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t } = useLanguage();

  const [students, setStudents] = useState<ClassMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const [email, setEmail] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const loadStudents = useCallback(async () => {
    if (!id) return;
    
    try {
      const data = await ExamService.getClassStudents(id);
      setStudents(data);
    } catch (error) {
      console.error('Load students error:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [id]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadStudents();
  };

  const handleAddStudent = async () => {
    if (!email.trim()) {
      Alert.alert(t.common.error, t.auth.emailRequired);
      return;
    }

    if (!id) return;

    setIsAdding(true);
    try {
      await ExamService.addStudentToClass(id, email.trim().toLowerCase());
      Alert.alert(t.common.success, t.class.studentAddedSuccess);
      setEmail('');
      setShowAddForm(false);
      loadStudents();
    } catch (error: any) {
      console.error('Add student error:', error);
      let errorMessage = t.class.addStudentError;
      
      if (error.message === 'STUDENT_NOT_FOUND') {
        errorMessage = t.class.studentNotFound;
      } else if (error.message === 'STUDENT_ALREADY_IN_CLASS') {
        errorMessage = t.class.studentAlreadyInClass;
      }
      
      Alert.alert(t.common.error, errorMessage);
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveStudent = (member: ClassMember) => {
    Alert.alert(
      t.class.removeStudent,
      t.class.confirmRemoveStudent,
      [
        { text: t.common.cancel, style: 'cancel' },
        {
          text: t.common.delete,
          style: 'destructive',
          onPress: async () => {
            try {
              await ExamService.removeStudentFromClass(id!, member.id);
              Alert.alert(t.common.success, t.class.studentRemovedSuccess);
              loadStudents();
            } catch (error) {
              console.error('Remove student error:', error);
              Alert.alert(t.common.error, 'Failed to remove student');
            }
          },
        },
      ]
    );
  };

  const renderStudent = ({ item }: { item: ClassMember }) => (
    <View style={styles.studentCard}>
      <View style={styles.avatar}>
        {item.avatar ? (
          <View style={styles.avatarImage}>
            <Text style={styles.avatarText}>
              {item.name?.charAt(0) || item.username?.charAt(0) || '?'}
            </Text>
          </View>
        ) : (
          <View style={styles.avatarImage}>
            <Text style={styles.avatarText}>
              {item.name?.charAt(0) || item.username?.charAt(0) || '?'}
            </Text>
          </View>
        )}
      </View>
      <View style={styles.studentInfo}>
        <Text style={styles.studentName}>{item.name || item.username}</Text>
        <Text style={styles.studentEmail}>{item.email}</Text>
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleRemoveStudent(item)}
      >
        <Ionicons name="person-remove" size={20} color="#FF3B30" />
      </TouchableOpacity>
    </View>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="people-outline" size={64} color="#ccc" />
      <Text style={styles.emptyText}>{t.class.noStudentsInClass}</Text>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setShowAddForm(true)}
      >
        <Ionicons name="person-add" size={20} color="#fff" />
        <Text style={styles.addButtonText}>{t.class.addStudent}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: t.class.manageStudents,
          headerBackTitle: t.common.back,
        }}
      />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        {/* Add Student Form */}
        {showAddForm && (
          <View style={styles.addFormContainer}>
            <Text style={styles.addFormTitle}>{t.class.addStudent}</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder={t.class.searchStudentByEmail}
                placeholderTextColor="#999"
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isAdding}
              />
              <TouchableOpacity
                style={[styles.searchButton, isAdding && styles.disabledButton]}
                onPress={handleAddStudent}
                disabled={isAdding}
              >
                {isAdding ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Ionicons name="add" size={24} color="#fff" />
                )}
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setShowAddForm(false);
                setEmail('');
              }}
            >
              <Text style={styles.cancelButtonText}>{t.common.cancel}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Header with Add Button */}
        {!showAddForm && students.length > 0 && (
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              {t.class.students}: {students.length}
            </Text>
            <TouchableOpacity
              style={styles.headerAddButton}
              onPress={() => setShowAddForm(true)}
            >
              <Ionicons name="person-add" size={20} color="#007AFF" />
              <Text style={styles.headerAddText}>{t.class.addStudent}</Text>
            </TouchableOpacity>
          </View>
        )}

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>{t.common.loading}</Text>
          </View>
        ) : (
          <FlatList
            data={students}
            renderItem={renderStudent}
            keyExtractor={(item) => item.id}
            contentContainerStyle={students.length === 0 ? styles.emptyList : styles.list}
            ListEmptyComponent={renderEmptyList}
            refreshControl={
              <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
            }
          />
        )}
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  headerAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAddText: {
    fontSize: 14,
    color: '#007AFF',
    marginLeft: 6,
  },
  addFormContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  addFormTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    width: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  cancelButtonText: {
    fontSize: 14,
    color: '#FF3B30',
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
  list: {
    padding: 16,
  },
  emptyList: {
    flex: 1,
  },
  studentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  avatar: {
    marginRight: 12,
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  studentEmail: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  removeButton: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  addButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
  },
});
